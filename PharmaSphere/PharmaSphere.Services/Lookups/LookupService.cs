using PharmaSphere.Repositories.Interfaces;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Services.Lookups
{
    public sealed class LookupService : ILookupService
    {
        private readonly ILookupRepository _lookups;

        public LookupService(ILookupRepository lookups) => _lookups = lookups;

        public Task<IReadOnlyList<string>> GetPartiesAsync(CancellationToken ct = default)
            => _lookups.GetPartiesAsync(ct);

        public Task<IReadOnlyList<string>> GetBrandNamesAsync(CancellationToken ct = default)
            => _lookups.GetBrandNamesAsync(ct);
    }
}
