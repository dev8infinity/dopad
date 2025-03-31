using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Dontpad.Data;
using Dontpad.Models;
using Dontpad.Services;
using Dontpad.ResquestModels;


namespace Dontpad.Controllers
{
    [ApiController]
    [Route("api/files")]
    public class FileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HashService _hashService;
        private readonly string _uploadPath = Path.Combine("wwwroot", "uploads");

        public FileController(AppDbContext context, HashService hashService)
        {
            _context = context;
            _hashService = hashService;

            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string endpoint)
        {
            if (file == null || file.Length == 0) return BadRequest("No file provided.");

            var url = await _context.Urls.FirstOrDefaultAsync(u => u.Endpoint == endpoint);
            if (url == null)
            {
                url = new Url { Id = Guid.NewGuid(), Endpoint = endpoint };
                _context.Urls.Add(url);
                await _context.SaveChangesAsync();
            }

            var endpointDir = Path.Combine(_uploadPath, url.Id.ToString());
            if (!Directory.Exists(endpointDir)) Directory.CreateDirectory(endpointDir);

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(endpointDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new Attachment { FilePath = filePath, UrlId = url.Id };
            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "File uploaded successfully", FileUrl = $"/uploads/{url.Id}/{fileName}" });
        }

        [HttpGet("details")]
        public async Task<IActionResult> GetAttachmentsAndContents([FromQuery] string endpoint)
        {
            if (string.IsNullOrEmpty(endpoint)) return BadRequest("Endpoint is required.");

            var url = await _context.Urls
                .Include(u => u.Attachments)
                .FirstOrDefaultAsync(u => u.Endpoint == endpoint);

            if (url == null)
            {
                url = new Url { Id = Guid.NewGuid(), Endpoint = endpoint, CreatedAt = DateTime.UtcNow };
                _context.Urls.Add(url);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                Endpoint = url.Endpoint,
                Text = url.Text,
                Hash = url.Hash,
                Attachments = url.Attachments?.Select(a => new
                {
                    a.Id,
                    FilePath = $"/uploads/{url.Id}/{Path.GetFileName(a.FilePath)}",
                    a.CreatedAt
                }) ?? Enumerable.Empty<object>()
            });
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAttachment(Guid id)
        {
            var attachment = await _context.Attachments.FindAsync(id);
            if (attachment == null) return NotFound("Attachment not found.");

            if (System.IO.File.Exists(attachment.FilePath))
            {
                System.IO.File.Delete(attachment.FilePath);
            }

            _context.Attachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Attachment deleted successfully.", AttachmentId = id });
        }

        [HttpPut("update-content")]
        public async Task<IActionResult> UpdateOrCreateContent([FromQuery] string endpoint, [FromBody] UpdateContentRequest request)
        {
            if (string.IsNullOrEmpty(endpoint) || request == null || string.IsNullOrEmpty(request.Text))
                return BadRequest("Endpoint and content text are required.");

            var url = await _context.Urls.FirstOrDefaultAsync(u => u.Endpoint == endpoint);

            if (url == null)
            {
                url = new Url { Id = Guid.NewGuid(), Endpoint = endpoint, Text = request.Text, Hash = _hashService.ComputeHash(request.Text) };
                _context.Urls.Add(url);
            }
            else
            {
                url.Text = request.Text;
                url.Hash = _hashService.ComputeHash(request.Text);
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Content updated successfully.", Url = url });
        }
    }
}
