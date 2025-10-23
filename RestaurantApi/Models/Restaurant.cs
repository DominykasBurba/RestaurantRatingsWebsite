using System.ComponentModel.DataAnnotations;

namespace RestaurantApi.Models
{
    public class Restaurant
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public double AverageRating { get; set; }
        public ICollection<Dish> Dishes { get; set; } = new List<Dish>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
