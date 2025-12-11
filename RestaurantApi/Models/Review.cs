using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantApi.Models
{
    public enum ReviewStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }

    public class Review
    {
        public int Id { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ReviewStatus Status { get; set; } = ReviewStatus.Approved;

        [ForeignKey(nameof(User))]
        public int UserId { get; set; }
        public User? User { get; set; }

        public int? RestaurantId { get; set; }
        public Restaurant? Restaurant { get; set; }

        public int? DishId { get; set; }
        public Dish? Dish { get; set; }
    }
}
