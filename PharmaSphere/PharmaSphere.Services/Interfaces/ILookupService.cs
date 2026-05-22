namespace PharmaSphere.Services.Interfaces
{
    public interface ILookupService
    {
        Task<IReadOnlyList<string>> GetPartiesAsync(CancellationToken ct = default);
        Task<IReadOnlyList<string>> GetBrandNamesAsync(CancellationToken ct = default);
    }
}
