window.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.querySelector('.bibliotheque .grid');
    const typeFilter = document.getElementById('typeFilter');
    const sortBy = document.getElementById('sortBy');
    let allPokemonData = [];
    let frenchNames = {};
    let pokemonByName = {}; // Map pour lier nom anglais -> données françaises
    
    // Variables pour la carte flottante des stats
    const statsCard = document.getElementById('statsCard');
    const statsCardTitle = document.getElementById('statsCardTitle');
    const statsCardPower = document.getElementById('statsCardPower');
    const winRateValue = document.getElementById('winRateValue');
    const winRateFill = document.getElementById('winRateFill');
    let radarChart = null;
    let currentHoveredCard = null;
    let hideTimeout = null;
    let showTimeout = null;
    
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

    // Charger les noms français
    Promise.all([
        fetch('assets/data/pokemons.json').then(response => response.json()),
        fetch('assets/data/pokemons_gen3_fr.json').then(response => response.json())
    ])
        .then(([pokemonData, frenchNamesData]) => {
            allPokemonData = pokemonData;
            frenchNames = frenchNamesData;
            
            // Initialiser les Pokémons de départ
            ShopSystem.initializeStarterPokemon(allPokemonData);
            ShopSystem.updateCreditsDisplay();
            
            // Créer un map pour lier le nom anglais aux données françaises
            Object.entries(frenchNamesData).forEach(([dexNum, data]) => {
                pokemonByName[data.name_en] = {
                    ...data,
                    dexNumber: dexNum
                };
            });
            // Trier par type principal dès le chargement
            const sortedData = [...pokemonData].sort((a, b) => a['Type 1'].localeCompare(b['Type 1']));
            displayPokemons(sortedData);
            
            // Ajouter l'événement de filtrage
            typeFilter.addEventListener('change', function() {
                filterAndDisplay();
            });
            
            // Ajouter l'événement de tri
            sortBy.addEventListener('change', function() {
                filterAndDisplay();
            });
            
            // Rechercher par nom
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', function() {
                filterAndDisplay();
            });
            
            // Fonction combinée de filtrage et recherche
            function filterAndDisplay() {
                const selectedType = typeFilter.value;
                const searchQuery = searchInput.value.toLowerCase();
                const sortOption = sortBy.value;
                
                let filteredData = allPokemonData;
                
                // Filtrer par type
                if (selectedType !== 'all') {
                    filteredData = filteredData.filter(pokemon => pokemon['Type 1'] === selectedType);
                }
                
                // Filtrer par nom
                if (searchQuery) {
                    filteredData = filteredData.filter(pokemon => {
                        let baseName = pokemon.Name;
                        let isMega = false;
                        if (pokemon.Name.includes('Mega')) {
                            baseName = pokemon.Name.split('Mega')[0];
                            isMega = true;
                        }
                        const pokemonData = pokemonByName[baseName];
                        let frenchName = pokemonData ? pokemonData.name_fr : baseName;
                        if (isMega) {
                            frenchName = 'Méga-' + frenchName;
                        }
                        return pokemon.Name.toLowerCase().includes(searchQuery) || 
                               frenchName.toLowerCase().includes(searchQuery) ||
                               (isMega && 'mega'.includes(searchQuery));
                    });
                }
                
                // Trier selon l'option sélectionnée
                filteredData = [...filteredData].sort((a, b) => {
                    switch(sortOption) {
                        case 'type':
                            return a['Type 1'].localeCompare(b['Type 1']);
                        case 'name':
                            let baseNameA = a.Name.includes('Mega') ? a.Name.split('Mega')[0] : a.Name;
                            let baseNameB = b.Name.includes('Mega') ? b.Name.split('Mega')[0] : b.Name;
                            const dataA = pokemonByName[baseNameA];
                            const dataB = pokemonByName[baseNameB];
                            let nameA = dataA ? dataA.name_fr : baseNameA;
                            let nameB = dataB ? dataB.name_fr : baseNameB;
                            if (a.Name.includes('Mega')) nameA = 'Méga-' + nameA;
                            if (b.Name.includes('Mega')) nameB = 'Méga-' + nameB;
                            return nameA.localeCompare(nameB);
                        case 'hp':
                            return b.HP - a.HP;
                        case 'attack':
                            return b.Attack - a.Attack;
                        case 'defense':
                            return b.Defense - a.Defense;
                        default:
                            return 0;
                    }
                });
                
                displayPokemons(filteredData);
            }
        })
        .catch(error => console.error('Error loading Pokémon data:', error));

    function displayPokemons(pokemons) {
        // Vider le conteneur
        gridContainer.innerHTML = '';
        
        pokemons.forEach(pokemon => {
            const card = document.createElement('div');
            card.classList.add('card');

            // Ajouter une classe css en fonction du type principal
            if(pokemon['Type 1'] == 'Grass') {
                card.classList.add('grass');
            }
            if(pokemon['Type 1'] == 'Fire') {
                card.classList.add('fire');
            }
            if(pokemon['Type 1'] == 'Water') {
                card.classList.add('water');
            }
            if(pokemon['Type 1'] == 'Electric') {
                card.classList.add('electric');
            }
            if(pokemon['Type 1'] == 'Psychic') {
                card.classList.add('psychic');
            } 
            if(pokemon['Type 1'] == 'Ice') {
                card.classList.add('ice');
            }
            if(pokemon['Type 1'] == 'Dragon') {
                card.classList.add('dragon');
            }
            if(pokemon['Type 1'] == 'Dark') {
                card.classList.add('dark');
            }
            if(pokemon['Type 1'] == 'Fairy') {
                card.classList.add('fairy');
            }
            if(pokemon['Type 1'] == 'Poison') {
                card.classList.add('poison');
            }
            if(pokemon['Type 1'] == 'Ground') {
                card.classList.add('ground');
            } 
            if(pokemon['Type 1'] == 'Flying') {
                card.classList.add('flying');
            }
            if(pokemon['Type 1'] == 'Bug') {
                card.classList.add('bug');
            }
            if(pokemon['Type 1'] == 'Rock') {
                card.classList.add('rock');
            }
            if(pokemon['Type 1'] == 'Ghost') {
                card.classList.add('ghost');
            }
            if(pokemon['Type 1'] == 'Fighting') {
                card.classList.add('fighting');
            }
            if(pokemon['Type 1'] == 'Steel') {
                card.classList.add('steel');
            }
            if(pokemon['Type 1'] == 'Normal') {
                card.classList.add('normal');
            }
            
            // Build type string
            let types = pokemon['Type 1'];
            if (pokemon['Type 2']) {
                types += ', ' + pokemon['Type 2'];
            }
            
            //Ajout de la traduction du type en français avec icônes
            const typeIcons = {
                'Grass': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/grass.svg',
                'Fire': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fire.svg',
                'Water': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/water.svg',
                'Electric': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/electric.svg',
                'Psychic': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/psychic.svg',
                'Ice': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ice.svg',
                'Dragon': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dragon.svg',
                'Dark': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/dark.svg',
                'Fairy': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fairy.svg',
                'Poison': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/poison.svg',
                'Ground': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ground.svg',
                'Flying': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/flying.svg',
                'Bug': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/bug.svg',
                'Rock': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/rock.svg',
                'Ghost': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/ghost.svg',
                'Fighting': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/fighting.svg',
                'Steel': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/steel.svg',
                'Normal': 'https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/normal.svg'
            };
            
            const typeNames = {
                'Grass': 'Plante',
                'Fire': 'Feu',
                'Water': 'Eau',
                'Electric': 'Électricité',
                'Psychic': 'Psy',
                'Ice': 'Glace',
                'Dragon': 'Dragon',
                'Dark': 'Ténèbres',
                'Fairy': 'Fée',
                'Poison': 'Poison',
                'Ground': 'Sol',
                'Flying': 'Vol',
                'Bug': 'Insecte',
                'Rock': 'Roche',
                'Ghost': 'Spectre',
                'Fighting': 'Combat',
                'Steel': 'Acier',
                'Normal': 'Normal'
            };
            
            // Créer une version avec icônes pour l'affichage
            let typesDisplay = types.split(', ').map(type => {
                const trimmedType = type.trim();
                const icon = typeIcons[trimmedType];
                const name = typeNames[trimmedType];
                const typeClass = trimmedType.toLowerCase();
                return icon ? `<img src="${icon}" class="type-icon type-icon-${typeClass}" alt="${name}"> ${name}` : type;
            }).join(', ');
            
            // Icône du type principal uniquement (pour la face avant)
            const primaryType = pokemon['Type 1'];
            const primaryTypeIcon = typeIcons[primaryType];
            const primaryTypeClass = primaryType.toLowerCase();
            const primaryTypeIconHTML = primaryTypeIcon ? `<img src="${primaryTypeIcon}" class="type-icon type-icon-header type-icon-${primaryTypeClass}" alt="${typeNames[primaryType]}">` : '';

            // Obtenir le nom français si disponible
            // Gérer les Mega évolutions (ex: "SceptileMega Sceptile" -> "Sceptile")
            let baseName = pokemon.Name;
            let isMega = false;
            if (pokemon.Name.includes('Mega')) {
                // Extraire le nom de base (avant "Mega")
                baseName = pokemon.Name.split('Mega')[0];
                isMega = true;
            }
            
            const pokemonData = pokemonByName[baseName];
            const pokemonNumber = pokemonData ? pokemonData.dexNumber : (pokemon.Number + 251);
            let displayName = pokemonData ? pokemonData.name_fr : baseName;
            if (isMega) {
                displayName = 'Méga-' + displayName;
            }
            
            // Pour les Mega évolutions, utiliser l'image mega si disponible
            let imageUrl;
            if (isMega && pokemonData && megaMapping[baseName]) {
                // Utiliser l'ID spécifique du Mega Pokemon depuis le mapping
                const megaId = megaMapping[baseName];
                imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${megaId}.png`;
            } else {
                imageUrl = pokemonData ? pokemonData.image : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNumber}.png`;
            }

            // Vérifier si le Pokémon est débloqué
            const isUnlocked = ShopSystem.isPokemonUnlocked(pokemon.Name);
            const price = ShopSystem.calculatePrice(pokemon);
            const power = ShopSystem.calculatePower(pokemon);
            
            // Ajouter une classe pour les Pokémons verrouillés
            if (!isUnlocked) {
                card.classList.add('locked');
            }

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <div class="card-front-header">
                            <span class="pokemon-id">#${pokemonNumber}</span>
                            <div class="pokemon-hp-front">
                                ${primaryTypeIconHTML}
                                <span>${pokemon.HP} PV</span>
                            </div>
                        </div>
                        <div class="pokemon-image ${!isUnlocked ? 'locked-image' : ''}">
                            <img src="${imageUrl}" alt="${displayName}" loading="lazy">
                        </div>
                        <h2>${displayName}</h2>
                        ${!isUnlocked ? `<div class="price-tag">💰 ${price} crédits</div>` : '<div class="unlocked-badge">✓ Possédé</div>'}
                    </div>
                    <div class="card-back">
                        <div class="card-back-hp">
                            ${primaryTypeIconHTML}
                            <span>${pokemon.HP} PV</span>
                        </div>
                        <div class="pokemon-image">
                            <img src="${imageUrl}" alt="${displayName}" loading="lazy">
                        </div>
                        <p class="type">${typesDisplay}</p>
                        <div class="stats">
                            <p>Attaque: <b>${pokemon.Attack}</b></p>
                            <p>Défense: <b>${pokemon.Defense}</b></p>
                            <p>Puissance: <b>${power}</b></p>
                        </div>
                        ${!isUnlocked ? `
                            <button class="buy-button" data-pokemon-name="${pokemon.Name}" data-price="${price}">
                                ${price} 💰
                            </button>
                        ` : '<div class="owned-message"> ✓ Possédé</div>'}
                    </div>
                </div>
            `;

            
            gridContainer.appendChild(card);
            
            // Ajouter l'événement de hover pour afficher la carte des stats
            card.addEventListener('mouseenter', function(e) {
                // Annuler tout timeout de masquage en cours
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }
                
                currentHoveredCard = card;
                showStatsCard(pokemon, displayName, power, card);
            });
            
            card.addEventListener('mouseleave', function() {
                if (currentHoveredCard === card) {
                    hideStatsCard();
                    currentHoveredCard = null;
                }
            });
        });
        
        // Garder la carte retournée quand on survole le bouton d'achat
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const buyButton = card.querySelector('.buy-button');
            if (buyButton) {
                buyButton.addEventListener('mouseenter', function() {
                    card.classList.add('flipped');
                });
                buyButton.addEventListener('mouseleave', function() {
                    card.classList.remove('flipped');
                });
            }
        });
        
        // Ajouter les gestionnaires d'événements pour les boutons d'achat
        const buyButtons = document.querySelectorAll('.buy-button');
        buyButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // Empêcher le retournement de la carte
                const pokemonName = this.getAttribute('data-pokemon-name');
                const price = parseInt(this.getAttribute('data-price'));
                
                const result = ShopSystem.buyPokemon(pokemonName, price);
                
                if (result.success) {
                    // Afficher un message de succès
                    showNotification(result.message, 'success');
                    // Rafraîchir l'affichage en utilisant les filtres actuels
                    setTimeout(() => {
                        const selectedType = typeFilter.value;
                        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
                        const sortOption = sortBy.value;
                        
                        let filteredData = allPokemonData;
                        
                        if (selectedType !== 'all') {
                            filteredData = filteredData.filter(pokemon => pokemon['Type 1'] === selectedType);
                        }
                        
                        if (searchQuery) {
                            filteredData = filteredData.filter(pokemon => {
                                let baseName = pokemon.Name;
                                let isMega = false;
                                if (pokemon.Name.includes('Mega')) {
                                    baseName = pokemon.Name.split('Mega')[0];
                                    isMega = true;
                                }
                                const pokemonData = pokemonByName[baseName];
                                let frenchName = pokemonData ? pokemonData.name_fr : baseName;
                                if (isMega) {
                                    frenchName = 'Méga-' + frenchName;
                                }
                                return pokemon.Name.toLowerCase().includes(searchQuery) || 
                                       frenchName.toLowerCase().includes(searchQuery) ||
                                       (isMega && 'mega'.includes(searchQuery));
                            });
                        }
                        
                        filteredData = [...filteredData].sort((a, b) => {
                            switch(sortOption) {
                                case 'type':
                                    return a['Type 1'].localeCompare(b['Type 1']);
                                case 'name':
                                    let baseNameA = a.Name.includes('Mega') ? a.Name.split('Mega')[0] : a.Name;
                                    let baseNameB = b.Name.includes('Mega') ? b.Name.split('Mega')[0] : b.Name;
                                    const dataA = pokemonByName[baseNameA];
                                    const dataB = pokemonByName[baseNameB];
                                    let nameA = dataA ? dataA.name_fr : baseNameA;
                                    let nameB = dataB ? dataB.name_fr : baseNameB;
                                    if (a.Name.includes('Mega')) nameA = 'Méga-' + nameA;
                                    if (b.Name.includes('Mega')) nameB = 'Méga-' + nameB;
                                    return nameA.localeCompare(nameB);
                                case 'hp':
                                    return b.HP - a.HP;
                                case 'attack':
                                    return b.Attack - a.Attack;
                                case 'defense':
                                    return b.Defense - a.Defense;
                                default:
                                    return 0;
                            }
                        });
                        
                        displayPokemons(filteredData);
                    }, 500);
                } else {
                    // Afficher un message d'erreur
                    showNotification(result.message, 'error');
                }
            });
        });
    }
    
    // Fonction pour afficher des notifications
    function showNotification(message, type) {
        // Supprimer les notifications existantes
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animation d'apparition
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Disparition après 3 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Fonction pour calculer le taux de victoire d'un Pokémon
    function calculateWinRate(pokemon) {
        let wins = 0;
        let total = allPokemonData.length - 1; // -1 pour exclure le Pokémon lui-même
        
        allPokemonData.forEach(opponent => {
            if (opponent.Name === pokemon.Name) return;
            
            // Simuler un combat simple basé sur les stats
            const pokemonPower = pokemon.HP + pokemon.Attack + pokemon.Defense + pokemon['Sp. Atk'] + pokemon['Sp. Def'] + pokemon.Speed;
            const opponentPower = opponent.HP + opponent.Attack + opponent.Defense + opponent['Sp. Atk'] + opponent['Sp. Def'] + opponent.Speed;
            
            // Facteur de type (bonus si avantage de type)
            let typeAdvantage = 1;
            const typeMatchups = getTypeAdvantage(pokemon['Type 1'], opponent['Type 1']);
            typeAdvantage *= typeMatchups;
            
            if (pokemon['Type 2']) {
                const type2Matchups = getTypeAdvantage(pokemon['Type 2'], opponent['Type 1']);
                typeAdvantage *= type2Matchups;
            }
            
            const adjustedPower = pokemonPower * typeAdvantage;
            
            if (adjustedPower > opponentPower) {
                wins++;
            }
        });
        
        return Math.round((wins / total) * 100);
    }
    
    // Fonction simplifiée pour obtenir l'avantage de type
    function getTypeAdvantage(attackType, defenseType) {
        const advantages = {
            'Fire': { 'Grass': 2, 'Ice': 2, 'Bug': 2, 'Steel': 2, 'Water': 0.5, 'Fire': 0.5, 'Rock': 0.5, 'Dragon': 0.5 },
            'Water': { 'Fire': 2, 'Ground': 2, 'Rock': 2, 'Water': 0.5, 'Grass': 0.5, 'Dragon': 0.5 },
            'Grass': { 'Water': 2, 'Ground': 2, 'Rock': 2, 'Fire': 0.5, 'Grass': 0.5, 'Poison': 0.5, 'Flying': 0.5, 'Bug': 0.5, 'Dragon': 0.5, 'Steel': 0.5 },
            'Electric': { 'Water': 2, 'Flying': 2, 'Electric': 0.5, 'Grass': 0.5, 'Dragon': 0.5, 'Ground': 0 },
            'Psychic': { 'Fighting': 2, 'Poison': 2, 'Psychic': 0.5, 'Steel': 0.5, 'Dark': 0 },
            'Ice': { 'Grass': 2, 'Ground': 2, 'Flying': 2, 'Dragon': 2, 'Fire': 0.5, 'Water': 0.5, 'Ice': 0.5, 'Steel': 0.5 },
            'Dragon': { 'Dragon': 2, 'Steel': 0.5, 'Fairy': 0 },
            'Dark': { 'Psychic': 2, 'Ghost': 2, 'Fighting': 0.5, 'Dark': 0.5, 'Fairy': 0.5 },
            'Fairy': { 'Fighting': 2, 'Dragon': 2, 'Dark': 2, 'Fire': 0.5, 'Poison': 0.5, 'Steel': 0.5 },
            'Fighting': { 'Normal': 2, 'Ice': 2, 'Rock': 2, 'Dark': 2, 'Steel': 2, 'Poison': 0.5, 'Flying': 0.5, 'Psychic': 0.5, 'Bug': 0.5, 'Fairy': 0.5, 'Ghost': 0 },
            'Poison': { 'Grass': 2, 'Fairy': 2, 'Poison': 0.5, 'Ground': 0.5, 'Rock': 0.5, 'Ghost': 0.5, 'Steel': 0 },
            'Ground': { 'Fire': 2, 'Electric': 2, 'Poison': 2, 'Rock': 2, 'Steel': 2, 'Grass': 0.5, 'Bug': 0.5, 'Flying': 0 },
            'Flying': { 'Grass': 2, 'Fighting': 2, 'Bug': 2, 'Electric': 0.5, 'Rock': 0.5, 'Steel': 0.5 },
            'Bug': { 'Grass': 2, 'Psychic': 2, 'Dark': 2, 'Fire': 0.5, 'Fighting': 0.5, 'Poison': 0.5, 'Flying': 0.5, 'Ghost': 0.5, 'Steel': 0.5, 'Fairy': 0.5 },
            'Rock': { 'Fire': 2, 'Ice': 2, 'Flying': 2, 'Bug': 2, 'Fighting': 0.5, 'Ground': 0.5, 'Steel': 0.5 },
            'Ghost': { 'Psychic': 2, 'Ghost': 2, 'Dark': 0.5, 'Normal': 0 },
            'Steel': { 'Ice': 2, 'Rock': 2, 'Fairy': 2, 'Fire': 0.5, 'Water': 0.5, 'Electric': 0.5, 'Steel': 0.5 },
            'Normal': { 'Rock': 0.5, 'Steel': 0.5, 'Ghost': 0 }
        };
        
        if (advantages[attackType] && advantages[attackType][defenseType]) {
            return advantages[attackType][defenseType];
        }
        return 1;
    }
    
    // Fonction pour afficher la carte des stats
    function showStatsCard(pokemon, displayName, power, cardElement) {
        // Annuler tout timeout de show en cours
        if (showTimeout) {
            clearTimeout(showTimeout);
            showTimeout = null;
        }
        
        statsCardTitle.textContent = displayName;
        statsCardPower.textContent = `⚡ ${power}`;
        
        // Calculer le taux de victoire
        const winRate = calculateWinRate(pokemon);
        winRateValue.textContent = `${winRate}%`;
        winRateFill.style.width = `${winRate}%`;
        
        // Créer ou mettre à jour le graphique radar
        const ctx = document.getElementById('statsRadarChart').getContext('2d');
        
        if (radarChart) {
            radarChart.destroy();
        }
        
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['PV', 'Attaque', 'Défense', 'Att. Spé.', 'Déf. Spé.', 'Vitesse'],
                datasets: [{
                    label: displayName,
                    data: [
                        pokemon.HP,
                        pokemon.Attack,
                        pokemon.Defense,
                        pokemon['Sp. Atk'],
                        pokemon['Sp. Def'],
                        pokemon.Speed
                    ],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 150,
                        ticks: {
                            stepSize: 30,
                            font: {
                                size: 10
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 11,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Afficher immédiatement la carte et la positionner
        statsCard.style.display = 'block';
        if (cardElement) {
            positionStatsCardNextToCard(cardElement);
        }
        statsCard.style.opacity = '0';
        
        // Utiliser requestAnimationFrame pour une animation fluide
        requestAnimationFrame(() => {
            statsCard.style.opacity = '1';
        });
    }
    
    // Fonction pour positionner la carte à côté de la carte Pokémon
    function positionStatsCardNextToCard(cardElement) {
        const cardRect = cardElement.getBoundingClientRect();
        const statsCardWidth = statsCard.offsetWidth;
        const statsCardHeight = statsCard.offsetHeight;
        const offset = 20;
        
        let x, y;
        
        // Essayer de positionner à droite de la carte
        x = cardRect.right + offset;
        y = cardRect.top;
        
        // Si ça dépasse à droite, positionner à gauche
        if (x + statsCardWidth > window.innerWidth - offset) {
            x = cardRect.left - statsCardWidth - offset;
        }
        
        // Si ça dépasse à gauche, forcer à droite dans la fenêtre
        if (x < offset) {
            x = window.innerWidth - statsCardWidth - offset;
        }
        
        // Ajuster verticalement si nécessaire
        if (y + statsCardHeight > window.innerHeight - offset) {
            y = Math.max(offset, window.innerHeight - statsCardHeight - offset);
        }
        
        // S'assurer que la carte ne dépasse pas en haut
        if (y < offset) {
            y = offset;
        }
        
        statsCard.style.left = `${x}px`;
        statsCard.style.top = `${y}px`;
    }
    
    // Fonction pour cacher la carte des stats
    function hideStatsCard() {
        // Annuler tout timeout de masquage précédent
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }
        
        // Annuler tout timeout de show en cours
        if (showTimeout) {
            clearTimeout(showTimeout);
            showTimeout = null;
        }
        
        statsCard.style.opacity = '0';
        hideTimeout = setTimeout(() => {
            statsCard.style.display = 'none';
            hideTimeout = null;
        }, 200);
    }
});