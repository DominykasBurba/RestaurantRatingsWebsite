using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantApi.Data;
using RestaurantApi.Models;
using System.Security.Claims;

namespace RestaurantApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ReviewsController(AppDbContext db) { _db = db; }

        // Visi mato tik patvirtintus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetAll()
            => Ok(await _db.Reviews
                .Where(r => r.Status == ReviewStatus.Approved)
                .AsNoTracking()
                .ToListAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> Get(int id)
        {
            var r = await _db.Reviews.FindAsync(id);
            if (r is null) return NotFound();

            if (r.Status != ReviewStatus.Approved)
            {
                if (!User.Identity?.IsAuthenticated ?? true) return NotFound();
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (role != nameof(UserRole.Admin) && r.UserId != userId) return Forbid();
            }

            return Ok(r);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Review>> Create(Review r)
        {
            if (r.RestaurantId is null && r.DishId is null)
                return BadRequest(new { error = "Either RestaurantId or DishId is required." });

            if (r.Rating < 1 || r.Rating > 5)
                return BadRequest(new { error = "Rating must be between 1 and 5." });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (r.RestaurantId is not null && !await _db.Restaurants.AnyAsync(x => x.Id == r.RestaurantId))
                return BadRequest(new { error = $"Restaurant with ID {r.RestaurantId} does not exist." });

            if (r.DishId is not null && !await _db.Dishes.AnyAsync(x => x.Id == r.DishId))
                return BadRequest(new { error = $"Dish with ID {r.DishId} does not exist." });

            r.UserId = userId;
            // paprastumo dėlei iškart laikome patvirtintu
            r.Status = ReviewStatus.Approved;
            r.CreatedAt = DateTime.UtcNow;

            _db.Reviews.Add(r);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = r.Id }, r);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, Review r)
        {
            if (id != r.Id) return BadRequest();

            var existing = await _db.Reviews.FindAsync(id);
            if (existing is null) return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (role != nameof(UserRole.Admin) && existing.UserId != userId)
                return Forbid();

            existing.Rating = r.Rating;
            existing.Comment = r.Comment;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var r = await _db.Reviews.FindAsync(id);
            if (r is null) return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (role != nameof(UserRole.Admin) && r.UserId != userId)
                return Forbid();

            _db.Reviews.Remove(r);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}


