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
    public class RestaurantsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public RestaurantsController(AppDbContext db) { _db = db; }

        // Neregistruotas mato tik patvirtintus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Restaurant>>> GetAll()
            => Ok(await _db.Restaurants
                .Where(r => r.Status == RestaurantStatus.Approved)
                .AsNoTracking()
                .ToListAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Restaurant>> Get(int id)
        {
            var r = await _db.Restaurants
                .Include(x => x.Dishes)
                .Include(x => x.Reviews)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (r is null) return NotFound();

            // Jei nepatvirtintas, leisti tik savininkui arba admin
            if (r.Status != RestaurantStatus.Approved)
            {
                if (!User.Identity?.IsAuthenticated ?? true) return NotFound();
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (role != nameof(UserRole.Admin) && r.OwnerId != userId) return Forbid();
            }

            // Rodom tik patvirtintus atsiliepimus
            r.Reviews = r.Reviews.Where(rev => rev.Status == ReviewStatus.Approved).ToList();
            return Ok(r);
        }

        [HttpPost]
        [Authorize(Roles = "RestaurantOwner,Admin")]
        public async Task<ActionResult<Restaurant>> Create(Restaurant r)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (role == nameof(UserRole.RestaurantOwner))
                r.OwnerId = userId;

            // Nauji restoranai laukia patvirtinimo
            if (role == nameof(UserRole.RestaurantOwner))
                r.Status = RestaurantStatus.Pending;

            r.AverageRating = 0;
            _db.Restaurants.Add(r);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = r.Id }, r);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "RestaurantOwner,Admin")]
        public async Task<IActionResult> Update(int id, Restaurant r)
        {
            if (id != r.Id) return BadRequest();

            var existing = await _db.Restaurants.FindAsync(id);
            if (existing is null) return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (role != nameof(UserRole.Admin) && existing.OwnerId != userId)
                return Forbid();

            existing.Name = r.Name;
            existing.Address = r.Address;
            // Status gali keisti tik admin
            if (role == nameof(UserRole.Admin))
                existing.Status = r.Status;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "RestaurantOwner,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var r = await _db.Restaurants.FindAsync(id);
            if (r is null) return NotFound();

            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (role != nameof(UserRole.Admin) && r.OwnerId != userId)
                return Forbid();

            _db.Restaurants.Remove(r);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{id}/dishes")]
        public async Task<ActionResult<IEnumerable<Dish>>> GetDishes(int id)
        {
            var restaurant = await _db.Restaurants.FindAsync(id);
            if (restaurant is null) return NotFound();

            if (restaurant.Status != RestaurantStatus.Approved)
            {
                if (!User.Identity?.IsAuthenticated ?? true) return NotFound();
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (role != nameof(UserRole.Admin) && restaurant.OwnerId != userId) return Forbid();
            }

            var dishes = await _db.Dishes.Where(d => d.RestaurantId == id).ToListAsync();
            return Ok(dishes);
        }
    }
}


