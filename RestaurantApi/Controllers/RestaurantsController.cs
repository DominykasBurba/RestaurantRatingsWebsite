using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantApi.Data;
using RestaurantApi.Models;

namespace RestaurantApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public RestaurantsController(AppDbContext db) { _db = db; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Restaurant>>> GetAll()
            => Ok(await _db.Restaurants.AsNoTracking().ToListAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Restaurant>> Get(int id)
        {
            var r = await _db.Restaurants.Include(x => x.Dishes)
            .Include(x => x.Reviews)
            .FirstOrDefaultAsync(x => x.Id == id);
            return r is null ? NotFound() : Ok(r);
        }

        [HttpPost]
        public async Task<ActionResult<Restaurant>> Create(Restaurant r)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            _db.Restaurants.Add(r);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = r.Id }, r);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Restaurant r)
        {
            if (id != r.Id) return BadRequest();
            _db.Entry(r).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Restaurants.AnyAsync(x => x.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var r = await _db.Restaurants.FindAsync(id);
            if (r is null) return NotFound();
            _db.Restaurants.Remove(r);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // Hierarchical endpoint: all dishes for specific restaurant
        [HttpGet("{id}/dishes")]
        public async Task<ActionResult<IEnumerable<Dish>>> GetDishes(int id)
        {
            var exists = await _db.Restaurants.AnyAsync(x => x.Id == id);
            if (!exists) return NotFound();
            var dishes = await _db.Dishes.Where(d => d.RestaurantId == id).ToListAsync();
            return Ok(dishes);
        }
    }
}


