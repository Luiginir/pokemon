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
            
            //Ajout de la traduction du type en français
            types = types.replace('Grass', '🍃Plante')
                            .replace('Fire', '🔥Feu')
                            .replace('Water', '💧Eau')
                            .replace('Electric', '⚡Électrik')
                            .replace('Psychic', '🔮Psy')
                            .replace('Ice', '❄️Glace')
                            .replace('Dragon', '🐉Dragon')
                            .replace('Dark', '🌑Ténèbres')
                            .replace('Fairy', '🧚‍♀️Fée')
                            .replace('Poison', '☠️Poison')
                            .replace('Ground', '🌍Sol')
                            .replace('Flying', '🕊️Vol')
                            .replace('Bug', '🐛Insecte')
                            .replace('Rock', '🪨Roche')
                            .replace('Ghost', '👻Spectre')
                            .replace('Steel', '⚙️Acier')
                            .replace('Normal', 'Normal');

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

            card.innerHTML = `
                <div class="card-header">
                    <p>#${pokemonNumber}</p>
                    <p>${pokemon.HP} PV</p>
                </div>
                <div class="pokemon-image">
                    <img src="${imageUrl}" alt="${displayName}" loading="lazy">
                </div>
                <h2>${displayName}</h2>
                <p class="type">Type: ${types}</p>
                <div class="stats">
                    <p>PV: <b>${pokemon.HP}</b></p>
                    <p>Attaque: <b>${pokemon.Attack}</b></p>
                    <p>Défense: <b>${pokemon.Defense}</b></p>
                </div>
            `;
            
            // Fonction pour afficher les stats de toutes les cartes sur la même ligne
            card.addEventListener('mouseenter', function() {
                const cards = gridContainer.querySelectorAll('.card');
                const hoveredRect = this.getBoundingClientRect();
                
                // D'abord, retirer la classe show-stats de toutes les cartes qui ne sont pas sur la même ligne
                cards.forEach(c => {
                    const cRect = c.getBoundingClientRect();
                    if (Math.abs(cRect.top - hoveredRect.top) >= 10) {
                        c.classList.remove('show-stats');
                        delete c.dataset.currentRow;
                    }
                });
                
                // Ensuite, ajouter la classe aux cartes de la même ligne
                cards.forEach(c => {
                    const cRect = c.getBoundingClientRect();
                    // Vérifier si la carte est sur la même ligne (tolérance de ±10px)
                    if (Math.abs(cRect.top - hoveredRect.top) < 10) {
                        c.classList.add('show-stats');
                        c.dataset.currentRow = hoveredRect.top;
                    }
                });
            });
            
            // Ajouter l'effet de suivi de la souris
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculer la rotation basée sur la position de la souris
                const rotateX = ((y - centerY) / centerY) * 1; // Max 1deg 
                const rotateY = ((x - centerX) / centerX) * -1; // Max 1deg 
                
                // Calculer la position du gradient de brillance
                const percentX = (x / rect.width) * 100;
                const percentY = (y / rect.height) * 100;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
                
                // Mettre à jour le gradient de brillance
                const beforeElement = window.getComputedStyle(card, '::before');
                card.style.setProperty('--mouse-x', `${percentX}%`);
                card.style.setProperty('--mouse-y', `${percentY}%`);
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
            
            gridContainer.appendChild(card);
        });
    }
    
    // Détecter quand on quitte complètement la grille pour masquer les stats (une seule fois, en dehors de la boucle)
    gridContainer.addEventListener('mouseleave', function() {
        const cards = gridContainer.querySelectorAll('.card');
        cards.forEach(c => {
            c.classList.remove('show-stats');
            delete c.dataset.currentRow;
        });
    });
});