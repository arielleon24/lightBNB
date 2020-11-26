INSERT INTO users (name, email, password)
VALUES ('Jean-Guy', "JdyGuy@gmail.com", "guydidoo"), 
('Sustin', 'elMinstro@gmail.com', 'taxemwepo'), 
('Rudy', 'helium4all@gmail.com', "slamitup");

INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code)
VALUES (1, "GuySpot", "description", "T-image", "C-image",  1200, 2, 5, 8, "Canada", "Rue-Principale", "Riviere-Beaudette", "Quebec", "h2t-1r8"), 
(1, "GuyRoyalSpot", "description", "T-image", "C-image",  4300, 5, 8, 4, "Canada", "Rue-Principale", "Les Coteaux", "Quebec", "h2x-3r8"), 
(3, "Rudymentary", "description", "T-image", "C-image",  1500, 3, 9, 4, "Canada", "Rue-Principale", "Rudalia", "UNDISCLOSED", "p2t-1y9");

INSERT INTO reservations (start_date, end_date, property_id, guest_id)
VALUES (2020-10-10, 2020-10-12, 2, 2), 
(2020-11-28, 2021-01-01, 2, 3), 
(2022-01-01, 2022-01-24, 3, 2);

INSERT INTO property_reviews (guest_id, property_id, reservation_id, rating, message)
VALUES (2, 3, 3, 5, "message"), 
(2, 2, 1, 4, "message"), 
(3, 2, 2, 4, "message");