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

1. Dans AlwaysData, allez dans **Sites** > **Ajouter un site** (ou modifiez votre site existant)

2. Configuration de base :
   - **Addresses** : Votre domaine (ex: `pokemon.votre-compte.alwaysdata.net`)
   - **Type** : Node.js
   - **Version** : Dernière version stable (16 ou supérieur)

3. Configuration de l'application :
   - **Command** : `node start.js` (n'utilisez PAS `npm start`)
   - **Working directory** : `/home/lthomassin/www/pokemon` (remplacez lthomassin par votre compte)
   - **Application port** : Laisser VIDE (AlwaysData gère automatiquement via la variable PORT)
   
   ⚠️ **IMPORTANT** : Si vous uploadez les fichiers dans un sous-dossier comme `/home/votre_compte/www/pokemon`, 
   assurez-vous que le **Working directory** pointe vers ce dossier complet !

4. Variables d'environnement :
   
   Cliquez sur **Environment variables** et ajoutez :
   
   ```
   DB_HOST=mysql-votre_compte.alwaysdata.net
   DB_USER=votre_compte_374918
   DB_PASSWORD=votre_mot_de_passe_mysql
   DB_NAME=votre_compte_pokemon
   DB_PORT=3306
   SESSION_SECRET=votre_secret_aleatoire_complexe_ici
   NODE_ENV=production
   ```
   
   **IMPORTANT** : 
   - Remplacez TOUTES les valeurs par vos vraies informations
   - Ne mettez PAS de guillemets autour des valeurs
   - Le SESSION_SECRET doit être unique et complexe

5. Sauvegardez et attendez que l'application démarre (environ 30 secondes)

6. Vérifiez les logs : **Sites** > Votre site > **Logs** pour voir si tout fonctionne

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

### "Connection to upstream failed: Upstream not ready"

C'est l'erreur la plus courante. Elle signifie que Node.js ne démarre pas. Causes possibles :

1. **Variables d'environnement manquantes**
   - Allez dans Sites > Votre site > **Environment variables**
   - Vérifiez que TOUTES les variables sont définies (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, SESSION_SECRET, NODE_ENV)
   - Pas de guillemets, pas d'espaces avant/après le nom

2. **Mauvais identifiants MySQL**
   - Vérifiez dans **Bases de données** > **MySQL** vos vrais identifiants
   - Le format est souvent : `votre_compte_XXXXXX` pour l'utilisateur
   - Le host est : `mysql-votre_compte.alwaysdata.net`

3. **Dépendances manquantes**
   - Connectez-vous en SSH : `ssh votre_compte@ssh-votre_compte.alwaysdata.net`
   - Allez dans votre dossier : `cd www/pokemon`
   - Exécutez : `npm install`
   - Vérifiez que `node_modules` existe et contient les dépendances

4. **Mauvais chemin de travail**
   - Dans la configuration du site, le Working directory doit être le chemin COMPLET
   - Format : `/home/votre_compte/www/pokemon` (pas de ~ ou de chemin relatif)

5. **Port non configuré**
   - Ne définissez PAS de port fixe dans la configuration du site
   - AlwaysData passe automatiquement la variable d'environnement PORT

6. **Consultez les logs**
   - Sites > Votre site > **Logs**
   - Les logs montreront l'erreur exacte
   - Cherchez les lignes avec ❌ ou ERROR

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
