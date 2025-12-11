using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantApi.Data;
using RestaurantApi.DTOs;
using RestaurantApi.Models;
using RestaurantApi.Services;

namespace RestaurantApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwtService;

        public AuthController(AppDbContext db, JwtService jwtService)
        {
            _db = db;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { error = "Email already exists" });

            if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest(new { error = "Username already exists" });

            var user = new User
            {
                Email = dto.Email,
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.User
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString()
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { error = "Invalid username or password" });

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString()
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // JWT yra stateless, todėl logout yra kliento atsakomybė (pašalinti tokeną)
            return Ok(new { message = "Logged out successfully" });
        }

        // AccessToken endpoint - grąžina naują token naudodamas esamus claim'us
        [HttpGet("access-token")]
        [Authorize]
        public async Task<ActionResult<AuthResponseDto>> AccessToken()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString()
            });
        }
    }
}

