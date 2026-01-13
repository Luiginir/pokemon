# 🚀 Déploiement rapide sur AlwaysData

## Checklist des étapes essentielles

### 1️⃣ Créer la base de données MySQL
- [ ] Aller dans **Bases de données** > **MySQL**
- [ ] Noter les identifiants (host, user, password)
- [ ] Créer une base nommée `votre_compte_pokemon`
- [ ] Ouvrir **phpMyAdmin**
- [ ] Sélectionner la base
- [ ] Aller dans **SQL**
- [ ] Copier-coller le contenu de `database.sql` (modifier la ligne `USE`)
- [ ] Exécuter

### 2️⃣ Uploader les fichiers
- [ ] **CRITIQUE** : Uploadez TOUS les fichiers du projet sur AlwaysData
- [ ] Via FTP (FileZilla recommandé) :
  - Hôte : `ftp-lthomassin.alwaysdata.net`
  - Utilisateur : `lthomassin`
  - Mot de passe : votre mot de passe AlwaysData
  - Uploadez tous les fichiers dans `/home/lthomassin/pokemon/`
- [ ] OU via SSH :
  ```bash
  ssh lthomassin@ssh-lthomassin.alwaysdata.net
  cd /home/lthomassin
  mkdir -p pokemon
  # Puis uploadez les fichiers via scp ou git clone
  ```
- [ ] **Vérifiez que ces fichiers existent** :
  - `server.js`
  - `config.js`
  - `package.json`
  - `start.js`
  - Tous les fichiers HTML (index.html, login.html, etc.)
  - Le dossier `assets/` complet
- [ ] Si SSH : exécuter `npm install` dans le dossier pokemon

### 3️⃣ Configurer le site Node.js
- [ ] Aller dans **Sites** > **Ajouter un site**
- [ ] Type : **Node.js**
- [ ] Command : `node server.js`
- [ ] Working directory : `/home/lthomassin/www/pokemon` (⚠️ IMPORTANT : utilisez le chemin complet où vous avez uploadé vos fichiers)
- [ ] Port : **LAISSER VIDE**

**Note** : 
- Si vous avez uploadé `start.js`, vous pouvez utiliser `node start.js` à la place.
- Le Working directory DOIT correspondre exactement à l'endroit où se trouvent vos fichiers sur alwaysdata !

### 4️⃣ Ajouter les variables d'environnement
Dans la configuration du site > **Environment variables**, ajouter :

```
DB_HOST=mysql-votre_compte.alwaysdata.net
DB_USER=votre_compte_XXXXXX
DB_PASSWORD=votre_mot_de_passe
DB_NAME=votre_compte_pokemon
DB_PORT=3306
SESSION_SECRET=changez_moi_par_une_valeur_complexe
NODE_ENV=production
```

**⚠️ IMPORTANT** : Remplacez toutes les valeurs par VOS vraies informations !

### 5️⃣ Vérifier
- [ ] Sauvegarder la configuration
- [ ] Attendre 30 secondes
- [ ] Aller dans **Sites** > Votre site > **Logs**
- [ ] Chercher : `✅ Serveur démarré sur le port XXXX`
- [ ] Visiter votre site

## ❌ En cas d'erreur "Upstream not ready"

1. Vérifiez les **logs** du site
2. Vérifiez que les **variables d'environnement** sont toutes définies
3. Vérifiez les **identifiants MySQL** (copier-coller depuis Bases de données)
4. Vérifiez que **npm install** a été exécuté
5. Vérifiez que le **Working directory** est correct et complet

## 📖 Documentation complète

Consultez [DEPLOYMENT.md](DEPLOYMENT.md) pour le guide détaillé complet.

## 💬 Support

- Vérifiez les logs dans AlwaysData
- Le fichier `start.js` affiche toutes les variables d'environnement au démarrage
- Cherchez les messages avec ❌ ou ERROR dans les logs
