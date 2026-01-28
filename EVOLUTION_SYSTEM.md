# Système de Pré-requis d'Évolution

## Description

Ce système empêche l'achat de Pokémons évolués ou de formes spéciales sans posséder au préalable leur forme précédente.

## Fonctionnement

### Règles d'achat

1. **Évolutions normales** : Pour acheter une évolution, vous devez d'abord posséder l'évolution précédente
   - Exemple : Pour acheter **Metagross**, vous devez avoir **Metang**
   - Exemple : Pour acheter **Metang**, vous devez avoir **Beldum**

2. **Mega Évolutions** : Pour acheter une Mega Évolution, vous devez posséder la forme de base
   - Exemple : Pour acheter **SceptileMega Sceptile**, vous devez avoir **Sceptile**

3. **Formes Primo (Primal)** : Pour acheter une forme Primo, vous devez posséder la forme normale
   - Exemple : Pour acheter **KyogrePrimal Kyogre**, vous devez avoir **Kyogre**
   - Exemple : Pour acheter **GroudonPrimal Groudon**, vous devez avoir **Groudon**

### Affichage visuel

- **Pokémon possédé** : Badge vert "✓ Possédé"
- **Pokémon achetable** : Bouton d'achat avec le prix en crédits
- **Pokémon bloqué par pré-requis** : 
  - Apparence plus sombre (grayscale + faible luminosité)
  - Bordure pointillée rouge
  - Message "🔒 Nécessite [Nom du Pokémon pré-requis]"

## Fichiers modifiés

### 1. `assets/js/shop-system.js`
- Ajout de `evolutionChains`: mapping complet des chaînes d'évolution de la génération 3
- Ajout de `checkEvolutionPrerequisites()`: fonction de vérification des pré-requis
- Modification de `buyPokemon()`: intégration de la vérification avant l'achat

### 2. `assets/js/bibliotheque.js`
- Vérification des pré-requis lors de l'affichage des cartes
- Ajout de classes CSS conditionnelles (`prerequisite-locked`)
- Affichage du message de pré-requis au lieu du bouton d'achat

### 3. `assets/css/bibliotheque.css`
- Style `.prerequisite-locked`: effet visuel pour les Pokémons bloqués
- Style `.prerequisite-warning`: affichage du message d'avertissement

## Exemples de chaînes d'évolution

### Starters
- **Treecko** → **Grovyle** → **Sceptile** → **SceptileMega Sceptile**
- **Torchic** → **Combusken** → **Blaziken** → **BlazikenMega Blaziken**
- **Mudkip** → **Marshtomp** → **Swampert** → **SwampertMega Swampert**

### Pseudo-légendaires
- **Beldum** → **Metang** → **Metagross** → **MetagrossMega Metagross**
- **Bagon** → **Shelgon** → **Salamence** → **SalamenceMega Salamence**

### Légendaires
- **Kyogre** → **KyogrePrimal Kyogre**
- **Groudon** → **GroudonPrimal Groudon**
- **Rayquaza** → **RayquazaMega Rayquaza**

## Messages d'erreur

Lorsqu'un joueur essaie d'acheter un Pokémon sans avoir le pré-requis :

```
"Vous devez d'abord posséder [Pokémon pré-requis] pour débloquer [Pokémon ciblé]!"
```

Exemple :
```
"Vous devez d'abord posséder Metang pour débloquer Metagross!"
```
