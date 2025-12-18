using Microsoft.EntityFrameworkCore;
using RestaurantApi.Models;

namespace RestaurantApi.Data
{
    public static class Seed
    {
        public static async Task EnsureSeededAsync(AppDbContext db)
        {
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
            var r3 = new Restaurant { Name = "Burger Spot", Address = "Klaipėda", OwnerId = owner.Id, Status = RestaurantStatus.Approved, AverageRating = 0 };
            var r4 = new Restaurant { Name = "Sushi Wave", Address = "Vilnius", OwnerId = owner.Id, Status = RestaurantStatus.Approved, AverageRating = 0 };
            db.Restaurants.AddRange(r1, r2, r3, r4);
            await db.SaveChangesAsync();

            var d1 = new Dish { Name = "Margarita", RestaurantId = r1.Id };
            var d2 = new Dish { Name = "Capricciosa", RestaurantId = r1.Id };
            var d3 = new Dish { Name = "Šašlykas", RestaurantId = r2.Id };
            var d4 = new Dish { Name = "BBQ Burger", RestaurantId = r3.Id };
            var d5 = new Dish { Name = "Cheeseburger", RestaurantId = r3.Id };
            var d6 = new Dish { Name = "Sushi Set A", RestaurantId = r4.Id };
            var d7 = new Dish { Name = "Ramen", RestaurantId = r4.Id };
            db.Dishes.AddRange(d1, d2, d3, d4, d5, d6, d7);
            await db.SaveChangesAsync();

            db.Reviews.AddRange(
                new Review { RestaurantId = r1.Id, Rating = 5, Comment = "Super!", UserId = user.Id, Status = ReviewStatus.Approved },
                new Review { DishId = d1.Id, Rating = 4, Comment = "Skani pica", UserId = user.Id, Status = ReviewStatus.Approved },
                new Review { RestaurantId = r2.Id, Rating = 3, Comment = "Vidutiniška", UserId = user.Id, Status = ReviewStatus.Approved },
                new Review { RestaurantId = r3.Id, Rating = 5, Comment = "Puikūs burgeriai", UserId = user.Id, Status = ReviewStatus.Approved },
                new Review { DishId = d5.Id, Rating = 4, Comment = "Sūris tinka puikiai", UserId = user.Id, Status = ReviewStatus.Approved },
                new Review { RestaurantId = r4.Id, Rating = 4, Comment = "Maloni atmosfera", UserId = user.Id, Status = ReviewStatus.Approved },
                new Review { DishId = d6.Id, Rating = 5, Comment = "Šviežia ir skanu", UserId = user.Id, Status = ReviewStatus.Approved }
            );
            await db.SaveChangesAsync();
        }
    }
}


