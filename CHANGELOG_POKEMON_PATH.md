# 🔄 Modifications pour le support du chemin /pokemon

## Résumé des changements

L'application a été modifiée pour fonctionner à la fois :
- **En local** : accessible via `http://localhost:8080/`
- **Sur AlwaysData** : accessible via `https://votre-site.alwaysdata.net/pokemon`

## Fichiers modifiés

### 1. Backend (server.js)
- ✅ Création d'un router Express pour isoler toutes les routes
- ✅ Montage du router sur le préfixe `/pokemon`
- ✅ Les fichiers statiques sont servis depuis `/pokemon`
- ✅ Les routes d'API sont accessibles via `/pokemon/api/*`

### 2. Configuration client (assets/js/config.js)
- ✅ Nouveau fichier de configuration créé
- ✅ Détection automatique du chemin de base :
  - Si l'URL contient `/pokemon` → utilise le préfixe `/pokemon`
  - Sinon → utilise la racine `/`
- ✅ Fonctions utilitaires :
  - `AppConfig.apiUrl('/api/endpoint')` → construit l'URL d'API
  - `AppConfig.pageUrl('page.html')` → construit l'URL de page

### 3. Fichiers HTML mis à jour
- ✅ login.html
- ✅ index.html
- ✅ bibliotheque.html
- ✅ deck-builder.html
- ✅ game.html
→ Tous incluent maintenant `<script src="assets/js/config.js"></script>`

### 4. Fichiers JavaScript mis à jour
- ✅ **assets/js/login.js** : tous les appels fetch utilisent `AppConfig.apiUrl()`
- ✅ **assets/js/shop-system.js** : tous les appels fetch utilisent `AppConfig.apiUrl()`

### 5. Documentation mise à jour
- ✅ **DEPLOYMENT.md** : ajout de notes sur le Working directory
- ✅ **QUICKSTART.md** : précisions sur le chemin /www/pokemon

## Comment ça fonctionne

### En développement local
```
URL: http://localhost:8080/
AppConfig.getBasePath() → ""
AppConfig.apiUrl('/api/session') → "/api/session"
AppConfig.pageUrl('login.html') → "/login.html"
```

### Sur AlwaysData (avec /pokemon)
```
URL: https://votre-site.alwaysdata.net/pokemon
AppConfig.getBasePath() → "/pokemon"
AppConfig.apiUrl('/api/session') → "/pokemon/api/session"
AppConfig.pageUrl('login.html') → "/pokemon/login.html"
```

## Configuration AlwaysData

Dans **Sites** > **Configuration** :
- **Addresses** : `votre-domaine.alwaysdata.net/pokemon`
- **Command** : `node server.js` (ou `node start.js`)
- **Working directory** : `/home/votre_compte/www/pokemon` ⚠️ IMPORTANT
- **Port** : LAISSER VIDE

## Test de fonctionnement

### En local
```bash
npm start
# Accéder à http://localhost:8080/
```

### Sur AlwaysData
```bash
# Upload des fichiers dans /home/votre_compte/www/pokemon
# Configuration du site avec le bon Working directory
# Accès via https://votre-domaine.alwaysdata.net/pokemon
```

## Avantages de cette solution

✅ **Aucun changement de configuration nécessaire** entre local et production
✅ **Détection automatique** du contexte d'exécution
✅ **Compatible** avec les deux environnements
✅ **Maintenable** : un seul code pour tous les environnements
✅ **Extensible** : facile d'ajouter d'autres environnements

## Rollback (si nécessaire)

Si vous voulez revenir à l'ancienne version (sans support de /pokemon) :
1. Dans server.js, supprimer les lignes avec `router` et remettre `app.get()`, `app.post()`, etc.
2. Supprimer `app.use('/pokemon', router)`
3. Supprimer les références à `AppConfig` dans les fichiers JS
4. Remettre les appels fetch directs : `fetch('/api/...')`

Mais cette solution est plus robuste et flexible ! 🚀
