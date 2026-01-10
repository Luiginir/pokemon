// Système de boutique et de crédits pour le jeu Pokémon

const ShopSystem = {
    // Clés pour le localStorage
    CREDITS_KEY: 'pokemon_credits',
    UNLOCKED_KEY: 'pokemon_unlocked',
    
    // Configuration
    STARTING_CREDITS: 1000,
    CREDITS_PER_WIN: 100,
    
    // Initialiser le système
    init() {
        // Vérifier si c'est la première fois
        if (localStorage.getItem(this.CREDITS_KEY) === null) {
            this.initializeFirstTime();
        }
    },
    
    // Initialisation au premier lancement
    initializeFirstTime() {
        // Donner des crédits de départ
        localStorage.setItem(this.CREDITS_KEY, this.STARTING_CREDITS);
        
        // Débloquer les 10 Pokémons les plus faibles
        // On va les identifier au moment du chargement des données
        localStorage.setItem(this.UNLOCKED_KEY, JSON.stringify([]));
    },
    
    // Obtenir les crédits actuels
    getCredits() {
        const credits = localStorage.getItem(this.CREDITS_KEY);
        return credits ? parseInt(credits) : this.STARTING_CREDITS;
    },
    
    // Ajouter des crédits
    addCredits(amount) {
        const currentCredits = this.getCredits();
        const newCredits = currentCredits + amount;
        localStorage.setItem(this.CREDITS_KEY, newCredits);
        this.updateCreditsDisplay();
        return newCredits;
    },
    
    // Retirer des crédits
    removeCredits(amount) {
        const currentCredits = this.getCredits();
        if (currentCredits >= amount) {
            const newCredits = currentCredits - amount;
            localStorage.setItem(this.CREDITS_KEY, newCredits);
            this.updateCreditsDisplay();
            return true;
        }
        return false;
    },
    
    // Obtenir la liste des Pokémons débloqués
    getUnlockedPokemon() {
        const unlocked = localStorage.getItem(this.UNLOCKED_KEY);
        return unlocked ? JSON.parse(unlocked) : [];
    },
    
    // Vérifier si un Pokémon est débloqué
    isPokemonUnlocked(pokemonName) {
        const unlocked = this.getUnlockedPokemon();
        return unlocked.includes(pokemonName);
    },
    
    // Débloquer un Pokémon
    unlockPokemon(pokemonName) {
        const unlocked = this.getUnlockedPokemon();
        if (!unlocked.includes(pokemonName)) {
            unlocked.push(pokemonName);
            localStorage.setItem(this.UNLOCKED_KEY, JSON.stringify(unlocked));
            return true;
        }
        return false;
    },
    
    // Débloquer plusieurs Pokémons
    unlockMultiplePokemon(pokemonNames) {
        const unlocked = this.getUnlockedPokemon();
        pokemonNames.forEach(name => {
            if (!unlocked.includes(name)) {
                unlocked.push(name);
            }
        });
        localStorage.setItem(this.UNLOCKED_KEY, JSON.stringify(unlocked));
    },
    
    // Calculer la puissance d'un Pokémon (somme des stats)
    calculatePower(pokemon) {
        return pokemon.HP + pokemon.Attack + pokemon.Defense + 
               (pokemon['Sp. Atk'] || 0) + (pokemon['Sp. Def'] || 0) + (pokemon.Speed || 0);
    },
    
    // Calculer le prix d'un Pokémon basé sur sa puissance
    calculatePrice(pokemon) {
        const power = this.calculatePower(pokemon);
        // Formule de prix: puissance * 2 (arrondi à la dizaine supérieure)
        const basePrice = Math.ceil((power * 2) / 10) * 10;
        return basePrice;
    },
    
    // Acheter un Pokémon
    buyPokemon(pokemonName, price) {
        if (this.isPokemonUnlocked(pokemonName)) {
            return { success: false, message: 'Vous possédez déjà ce Pokémon!' };
        }
        
        if (this.getCredits() < price) {
            return { success: false, message: 'Crédits insuffisants!' };
        }
        
        if (this.removeCredits(price)) {
            this.unlockPokemon(pokemonName);
            return { success: true, message: `${pokemonName} débloqué!` };
        }
        
        return { success: false, message: 'Erreur lors de l\'achat.' };
    },
    
    // Mettre à jour l'affichage des crédits sur toutes les pages
    updateCreditsDisplay() {
        const creditsElements = document.querySelectorAll('.credits-display');
        const credits = this.getCredits();
        creditsElements.forEach(el => {
            el.textContent = credits;
        });
    },
    
    // Initialiser les Pokémons de départ (les 10 plus faibles)
    initializeStarterPokemon(allPokemons) {
        const unlocked = this.getUnlockedPokemon();
        
        // Si on a déjà des Pokémons débloqués, ne rien faire
        if (unlocked.length > 0) {
            return;
        }
        
        // Trier les Pokémons par puissance (du plus faible au plus fort)
        const sortedByPower = [...allPokemons].sort((a, b) => {
            return this.calculatePower(a) - this.calculatePower(b);
        });
        
        // Prendre les 10 premiers (les plus faibles)
        const starters = sortedByPower.slice(0, 10).map(p => p.Name);
        
        // Les débloquer
        this.unlockMultiplePokemon(starters);
        
        console.log('Pokémons de départ débloqués:', starters);
    },
    
    // Récompense après une victoire
    rewardWin() {
        const creditsEarned = this.CREDITS_PER_WIN;
        const newTotal = this.addCredits(creditsEarned);
        return { creditsEarned, newTotal };
    },
    
    // Réinitialiser le système (pour debug)
    reset() {
        localStorage.removeItem(this.CREDITS_KEY);
        localStorage.removeItem(this.UNLOCKED_KEY);
        this.initializeFirstTime();
    }
};

// Initialiser au chargement de la page
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        ShopSystem.init();
        ShopSystem.updateCreditsDisplay();
    });
}
