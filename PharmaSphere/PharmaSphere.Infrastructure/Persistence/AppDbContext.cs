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
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderStatusHistory> OrderStatusHistory => Set<OrderStatusHistory>();
        public DbSet<OrderAuditLog> OrderAuditLogs => Set<OrderAuditLog>();
        public DbSet<SealColor>           SealColors       => Set<SealColor>();
        public DbSet<Party>               Parties          => Set<Party>();
        public DbSet<BrandNameLookup>     BrandNames       => Set<BrandNameLookup>();
        public DbSet<OrderStatusConfig>     OrderStatuses          => Set<OrderStatusConfig>();
        public DbSet<OrderStatusTransition> OrderStatusTransitions => Set<OrderStatusTransition>();
        public DbSet<ErrorLog>              ErrorLogs              => Set<ErrorLog>();

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

            // ── Orders table ──────────────────────────────────────────────────────
            modelBuilder.Entity<Order>(e =>
            {
                e.ToTable("Orders");
                e.HasKey(o => o.OrderId);

                e.Property(o => o.OrderId).ValueGeneratedOnAdd();
                e.Property(o => o.OrderNo).HasMaxLength(50).IsRequired();
                e.Property(o => o.OrderDate).IsRequired();
                e.Property(o => o.BrandName).HasMaxLength(200);
                e.Property(o => o.Composition).HasMaxLength(500);
                e.Property(o => o.ShelfLifeMonths).HasMaxLength(200);
                e.Property(o => o.Amount).HasPrecision(18, 2);
                e.Property(o => o.Party).HasMaxLength(200);
                e.Property(o => o.Make).HasMaxLength(200);
                e.Property(o => o.AdminRemarks).HasMaxLength(1000);
                e.Property(o => o.Vial).HasMaxLength(100);
                e.Property(o => o.SealColour).HasMaxLength(100);
                e.Property(o => o.WFI).HasMaxLength(100);
                e.Property(o => o.Label).HasMaxLength(100);
                e.Property(o => o.MonoBox).HasMaxLength(100);
                e.Property(o => o.Tray).HasMaxLength(100);
                e.Property(o => o.Leaflet).HasMaxLength(100);
                e.Property(o => o.SyringeAndNeedle).HasMaxLength(100);
                e.Property(o => o.Shrink).HasMaxLength(100);
                e.Property(o => o.Shipper).HasMaxLength(100);
                e.Property(o => o.OtherRemarks).HasMaxLength(1000);
                e.Property(o => o.CurrentStatus).HasMaxLength(50).IsRequired()
                 .HasDefaultValue("PIS Pending");
                e.Property(o => o.CreatedBy).HasMaxLength(100);
                e.Property(o => o.CreatedDate).IsRequired();
                e.Property(o => o.UpdatedBy).HasMaxLength(100);
                e.Property(o => o.IsActive).IsRequired().HasDefaultValue(true);

                e.HasIndex(o => o.IsActive).HasDatabaseName("IX_Orders_IsActive");
                e.HasIndex(o => o.CurrentStatus).HasDatabaseName("IX_Orders_Status");
                e.HasIndex(o => o.OrderDate).HasDatabaseName("IX_Orders_OrderDate");

                e.HasOne(o => o.CreatedByUser)
                 .WithMany()
                 .HasForeignKey(o => o.CreatedByUserId)
                 .HasConstraintName("FK_Orders_CreatedByUser")
                 .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(o => o.UpdatedByUser)
                 .WithMany()
                 .HasForeignKey(o => o.UpdatedByUserId)
                 .HasConstraintName("FK_Orders_UpdatedByUser")
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── OrderStatusHistory table ──────────────────────────────────────────
            modelBuilder.Entity<OrderStatusHistory>(e =>
            {
                e.ToTable("OrderStatusHistory");
                e.HasKey(h => h.HistoryId);

                e.Property(h => h.HistoryId).ValueGeneratedOnAdd();
                e.Property(h => h.FromStatus).HasMaxLength(50);
                e.Property(h => h.ToStatus).HasMaxLength(50).IsRequired();
                e.Property(h => h.Remarks).HasMaxLength(500);
                e.Property(h => h.ChangedBy).HasMaxLength(100);
                e.Property(h => h.ChangedDate).IsRequired();

                e.HasIndex(h => h.OrderId).HasDatabaseName("IX_OrderStatusHistory_OrderId");

                e.HasOne(h => h.Order)
                 .WithMany(o => o.StatusHistory)
                 .HasForeignKey(h => h.OrderId)
                 .HasConstraintName("FK_OrderStatusHistory_Order")
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(h => h.ChangedByUser)
                 .WithMany()
                 .HasForeignKey(h => h.ChangedByUserId)
                 .HasConstraintName("FK_OrderStatusHistory_User")
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── OrderAuditLogs table ──────────────────────────────────────────────
            modelBuilder.Entity<OrderAuditLog>(e =>
            {
                e.ToTable("OrderAuditLogs");
                e.HasKey(a => a.AuditLogId);

                e.Property(a => a.AuditLogId).ValueGeneratedOnAdd();
                e.Property(a => a.Action).HasMaxLength(50).IsRequired();
                e.Property(a => a.FieldName).HasMaxLength(100);
                e.Property(a => a.ChangedBy).HasMaxLength(100);
                e.Property(a => a.ChangedDate).IsRequired();

                e.HasIndex(a => a.OrderId).HasDatabaseName("IX_OrderAuditLogs_OrderId");

                e.HasOne(a => a.Order)
                 .WithMany(o => o.AuditLogs)
                 .HasForeignKey(a => a.OrderId)
                 .HasConstraintName("FK_OrderAuditLogs_Order")
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(a => a.ChangedByUser)
                 .WithMany()
                 .HasForeignKey(a => a.ChangedByUserId)
                 .HasConstraintName("FK_OrderAuditLogs_User")
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── SealColors table ──────────────────────────────────────────────────
            modelBuilder.Entity<SealColor>(e =>
            {
                e.ToTable("SealColors");
                e.HasKey(s => s.SealColorId);
                e.Property(s => s.SealColorId).ValueGeneratedOnAdd();
                e.Property(s => s.ColorName).HasMaxLength(100).IsRequired();
                e.Property(s => s.IsActive).IsRequired().HasDefaultValue(true);
                e.HasIndex(s => s.ColorName).IsUnique()
                 .HasDatabaseName("UQ_SealColors_ColorName");
            });

            // ── Parties table ─────────────────────────────────────────────────────
            modelBuilder.Entity<Party>(e =>
            {
                e.ToTable("Parties");
                e.HasKey(p => p.PartyId);
                e.Property(p => p.PartyId).ValueGeneratedOnAdd();
                e.Property(p => p.PartyName).HasMaxLength(200).IsRequired();
                e.Property(p => p.IsActive).IsRequired().HasDefaultValue(true);
                e.HasIndex(p => p.PartyName).IsUnique()
                 .HasDatabaseName("UQ_Parties_PartyName");
            });

            // ── BrandNames table ──────────────────────────────────────────────────
            modelBuilder.Entity<BrandNameLookup>(e =>
            {
                e.ToTable("BrandNames");
                e.HasKey(b => b.BrandNameId);
                e.Property(b => b.BrandNameId).ValueGeneratedOnAdd();
                e.Property(b => b.BrandName).HasMaxLength(200).IsRequired();
                e.Property(b => b.IsActive).IsRequired().HasDefaultValue(true);
                e.HasIndex(b => b.BrandName).IsUnique()
                 .HasDatabaseName("UQ_BrandNames_BrandName");
            });

            // ── OrderStatuses table ───────────────────────────────────────────────
            modelBuilder.Entity<OrderStatusConfig>(e =>
            {
                e.ToTable("OrderStatuses");
                e.HasKey(s => s.StatusId);
                e.Property(s => s.StatusId).ValueGeneratedOnAdd();
                e.Property(s => s.StatusName).HasMaxLength(100).IsRequired();
                e.Property(s => s.DisplayOrder).IsRequired();
                e.Property(s => s.Color).HasMaxLength(50).IsRequired().HasDefaultValue("default");
                e.Property(s => s.IsInitial).IsRequired().HasDefaultValue(false);
                e.Property(s => s.IsTerminal).IsRequired().HasDefaultValue(false);
                e.Property(s => s.ShowInFlow).IsRequired().HasDefaultValue(true);
                e.Property(s => s.IsActive).IsRequired().HasDefaultValue(true);
                e.HasIndex(s => s.StatusName).IsUnique()
                 .HasDatabaseName("UQ_OrderStatuses_StatusName");
            });

            // ── OrderStatusTransitions table ──────────────────────────────────────
            modelBuilder.Entity<OrderStatusTransition>(e =>
            {
                e.ToTable("OrderStatusTransitions");
                e.HasKey(t => t.TransitionId);
                e.Property(t => t.TransitionId).ValueGeneratedOnAdd();
                e.Property(t => t.FromStatus).HasMaxLength(100).IsRequired();
                e.Property(t => t.ToStatus).HasMaxLength(100).IsRequired();
                e.HasIndex(t => new { t.FromStatus, t.ToStatus }).IsUnique()
                 .HasDatabaseName("UQ_OrderStatusTransitions");
            });

            // ── ErrorLog table ────────────────────────────────────────────────────
            modelBuilder.Entity<ErrorLog>(e =>
            {
                e.ToTable("ErrorLog");
                e.HasKey(el => el.ErrorLogId);
                e.Property(el => el.ErrorLogId).ValueGeneratedOnAdd();
                e.Property(el => el.IPAddress).HasMaxLength(20);
                e.Property(el => el.ClientBrowser).HasMaxLength(50);
            });
        }
    }

}
