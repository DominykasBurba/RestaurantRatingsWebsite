using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantApi.Data;
using RestaurantApi.Models;

namespace RestaurantApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ReviewsController(AppDbContext db) { _db = db; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetAll()
            => Ok(await _db.Reviews.AsNoTracking().ToListAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> Get(int id)
        {
            var r = await _db.Reviews.FindAsync(id);
            return r is null ? NotFound() : Ok(r);
        }

        [HttpPost]
        public async Task<ActionResult<Review>> Create(Review r)
        {
            if (r.RestaurantId is null && r.DishId is null)
                return BadRequest(new { error = "Either RestaurantId or DishId is required." });

            if (r.Rating < 1 || r.Rating > 5)
                return BadRequest(new { error = "Rating must be between 1 and 5." });

            if (r.RestaurantId is not null && !await _db.Restaurants.AnyAsync(x => x.Id == r.RestaurantId))
                return BadRequest(new { error = $"Restaurant with ID {r.RestaurantId} does not exist." });

            if (r.DishId is not null && !await _db.Dishes.AnyAsync(x => x.Id == r.DishId))
                return BadRequest(new { error = $"Dish with ID {r.DishId} does not exist." });
            _db.Reviews.Add(r);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = r.Id }, r);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Review r)
        {
            if (id != r.Id) return BadRequest();
            _db.Entry(r).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Reviews.AnyAsync(x => x.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var r = await _db.Reviews.FindAsync(id);
            if (r is null) return NotFound();
            _db.Reviews.Remove(r);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}


