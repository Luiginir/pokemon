// Système de boutique et de crédits pour le jeu Pokémon avec API Backend

const ShopSystem = {
    // Configuration
    STARTING_CREDITS: 1000,
    CREDITS_PER_WIN: 100,
    DECK_SIZE: 9,
    
    // État en cache
    cachedData: null,
    currentUser: null,
    
    // Initialiser le système
    async init() {
        try {
            // Vérifier la session
            const sessionResponse = await fetch('/api/session');
            const sessionData = await sessionResponse.json();
            
            if (!sessionData.authenticated) {
                window.location.href = '/login.html';
                return;
            }
            
            this.currentUser = sessionData.username;
            
            // Charger les données utilisateur
            await this.loadUserData();
            
            // Mettre à jour l'affichage
            this.updateCreditsDisplay();
            this.updateUserDisplay();
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
        }
    },
    
    // Charger les données utilisateur depuis l'API
    async loadUserData() {
        try {
            const response = await fetch('/api/userdata');
            if (response.ok) {
                this.cachedData = await response.json();
                return this.cachedData;
            } else if (response.status === 401) {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Erreur de chargement des données:', error);
        }
        return null;
    },
    
    // Obtenir les crédits actuels
    getCredits() {
        if (this.cachedData) {
            return this.cachedData.credits || 0;
        }
        return 0;
    },
    
    // Ajouter des crédits
    async addCredits(amount) {
        const newCredits = this.getCredits() + amount;
        try {
            const response = await fetch('/api/credits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: newCredits })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.cachedData.credits = data.credits;
                this.updateCreditsDisplay();
                return data.credits;
            }
        } catch (error) {
            console.error('Erreur d\'ajout de crédits:', error);
        }
        return this.getCredits();
    },
    
    // Obtenir la liste des Pokémons débloqués
    getUnlockedPokemon() {
        if (this.cachedData) {
            return this.cachedData.unlockedPokemons || [];
        }
        return [];
    },
    
    // Vérifier si un Pokémon est débloqué
    isPokemonUnlocked(pokemonName) {
        const unlocked = this.getUnlockedPokemon();
        return unlocked.includes(pokemonName);
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
    async buyPokemon(pokemonName, price) {
        if (this.isPokemonUnlocked(pokemonName)) {
            return { success: false, message: 'Vous possédez déjà ce Pokémon!' };
        }
        
        if (this.getCredits() < price) {
            return { success: false, message: 'Crédits insuffisants!' };
        }
        
        try {
            const response = await fetch('/api/unlock-pokemon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pokemonName, price })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.cachedData.credits = data.credits;
                this.cachedData.unlockedPokemons = data.unlockedPokemons;
                this.updateCreditsDisplay();
                return { success: true, message: `${pokemonName} débloqué!` };
            } else {
                const error = await response.json();
                return { success: false, message: error.error || 'Erreur lors de l\'achat' };
            }
        } catch (error) {
            console.error('Erreur d\'achat:', error);
            return { success: false, message: 'Erreur de connexion' };
        }
    },
    
    // Mettre à jour l'affichage des crédits sur toutes les pages
    updateCreditsDisplay() {
        const creditsElements = document.querySelectorAll('.credits-display');
        const credits = this.getCredits();
        creditsElements.forEach(el => {
            el.textContent = credits;
        });
    },
    
    // Mettre à jour l'affichage du nom d'utilisateur
    updateUserDisplay() {
        const userElements = document.querySelectorAll('.username-display');
        userElements.forEach(el => {
            el.textContent = this.currentUser || '';
        });
    },
    
    // Initialiser les Pokémons de départ (les 10 plus faibles)
    async initializeStarterPokemon(allPokemons) {
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
        
        // Les débloquer via l'API
        try {
            const response = await fetch('/api/unlocked-pokemons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pokemons: starters })
            });
            
            if (response.ok) {
                this.cachedData.unlockedPokemons = starters;
                console.log('🎁 Pokémons de départ débloqués:', starters);
            }
        } catch (error) {
            console.error('Erreur d\'initialisation des Pokémons de départ:', error);
        }
    },
    
    // Récompense après une victoire
    async rewardWin() {
        const creditsEarned = this.CREDITS_PER_WIN;
        const newTotal = await this.addCredits(creditsEarned);
        return { creditsEarned, newTotal };
    },
    
    // Déconnexion
    async logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
        }
    },
    
    // ==================== GESTION DES DECKS ====================
    
    // Créer un nouveau deck
    async createDeck(name, pokemonNames) {
        // Validation
        if (!name || name.trim() === '') {
            return { success: false, message: 'Le nom du deck est requis' };
        }
        
        if (!Array.isArray(pokemonNames) || pokemonNames.length !== this.DECK_SIZE) {
            return { success: false, message: `Un deck doit contenir exactement ${this.DECK_SIZE} Pokémons` };
        }
        
        // Vérifier que tous les Pokémons sont débloqués
        const unlockedPokemons = this.getUnlockedPokemon();
        const allUnlocked = pokemonNames.every(name => unlockedPokemons.includes(name));
        
        if (!allUnlocked) {
            return { success: false, message: 'Certains Pokémons ne sont pas débloqués' };
        }
        
        try {
            const response = await fetch('/api/decks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name.trim(), pokemons: pokemonNames })
            });
            
            if (response.ok) {
                const data = await response.json();
                // Mettre à jour le cache
                if (!this.cachedData.decks) {
                    this.cachedData.decks = [];
                }
                this.cachedData.decks.push(data.deck);
                return { success: true, message: 'Deck créé avec succès!', deck: data.deck };
            } else {
                const error = await response.json();
                return { success: false, message: error.error || 'Erreur lors de la création' };
            }
        } catch (error) {
            console.error('Erreur de création de deck:', error);
            return { success: false, message: 'Erreur de connexion' };
        }
    },
    
    // Mettre à jour un deck
    async updateDeck(deckId, name, pokemonNames) {
        // Validation
        if (!name || name.trim() === '') {
            return { success: false, message: 'Le nom du deck est requis' };
        }
        
        if (!Array.isArray(pokemonNames) || pokemonNames.length !== this.DECK_SIZE) {
            return { success: false, message: `Un deck doit contenir exactement ${this.DECK_SIZE} Pokémons` };
        }
        
        // Vérifier que tous les Pokémons sont débloqués
        const unlockedPokemons = this.getUnlockedPokemon();
        const allUnlocked = pokemonNames.every(name => unlockedPokemons.includes(name));
        
        if (!allUnlocked) {
            return { success: false, message: 'Certains Pokémons ne sont pas débloqués' };
        }
        
        try {
            const response = await fetch(`/api/decks/${deckId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name.trim(), pokemons: pokemonNames })
            });
            
            if (response.ok) {
                const data = await response.json();
                // Mettre à jour le cache
                const deckIndex = this.cachedData.decks.findIndex(d => d.id === deckId);
                if (deckIndex !== -1) {
                    this.cachedData.decks[deckIndex] = data.deck;
                }
                return { success: true, message: 'Deck mis à jour!', deck: data.deck };
            } else {
                const error = await response.json();
                return { success: false, message: error.error || 'Erreur lors de la mise à jour' };
            }
        } catch (error) {
            console.error('Erreur de mise à jour de deck:', error);
            return { success: false, message: 'Erreur de connexion' };
        }
    },
    
    // Supprimer un deck
    async deleteDeck(deckId) {
        try {
            const response = await fetch(`/api/decks/${deckId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Mettre à jour le cache
                this.cachedData.decks = this.cachedData.decks.filter(d => d.id !== deckId);
                return { success: true, message: 'Deck supprimé!' };
            } else {
                const error = await response.json();
                return { success: false, message: error.error || 'Erreur lors de la suppression' };
            }
        } catch (error) {
            console.error('Erreur de suppression de deck:', error);
            return { success: false, message: 'Erreur de connexion' };
        }
    },
    
    // Obtenir un deck par ID
    getDeckById(deckId) {
        if (!this.cachedData || !this.cachedData.decks) {
            return null;
        }
        return this.cachedData.decks.find(d => d.id === parseInt(deckId));
    },
    
    // Obtenir tous les decks
    getDecks() {
        if (!this.cachedData || !this.cachedData.decks) {
            return [];
        }
        return this.cachedData.decks;
    }
};

// Initialiser au chargement de la page
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        ShopSystem.init();
    });
}
