using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Dontpad.Models
{
    public class Url
    {
        [Key]
        public Guid Id { get; set; }
        public string Endpoint { get; set; }
        public string Text { get; set; } = string.Empty; // Define um valor padrão para evitar NULL
        public string Hash { get; set; } = string.Empty; // Define um valor padrão para evitar NULL 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Attachment> Attachments { get; set; } = new();
    }
}
