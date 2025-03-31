using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Threading.Tasks;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=database.db"));
builder.Services.AddControllers();
var app = builder.Build();
app.UseRouting();

// Use static files middleware to serve files from the uploads folder
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
    public DbSet<Content> Contents { get; set; }

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

public class Content
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Text { get; set; }
    public string Hash { get; set; }
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
}
