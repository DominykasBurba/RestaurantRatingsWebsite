
CREATE DATABASE IF NOT EXISTS restaurant_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurant_api;
-- Drop old tables if they exist
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS restaurants;

-- Create restaurants table
CREATE TABLE restaurants (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Address VARCHAR(500),
    AverageRating DOUBLE NOT NULL DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create dishes table
CREATE TABLE dishes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    RestaurantId INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dish_restaurant FOREIGN KEY (RestaurantId)
        REFERENCES restaurants(Id) ON DELETE CASCADE
);

-- Create reviews table
CREATE TABLE reviews (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    RestaurantId INT NULL,
    DishId INT NULL,
    CONSTRAINT fk_review_restaurant FOREIGN KEY (RestaurantId)
        REFERENCES restaurants(Id) ON DELETE CASCADE,
    CONSTRAINT fk_review_dish FOREIGN KEY (DishId)
        REFERENCES dishes(Id) ON DELETE CASCADE
);

-- Insert initial restaurant data
INSERT INTO restaurants (Name, Address, AverageRating) VALUES
('Pica House', 'Vilnius', 0),
('Šašlykai LT', 'Kaunas', 0),
('Burger Palace', 'Klaipėda', 0),
('Sushi Master', 'Vilnius', 0);

-- Insert dishes (linked via RestaurantId)
INSERT INTO dishes (Name, Description, RestaurantId) VALUES
('Margarita', 'Classic tomato, mozzarella, basil', 1),
('Capricciosa', 'Ham, mushrooms, artichokes, olives', 1),
('Quattro Stagioni', 'Four seasons pizza with seasonal ingredients', 1),
('Šašlykas', 'Marinated pork skewers', 2),
('Kebabas', 'Grilled meat with vegetables', 2),
('Cepelinai', 'Traditional Lithuanian potato dumplings', 2),
('Classic Burger', 'Beef patty with lettuce, tomato, onion', 3),
('Cheese Burger', 'Beef patty with cheese and special sauce', 3),
('Chicken Burger', 'Grilled chicken breast with herbs', 3),
('California Roll', 'Crab, avocado, cucumber', 4),
('Salmon Nigiri', 'Fresh salmon on rice', 4),
('Dragon Roll', 'Eel, cucumber, avocado', 4);

-- Insert reviews (both restaurant-level and dish-level)
INSERT INTO reviews (Rating, Comment, RestaurantId) VALUES
(5, 'Excellent pizza! Best in town.', 1),
(4, 'Good atmosphere, friendly staff', 1),
(3, 'Average quality, could be better', 2),
(5, 'Authentic Lithuanian cuisine', 2),
(4, 'Great burgers, fast service', 3),
(2, 'Overpriced for what you get', 3),
(5, 'Fresh sushi, amazing taste', 4),
(4, 'Good variety of rolls', 4);

INSERT INTO reviews (Rating, Comment, DishId) VALUES
(4, 'Perfectly cooked pizza', 1),
(5, 'Amazing margarita!', 1),
(3, 'Too much cheese', 2),
(4, 'Delicious capricciosa', 2),
(5, 'Best šašlykas ever!', 4),
(4, 'Tender and flavorful', 4),
(3, 'Good but expensive', 7),
(5, 'Perfect burger', 8),
(4, 'Fresh salmon', 11),
(5, 'Excellent dragon roll', 12);

-- Update restaurant average ratings based on their reviews
UPDATE restaurants r
SET AverageRating = (
    SELECT COALESCE(AVG(Rating), 0)
    FROM reviews rv
    WHERE rv.RestaurantId = r.Id
);

-- Verify everything
SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS restaurant_count FROM restaurants;
SELECT COUNT(*) AS dish_count FROM dishes;
SELECT COUNT(*) AS review_count FROM reviews;
