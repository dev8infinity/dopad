using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=database.db"));
builder.Services.AddControllers();

// Register CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod());
});

var app = builder.Build();

// Apply CORS before routing
app.UseCors("AllowSpecificOrigin");

app.UseRouting();

// Serve static files
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads")),
    RequestPath = "/uploads"
});

app.MapControllers();
app.Run();


public class AppDbContext : DbContext
{
    public DbSet<Url> Urls { get; set; }
    public DbSet<Attachment> Attachments { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Url>().HasIndex(u => u.Endpoint).IsUnique();
    }
}

public class Url
{
    [Key]
    public Guid Id { get; set; }  
    public string Endpoint { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string Text { get; set; }
    public string Hash { get; set; }

    // Add navigation properties
    public List<Attachment> Attachments { get; set; } = new();
}

public class Attachment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FilePath { get; set; }
    public Guid UrlId { get; set; }
    [ForeignKey("UrlId")]
    public Url Url { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}



[ApiController]
[Route("api/files")]
public class FileController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly string _uploadPath = Path.Combine("wwwroot", "uploads");

    public FileController(AppDbContext context)
    {
        _context = context;
        // Ensure that the upload path exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    [HttpPost("upload")] // Endpoint: POST /api/files/upload
    public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string endpoint)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        // Find or create the URL by endpoint (which is a string)
        var url = await _context.Urls.FirstOrDefaultAsync(u => u.Endpoint == endpoint);
        
        if (url == null)
        {
            // Create a new URL with a generated Guid as the Id
            url = new Url
            {
                Id = Guid.NewGuid(), // Generate a new Guid for this URL
                Endpoint = endpoint
            };

            _context.Urls.Add(url);
            await _context.SaveChangesAsync();
        }

        // Create the directory for the uploaded file using the URL's Guid Id
        var endpointDir = Path.Combine(_uploadPath, url.Id.ToString());
        if (!Directory.Exists(endpointDir))
        {
            Directory.CreateDirectory(endpointDir);
        }

        // Generate a new Guid for the uploaded file as the filename
        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(endpointDir, fileName);

        // Save the uploaded file to disk
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Create an attachment entry in the database
        var attachment = new Attachment { FilePath = filePath, UrlId = url.Id };
        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync();

        // Return the file URL
        return Ok(new { Message = "File uploaded successfully", FileUrl = $"/uploads/{url.Id}/{fileName}" });
    }
    [HttpGet("details")] // GET /api/files/details?endpoint=gato
    public async Task<IActionResult> GetAttachmentsAndContents([FromQuery] string endpoint)
    {
        if (string.IsNullOrEmpty(endpoint))
            return BadRequest("Endpoint is required.");

        var url = await _context.Urls
            .Include(u => u.Attachments)
            .FirstOrDefaultAsync(u => u.Endpoint == endpoint);

        // If URL not found, create a new one
        if (url == null)
        {
            url = new Url
            {
                Id = Guid.NewGuid(),
                Endpoint = endpoint,
                Text = string.Empty, // Initialize with empty text
                Hash = string.Empty, // Initialize with empty hash
                CreatedAt = DateTime.UtcNow
            };

            _context.Urls.Add(url);
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            Endpoint = url.Endpoint,
            Text = url.Text,  // Directly returning the text from Url
            Hash = url.Hash,  // Directly returning the hash from Url
            Attachments = url.Attachments?.Select(a => new
            {
                a.Id,
                FilePath = $"/uploads/{url.Id}/{Path.GetFileName(a.FilePath)}",
                a.CreatedAt
            }) ?? Enumerable.Empty<object>()
        });
    }

    [HttpDelete("delete/{id}")] // DELETE /api/files/delete/{id}
    public async Task<IActionResult> DeleteAttachment(Guid id)
    {
        var attachment = await _context.Attachments.FindAsync(id);
        
        if (attachment == null)
            return NotFound("Attachment not found.");

        if (System.IO.File.Exists(attachment.FilePath))
        {
            System.IO.File.Delete(attachment.FilePath);
        }

        _context.Attachments.Remove(attachment);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Attachment deleted successfully.", AttachmentId = id });
    }
    [HttpPut("update-content")] // PUT /api/files/update-content
    public async Task<IActionResult> UpdateOrCreateContent([FromQuery] string endpoint, [FromBody] UpdateContentRequest request)
    {
        if (string.IsNullOrEmpty(endpoint) || request == null || string.IsNullOrEmpty(request.Text))
            return BadRequest("Endpoint and content text are required.");

        // Check if the endpoint exists
        var url = await _context.Urls.FirstOrDefaultAsync(u => u.Endpoint == endpoint);

        // If not found, create a new URL entry
        if (url == null)
        {
            url = new Url
            {
                Id = Guid.NewGuid(),
                Endpoint = endpoint,
                Text = request.Text,
                Hash = ComputeHash(request.Text),
                CreatedAt = DateTime.UtcNow
            };

            _context.Urls.Add(url);
        }
        else
        {
            // Update existing URL entry
            url.Text = request.Text;
            url.Hash = ComputeHash(request.Text);
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = url.CreatedAt == DateTime.UtcNow ? "Content created successfully." : "Content updated successfully.",
            Url = new { url.Id, url.Endpoint, url.Text, url.Hash, url.CreatedAt }
        });
    }

    // Request Model
    public class UpdateContentRequest
    {
        public string Text { get; set; }
    }

    // Hash Function
    private string ComputeHash(string input)
    {
         using (SHA1 sha1 = SHA1.Create())
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(input);
            byte[] hashBytes = sha1.ComputeHash(inputBytes);
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }
    }

}
