using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PharmaSphere.Core.Models
{
    /// <summary>
    /// Maps to the [Role] table.
    /// Columns: RoleId (PK), RoleName
    /// </summary>
    public sealed class Role
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;

        // Navigation
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
