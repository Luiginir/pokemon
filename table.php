<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulation</title>
</head>
<body>
    <h1>Simulation de combat</h1>
    <h3>Simulez votre combat Pokémon et voyez quelle est la meilleure comboinaison</h3>
    <div class="select">
        <div class="deck">
            <h4>Equipe 1</h4>
            <?php 
                // Load Pokemon data from JSON file
                $json_file = 'assets/data/pokemons.json';
                $json_data = file_get_contents($json_file);
                $pokemons = json_decode($json_data, true);
                
                for ($i = 1; $i <= 9; $i++) {
                    echo '<label for="pokemon' . $i . '">Selectionner un pokemon</label>';
                    echo '<select name="pokemon' . $i . '" id="pokemon' . $i . '">';
                    foreach ($pokemons as $pokemon) {
                        echo "<option value='" . $pokemon['#'] . "'>" . $pokemon['Name'] . "</option>";
                    }
                    echo '</select>';
                }
            ?>
        </div>
        <div class="deck">
            <h4>Equipe 2</h4>
        </div>
    </div>
</body>
</html>