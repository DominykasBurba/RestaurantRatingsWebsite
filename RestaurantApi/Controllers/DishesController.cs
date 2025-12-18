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
    public class DishesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DishesController(AppDbContext db) { _db = db; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Dish>>> GetAll()
            => Ok(await _db.Dishes
                .Include(d => d.Restaurant)
                .Where(d => d.Restaurant != null && d.Restaurant.Status == RestaurantStatus.Approved)
                .AsNoTracking()
                .ToListAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Dish>> Get(int id)
        {
            var d = await _db.Dishes
                .Include(x => x.Restaurant)
                .Include(x => x.Reviews)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (d is null) return NotFound();

            if (d.Restaurant?.Status != RestaurantStatus.Approved)
            {
                if (!User.Identity?.IsAuthenticated ?? true) return NotFound();
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (role != nameof(UserRole.Admin) && d.Restaurant?.OwnerId != userId) return Forbid();
            }

            d.Reviews = d.Reviews.Where(r => r.Status == ReviewStatus.Approved).ToList();
            return Ok(d);
        }

        [HttpPost]
        [Authorize(Roles = "RestaurantOwner,Admin")]
        public async Task<ActionResult<Dish>> Create(Dish d)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var restaurant = await _db.Restaurants.FindAsync(d.RestaurantId);
            if (restaurant is null)
                return BadRequest(new { error = "Restaurant not found" });

            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (role != nameof(UserRole.Admin) && restaurant.OwnerId != userId)
                return Forbid();

            _db.Dishes.Add(d);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = d.Id }, d);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "RestaurantOwner,Admin")]
        public async Task<IActionResult> Update(int id, Dish d)
        {
            if (id != d.Id) 
                return BadRequest(new { error = "ID in URL does not match ID in body." });

            var existing = await _db.Dishes.Include(x => x.Restaurant).FirstOrDefaultAsync(x => x.Id == id);
            if (existing is null) return NotFound();

            var restaurant = await _db.Restaurants.FindAsync(d.RestaurantId);
            if (restaurant is null)
                return BadRequest(new { error = $"Restaurant with ID {d.RestaurantId} does not exist." });

            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (role != nameof(UserRole.Admin) && restaurant.OwnerId != userId)
                return Forbid();

            existing.Name = d.Name;
            existing.Description = d.Description;
            existing.RestaurantId = d.RestaurantId;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "RestaurantOwner,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var d = await _db.Dishes
                .Include(x => x.Restaurant)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (d is null) return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (role != nameof(UserRole.Admin) && d.Restaurant?.OwnerId != userId)
                return Forbid();

            // Pirmiausia pašaliname su šiuo patiekalu susijusius atsiliepimus,
            // kad neliktų FK klaidos trynimo metu.
            var relatedReviews = await _db.Reviews
                .Where(r => r.DishId == id)
                .ToListAsync();
            if (relatedReviews.Any())
            {
                _db.Reviews.RemoveRange(relatedReviews);
            }

            _db.Dishes.Remove(d);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}


