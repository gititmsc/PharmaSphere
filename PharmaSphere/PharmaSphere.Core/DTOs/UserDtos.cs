using System;
using System.Collections.Generic;

namespace PharmaSphere.Core.DTOs
{
    // ─── User Management DTOs ────────────────────────────────────────────────────

    public sealed record RoleDto(int RoleId, string RoleName);

    public sealed record UserListItemDto(
        int UserId,
        string Email,
        string? FirstName,
        string? LastName,
        string RoleName,
        int RoleId,
        bool IsActive);

    public sealed record UserListQueryDto(
        string? Search = null,
        int? RoleId = null,
        bool? IsActive = null,      // null = all, true = active only, false = inactive only
        string? SortBy = null,      // "email" | "firstName" | "lastName"
        string? SortDir = null,     // "asc" | "desc"
        int Page = 1,
        int PageSize = 10);

    public sealed record PagedResultDto<T>(
        IReadOnlyList<T> Items,
        int TotalCount,
        int Page,
        int PageSize);

    /// <summary>Full user detail returned by GET /api/users/{id}.</summary>
    public sealed record UserByIdDto(
        int UserId,
        string Email,
        string? FirstName,
        string? LastName,
        int RoleId,
        bool IsActive);

    public sealed record CreateUserRequestDto(
        string Email,
        string Password,
        string? FirstName,
        string? LastName,
        int RoleId,
        bool IsActive = true);

    public sealed record UpdateUserRequestDto(
        string Email,
        string? FirstName,
        string? LastName,
        int RoleId,
        bool IsActive,
        string? Password = null);   // null = keep existing password
}
