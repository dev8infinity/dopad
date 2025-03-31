using System.Security.Cryptography;
using System.Text;

namespace Dontpad.Services
{
    public class HashService
    {
        public string ComputeHash(string input)
        {
            using var sha1 = SHA1.Create();
            var hashBytes = sha1.ComputeHash(Encoding.UTF8.GetBytes(input));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }
    }
}
