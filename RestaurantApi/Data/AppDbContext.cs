using Microsoft.EntityFrameworkCore;
using RestaurantApi.Models;

namespace RestaurantApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Restaurant> Restaurants => Set<Restaurant>();
        public DbSet<Dish> Dishes => Set<Dish>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<User> Users => Set<User>();
    }
}


