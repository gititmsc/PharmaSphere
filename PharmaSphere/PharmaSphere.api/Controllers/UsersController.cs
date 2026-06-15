using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmaSphere.Core.DTOs;
using PharmaSphere.Services.Interfaces;

namespace PharmaSphere.Api.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    [Produces("application/json")]
    public sealed class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // GET /api/users?search=&roleId=&sortBy=&sortDir=&page=1&pageSize=10
        [HttpGet]
        [ProducesResponseType(typeof(PagedResultDto<UserListItemDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsers(
            [FromQuery] UserListQueryDto query, CancellationToken ct)
        {
            var result = await _userService.GetUsersAsync(query, ct);
            return Ok(result);
        }

        // GET /api/users/roles
        [HttpGet("roles")]
        [ProducesResponseType(typeof(IReadOnlyList<RoleDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRoles(CancellationToken ct)
        {
            var roles = await _userService.GetRolesAsync(ct);
            return Ok(roles);
        }

        // GET /api/users/{id}
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(UserByIdDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUser(int id, CancellationToken ct)
        {
            var user = await _userService.GetUserByIdAsync(id, ct);
            if (user is null) return NotFound(new { message = "User not found." });
            return Ok(user);
        }

        // POST /api/users
        [HttpPost]
        [ProducesResponseType(typeof(UserListItemDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateUser(
            [FromBody] CreateUserRequestDto request, CancellationToken ct)
        {
            try
            {
                var result = await _userService.CreateUserAsync(request, ct);
                return CreatedAtAction(nameof(GetUser), new { id = result.UserId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/users/{id}
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUser(int id, CancellationToken ct)
        {
            try
            {
                await _userService.DeleteUserAsync(id, ct);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT /api/users/{id}
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(UserListItemDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUser(
            int id, [FromBody] UpdateUserRequestDto request, CancellationToken ct)
        {
            try
            {
                var result = await _userService.UpdateUserAsync(id, request, ct);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
