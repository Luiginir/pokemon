window.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.querySelector('.bibliotheque .grid');
    const typeFilter = document.getElementById('typeFilter');
    let allPokemonData = [];

    fetch('assets/data/pokemons.json')
        .then(response => response.json())
        .then(data => {
            allPokemonData = data;
            // Trier par type principal dès le chargement
            const sortedData = [...data].sort((a, b) => a['Type 1'].localeCompare(b['Type 1']));
            displayPokemons(sortedData);
            
            // Ajouter l'événement de filtrage
            typeFilter.addEventListener('change', function() {
                const selectedType = this.value;
                if (selectedType === 'all') {
                    // Trier par type principal
                    const sortedData = [...allPokemonData].sort((a, b) => a['Type 1'].localeCompare(b['Type 1']));
                    displayPokemons(sortedData);
                } else {
                    const filteredData = allPokemonData.filter(pokemon => pokemon['Type 1'] === selectedType);
                    displayPokemons(filteredData);
                }
            });
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
            types = types.replace('Grass', 'Plante')
                            .replace('Fire', 'Feu')
                            .replace('Water', 'Eau')
                            .replace('Electric', 'Électrik')
                            .replace('Psychic', 'Psy')
                            .replace('Ice', 'Glace')
                            .replace('Dragon', 'Dragon')
                            .replace('Dark', 'Ténèbres')
                            .replace('Fairy', 'Fée')
                            .replace('Poison', 'Poison')
                            .replace('Ground', 'Sol')
                            .replace('Flying', 'Vol')
                            .replace('Bug', 'Insecte')
                            .replace('Rock', 'Roche')
                            .replace('Ghost', 'Spectre')
                            .replace('Steel', 'Acier')
                            .replace('Normal', 'Normal');

            card.innerHTML = `
                <h2>${pokemon.Name}</h2>
                <p class="type">Type: ${types}</p>
                <div class="stats">
                    <p>PV: ${pokemon.HP}</p>
                    <p>Attaque: ${pokemon.Attack}</p>
                    <p>Défense: ${pokemon.Defense}</p>
                    <p>Attaque spé: ${pokemon['Sp. Atk']}</p>
                    <p>Défense spé: ${pokemon['Sp. Def']}</p>
                    <p>Vitesse: ${pokemon.Speed}</p>
                </div>
            `;
            
            // Ajouter l'effet de suivi de la souris
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculer la rotation basée sur la position de la souris
                const rotateX = ((y - centerY) / centerY) * 3; // Max 3deg 
                const rotateY = ((x - centerX) / centerX) * -3; // Max 3deg 
                
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
});