using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantApi.Models
{
    public enum RestaurantStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }

    public class Restaurant
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Address { get; set; }

        [Required]
        [Range(1, 5)]
        public double AverageRating { get; set; }

        public RestaurantStatus Status { get; set; } = RestaurantStatus.Approved;

        [ForeignKey(nameof(Owner))]
        public int? OwnerId { get; set; }
        public User? Owner { get; set; }

        public ICollection<Dish> Dishes { get; set; } = new List<Dish>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
