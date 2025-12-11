using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantApi.Data;
using RestaurantApi.Models;

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
            => Ok(await _db.Dishes.AsNoTracking().ToListAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Dish>> Get(int id)
        {
            var d = await _db.Dishes.Include(x => x.Restaurant)
            .Include(x => x.Reviews)
            .FirstOrDefaultAsync(x => x.Id == id);
            return d is null ? NotFound() : Ok(d);
        }

        [HttpPost]
        public async Task<ActionResult<Dish>> Create(Dish d)
        {
            if (!await _db.Restaurants.AnyAsync(r => r.Id == d.RestaurantId))
                return BadRequest(new { error = "Restaurant not found" });
            _db.Dishes.Add(d);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = d.Id }, d);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Dish d)
        {
            if (id != d.Id) 
                return BadRequest(new { error = "ID in URL does not match ID in body." });

            if (!await _db.Restaurants.AnyAsync(r => r.Id == d.RestaurantId))
                return BadRequest(new { error = $"Restaurant with ID {d.RestaurantId} does not exist." });

            _db.Entry(d).State = EntityState.Modified;

            try 
            { 
                await _db.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Dishes.AnyAsync(x => x.Id == id))
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var d = await _db.Dishes.FindAsync(id);
            if (d is null) return NotFound();
            _db.Dishes.Remove(d);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}


