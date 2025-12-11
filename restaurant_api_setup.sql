
CREATE DATABASE IF NOT EXISTS restaurant_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurant_api;

-- Drop old tables in FK-safe order
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

-- Users table (for auth)
CREATE TABLE users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Username VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role INT NOT NULL DEFAULT 0 COMMENT '0=User, 1=Admin, 2=RestaurantOwner',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table with owner and status
CREATE TABLE restaurants (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Address VARCHAR(500),
    AverageRating DOUBLE NOT NULL DEFAULT 0,
    Status INT NOT NULL DEFAULT 1 COMMENT '0=Pending, 1=Approved, 2=Rejected',
    OwnerId INT NULL,
    CONSTRAINT fk_restaurant_owner FOREIGN KEY (OwnerId)
        REFERENCES users(Id) ON DELETE SET NULL
);

-- Dishes table
CREATE TABLE dishes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    RestaurantId INT NOT NULL,
    CONSTRAINT fk_dish_restaurant FOREIGN KEY (RestaurantId)
        REFERENCES restaurants(Id) ON DELETE CASCADE
);

-- Reviews table with user and status
CREATE TABLE reviews (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status INT NOT NULL DEFAULT 1 COMMENT '0=Pending, 1=Approved, 2=Rejected',
    UserId INT NOT NULL,
    RestaurantId INT NULL,
    DishId INT NULL,
    CONSTRAINT fk_review_user FOREIGN KEY (UserId)
        REFERENCES users(Id) ON DELETE CASCADE,
    CONSTRAINT fk_review_restaurant FOREIGN KEY (RestaurantId)
        REFERENCES restaurants(Id) ON DELETE CASCADE,
    CONSTRAINT fk_review_dish FOREIGN KEY (DishId)
        REFERENCES dishes(Id) ON DELETE CASCADE
);

-- Optional: insert demo users (password hashes MUST be real bcrypt hashes).
-- Replace HASH_* with BCrypt.Net.BCrypt.HashPassword("yourPassword") values.
-- INSERT INTO users (Email, Username, PasswordHash, Role) VALUES
-- ('admin@demo.com', 'admin', 'HASH_ADMIN', 1),
-- ('owner@demo.com', 'owner', 'HASH_OWNER', 2),
-- ('user@demo.com', 'user', 'HASH_USER', 0);

-- Optional: insert restaurants (set OwnerId to an existing owner or NULL)
-- INSERT INTO restaurants (Name, Address, AverageRating, Status, OwnerId) VALUES
-- ('Pica House', 'Vilnius', 0, 1, NULL),
-- ('Šašlykai LT', 'Kaunas', 0, 1, NULL);

-- Optional: insert dishes after restaurants exist
-- INSERT INTO dishes (Name, Description, RestaurantId) VALUES
-- ('Margarita', 'Classic tomato, mozzarella, basil', 1),
-- ('Capricciosa', 'Ham, mushrooms, artichokes, olives', 1);

-- Optional: insert reviews after users and restaurants/dishes exist
-- INSERT INTO reviews (Rating, Comment, RestaurantId, UserId, Status) VALUES
-- (5, 'Excellent pizza!', 1, 3, 1);

-- Verify
SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS restaurant_count FROM restaurants;
SELECT COUNT(*) AS dish_count FROM dishes;
SELECT COUNT(*) AS review_count FROM reviews;
