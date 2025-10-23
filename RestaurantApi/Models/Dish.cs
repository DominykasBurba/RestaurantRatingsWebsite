using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantApi.Models
{
    public class Dish
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [ForeignKey(nameof(Restaurant))]
        public int RestaurantId { get; set; }
        public Restaurant? Restaurant { get; set; }
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
