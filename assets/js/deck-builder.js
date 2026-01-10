// Deck Builder - Gestion des decks personnalisés

let allPokemons = [];
let pokemonsFrench = {};
let pokemonByName = {};
let currentDeck = {
    id: null,
    name: '',
    pokemons: []
};
let editMode = false;

// Mapping des Mega évolutions
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    // Charger les Pokémons
    try {
        const [responsePokemon, responseFrench] = await Promise.all([
            fetch('assets/data/pokemons.json'),
            fetch('assets/data/pokemons_gen3_fr.json')
        ]);
        
        allPokemons = await responsePokemon.json();
        pokemonsFrench = await responseFrench.json();
        
        // Créer le mapping nom anglais -> données françaises
        Object.entries(pokemonsFrench).forEach(([dexNum, data]) => {
            pokemonByName[data.name_en] = {
                ...data,
                dexNumber: dexNum
            };
        });
        
        // Initialiser l'interface
        displayDecksList();
        setupEventListeners();
        
    } catch (error) {
        console.error('Erreur lors du chargement des Pokémons:', error);
    }
});

// Configuration des événements
function setupEventListeners() {
    document.getElementById('newDeckBtn').addEventListener('click', () => openDeckEditor());
    document.getElementById('closeEditorBtn').addEventListener('click', closeDeckEditor);
    document.getElementById('saveDeckBtn').addEventListener('click', saveDeck);
    document.getElementById('cancelBtn').addEventListener('click', closeDeckEditor);
    
    // Filtres
    document.getElementById('pokemonSearch').addEventListener('input', filterPokemons);
    document.getElementById('typeFilterDeck').addEventListener('change', filterPokemons);
}

// Afficher la liste des decks
function displayDecksList() {
    const decks = ShopSystem.getDecks();
    const container = document.getElementById('decksList');
    
    if (decks.length === 0) {
        container.innerHTML = '<div class="empty-message">Aucun deck créé.<br>Cliquez sur "Nouveau Deck" pour commencer !</div>';
        return;
    }
    
    container.innerHTML = '';
    decks.forEach(deck => {
        const deckItem = document.createElement('div');
        deckItem.className = 'deck-item';
        deckItem.innerHTML = `
            <div class="deck-item-header">
                <div class="deck-item-name">${deck.name}</div>
                <div class="deck-item-actions">
                    <button onclick="editDeck(${deck.id})" title="Modifier">✏️</button>
                    <button onclick="deleteDeck(${deck.id})" title="Supprimer">🗑️</button>
                </div>
            </div>
            <div class="deck-item-count">${deck.pokemons.length} Pokémons</div>
        `;
        container.appendChild(deckItem);
    });
}

// Ouvrir l'éditeur de deck
function openDeckEditor(deckId = null) {
    const editor = document.getElementById('deckEditor');
    const title = document.getElementById('editorTitle');
    
    if (deckId) {
        // Mode édition
        const deck = ShopSystem.getDeckById(deckId);
        if (!deck) return;
        
        editMode = true;
        currentDeck = {
            id: deck.id,
            name: deck.name,
            pokemons: [...deck.pokemons]
        };
        title.textContent = 'Modifier le deck';
        document.getElementById('deckName').value = deck.name;
    } else {
        // Mode création
        editMode = false;
        currentDeck = {
            id: null,
            name: '',
            pokemons: []
        };
        title.textContent = 'Nouveau Deck';
        document.getElementById('deckName').value = '';
    }
    
    editor.classList.remove('hidden');
    renderDeckSlots();
    renderPokemonGrid();
    updateCounter();
}

// Fermer l'éditeur
function closeDeckEditor() {
    document.getElementById('deckEditor').classList.add('hidden');
    currentDeck = { id: null, name: '', pokemons: [] };
}

// Rendre les slots du deck
function renderDeckSlots() {
    const container = document.getElementById('deckSlots');
    container.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        const pokemonName = currentDeck.pokemons[i];
        
        if (pokemonName) {
            const pokemon = allPokemons.find(p => p.Name === pokemonName);
            if (pokemon) {
                const pokemonData = getPokemonData(pokemon.Name);
                const imageUrl = getPokemonImageUrl(pokemon.Name, pokemonData);
                const displayName = getFrenchName(pokemon.Name);
                
                slot.className = 'deck-slot filled';
                slot.innerHTML = `
                    <img src="${imageUrl}" alt="${displayName}">
                    <div class="deck-slot-name">${displayName}</div>
                    <button class="deck-slot-remove" onclick="removePokemonFromDeck(${i})">✕</button>
                `;
            }
        } else {
            slot.className = 'deck-slot empty';
            slot.innerHTML = '<span style="font-size: 2rem; color: #ccc;">+</span>';
        }
        
        container.appendChild(slot);
    }
}

// Rendre la grille de sélection des Pokémons
function renderPokemonGrid() {
    const container = document.getElementById('pokemonGrid');
    const searchQuery = document.getElementById('pokemonSearch').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilterDeck').value;
    
    // Filtrer uniquement les Pokémons débloqués
    let pokemons = allPokemons.filter(p => ShopSystem.isPokemonUnlocked(p.Name));
    
    // Appliquer les filtres
    if (typeFilter !== 'all') {
        pokemons = pokemons.filter(p => p['Type 1'] === typeFilter);
    }
    
    if (searchQuery) {
        pokemons = pokemons.filter(p => {
            const frenchName = getFrenchName(p.Name).toLowerCase();
            return p.Name.toLowerCase().includes(searchQuery) || frenchName.includes(searchQuery);
        });
    }
    
    container.innerHTML = '';
    pokemons.forEach(pokemon => {
        const pokemonData = getPokemonData(pokemon.Name);
        const imageUrl = getPokemonImageUrl(pokemon.Name, pokemonData);
        const displayName = getFrenchName(pokemon.Name);
        const isSelected = currentDeck.pokemons.includes(pokemon.Name);
        const isFull = currentDeck.pokemons.length >= 9 && !isSelected;
        
        const option = document.createElement('div');
        option.className = `pokemon-option ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}`;
        option.innerHTML = `
            <img src="${imageUrl}" alt="${displayName}">
            <div class="pokemon-option-name">${displayName}</div>
        `;
        
        if (!isFull) {
            option.addEventListener('click', () => togglePokemon(pokemon.Name));
        }
        
        container.appendChild(option);
    });
}

// Ajouter/Retirer un Pokémon du deck
function togglePokemon(pokemonName) {
    const index = currentDeck.pokemons.indexOf(pokemonName);
    
    if (index > -1) {
        // Retirer
        currentDeck.pokemons.splice(index, 1);
    } else {
        // Ajouter si pas plein
        if (currentDeck.pokemons.length < 9) {
            currentDeck.pokemons.push(pokemonName);
        }
    }
    
    renderDeckSlots();
    renderPokemonGrid();
    updateCounter();
}

// Retirer un Pokémon d'un slot spécifique
function removePokemonFromDeck(index) {
    currentDeck.pokemons.splice(index, 1);
    renderDeckSlots();
    renderPokemonGrid();
    updateCounter();
}

// Mettre à jour le compteur
function updateCounter() {
    document.getElementById('selectedCount').textContent = currentDeck.pokemons.length;
    
    const saveBtn = document.getElementById('saveDeckBtn');
    saveBtn.disabled = currentDeck.pokemons.length !== 9;
}

// Sauvegarder le deck
function saveDeck() {
    const name = document.getElementById('deckName').value.trim();
    
    if (!name) {
        alert('Veuillez donner un nom à votre deck !');
        return;
    }
    
    if (currentDeck.pokemons.length !== 9) {
        alert('Votre deck doit contenir exactement 9 Pokémons !');
        return;
    }
    
    let result;
    if (editMode) {
        result = ShopSystem.updateDeck(currentDeck.id, name, currentDeck.pokemons);
    } else {
        result = ShopSystem.createDeck(name, currentDeck.pokemons);
    }
    
    if (result.success) {
        alert(result.message);
        displayDecksList();
        closeDeckEditor();
    } else {
        alert(result.message);
    }
}

// Éditer un deck
function editDeck(deckId) {
    openDeckEditor(deckId);
}

// Supprimer un deck
function deleteDeck(deckId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce deck ?')) {
        return;
    }
    
    const result = ShopSystem.deleteDeck(deckId);
    if (result.success) {
        displayDecksList();
    } else {
        alert(result.message);
    }
}

// Filtrer les Pokémons
function filterPokemons() {
    renderPokemonGrid();
}

// Fonctions utilitaires
function getPokemonData(name) {
    let baseName = name;
    if (name.includes('Mega')) {
        baseName = name.split('Mega')[0];
    }
    return pokemonByName[baseName];
}

function getPokemonImageUrl(name, pokemonData) {
    let baseName = name;
    let isMega = false;
    if (name.includes('Mega')) {
        baseName = name.split('Mega')[0];
        isMega = true;
    }
    
    if (isMega && megaMapping[baseName]) {
        const megaId = megaMapping[baseName];
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${megaId}.png`;
    }
    
    const pokemonNumber = pokemonData ? pokemonData.dexNumber : (252);
    return pokemonData ? pokemonData.image : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNumber}.png`;
}

function getFrenchName(name) {
    let baseName = name;
    let isMega = false;
    if (name.includes('Mega')) {
        baseName = name.split('Mega')[0];
        isMega = true;
    }
    
    const pokemonData = pokemonByName[baseName];
    let displayName = pokemonData ? pokemonData.name_fr : baseName;
    if (isMega) {
        displayName = 'Méga-' + displayName;
    }
    return displayName;
}
