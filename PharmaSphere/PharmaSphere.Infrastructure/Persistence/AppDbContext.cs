using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.Models;

namespace PharmaSphere.Infrastructure.Persistence
{

    /// <summary>
    /// EF Core database context.
    /// Configured to map exactly to the existing SQL Server schema:
    ///
    ///   Role    (RoleId PK, RoleName)
    ///   Users   (UserId PK, EmailAddress, Password, isActive, RoleId FK)
    ///   RefreshTokens  — created by EF migration (manages JWT session revocation)
    /// </summary>
    public sealed class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<TwoFactorCode> TwoFactorCodes => Set<TwoFactorCode>();
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Role table ────────────────────────────────────────────────────────
            modelBuilder.Entity<Role>(e =>
            {
                e.ToTable("Role");
                e.HasKey(r => r.RoleId);

                e.Property(r => r.RoleId)
                 .HasColumnName("RoleId")
                 .ValueGeneratedOnAdd();

                e.Property(r => r.RoleName)
                 .HasColumnName("RoleName")
                 .HasMaxLength(100)
                 .IsRequired();
            });

            // ── Users table ───────────────────────────────────────────────────────
            modelBuilder.Entity<User>(e =>
            {
                e.ToTable("Users");
                e.HasKey(u => u.UserId);

                e.Property(u => u.UserId)
                 .HasColumnName("UserId")
                 .ValueGeneratedOnAdd();

                e.Property(u => u.EmailAddress)
                 .HasColumnName("EmailAddress")
                 .HasMaxLength(500)
                 .IsRequired();

                e.Property(u => u.Password)
                 .HasColumnName("Password")
                 .HasMaxLength(100)
                 .IsRequired();

                e.Property(u => u.FirstName)
                 .HasColumnName("FirstName")
                 .HasMaxLength(100);

                e.Property(u => u.LastName)
                 .HasColumnName("LastName")
                 .HasMaxLength(100);

                e.Property(u => u.IsActive)
                 .HasColumnName("isActive")
                 .IsRequired();

                e.Property(u => u.RoleId)
                 .HasColumnName("RoleId")
                 .IsRequired();

                // Unique index on email
                e.HasIndex(u => u.EmailAddress)
                 .IsUnique()
                 .HasDatabaseName("IX_Users_EmailAddress");

                // FK → Role
                e.HasOne(u => u.Role)
                 .WithMany(r => r.Users)
                 .HasForeignKey(u => u.RoleId)
                 .HasConstraintName("FK_Users_Role")
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── RefreshTokens table ───────────────────────────────────────────────
            modelBuilder.Entity<RefreshToken>(e =>
            {
                e.ToTable("RefreshTokens");
                e.HasKey(t => t.RefreshTokenId);

                e.Property(t => t.RefreshTokenId).ValueGeneratedOnAdd();
                e.Property(t => t.Token).HasMaxLength(512).IsRequired();
                e.Property(t => t.ReplacedByToken).HasMaxLength(512);
                e.Property(t => t.ExpiresAt).IsRequired();
                e.Property(t => t.IsRevoked).IsRequired();
                e.Property(t => t.CreatedAt).IsRequired();

                // Unique index on Token value for fast lookup
                e.HasIndex(t => t.Token)
                 .IsUnique()
                 .HasDatabaseName("IX_RefreshTokens_Token");

                // FK → Users
                e.HasOne(t => t.User)
                 .WithMany()
                 .HasForeignKey(t => t.UserId)
                 .HasConstraintName("FK_RefreshTokens_Users")
                 .OnDelete(DeleteBehavior.Cascade);

                // Ignore computed properties — not stored in DB
                e.Ignore(t => t.IsExpired);
                e.Ignore(t => t.IsActive);
            });

            // ── TwoFactorCodes table ──────────────────────────────────────────────
            modelBuilder.Entity<TwoFactorCode>(e =>
            {
                e.ToTable("TwoFactorCodes");
                e.HasKey(c => c.TwoFactorCodeId);

                e.Property(c => c.TwoFactorCodeId).ValueGeneratedOnAdd();
                e.Property(c => c.Code).HasMaxLength(6).IsRequired().IsFixedLength();
                e.Property(c => c.ExpiresAt).IsRequired();
                e.Property(c => c.IsUsed).IsRequired();
                e.Property(c => c.CreatedAt).IsRequired();

                // FK → Users
                e.HasOne(c => c.User)
                 .WithMany()
                 .HasForeignKey(c => c.UserId)
                 .HasConstraintName("FK_TwoFactorCodes_Users")
                 .OnDelete(DeleteBehavior.Cascade);

                // Index for fast per-user lookup
                e.HasIndex(c => c.UserId)
                 .HasDatabaseName("IX_TwoFactorCodes_UserId");

                // Ignore computed properties
                e.Ignore(c => c.IsExpired);
                e.Ignore(c => c.IsValid);
            });

            // ── PasswordResetTokens table ─────────────────────────────────────────
            modelBuilder.Entity<PasswordResetToken>(e =>
            {
                e.ToTable("PasswordResetTokens");
                e.HasKey(t => t.PasswordResetTokenId);

                e.Property(t => t.PasswordResetTokenId).ValueGeneratedOnAdd();
                e.Property(t => t.Token).HasMaxLength(36).IsRequired();
                e.Property(t => t.ExpiresAt).IsRequired();
                e.Property(t => t.IsUsed).IsRequired();
                e.Property(t => t.CreatedAt).IsRequired();

                e.HasIndex(t => t.Token)
                 .IsUnique()
                 .HasDatabaseName("IX_PasswordResetTokens_Token");

                e.HasIndex(t => t.UserId)
                 .HasDatabaseName("IX_PasswordResetTokens_UserId");

                // FK → Users
                e.HasOne(t => t.User)
                 .WithMany()
                 .HasForeignKey(t => t.UserId)
                 .HasConstraintName("FK_PasswordResetTokens_Users")
                 .OnDelete(DeleteBehavior.Cascade);

                e.Ignore(t => t.IsExpired);
                e.Ignore(t => t.IsValid);
            });
        }
    }

}
