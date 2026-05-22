using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;
using PharmaSphere.Repositories.Interfaces;

namespace PharmaSphere.Repositories.Lookups
{
    public sealed class LookupRepository : ILookupRepository
    {
        private readonly AppDbContext _db;

        public LookupRepository(AppDbContext db) => _db = db;

        public async Task<IReadOnlyList<string>> GetPartiesAsync(CancellationToken ct = default)
            => await _db.Parties
                .Where(p => p.IsActive)
                .OrderBy(p => p.PartyName)
                .Select(p => p.PartyName)
                .ToListAsync(ct);

        public async Task<IReadOnlyList<string>> GetBrandNamesAsync(CancellationToken ct = default)
            => await _db.BrandNames
                .Where(b => b.IsActive)
                .OrderBy(b => b.BrandName)
                .Select(b => b.BrandName)
                .ToListAsync(ct);

        public async Task EnsurePartyExistsAsync(string name, CancellationToken ct = default)
        {
            var trimmed = name.Trim();
            if (string.IsNullOrEmpty(trimmed)) return;

            var exists = await _db.Parties
                .AnyAsync(p => p.PartyName == trimmed, ct);

            if (!exists)
            {
                _db.Parties.Add(new Party { PartyName = trimmed, IsActive = true });
                await _db.SaveChangesAsync(ct);
            }
        }

        public async Task EnsureBrandNameExistsAsync(string name, CancellationToken ct = default)
        {
            var trimmed = name.Trim();
            if (string.IsNullOrEmpty(trimmed)) return;

            var exists = await _db.BrandNames
                .AnyAsync(b => b.BrandName == trimmed, ct);

            if (!exists)
            {
                _db.BrandNames.Add(new BrandNameLookup { BrandName = trimmed, IsActive = true });
                await _db.SaveChangesAsync(ct);
            }
        }
    }
}
