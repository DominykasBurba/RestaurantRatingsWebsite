using System.ComponentModel.DataAnnotations;

namespace RestaurantApi.Models
{
    public class Review
    {
        public int Id { get; set; }
        [Range(1,5)]
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? RestaurantId { get; set; }
        public Restaurant? Restaurant { get; set; }
        public int? DishId { get; set; }
        public Dish? Dish { get; set; }
    }
}
