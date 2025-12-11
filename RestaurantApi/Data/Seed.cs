using Microsoft.EntityFrameworkCore;
using RestaurantApi.Models;

namespace RestaurantApi.Data
{
    public static class Seed
    {
        public static async Task EnsureSeededAsync(AppDbContext db)
        {
            await db.Database.EnsureCreatedAsync();
            if (await db.Users.AnyAsync()) return;

            var admin = new User
            {
                Email = "admin@demo.com",
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Admin
            };

            var owner = new User
            {
                Email = "owner@demo.com",
                Username = "owner",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("owner123"),
                Role = UserRole.RestaurantOwner
            };

            var user = new User
            {
                Email = "user@demo.com",
                Username = "user",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                Role = UserRole.User
            };

            db.Users.AddRange(admin, owner, user);
            await db.SaveChangesAsync();

            // Sample restaurants owned by owner
            var r1 = new Restaurant { Name = "Pica House", Address = "Vilnius", OwnerId = owner.Id, Status = RestaurantStatus.Approved, AverageRating = 0 };
            var r2 = new Restaurant { Name = "Šašlykai LT", Address = "Kaunas", OwnerId = owner.Id, Status = RestaurantStatus.Approved, AverageRating = 0 };
            db.Restaurants.AddRange(r1, r2);
            await db.SaveChangesAsync();

            var d1 = new Dish { Name = "Margarita", RestaurantId = r1.Id };
            var d2 = new Dish { Name = "Capricciosa", RestaurantId = r1.Id };
            var d3 = new Dish { Name = "Šašlykas", RestaurantId = r2.Id };
            db.Dishes.AddRange(d1, d2, d3);
            await db.SaveChangesAsync();

            db.Reviews.AddRange(
                new Review { RestaurantId = r1.Id, Rating = 5, Comment = "Super!", UserId = user.Id, Status = ReviewStatus.Approved },
                new Review { DishId = d1.Id, Rating = 4, Comment = "Skani pica", UserId = user.Id, Status = ReviewStatus.Approved },
                new Review { RestaurantId = r2.Id, Rating = 3, Comment = "Vidutiniška", UserId = user.Id, Status = ReviewStatus.Approved }
            );
            await db.SaveChangesAsync();
        }
    }
}


