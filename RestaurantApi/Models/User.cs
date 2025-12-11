using System.ComponentModel.DataAnnotations;

namespace RestaurantApi.Models
{
    public enum UserRole
    {
        User = 0,
        Admin = 1,
        RestaurantOwner = 2
    }

    public class User
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(3)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public UserRole Role { get; set; } = UserRole.User;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

