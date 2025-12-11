using Microsoft.EntityFrameworkCore;
using RestaurantApi.Models;

namespace RestaurantApi.Data
{
    public static class Seed
    {
        public static async Task EnsureSeededAsync(AppDbContext db)
        {
            await db.Database.EnsureCreatedAsync();
            if (await db.Restaurants.AnyAsync()) return;

            var r1 = new Restaurant { Name = "Pica House", Address = "Vilnius" };
            var r2 = new Restaurant { Name = "Šašlykai LT", Address = "Kaunas" };
            db.Restaurants.AddRange(r1, r2);
            await db.SaveChangesAsync();

            var d1 = new Dish { Name = "Margarita", RestaurantId = r1.Id };
            var d2 = new Dish { Name = "Capricciosa", RestaurantId = r1.Id };
            var d3 = new Dish { Name = "Šašlykas", RestaurantId = r2.Id };
            db.Dishes.AddRange(d1, d2, d3);
            await db.SaveChangesAsync();

            db.Reviews.AddRange(
                new Review { RestaurantId = r1.Id, Rating = 5, Comment = "Super!" },
                new Review { DishId = d1.Id, Rating = 4, Comment = "Skani pica" },
                new Review { RestaurantId = r2.Id, Rating = 3, Comment = "Vidutiniška" }
            );
            await db.SaveChangesAsync();
        }
    }
}


