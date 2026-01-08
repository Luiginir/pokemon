window.addEventListener('DOMContentLoaded', function() {
    let allPokemonData = [];
    let frenchNames = {};
    let pokemonByName = {};
    let winRateChart = null;
    
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

    // Charger les données Pokemon
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
            
            // Initialiser les images pour tous les sélecteurs
            for (let i = 1; i <= 18; i++) {
                const select = document.getElementById('pokemon' + i);
                if (select) {
                    // Charger l'image initiale
                    updatePokemonImage(i);
                    
                    // Ajouter l'événement de changement
                    select.addEventListener('change', function() {
                        updatePokemonImage(i);
                        generateHeatmap(); // Mettre à jour le heatmap
                    });
                }
            }
            
            // Générer le heatmap initial
            generateHeatmap();
            addRandomButton();
            generateWinRateChart();
        })
        .catch(error => console.error('Error loading Pokémon data:', error));

    function updatePokemonImage(selectNumber) {
        const select = document.getElementById('pokemon' + selectNumber);
        const imageElement = document.getElementById('image-' + selectNumber);
        
        if (!select || !imageElement) return;
        
        const selectedValue = select.value;
        
        // Trouver le Pokemon correspondant dans les données
        const pokemon = allPokemonData.find(p => {
            const pokemonId = p['#'] || allPokemonData.indexOf(p);
            return pokemonId == selectedValue;
        });
        
        if (pokemon) {
            // Gérer les Mega évolutions
            let baseName = pokemon.Name;
            let isMega = false;
            if (pokemon.Name.includes('Mega')) {
                baseName = pokemon.Name.split('Mega')[0];
                isMega = true;
            }
            
            const pokemonData = pokemonByName[baseName];
            const pokemonNumber = pokemonData ? pokemonData.dexNumber : (pokemon.Number + 251);
            
            // Pour les Mega évolutions, utiliser l'image mega si disponible
            let imageUrl;
            if (isMega && pokemonData && megaMapping[baseName]) {
                const megaId = megaMapping[baseName];
                imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${megaId}.png`;
            } else {
                imageUrl = pokemonData ? pokemonData.image : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNumber}.png`;
            }
            
            // Mettre à jour l'image
            imageElement.src = imageUrl;
            imageElement.style.display = 'block';
            imageElement.alt = pokemon.Name;
        } else {
            imageElement.style.display = 'none';
        }
    }
    
    // Calculer la probabilité de victoire (formule de game.js)
    function calculateWinProbability(pokemon1, pokemon2) {
        // puissance = attaque + defense + pv
        const power1 = pokemon1.Attack + pokemon1.Defense + pokemon1.HP;
        const power2 = pokemon2.Attack + pokemon2.Defense + pokemon2.HP;
        
        const total = power1 + power2;
        
        // prob1 = puissance1 / tot * 100
        const prob1 = (power1 / total) * 100;
        
        return prob1;
    }
    
    // Convertir la probabilité en couleur (rouge à vert)
    function probabilityToColor(probability) {
        // 0% = rouge (255, 0, 0), 50% = jaune (255, 255, 0), 100% = vert (0, 255, 0)
        let r, g, b;
        
        if (probability <= 50) {
            // Rouge vers Jaune (0-50%)
            r = 255;
            g = Math.round((probability / 50) * 255);
            b = 0;
        } else {
            // Jaune vers Vert (50-100%)
            r = Math.round(255 - ((probability - 50) / 50) * 255);
            g = 255;
            b = 0;
        }
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Obtenir le nom français d'un Pokemon
    function getFrenchName(pokemon) {
        let baseName = pokemon.Name;
        let isMega = false;
        if (pokemon.Name.includes('Mega')) {
            baseName = pokemon.Name.split('Mega')[0];
            isMega = true;
        }
        
        const pokemonData = pokemonByName[baseName];
        let displayName = pokemonData ? pokemonData.name_fr : baseName;
        if (isMega) {
            displayName = 'Méga-' + displayName;
        }
        return displayName;
    }
    
    // Générer le heatmap
    function generateHeatmap() {
        const table = document.getElementById('heatmap-table');
        if (!table || allPokemonData.length === 0) return;
        
        // Récupérer les Pokemon des deux équipes séparément
        const team1 = getTeamPokemons(1, 9);
        const team2 = getTeamPokemons(10, 18);
        
        if (team1.length === 0 || team2.length === 0) {
            table.innerHTML = '<tr><td>Sélectionnez des Pokémon dans les deux équipes</td></tr>';
            return;
        }
        
        table.innerHTML = '';
        
        // Créer l'en-tête (Équipe 2 en colonnes)
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th class="corner-cell">Équipe 1 \\ Équipe 2</th>'; // Cellule en haut à gauche
        
        team2.forEach(pokemon => {
            const th = document.createElement('th');
            th.className = 'header-cell';
            
            const headerContent = document.createElement('div');
            headerContent.className = 'header-content';
            
            const img = document.createElement('img');
            img.src = getPokemonImage(pokemon);
            img.alt = getFrenchName(pokemon);
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'pokemon-name-vertical';
            nameSpan.textContent = getFrenchName(pokemon);
            
            headerContent.appendChild(img);
            headerContent.appendChild(nameSpan);
            th.appendChild(headerContent);
            th.title = getFrenchName(pokemon);
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        // Créer les lignes de données (Équipe 1 en lignes)
        team1.forEach((pokemon1) => {
            const row = document.createElement('tr');
            
            // En-tête de ligne (nom du Pokemon de l'équipe 1)
            const rowHeader = document.createElement('th');
            rowHeader.className = 'row-header';
            
            const rowContent = document.createElement('div');
            rowContent.className = 'row-content';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = getFrenchName(pokemon1);
            
            const img = document.createElement('img');
            img.src = getPokemonImage(pokemon1);
            img.alt = getFrenchName(pokemon1);
            
            rowContent.appendChild(nameSpan);
            rowContent.appendChild(img);
            rowHeader.appendChild(rowContent);
            rowHeader.title = getFrenchName(pokemon1);
            row.appendChild(rowHeader);
            
            // Cellules de données (comparaison avec équipe 2)
            team2.forEach((pokemon2) => {
                const cell = document.createElement('td');
                
                const probability = calculateWinProbability(pokemon1, pokemon2);
                cell.className = 'data-cell';
                cell.textContent = Math.round(probability) + '%';
                cell.style.backgroundColor = probabilityToColor(probability);
                cell.title = `${getFrenchName(pokemon1)} vs ${getFrenchName(pokemon2)}: ${probability.toFixed(1)}%`;
                
                // Ajuster la couleur du texte pour la lisibilité
                if (probability > 40 && probability < 60) {
                    cell.style.color = '#000';
                } else {
                    cell.style.color = '#fff';
                }
                
                row.appendChild(cell);
            });
            
            table.appendChild(row);
        });
    }
    
    // Récupérer les Pokemon d'une équipe (par plage de sélecteurs)
    function getTeamPokemons(startIndex, endIndex) {
        const teamPokemons = [];
        const seenIds = new Set();
        
        for (let i = startIndex; i <= endIndex; i++) {
            const select = document.getElementById('pokemon' + i);
            if (select) {
                const selectedValue = select.value;
                
                // Trouver le Pokemon correspondant
                const pokemon = allPokemonData.find(p => {
                    const pokemonId = p['#'] !== undefined ? p['#'] : allPokemonData.indexOf(p);
                    return String(pokemonId) === String(selectedValue);
                });
                
                if (pokemon) {
                    // Éviter les doublons dans la même équipe
                    const pokemonId = pokemon['#'] !== undefined ? pokemon['#'] : pokemon.Name;
                    if (!seenIds.has(pokemonId)) {
                        seenIds.add(pokemonId);
                        teamPokemons.push(pokemon);
                    }
                }
            }
        }
        
        return teamPokemons;
    }
    
    // Ajout boutons de sélection aléatoire
    function addRandomButton() {
        // Attacher les événements aux boutons existants dans le HTML
        const btn1 = document.getElementById('shuffle-team1');
        const btn2 = document.getElementById('shuffle-team2');
        
        if (btn1) {
            btn1.onclick = () => randomizeTeam(1, 9);
        }
        if (btn2) {
            btn2.onclick = () => randomizeTeam(10, 18);
        }
    }

    function randomizeTeam(startIndex, endIndex) {
        if (!allPokemonData.length) return;
        
        // Shuffle helper
        function shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }
        
        const shuffled = shuffle([...allPokemonData]);
        const teamSize = endIndex - startIndex + 1;
        
        // Remplir l'équipe avec des Pokémon aléatoires
        for (let i = startIndex; i <= endIndex; i++) {
            const select = document.getElementById('pokemon' + i);
            if (select) {
                const poke = shuffled[i - startIndex];
                const pokeId = poke['#'] !== undefined ? poke['#'] : allPokemonData.indexOf(poke);
                select.value = pokeId;
                select.dispatchEvent(new Event('change'));
            }
        }
    }
    
    // --- Détail flottant sur hover ---
    function createFloatingCard() {
        let card = document.getElementById('floating-detail-card');
        if (!card) {
            card = document.createElement('div');
            card.id = 'floating-detail-card';
            card.style.position = 'fixed';
            card.style.pointerEvents = 'none';
            card.style.display = 'none';
            card.style.zIndex = '9999';
            card.style.minWidth = '220px';
            card.style.maxWidth = '320px';
            card.style.background = 'rgba(30,30,30,0.95)';
            card.style.border = '2px solid #fff';
            card.style.borderRadius = '12px';
            card.style.boxShadow = '0 4px 24px #0008';
            card.style.padding = '16px';
            card.style.color = '#fff';
            card.style.fontSize = '13px';
            card.style.transition = 'opacity 0.1s';
            card.style.backdropFilter = 'blur(8px)';
            document.body.appendChild(card);
        }
        return card;
    }

    function showFloatingCard(e, pokemon1, pokemon2, probability) {
        const card = createFloatingCard();
        card.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <div style="text-align:center;">
                    <img src="${getPokemonImage(pokemon1)}" alt="${getFrenchName(pokemon1)}" style="width:60px;height:60px;object-fit:contain;display:block;margin:0 auto 4px auto;">
                    <b>${getFrenchName(pokemon1)}</b><br>
                    <span style='font-size:11px;'>PV: ${pokemon1.HP} | Atq: ${pokemon1.Attack} | Def: ${pokemon1.Defense}</span>
                </div>
                <div style="font-size:22px;font-weight:bold;">VS</div>
                <div style="text-align:center;">
                    <img src="${getPokemonImage(pokemon2)}" alt="${getFrenchName(pokemon2)}" style="width:60px;height:60px;object-fit:contain;display:block;margin:0 auto 4px auto;">
                    <b>${getFrenchName(pokemon2)}</b><br>
                    <span style='font-size:11px;'>PV: ${pokemon2.HP} | Atq: ${pokemon2.Attack} | Def: ${pokemon2.Defense}</span>
                </div>
            </div>
            <div style="margin-top:10px;text-align:center;font-size:15px;">
                <b>Probabilité de victoire :</b> <span style="color:${probabilityToColor(probability)};font-weight:bold;">${probability.toFixed(1)}%</span>
            </div>
        `;
        card.style.display = 'block';
        card.style.opacity = '1';
        positionFloatingCard(e, card);
    }

    function hideFloatingCard() {
        const card = document.getElementById('floating-detail-card');
        if (card) {
            card.style.display = 'none';
            card.style.opacity = '0';
        }
    }

    function positionFloatingCard(e, card) {
        const padding = 16;
        let x = e.clientX + 20;
        let y = e.clientY - 20;
        if (x + card.offsetWidth > window.innerWidth - padding) {
            x = window.innerWidth - card.offsetWidth - padding;
        }
        if (y + card.offsetHeight > window.innerHeight - padding) {
            y = window.innerHeight - card.offsetHeight - padding;
        }
        if (y < padding) y = padding;
        card.style.left = x + 'px';
        card.style.top = y + 'px';
    }

    function getPokemonImage(pokemon) {
        let baseName = pokemon.Name;
        let isMega = false;
        if (pokemon.Name.includes('Mega')) {
            baseName = pokemon.Name.split('Mega')[0];
            isMega = true;
        }
        const pokemonData = pokemonByName[baseName];
        const pokemonNumber = pokemonData ? pokemonData.dexNumber : (pokemon.Number + 251);
        if (isMega && pokemonData && megaMapping[baseName]) {
            const megaId = megaMapping[baseName];
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${megaId}.png`;
        } else {
            return pokemonData ? pokemonData.image : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonNumber}.png`;
        }
    }

    // Ajout des listeners sur les cellules du heatmap
    function addHeatmapHoverListeners() {
        const table = document.getElementById('heatmap-table');
        if (!table) return;
        // Remove previous listeners (by cloning)
        const newTable = table.cloneNode(true);
        table.parentNode.replaceChild(newTable, table);
        // Add listeners
        for (let row of newTable.rows) {
            for (let cell of row.cells) {
                if (cell.classList.contains('data-cell')) {
                    cell.onmousemove = (e) => {
                        const rowIdx = cell.parentNode.rowIndex - 1;
                        const colIdx = cell.cellIndex - 1;
                        const team1 = getTeamPokemons(1, 9);
                        const team2 = getTeamPokemons(10, 18);
                        if (team1[rowIdx] && team2[colIdx]) {
                            const probability = calculateWinProbability(team1[rowIdx], team2[colIdx]);
                            showFloatingCard(e, team1[rowIdx], team2[colIdx], probability);
                        }
                    };
                    cell.onmouseleave = hideFloatingCard;
                }
            }
        }
        // Hide card on scroll
        window.addEventListener('scroll', hideFloatingCard);
    }

    // Appeler addHeatmapHoverListeners après chaque génération de heatmap
    const oldGenerateHeatmap = generateHeatmap;
    generateHeatmap = function() {
        oldGenerateHeatmap.apply(this, arguments);
        addHeatmapHoverListeners();
        generateWinRateChart();
    };
    
    // Fonction pour calculer les statistiques de victoire
    function calculateWinStatistics() {
        const team1 = getTeamPokemons(1, 9);
        const team2 = getTeamPokemons(10, 18);
        
        if (team1.length === 0 || team2.length === 0) {
            return [];
        }
        
        const winStats = new Map();
        
        // Initialiser les stats pour tous les pokémons
        [...team1, ...team2].forEach(pokemon => {
            const name = getFrenchName(pokemon);
            if (!winStats.has(name)) {
                winStats.set(name, { 
                    pokemon: pokemon, 
                    wins: 0, 
                    total: 0,
                    winRate: 0
                });
            }
        });
        
        // Calculer les victoires pour l'équipe 1 contre l'équipe 2
        team1.forEach(pokemon1 => {
            const name1 = getFrenchName(pokemon1);
            team2.forEach(pokemon2 => {
                const probability = calculateWinProbability(pokemon1, pokemon2);
                const stats1 = winStats.get(name1);
                stats1.total++;
                if (probability > 50) {
                    stats1.wins++;
                }
            });
        });
        
        // Calculer les victoires pour l'équipe 2 contre l'équipe 1
        team2.forEach(pokemon2 => {
            const name2 = getFrenchName(pokemon2);
            team1.forEach(pokemon1 => {
                const probability = calculateWinProbability(pokemon2, pokemon1);
                const stats2 = winStats.get(name2);
                stats2.total++;
                if (probability > 50) {
                    stats2.wins++;
                }
            });
        });
        
        // Calculer le taux de victoire
        winStats.forEach((stats, name) => {
            stats.winRate = stats.total > 0 ? (stats.wins / stats.total) * 100 : 0;
        });
        
        // Convertir en array et trier par nombre de victoires
        const statsArray = Array.from(winStats.values());
        statsArray.sort((a, b) => b.wins - a.wins);
        
        return statsArray;
    }
    
    // Fonction pour générer des couleurs pour tous les pokémons
    function generateColors(count) {
        const colors = [];
        const borderColors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 360 / count) % 360;
            colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
            borderColors.push(`hsla(${hue}, 70%, 60%, 1)`);
        }
        return { colors, borderColors };
    }
    
    // Fonction pour générer le diagramme camembert
    function generateWinRateChart() {
        const canvas = document.getElementById('winRateChart');
        if (!canvas) return;
        
        const stats = calculateWinStatistics();
        
        if (stats.length === 0) {
            // Si pas de données, afficher un message
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '14px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Sélectionnez des Pokémon', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Prendre tous les pokémons
        const topStats = stats;
        
        // Générer des couleurs pour tous les pokémons
        const { colors, borderColors } = generateColors(topStats.length);
        
        const data = {
            labels: topStats.map(s => getFrenchName(s.pokemon)),
            datasets: [{
                label: 'Nombre de victoires',
                data: topStats.map(s => s.wins),
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2
            }]
        };
        
        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'white',
                            font: {
                                size: 11
                            },
                            padding: 8
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const stat = topStats[context.dataIndex];
                                return [
                                    `${context.label}`,
                                    `Victoires: ${stat.wins}/${stat.total}`,
                                    `Taux: ${stat.winRate.toFixed(1)}%`
                                ];
                            }
                        }
                    }
                }
            }
        };
        
        // Détruire le graphique existant s'il existe
        if (winRateChart) {
            winRateChart.destroy();
        }
        
        // Créer le nouveau graphique
        winRateChart = new Chart(canvas, config);
    }
});
