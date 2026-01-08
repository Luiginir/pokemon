// Système de combat Pokémon avec logique de dégâts et aléatoire

let player1Pokemon = null;
let player2Pokemon = null;
let gameLog = [];

// Variables pour la gestion du jeu
let playerDeck = [];
let botDeck = [];
let allPokemons = [];
let pokemonsFrench = {};
let pokemonByName = {}; // Map pour lier nom anglais -> données françaises
let selectedPlayerCard = null;
let selectedBotCard = null;
let isPlayerTurn = true;

// Mapping manuel des Mega évolutions vers leurs IDs PokeAPI
const megaMapping = {
    'Sceptile': '10065',
    'Blaziken': '10050',
    'Swampert': '10064',
    'Gardevoir': '10068',
    'Sableye': '10066',
    'Mawile': '10052',
    'Aggron': '10053',
    'Medicham': '10054',
    'Manectric': '10055',
    'Sharpedo': '10070',
    'Camerupt': '10087',
    'Altaria': '10067',
    'Banette': '10056',
    'Absol': '10057',
    'Glalie': '10074',
    'Salamence': '10089',
    'Metagross': '10076',
    'Latias': '10062',
    'Latios': '10063',
    'Rayquaza': '10079'
};

// Fonction pour calculer les HP totaux (PV uniquement, la défense sert maintenant à réduire les dégâts)
function calculateTotalHP(pokemon) {
    return pokemon.HP;
}

// Fonction pour calculer les dégâts en tenant compte de la défense adverse
function calculateDamage(attackPower, defense) {
    // L'attaque doit être supérieure à la défense pour infliger des dégâts
    if (attackPower <= defense) {
        return 0; // Aucun dégât si l'attaque est inférieure ou égale à la défense
    }
    
    // Dégâts de base = Attaque - Défense
    const baseDamage = attackPower - defense;
    
    // Facteur aléatoire (85%-100%)
    const randomFactor = 0.85 + Math.random() * 0.15;
    
    return Math.floor(baseDamage * randomFactor);
}

// Fonction pour calculer la probabilité de victoire basée sur la puissance totale
function calculateWinProbability(pokemon1, pokemon2) {
    const power1 = pokemon1.Attack + pokemon1.Defense + pokemon1.HP;
    const power2 = pokemon2.Attack + pokemon2.Defense + pokemon2.HP;
    const total = power1 + power2;
    
    return {
        prob1: Math.round((power1 / total) * 100),
        prob2: Math.round((power2 / total) * 100)
    };
}

// Fonction principale de combat
function startBattle(pokemon1, pokemon2) {
    gameLog = [];
    
    // Calcul des HP totaux initiaux
    let hp1 = calculateTotalHP(pokemon1);
    let hp2 = calculateTotalHP(pokemon2);
    
    // Calcul des probabilités de victoire
    const probabilities = calculateWinProbability(pokemon1, pokemon2);
    
    console.log(`Combat: ${pokemon1.Name} vs ${pokemon2.Name}`);
    console.log(`Probabilité de victoire - Joueur 1: ${probabilities.prob1}% | Joueur 2: ${probabilities.prob2}%`);
    console.log(`HP initiaux - ${pokemon1.Name}: ${hp1} | ${pokemon2.Name}: ${hp2}`);
    
    // Boucle de combat (maximum 15 tours pour éviter une boucle infinie)
    let maxTurns = 15;
    let turn = 0;
    let winner = null;
    
    while (turn < maxTurns && !winner) {
        turn++;
        
        // Calcul des dégâts avec aléatoire et en tenant compte de la défense adverse
        const damage1 = calculateDamage(pokemon1.Attack, pokemon2.Defense);
        const damage2 = calculateDamage(pokemon2.Attack, pokemon1.Defense);
        
        // Application des dégâts sur les HP actuels (continuité des HP)
        hp2 = hp2 - damage1;
        hp1 = hp1 - damage2;
        
        // S'assurer que les HP ne descendent pas en dessous de 0
        hp2 = Math.max(0, hp2);
        hp1 = Math.max(0, hp1);
        
        // Enregistrer le tour dans le log
        gameLog.push({
            turn: turn,
            pokemon1: pokemon1.Name,
            pokemon2: pokemon2.Name,
            damage1: damage1,
            damage2: damage2,
            hp1: hp1,
            hp2: hp2
        });
        
        console.log(`Tour ${turn}: ${pokemon1.Name} inflige ${damage1} dégâts, ${pokemon2.Name} inflige ${damage2} dégâts`);
        console.log(`  → ${pokemon1.Name}: ${hp1} HP | ${pokemon2.Name}: ${hp2} HP`);
        
        // Vérifier le gagnant
        if (hp1 <= 0 && hp2 <= 0) {
            winner = 'draw'; // Match nul (très rare)
            console.log(`Match nul! Les deux Pokémon sont KO.`);
        } else if (hp1 <= 0) {
            winner = 'player2';
            console.log(`Victoire: ${pokemon2.Name}!`);
        } else if (hp2 <= 0) {
            winner = 'player1';
            console.log(`Victoire: ${pokemon1.Name}!`);
        }
    }
    
    if (!winner && turn >= maxTurns) {
        // Si aucun gagnant après 50 tours, celui avec le plus de HP gagne
        winner = hp1 > hp2 ? 'player1' : (hp2 > hp1 ? 'player2' : 'draw');
        console.log(`Combat terminé après ${maxTurns} tours. Gagnant par HP restants: ${winner}`);
    }
    
    return {
        winner: winner,
        turns: turn,
        log: gameLog,
        probabilities: probabilities,
        finalHP: { hp1, hp2 }
    };
}

// Mapping des icônes de types
const typeIcons = {
    normal: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/normal.svg',
    fire: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fire.svg',
    water: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/water.svg',
    electric: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/electric.svg',
    grass: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/grass.svg',
    ice: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ice.svg',
    fighting: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fighting.svg',
    poison: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/poison.svg',
    ground: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ground.svg',
    flying: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/flying.svg',
    psychic: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/psychic.svg',
    bug: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/bug.svg',
    rock: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/rock.svg',
    ghost: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ghost.svg',
    dragon: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dragon.svg',
    dark: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dark.svg',
    steel: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/steel.svg',
    fairy: 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fairy.svg'
};

const typeNames = {
    normal: 'Normal', fire: 'Feu', water: 'Eau', electric: 'Électrik',
    grass: 'Plante', ice: 'Glace', fighting: 'Combat', poison: 'Poison',
    ground: 'Sol', flying: 'Vol', psychic: 'Psy', bug: 'Insecte',
    rock: 'Roche', ghost: 'Spectre', dragon: 'Dragon', dark: 'Ténèbres',
    steel: 'Acier', fairy: 'Fée'
};

// Fonction pour créer une barre de vie
function createHealthBar(owner) {
    const maxHP = owner === 'player' ? calculateTotalHP(selectedPlayerCard) : calculateTotalHP(selectedBotCard);
    return `
        <div class="health-bar-container" data-owner="${owner}">
            <div class="health-bar-bg">
                <div class="health-bar-fill" data-max-hp="${maxHP}" style="width: 100%;"></div>
            </div>
            <div class="health-bar-text">
                <span class="current-hp">${maxHP}</span> / <span class="max-hp">${maxHP}</span> PV
            </div>
        </div>
    `;
}

// Fonction pour mettre à jour la barre de vie
function updateHealthBar(owner, currentHP, maxHP) {
    const container = document.querySelector(`.health-bar-container[data-owner="${owner}"]`);
    if (!container) return;
    
    const fillBar = container.querySelector('.health-bar-fill');
    const currentHPText = container.querySelector('.current-hp');
    
    const percentage = Math.max(0, (currentHP / maxHP) * 100);
    fillBar.style.width = percentage + '%';
    currentHPText.textContent = Math.max(0, currentHP);
    
    // Changer la couleur en fonction des HP
    if (percentage > 50) {
        fillBar.style.backgroundColor = '#4CAF50';
    } else if (percentage > 25) {
        fillBar.style.backgroundColor = '#FFA726';
    } else {
        fillBar.style.backgroundColor = '#EF5350';
    }
}

// Fonction pour générer le HTML d'une carte
function createCardHTML(pokemon, index) {
    const primaryType = pokemon['Type 1'].toLowerCase();
    const hasSecondType = pokemon['Type 2'] && pokemon['Type 2'].trim() !== '';
    const secondaryType = hasSecondType ? pokemon['Type 2'].toLowerCase() : null;
    
    // Gérer les Mega évolutions (ex: "SceptileMega Sceptile" -> "Sceptile")
    let baseName = pokemon.Name;
    let isMega = false;
    if (pokemon.Name.includes('Mega')) {
        baseName = pokemon.Name.split('Mega')[0];
        isMega = true;
    }
    
    const pokemonData = pokemonByName[baseName];
    const pokemonNumber = pokemonData ? pokemonData.dexNumber : (pokemon.Number + 251);
    let pokemonName = pokemonData ? pokemonData.name_fr : baseName;
    if (isMega) {
        pokemonName = 'Méga-' + pokemonName;
    }
    
    // Pour les Mega évolutions, utiliser l'image mega si disponible
    let pokemonImage;
    if (isMega && pokemonData && megaMapping[baseName]) {
        const megaId = megaMapping[baseName];
        pokemonImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${megaId}.png`;
    } else {
        pokemonImage = pokemonData ? pokemonData.image : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNumber}.png`;
    }
    
    const primaryTypeIcon = typeIcons[primaryType] || '';
    const primaryTypeIconHTML = primaryTypeIcon 
        ? `<img src="${primaryTypeIcon}" alt="${primaryType}" class="type-icon type-icon-header">`
        : '';
    
    const type1IconHTML = primaryTypeIcon 
        ? `<img src="${primaryTypeIcon}" alt="${primaryType}" class="type-icon type-icon-${primaryType}">`
        : '';
    
    const type2IconHTML = hasSecondType && typeIcons[secondaryType]
        ? `<img src="${typeIcons[secondaryType]}" alt="${secondaryType}" class="type-icon type-icon-${secondaryType}">`
        : '';
    
    return `
        <div class="card ${primaryType}" data-index="${index}">
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-front-header">
                        <span class="pokemon-id">#${pokemonNumber}</span>
                        <div class="pokemon-hp-front">
                            ${primaryTypeIconHTML}
                            <span>${pokemon.HP} PV</span>
                        </div>
                    </div>
                    <div class="pokemon-image">
                        <img src="${pokemonImage}" alt="${pokemonName}">
                    </div>
                    <h2>${pokemonName}</h2>
                </div>
                <div class="card-back">
                    <div class="card-back-hp">
                        ${primaryTypeIconHTML}
                        <span>${pokemon.HP} PV</span>
                    </div>
                    <div class="pokemon-image">
                        <img src="${pokemonImage}" alt="${pokemonName}">
                    </div>
                    <p class="type">${typeNames[primaryType] || pokemon['Type 1']}${hasSecondType ? ' / ' + (typeNames[secondaryType] || pokemon['Type 2']) : ''}</p>
                    <div class="stats">
                        <p>Attaque: <b>${pokemon.Attack}</b></p>
                        <p>Défense: <b>${pokemon.Defense}</b></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour charger les Pokémon et initialiser le jeu
async function initGame() {
    try {
        // Charger les deux fichiers JSON
        const [responsePokemons, responseFrench] = await Promise.all([
            fetch('assets/data/pokemons.json'),
            fetch('assets/data/pokemons_gen3_fr.json')
        ]);
        
        allPokemons = await responsePokemons.json();
        pokemonsFrench = await responseFrench.json();
        
        // Créer un map pour lier le nom anglais aux données françaises
        Object.entries(pokemonsFrench).forEach(([dexNum, data]) => {
            pokemonByName[data.name_en] = {
                ...data,
                dexNumber: dexNum
            };
        });
        
        // Sélectionner 9 Pokémon aléatoires pour chaque joueur
        playerDeck = getRandomPokemons(9);
        botDeck = getRandomPokemons(9);
        
        // Afficher les decks
        displayDeck(playerDeck, 'playerDeck', true);
        displayDeck(botDeck, 'botDeck', false);
        
        // Mettre à jour les compteurs
        updateCardsCounter();
        
        updateGameInfo("Choisissez un Pokémon pour commencer le combat !");
    } catch (error) {
        console.error('Erreur lors du chargement des Pokémon:', error);
    }
}

// Fonction pour obtenir des Pokémon aléatoires
function getRandomPokemons(count) {
    const shuffled = [...allPokemons].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Fonction pour afficher un deck
function displayDeck(deck, elementId, isPlayer) {
    const deckElement = document.getElementById(elementId);
    deckElement.innerHTML = '';
    
    deck.forEach((pokemon, index) => {
        if (pokemon) {
            const cardHTML = createCardHTML(pokemon, index);
            deckElement.innerHTML += cardHTML;
        }
    });
    
    // Ajouter les événements de clic pour le joueur
    if (isPlayer) {
        const cards = deckElement.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.addEventListener('click', () => selectPlayerCard(index));
        });
    }
}

// Fonction pour sélectionner une carte du joueur
function selectPlayerCard(index) {
    if (!isPlayerTurn || !playerDeck[index]) return;
    
    selectedPlayerCard = playerDeck[index];
    
    // Afficher la carte sélectionnée dans l'arène
    const playerCardSlot = document.getElementById('playerCard');
    playerCardSlot.innerHTML = createCardHTML(selectedPlayerCard, index);
    
    // Afficher la barre de vie dans le conteneur dédié
    const playerHealthBar = document.getElementById('playerHealthBar');
    playerHealthBar.innerHTML = createHealthBar('player');
    
    // Désactiver la carte dans le deck
    const playerDeckElement = document.getElementById('playerDeck');
    playerDeckElement.querySelectorAll('.card')[index].classList.add('disabled');
    
    updateGameInfo("Sélection du Pokémon adverse...");
    
    // Le bot sélectionne une carte après un délai
    setTimeout(() => selectBotCard(), 1000);
}

// Fonction pour que le bot sélectionne une carte
function selectBotCard() {
    // Le bot sélectionne une carte aléatoire parmi celles disponibles
    const availableIndices = botDeck.map((p, i) => p ? i : null).filter(i => i !== null);
    if (availableIndices.length === 0) return;
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    selectedBotCard = botDeck[randomIndex];
    
    // Afficher la carte du bot dans l'arène
    const botCardSlot = document.getElementById('botCard');
    botCardSlot.innerHTML = createCardHTML(selectedBotCard, randomIndex);
    
    // Afficher la barre de vie dans le conteneur dédié
    const botHealthBar = document.getElementById('botHealthBar');
    botHealthBar.innerHTML = createHealthBar('bot');
    
    updateGameInfo("Combat en cours...");
    
    // Lancer le combat après un délai
    setTimeout(() => executeBattle(randomIndex), 1500);
}

// Fonction pour exécuter le combat
function executeBattle(botIndex) {
    const playerCardElement = document.querySelector('#playerCard .card');
    const botCardElement = document.querySelector('#botCard .card');
    
    // Animation de début de combat
    updateGameInfo("⚔️ Le combat commence !");
    
    // Simuler le combat tour par tour avec animations
    setTimeout(() => {
        // Cacher le message pendant le combat
        const battleInfo = document.getElementById('battleInfo');
        if (battleInfo) battleInfo.style.display = 'none';
        
        const result = startBattle(selectedPlayerCard, selectedBotCard);
        
        // Animer le combat
        animateBattle(result, () => {
            // Obtenir les noms français avec gestion des Mega évolutions
            let playerBaseName = selectedPlayerCard.Name;
            let playerIsMega = false;
            if (selectedPlayerCard.Name.includes('Mega')) {
                playerBaseName = selectedPlayerCard.Name.split('Mega')[0];
                playerIsMega = true;
            }
            
            let botBaseName = selectedBotCard.Name;
            let botIsMega = false;
            if (selectedBotCard.Name.includes('Mega')) {
                botBaseName = selectedBotCard.Name.split('Mega')[0];
                botIsMega = true;
            }
            
            const playerData = pokemonByName[playerBaseName];
            const botData = pokemonByName[botBaseName];
            
            let playerName = playerData ? playerData.name_fr : playerBaseName;
            if (playerIsMega) {
                playerName = 'Méga-' + playerName;
            }
            
            let botName = botData ? botData.name_fr : botBaseName;
            if (botIsMega) {
                botName = 'Méga-' + botName;
            }
            
            // Afficher le résultat
            let message = '';
            if (result.winner === 'player1') {
                message = `🎉 ${playerName} a gagné ! (${result.turns} tours)`;
                if (botCardElement) botCardElement.classList.add('defeat');
                if (playerCardElement) playerCardElement.classList.add('victory');
                // Retirer la carte du bot
                botDeck[botIndex] = null;
                updateCardsCounter();
            } else if (result.winner === 'player2') {
                message = `😢 ${botName} a gagné... (${result.turns} tours)`;
                if (playerCardElement) playerCardElement.classList.add('defeat');
                if (botCardElement) botCardElement.classList.add('victory');
                // Retirer la carte du joueur
                const playerIndex = playerDeck.indexOf(selectedPlayerCard);
                if (playerIndex !== -1) {
                    playerDeck[playerIndex] = null;
                    updateCardsCounter();
                }
            } else {
                message = `Match nul après ${result.turns} tours !`;
            }
            
            // Réafficher le message d'info
            const battleInfo = document.getElementById('battleInfo');
            if (battleInfo) battleInfo.style.display = 'block';
            
            updateGameInfo(message);
            
            // Vérifier si le jeu est terminé
            setTimeout(() => checkGameEnd(), 3000);
        });
    }, 500);
}

// Fonction pour animer le combat
function animateBattle(result, callback) {
    const playerCardElement = document.querySelector('#playerCard .card');
    const botCardElement = document.querySelector('#botCard .card');
    
    // Initialiser les barres de vie
    const playerMaxHP = calculateTotalHP(selectedPlayerCard);
    const botMaxHP = calculateTotalHP(selectedBotCard);
    updateHealthBar('player', playerMaxHP, playerMaxHP);
    updateHealthBar('bot', botMaxHP, botMaxHP);
    
    let currentTurn = 0;
    const turnDelay = 1500; // Augmenté de 800 à 1500ms pour des combats plus longs
    
    function animateTurn() {
        if (currentTurn >= Math.min(result.turns, 5)) { // Afficher max 5 tours d'animation
            // Mettre à jour les barres de vie avec les HP finaux
            updateHealthBar('player', result.finalHP.hp1, playerMaxHP);
            updateHealthBar('bot', result.finalHP.hp2, botMaxHP);
            callback();
            return;
        }
        
        const turnData = result.log[currentTurn];
        
        // Animation d'attaque du joueur
        if (botCardElement && turnData.damage1 > 0) {
            playerCardElement?.classList.add('attacking');
            setTimeout(() => {
                playerCardElement?.classList.remove('attacking');
                botCardElement.classList.add('damaged');
                // Mettre à jour la barre de vie du bot
                updateHealthBar('bot', turnData.hp2, botMaxHP);
                setTimeout(() => botCardElement.classList.remove('damaged'), 400);
            }, 250);
        }
        
        // Animation d'attaque du bot
        setTimeout(() => {
            if (playerCardElement && turnData.damage2 > 0) {
                botCardElement?.classList.add('attacking');
                setTimeout(() => {
                    botCardElement?.classList.remove('attacking');
                    playerCardElement.classList.add('damaged');
                    // Mettre à jour la barre de vie du joueur
                    updateHealthBar('player', turnData.hp1, playerMaxHP);
                    setTimeout(() => playerCardElement.classList.remove('damaged'), 400);
                }, 250);
            }
        }, 400);
        
        currentTurn++;
        setTimeout(animateTurn, turnDelay);
    }
    
    animateTurn();
}

// Fonction pour vérifier si le jeu est terminé
function checkGameEnd() {
    const playerCardsLeft = playerDeck.filter(p => p !== null).length;
    const botCardsLeft = botDeck.filter(p => p !== null).length;
    
    if (playerCardsLeft === 0) {
        updateGameInfo("💀 Vous avez perdu ! Le bot a gagné la partie.");
        return;
    }
    
    if (botCardsLeft === 0) {
        updateGameInfo("🏆 Félicitations ! Vous avez gagné la partie !");
        return;
    }
    
    // Réinitialiser pour le prochain round
    selectedPlayerCard = null;
    selectedBotCard = null;
    
    // Vider les slots de combat
    document.getElementById('playerCard').innerHTML = '<p>Choisissez votre Pokémon</p>';
    document.getElementById('botCard').innerHTML = '<p>En attente...</p>';
    document.getElementById('playerHealthBar').innerHTML = '';
    document.getElementById('botHealthBar').innerHTML = '';
    
    // Mettre à jour l'affichage du deck du bot
    displayDeck(botDeck, 'botDeck', false);
    
    updateGameInfo("Choisissez votre prochain Pokémon !");
}

// Fonction pour mettre à jour le message d'information
function updateGameInfo(message) {
    const gameInfo = document.querySelector('.battle-info p');
    if (gameInfo) {
        gameInfo.textContent = message;
    }
}

// Fonction pour mettre à jour les compteurs de cartes
function updateCardsCounter() {
    const playerCardsLeft = playerDeck.filter(p => p !== null).length;
    const botCardsLeft = botDeck.filter(p => p !== null).length;
    
    const playerCounter = document.querySelector('#playerCardsCounter .counter');
    const botCounter = document.querySelector('#botCardsCounter .counter');
    
    if (playerCounter) playerCounter.textContent = playerCardsLeft;
    if (botCounter) botCounter.textContent = botCardsLeft;
}

// Initialiser le jeu au chargement de la page
document.addEventListener('DOMContentLoaded', initGame);

// Export des fonctions pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { startBattle, calculateWinProbability };
}