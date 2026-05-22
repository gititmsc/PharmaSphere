namespace PharmaSphere.Repositories.Interfaces
{
    public interface ILookupRepository
    {
        Task<IReadOnlyList<string>> GetPartiesAsync(CancellationToken ct = default);
        Task<IReadOnlyList<string>> GetBrandNamesAsync(CancellationToken ct = default);
        Task EnsurePartyExistsAsync(string name, CancellationToken ct = default);
        Task EnsureBrandNameExistsAsync(string name, CancellationToken ct = default);
    }
}
