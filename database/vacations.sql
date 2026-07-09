-- vacations database init file
-- loaded automatically by the mysql docker image from /docker-entrypoint-initdb.d/
--
-- seeded credentials (also documented in README.md):
--   admin: admin@vacations.com / admin1234
--   user:  user1@vacations.com / user1234
--   user:  user2@vacations.com / user1234
--
-- passwords are stored as HMAC-SHA256 hashes keyed by the app encryptionKey

CREATE DATABASE IF NOT EXISTS `vacations` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `vacations`;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- table: users
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
('ff82a226-5b72-4a6d-a6ce-71c6f46b24ec', 'Albus', 'Dumbledore', 'admin@vacations.com', '3232f1feb17d39e7521340a73b4102e8b35a197eea48fb93bf4a5c496e1bff8e', 'admin', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('bfb6cd40-fbed-4e78-8217-6964240b7536', 'Peter', 'Pan', 'user1@vacations.com', '543231d4bb1ecd11e0e5d62e14f16ecc310edd4f84d046cc4e1a53e9081b7455', 'user', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('6ee61795-be75-492e-8846-e181942a5177', 'Marge', 'Simpson', 'user2@vacations.com', '543231d4bb1ecd11e0e5d62e14f16ecc310edd4f84d046cc4e1a53e9081b7455', 'user', '2026-07-09 12:00:00', '2026-07-09 12:00:00');

-- --------------------------------------------------------
-- table: vacations
-- image urls point at the localstack s3 bucket; the backend uploads
-- the matching files from backend/seed-images/ on startup
-- --------------------------------------------------------

DROP TABLE IF EXISTS `vacations`;
CREATE TABLE `vacations` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `destination` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `vacations` (`id`, `destination`, `description`, `start_date`, `end_date`, `price`, `image_url`, `created_at`, `updated_at`) VALUES
('b3cbb3dd-a6b7-40db-ba12-3c6860684548', 'Atlantis', 'Dive into the legendary sunken city. Guided submarine tours of the crystal palaces, ancient temple ruins and glowing coral gardens - breathing apparatus included.', '2026-03-10', '2026-03-20', 3100.00, 'http://localhost:4566/vacations/atlantis.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('7c34fca2-541b-4291-95f5-dd7413edb115', 'Gotham City', 'Experience the city that never sleeps - mostly because of the sirens. Rooftop cocktail tours, gargoyle photo spots and a guaranteed sighting of at least one dramatic cape.', '2026-05-01', '2026-05-08', 2200.00, 'http://localhost:4566/vacations/gotham.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('67c2b69e-8d10-43b6-9403-68484088878d', 'Elysium', 'The fields of eternal spring await. Unwind among the heroes of old with meadow picnics, ambrosia tastings and sunsets that literally never disappoint.', '2026-06-01', '2026-06-14', 9999.99, 'http://localhost:4566/vacations/elysium.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('bd746f9c-700f-4e0f-8c06-93ba4498e81f', 'Bikini Bottom', 'An underwater getaway for the whole family. Krabby Patty cooking classes, jellyfishing excursions and front-row seats to the most enthusiastic clarinet concert under the sea.', '2026-06-25', '2026-07-25', 799.99, 'http://localhost:4566/vacations/bikini-bottom.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('25885623-abc6-4b1c-b683-e95c594bc832', 'Hogwarts', 'A magical castle getaway with moving staircases, enchanted feasts in the Great Hall and optional broomstick lessons on the Quidditch pitch. Owl delivery service included.', '2026-07-01', '2026-07-15', 1899.50, 'http://localhost:4566/vacations/hogwarts.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('d410948e-a040-4341-8b75-a8c1ff4f7a72', 'Springfield', 'Visit the most famous small town in America. Donut crawls, a guided tour of the nuclear power plant (helmets provided) and all-you-can-drink Duff at Moe''s.', '2026-07-05', '2026-07-12', 450.00, 'http://localhost:4566/vacations/springfield.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('6e084c78-b5e5-4e09-aa20-acad70ebcdf3', 'Asgard', 'Walk the golden halls of the realm eternal. Bifrost arrival experience, mead hall banquets and panoramic views over the nine realms from the palace balconies.', '2026-08-10', '2026-08-24', 5400.00, 'http://localhost:4566/vacations/asgard.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('957f80e5-b63f-407e-a28f-e9f4ee112e17', 'Emerald City', 'Follow the yellow brick road to the jewel of Oz. Horse-of-a-different-color carriage rides, wizard meet-and-greets and complimentary emerald-tinted glasses.', '2026-09-03', '2026-09-10', 1450.00, 'http://localhost:4566/vacations/emerald-city.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('bbe5b0ef-8e45-48b3-a468-993df4d01f49', 'Jurassic Park', 'Safari like it''s 65 million years ago. Electric jeep tours between the paddocks, hand-feeding gentle herbivores and a visitor center buffet that (usually) stays open.', '2026-10-01', '2026-10-08', 6800.00, 'http://localhost:4566/vacations/jurassic-park.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('23bb5621-decd-4de1-9256-ac680a0f4d8e', 'Middle-earth', 'One trek to rule them all. Second breakfasts in the Shire, elven hospitality in Rivendell and an optional (strongly discouraged) day hike to Mount Doom.', '2026-11-05', '2026-11-25', 4750.00, 'http://localhost:4566/vacations/middle-earth.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('3d5e5538-91d0-4c80-93f6-c144190d4fab', 'Neverland', 'The vacation where nobody has to grow up. Flying lessons with pixie dust included, lagoon swims with the mermaids and pirate-ship dinner cruises every night.', '2026-12-20', '2027-01-03', 3333.00, 'http://localhost:4566/vacations/never-land.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('c0d98cbd-fcca-4314-9276-61736d80c7f8', 'Wakanda', 'The most advanced city on Earth finally opens its borders. Vibranium tech expos, waterfall palace tours and maglev rides over the golden city skyline. Wakanda forever.', '2027-02-01', '2027-02-10', 8200.00, 'http://localhost:4566/vacations/wakanda.jpg', '2026-07-09 12:00:00', '2026-07-09 12:00:00');

-- --------------------------------------------------------
-- table: likes
-- --------------------------------------------------------

DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `vacation_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`,`vacation_id`),
  UNIQUE KEY `likes_vacationId_userId_unique` (`user_id`,`vacation_id`),
  KEY `vacation_id` (`vacation_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`vacation_id`) REFERENCES `vacations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `likes` (`user_id`, `vacation_id`, `created_at`, `updated_at`) VALUES
-- Peter Pan likes: Hogwarts, Asgard, Middle-earth, Wakanda, Bikini Bottom
('bfb6cd40-fbed-4e78-8217-6964240b7536', '25885623-abc6-4b1c-b683-e95c594bc832', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('bfb6cd40-fbed-4e78-8217-6964240b7536', '6e084c78-b5e5-4e09-aa20-acad70ebcdf3', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('bfb6cd40-fbed-4e78-8217-6964240b7536', '23bb5621-decd-4de1-9256-ac680a0f4d8e', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('bfb6cd40-fbed-4e78-8217-6964240b7536', 'c0d98cbd-fcca-4314-9276-61736d80c7f8', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('bfb6cd40-fbed-4e78-8217-6964240b7536', 'bd746f9c-700f-4e0f-8c06-93ba4498e81f', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
-- Marge Simpson likes: Hogwarts, Middle-earth, Jurassic Park
('6ee61795-be75-492e-8846-e181942a5177', '25885623-abc6-4b1c-b683-e95c594bc832', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('6ee61795-be75-492e-8846-e181942a5177', '23bb5621-decd-4de1-9256-ac680a0f4d8e', '2026-07-09 12:00:00', '2026-07-09 12:00:00'),
('6ee61795-be75-492e-8846-e181942a5177', 'bbe5b0ef-8e45-48b3-a468-993df4d01f49', '2026-07-09 12:00:00', '2026-07-09 12:00:00');

SET FOREIGN_KEY_CHECKS = 1;