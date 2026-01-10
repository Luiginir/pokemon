# Pokémon Battle Game

Un jeu de combat Pokémon avec système de boutique, decks personnalisés et authentification utilisateur.

## 🚀 Fonctionnalités

- ✅ **Système d'authentification** : Inscription et connexion sécurisées
- ✅ **Boutique Pokémon** : Achetez des Pokémons avec vos crédits
- ✅ **Système de crédits** : Gagnez des crédits en remportant des combats
- ✅ **Decks personnalisés** : Créez et gérez vos propres decks de 9 Pokémons
- ✅ **Mode Solo** : Combattez contre l'IA
- ✅ **Mode Multijoueur** : Affrontez d'autres joueurs en peer-to-peer
- ✅ **Sauvegarde en ligne** : Vos données sont persistées sur le serveur

## 📋 Prérequis

- **Node.js** version 14 ou supérieure
- **npm** (inclus avec Node.js)

## 🔧 Installation

1. **Clonez ou téléchargez le projet**

2. **Installez les dépendances**
   ```bash
   npm install
   ```

## ▶️ Démarrage

1. **Lancez le serveur**
   ```bash
   npm start
   ```

   Pour le développement avec rechargement automatique :
   ```bash
   npm run dev
   ```

2. **Ouvrez votre navigateur**
   
   Rendez-vous sur : `http://localhost:3000`

3. **Créez un compte**
   
   - Cliquez sur "Créer un compte"
   - Choisissez un nom d'utilisateur et un mot de passe (minimum 6 caractères)
   - Vous serez automatiquement connecté avec 1000 crédits de départ

## 🎮 Comment jouer

### Premier lancement
- Vous démarrez avec **1000 crédits**
- Les **10 Pokémons les plus faibles** sont débloqués automatiquement
- Visitez la **Boutique** pour acheter plus de Pokémons

### Boutique
- Parcourez tous les Pokémons de la Génération 3
- Les Pokémons non débloqués apparaissent en **noir et blanc**
- Le prix dépend de la puissance du Pokémon (somme des statistiques)
- Cliquez sur **"Acheter"** pour débloquer un Pokémon

### Créer des Decks
1. Allez dans **"Mes Decks"**
2. Cliquez sur **"Nouveau Deck"**
3. Donnez un nom à votre deck
4. Sélectionnez 9 Pokémons parmi ceux que vous possédez
5. Sauvegardez votre deck

### Lancer un combat
1. Cliquez sur **"Jouer"**
2. Choisissez votre mode :
   - **Solo** : Contre l'IA
   - **Multijoueur** : Contre un autre joueur
3. Sélectionnez votre deck ou utilisez un deck aléatoire
4. Choisissez un Pokémon pour chaque tour
5. Gagnez des crédits à chaque victoire (+100 crédits)

### Système de combat
- Les dégâts sont calculés selon les statistiques (Attaque, Défense, etc.)
- Les **types** influencent les dégâts (feu > plante, eau > feu, etc.)
- Le premier à éliminer 5 Pokémons adverses gagne

## 🗄️ Base de données

Les données sont stockées dans `database.json` :
- **Utilisateurs** : Comptes avec mots de passe hashés
- **Crédits** : Solde de chaque joueur
- **Pokémons débloqués** : Liste par utilisateur
- **Decks** : Decks personnalisés par utilisateur

## 🔒 Sécurité

- Les mots de passe sont **hashés** avec bcrypt
- Les sessions utilisateur expirent après **7 jours**
- L'authentification est requise pour toutes les actions

## 🌐 Déploiement en production

Pour déployer en ligne :

1. **Configurez HTTPS** (requis pour les cookies sécurisés)
2. Dans `server.js`, modifiez :
   ```javascript
   cookie: { 
       secure: true, // Activer pour HTTPS
       maxAge: 7 * 24 * 60 * 60 * 1000
   }
   ```
3. Changez le `secret` de session par une valeur aléatoire complexe
4. Déployez sur votre hébergeur (Heroku, DigitalOcean, etc.)

## 📝 API Endpoints

### Authentification
- `POST /api/register` - Créer un compte
- `POST /api/login` - Se connecter
- `POST /api/logout` - Se déconnecter
- `GET /api/session` - Vérifier la session

### Données utilisateur
- `GET /api/userdata` - Obtenir toutes les données
- `POST /api/credits` - Mettre à jour les crédits
- `POST /api/unlock-pokemon` - Débloquer un Pokémon
- `POST /api/unlocked-pokemons` - Sauvegarder les Pokémons débloqués

### Decks
- `GET /api/decks` - Liste des decks
- `POST /api/decks` - Créer un deck
- `PUT /api/decks/:id` - Modifier un deck
- `DELETE /api/decks/:id` - Supprimer un deck

## 🛠️ Technologies utilisées

- **Backend** : Node.js, Express
- **Authentification** : express-session, bcryptjs
- **Base de données** : JSON (fichier local)
- **Frontend** : HTML, CSS, JavaScript vanilla
- **Multijoueur** : PeerJS (WebRTC)

## 📄 Licence

Ce projet est à usage éducatif. Les données Pokémon appartiennent à The Pokémon Company.

## 🤝 Contribution

N'hésitez pas à ouvrir des issues ou proposer des améliorations !
