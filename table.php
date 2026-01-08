<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulation</title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/table.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="assets/js/table.js" defer></script>
</head>

<body>
    <h1>Simulation de combat</h1>
    <h3>Simulez votre combat Pokémon et voyez quelle est la meilleure combinaison</h3>
    <div class="select">
        <div class="team-header">
            <h2>Equipe 1</h2>
            <button class="shuffle-btn" id="shuffle-team1" title="Mélanger l'équipe 1">
                <i class="fas fa-random"></i> Aléatoire
            </button>
        </div>
        <div class="deck">
            <?php
            $json_file = 'assets/data/pokemons.json';
            $json_data = file_get_contents($json_file);
            $pokemons = json_decode($json_data, true);

            for ($i = 1; $i <= 9; $i++) {
                echo '<div class="pokemon-select">';
                echo '<label for="pokemon' . $i . '">Selectionner un pokemon</label>';
                echo '<div class="pokemon-image-container" id="image-container-' . $i . '">';
                echo '<img src="" alt="Pokemon" class="pokemon-image" id="image-' . $i . '" style="display:none;">';
                echo '</div>';
                echo '<select name="pokemon' . $i . '" id="pokemon' . $i . '">';
                foreach ($pokemons as $index => $pokemon) {
                    $pokemonId = isset($pokemon['#']) ? $pokemon['#'] : $index;
                    echo "<option value='" . htmlspecialchars($pokemonId) . "'>" . htmlspecialchars($pokemon['Name']) . "</option>";
                }
                echo '</select>';
                echo '</div>';
            }
            ?>
        </div>
        <div class="team-header">
            <h2>Equipe 2</h2>
            <button class="shuffle-btn" id="shuffle-team2" title="Mélanger l'équipe 2">
                <i class="fas fa-random"></i> Aléatoire
            </button>
        </div>
        <div class="deck">
            <?php
            for ($i = 10; $i <= 18; $i++) {
                echo '<div class="pokemon-select">';
                echo '<label for="pokemon' . $i . '">Selectionner un pokemon</label>';
                echo '<div class="pokemon-image-container" id="image-container-' . $i . '">';
                echo '<img src="" alt="Pokemon" class="pokemon-image" id="image-' . $i . '" style="display:none;">';
                echo '</div>';
                echo '<select name="pokemon' . $i . '" id="pokemon' . $i . '">';
                foreach ($pokemons as $index => $pokemon) {
                    $pokemonId = isset($pokemon['#']) ? $pokemon['#'] : $index;
                    echo "<option value='" . htmlspecialchars($pokemonId) . "'>" . htmlspecialchars($pokemon['Name']) . "</option>";
                }
                echo '</select>';
                echo '</div>';
            }
            ?>
        </div>
    </div>
    
    <div class="heatmap-section">
        <h2>Tableau de Comparaison (Heatmap)</h2>
        <p>Probabilité de victoire du Pokémon en ligne contre le Pokémon en colonne</p>
        <div class="analysis-container">
            <div class="heatmap-container">
                <table id="heatmap-table">
                    <!-- JS -->
                </table>
            </div>
            <div class="chart-container">
                <h3>Statistiques de Victoires</h3>
                <canvas id="winRateChart"></canvas>
            </div>
        </div>
        <div class="heatmap-legend">
            <span class="legend-label">0%</span>
            <div class="legend-gradient"></div>
            <span class="legend-label">100%</span>
        </div>
    </div>
</body>

</html>