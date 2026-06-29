using Microsoft.EntityFrameworkCore;
using PharmaSphere.Core.DTOs;
using PharmaSphere.Core.Models;
using PharmaSphere.Infrastructure.Persistence;
using PharmaSphere.Repositories.Interfaces;

namespace PharmaSphere.Repositories.ProductMasters
{
    public sealed class ProductMasterRepository : IProductMasterRepository
    {
        private readonly AppDbContext _db;

        public ProductMasterRepository(AppDbContext db) => _db = db;

        public async Task<PagedResultDto<ProductMasterListItemDto>> GetPagedAsync(
            ProductMasterListQueryDto query, CancellationToken ct = default)
        {
            var q = _db.ProductMasters.AsNoTracking()
                        .Where(p => !p.IsDeleted);

            // Quick search across all text fields
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.Trim().ToLower();
                q = q.Where(p =>
                    p.BrandName.ToLower().Contains(s)    ||
                    p.GenericName.ToLower().Contains(s)  ||
                    p.Vial.ToLower().Contains(s)         ||
                    p.SealColor.ToLower().Contains(s)    ||
                    p.WFI.ToLower().Contains(s)          ||
                    p.Label.ToLower().Contains(s)        ||
                    p.MonoBox.ToLower().Contains(s)      ||
                    p.MonthBox.ToLower().Contains(s)     ||
                    p.Tray.ToLower().Contains(s)         ||
                    p.Leaflet.ToLower().Contains(s)      ||
                    p.SyringeNeedle.ToLower().Contains(s)||
                    p.Shrink.ToLower().Contains(s)       ||
                    p.Shipper.ToLower().Contains(s)      ||
                    p.Hologram.ToLower().Contains(s));
            }

            // Brand name filter (dropdown)
            if (!string.IsNullOrWhiteSpace(query.BrandName))
                q = q.Where(p => p.BrandName == query.BrandName);

            // Sorting
            q = (query.SortBy?.ToLower(), query.SortDir?.ToLower()) switch
            {
                ("genericname", "desc") => q.OrderByDescending(p => p.GenericName),
                ("genericname",      _) => q.OrderBy(p => p.GenericName),
                ("vial",        "desc") => q.OrderByDescending(p => p.Vial),
                ("vial",             _) => q.OrderBy(p => p.Vial),
                ("sealcolor",   "desc") => q.OrderByDescending(p => p.SealColor),
                ("sealcolor",        _) => q.OrderBy(p => p.SealColor),
                ("monobox",     "desc") => q.OrderByDescending(p => p.MonoBox),
                ("monobox",          _) => q.OrderBy(p => p.MonoBox),
                ("brandname",   "desc") => q.OrderByDescending(p => p.BrandName),
                _                       => q.OrderBy(p => p.BrandName),
            };

            var total = await q.CountAsync(ct);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => new ProductMasterListItemDto(
                    p.Id, p.BrandName, p.GenericName, p.Vial, p.SealColor, p.MonoBox))
                .ToListAsync(ct);

            return new PagedResultDto<ProductMasterListItemDto>(items, total, query.Page, query.PageSize);
        }

        public async Task<IReadOnlyList<string>> GetAllBrandNamesAsync(CancellationToken ct = default) =>
            await _db.ProductMasters.AsNoTracking()
                .Where(p => !p.IsDeleted)
                .Select(p => p.BrandName)
                .Distinct()
                .OrderBy(n => n)
                .ToListAsync(ct);

        public async Task<ProductMaster?> GetByIdAsync(int id, CancellationToken ct = default) =>
            await _db.ProductMasters.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, ct);

        public async Task<ProductMaster?> GetByBrandNameAsync(string brandName, CancellationToken ct = default) =>
            await _db.ProductMasters
                .AsNoTracking()
                .Where(p => !p.IsDeleted && p.BrandName == brandName)
                .OrderBy(p => p.Id)
                .FirstOrDefaultAsync(ct);

        public async Task AddAsync(ProductMaster product, CancellationToken ct = default)
        {
            _db.ProductMasters.Add(product);
            await SaveChangesAsync(ct);
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
        {
            var product = await _db.ProductMasters.FindAsync([id], ct);
            if (product is null || product.IsDeleted) return false;
            product.IsDeleted = true;
            await SaveChangesAsync(ct);
            return true;
        }

        public async Task SaveChangesAsync(CancellationToken ct = default) =>
            await _db.SaveChangesAsync(ct);
    }
}
