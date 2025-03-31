using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dontpad.Models
{
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
}
