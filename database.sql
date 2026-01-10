-- Base de données pour le jeu Pokémon Battle
-- Sur AlwaysData, la base de données doit être créée via l'interface web
-- Remplacez 'lthomassin_pokemon' par le nom de VOTRE base de données

-- Sélectionner la base de données (remplacez par votre nom de base)
USE lthomassin_pokemon;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    credits INT DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des Pokémons débloqués
CREATE TABLE IF NOT EXISTS unlocked_pokemons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pokemon_name VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pokemon (user_id, pokemon_name),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des decks personnalisés
CREATE TABLE IF NOT EXISTS decks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des Pokémons dans les decks
CREATE TABLE IF NOT EXISTS deck_pokemons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deck_id INT NOT NULL,
    pokemon_name VARCHAR(100) NOT NULL,
    position INT NOT NULL, -- Position dans le deck (1-9)
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
    INDEX idx_deck_id (deck_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
