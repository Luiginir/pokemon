# Guide de déploiement sur AlwaysData

## 📋 Prérequis

1. Un compte AlwaysData (gratuit ou payant)
2. Accès à votre espace d'administration AlwaysData

## 🗄️ Étape 1 : Créer la base de données MySQL

1. Connectez-vous à votre compte AlwaysData
2. Allez dans **Bases de données** > **MySQL**
3. Cliquez sur **Installer MySQL** si ce n'est pas déjà fait
4. Notez vos identifiants :
   - Hôte : `mysql-votre_compte.alwaysdata.net`
   - Utilisateur : `votre_compte_xxxxxxx`
   - Mot de passe : (celui que vous avez défini)
   - Nom de la base : `votre_compte_pokemon` (ou autre nom)

5. Ouvrez **phpMyAdmin** depuis l'interface AlwaysData
6. Sélectionnez votre base de données
7. Allez dans l'onglet **SQL**
8. Copiez-collez le contenu du fichier `database.sql`
9. Cliquez sur **Exécuter**

Les tables `users`, `unlocked_pokemons`, `decks`, et `deck_pokemons` sont maintenant créées.

## 📦 Étape 2 : Uploader les fichiers

### Option A : Par FTP (recommandé)

1. Dans AlwaysData, allez dans **Sites** > **Votre site**
2. Notez les identifiants FTP :
   - Hôte : `ftp-votre_compte.alwaysdata.net`
   - Utilisateur : `votre_compte`
   - Mot de passe : (votre mot de passe AlwaysData)

3. Utilisez un client FTP (FileZilla, WinSCP, etc.)
4. Uploadez tous les fichiers du projet dans le dossier de votre site
5. Uploadez également le dossier `node_modules` OU installez les dépendances via SSH (voir Option B)

### Option B : Par SSH

1. Activez l'accès SSH dans votre compte AlwaysData
2. Connectez-vous en SSH :
   ```bash
   ssh votre_compte@ssh-votre_compte.alwaysdata.net
   ```

3. Naviguez vers le dossier de votre site :
   ```bash
   cd www/votre_site
   ```

4. Uploadez vos fichiers (via git clone ou scp)
5. Installez les dépendances :
   ```bash
   npm install
   ```

## ⚙️ Étape 3 : Configuration des variables d'environnement

1. Dans le dossier de votre site, créez un fichier `.env`
2. Copiez le contenu de `.env.example`
3. Remplacez les valeurs par vos identifiants MySQL AlwaysData :

```env
DB_HOST=mysql-votre_compte.alwaysdata.net
DB_USER=votre_compte_xxxxxxx
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=votre_compte_pokemon
DB_PORT=3306

SESSION_SECRET=generez_un_secret_aleatoire_complexe_ici

NODE_ENV=production
PORT=8000
```

**Important** : Changez `SESSION_SECRET` par une chaîne aléatoire complexe !

## 🚀 Étape 4 : Configurer l'application Node.js dans AlwaysData

1. Dans AlwaysData, allez dans **Sites** > **Ajouter un site**
2. Ou modifiez votre site existant
3. Choisissez **Node.js** comme type d'application
4. Configuration :
   - **Type** : Node.js
   - **Command** : `node server.js` ou `npm start`
   - **Working directory** : Le chemin vers votre dossier
   - **Port** : Laissez vide (AlwaysData gère automatiquement)
   - **Environment** : Cliquez sur **Advanced** et ajoutez vos variables d'environnement

5. Sauvegardez

## 🌐 Étape 5 : Configurer le domaine

1. Allez dans **Domaines**
2. Ajoutez votre domaine ou sous-domaine
3. Pointez-le vers votre application Node.js

## ✅ Vérification

1. Visitez votre site : `https://votre-domaine.alwaysdata.net`
2. Vous devriez voir la page de connexion
3. Créez un compte test
4. Vérifiez que tout fonctionne :
   - Connexion/Déconnexion
   - Achat de Pokémons
   - Création de decks
   - Lancement de parties

## 🔧 Dépannage

### Erreur "Cannot connect to MySQL"

- Vérifiez vos identifiants dans `.env`
- Vérifiez que MySQL est bien installé dans AlwaysData
- Vérifiez que les tables ont été créées avec `database.sql`

### Erreur 500

- Consultez les logs dans AlwaysData : **Sites** > **Logs**
- Vérifiez que toutes les dépendances sont installées (`npm install`)
- Vérifiez que le fichier `.env` existe et contient les bonnes valeurs

### Page blanche ou erreur de chargement

- Vérifiez que le serveur Node.js est démarré
- Dans AlwaysData, allez dans **Sites** et vérifiez le statut
- Redémarrez l'application si nécessaire

### Sessions qui ne fonctionnent pas

- Assurez-vous que `SESSION_SECRET` est défini dans `.env`
- Vérifiez que `NODE_ENV=production` est défini
- Les cookies sécurisés nécessitent HTTPS (activé par défaut sur AlwaysData)

## 📊 Maintenance

### Sauvegarder la base de données

Dans phpMyAdmin :
1. Sélectionnez votre base
2. Cliquez sur **Exporter**
3. Choisissez **Personnalisée** et cochez toutes les tables
4. Téléchargez le fichier SQL

### Mettre à jour le code

1. Connectez-vous en FTP ou SSH
2. Uploadez les fichiers modifiés
3. Si vous avez modifié `package.json`, exécutez `npm install`
4. Redémarrez l'application dans AlwaysData

## 🔒 Sécurité

- ✅ Les mots de passe sont hashés avec bcrypt
- ✅ Les sessions utilisent des cookies sécurisés en HTTPS
- ✅ Les requêtes SQL utilisent des requêtes préparées (protection contre les injections)
- ✅ Les crédits sont vérifiés côté serveur avant chaque achat

## 💡 Astuces

- Utilisez les logs AlwaysData pour déboguer
- Testez toujours localement avant de déployer
- Gardez une sauvegarde de votre base de données
- Documentez tout changement de configuration

Bon jeu ! 🎮
