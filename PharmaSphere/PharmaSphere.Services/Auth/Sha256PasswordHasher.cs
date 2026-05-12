using System.Security.Cryptography;
using System.Text;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.Auth
{

    /// <summary>
    /// SHA-256 password hasher.
    ///
    /// Produces a 64-character lowercase hex string which fits in
    /// the existing Password varchar(100) column.
    ///
    /// ⚠ If you can ALTER the Password column to varchar(255) or nvarchar(255),
    ///   switch to the BCryptPasswordHasher (also provided below as a comment)
    ///   for stronger security with salted hashing.
    ///
    /// To hash existing plain-text passwords in the DB, run the migration
    /// helper script in /docs/hash-existing-passwords.sql.
    /// </summary>
    public sealed class Sha256PasswordHasher : IPasswordHasher
    {
        public string Hash(string plainText)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainText));
            return Convert.ToHexString(bytes).ToLowerInvariant(); // 64 chars
        }

        public bool Verify(string plainText, string storedHash)
            => Hash(plainText) == storedHash;
    }

    /*
     * ─── BCrypt alternative (recommended if column can be widened) ───────────────
     * Install-Package BCrypt.Net-Next in PharmaSphere.Services.csproj
     *
     * public sealed class BCryptPasswordHasher : IPasswordHasher
     * {
     *     public string Hash(string plainText) =>
     *         BCrypt.Net.BCrypt.HashPassword(plainText, workFactor: 12); // ~60 chars
     *
     *     public bool Verify(string plainText, string storedHash) =>
     *         BCrypt.Net.BCrypt.Verify(plainText, storedHash);
     * }
     */

}
