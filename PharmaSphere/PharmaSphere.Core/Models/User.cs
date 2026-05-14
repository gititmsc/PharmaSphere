using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmaSphere.Core.Models
{

    /// <summary>
    /// Maps to the [Users] table.
    /// Columns: UserId (PK int), EmailAddress, Password, isActive, RoleId (FK → Role)
    /// </summary>
    public sealed class User
    {
        /// <summary>Primary key — int identity column in the database.</summary>
        public int UserId { get; set; }

        /// <summary>Maps to EmailAddress varchar(500).</summary>
        public string EmailAddress { get; set; } = string.Empty;

        /// <summary>
        /// Maps to Password varchar(100).
        /// Stored as SHA-256 hex hash (64 chars) — fits comfortably in varchar(100).
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>Maps to isActive bit.</summary>
        public bool IsActive { get; set; } = true;

        /// <summary>Maps to FirstName varchar(100).</summary>
        public string? FirstName { get; set; }

        /// <summary>Maps to LastName varchar(100).</summary>
        public string? LastName { get; set; }

        /// <summary>Foreign key to Role table.</summary>
        public int RoleId { get; set; }

        // ─── Navigation ───────────────────────────────────────────────────────────
        public Role Role { get; set; } = default!;
    }

}
