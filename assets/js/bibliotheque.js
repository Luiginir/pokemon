window.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.querySelector('.bibliotheque .grid');
    const typeFilter = document.getElementById('typeFilter');
    const sortBy = document.getElementById('sortBy');
    let allPokemonData = [];
    let frenchNames = {};
    let pokemonByName = {}; // Map pour lier nom anglais -> données françaises
    
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
            // Trier par type principal dès le chargement (correspond à l'option par défaut)
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
                        case 'pokedex': {
                            // Tri par numéro de Pokédex
                            let baseNameA = a.Name.includes('Mega') ? a.Name.split('Mega')[0] : a.Name;
                            let baseNameB = b.Name.includes('Mega') ? b.Name.split('Mega')[0] : b.Name;
                            const pokeDataA = pokemonByName[baseNameA];
                            const pokeDataB = pokemonByName[baseNameB];
                            let dexNumA = pokeDataA ? parseInt(pokeDataA.dexNumber) : 999;
                            let dexNumB = pokeDataB ? parseInt(pokeDataB.dexNumber) : 999;
                            return dexNumA - dexNumB;
                        }
                        case 'type':
                            return a['Type 1'].localeCompare(b['Type 1']);
                        case 'name': {
                            let baseNameA = a.Name.includes('Mega') ? a.Name.split('Mega')[0] : a.Name;
                            let baseNameB = b.Name.includes('Mega') ? b.Name.split('Mega')[0] : b.Name;
                            const dataA = pokemonByName[baseNameA];
                            const dataB = pokemonByName[baseNameB];
                            let nameA = dataA ? dataA.name_fr : baseNameA;
                            let nameB = dataB ? dataB.name_fr : baseNameB;
                            if (a.Name.includes('Mega')) nameA = 'Méga-' + nameA;
                            if (b.Name.includes('Mega')) nameB = 'Méga-' + nameB;
                            return nameA.localeCompare(nameB);
                        }
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
    
    // Gestion du bouton retour en haut
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    if (scrollToTopBtn) {
        // Afficher/masquer le bouton selon la position de scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        // Action au clic : retour en haut avec smooth scroll
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});