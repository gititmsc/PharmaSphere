namespace PharmaSphere.Services.Interfaces
{
    /// <summary>
    /// Abstraction for password hashing and verification.
    /// Lives in PharmaSphere.Services alongside its implementation (Sha256PasswordHasher).
    /// </summary>
    public interface IPasswordHasher
    {
        /// <summary>Returns a 64-char lowercase hex SHA-256 hash of the plain-text password.</summary>
        string Hash(string plainText);

        /// <summary>Compares a plain-text password against a stored hash.</summary>
        bool Verify(string plainText, string storedHash);
    }
}
