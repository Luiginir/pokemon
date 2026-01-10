const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Configuration des sessions
app.use(session({
    secret: 'pokemon-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Mettre à true en production avec HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    }
}));

// Fichier de base de données JSON
const DB_FILE = path.join(__dirname, 'database.json');

// Initialiser la base de données si elle n'existe pas
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        users: {},
        userData: {}
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Lire la base de données
function readDB() {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

// Écrire dans la base de données
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Middleware pour vérifier l'authentification
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    next();
}

// Route principale - rediriger vers login si non authentifié
app.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.sendFile(path.join(__dirname, 'login.html'));
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API - Inscription
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    
    const db = readDB();
    
    // Vérifier si l'utilisateur existe déjà
    if (db.users[username]) {
        return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    db.users[username] = {
        password: hashedPassword,
        createdAt: new Date().toISOString()
    };
    
    // Initialiser les données utilisateur avec les 10 Pokémons les plus faibles
    db.userData[username] = {
        credits: 1000,
        unlockedPokemons: [],
        decks: []
    };
    
    writeDB(db);
    
    // Connecter automatiquement après l'inscription
    req.session.userId = username;
    
    res.json({ 
        success: true, 
        message: 'Compte créé avec succès',
        username: username
    });
});

// API - Connexion
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    const db = readDB();
    const user = db.users[username];
    
    if (!user) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    
    // Créer la session
    req.session.userId = username;
    
    res.json({ 
        success: true, 
        message: 'Connexion réussie',
        username: username
    });
});

// API - Déconnexion
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        res.json({ success: true, message: 'Déconnexion réussie' });
    });
});

// API - Vérifier la session
app.get('/api/session', (req, res) => {
    if (!req.session.userId) {
        return res.json({ authenticated: false });
    }
    
    res.json({ 
        authenticated: true, 
        username: req.session.userId 
    });
});

// API - Obtenir les données utilisateur
app.get('/api/userdata', requireAuth, (req, res) => {
    const db = readDB();
    const userData = db.userData[req.session.userId];
    
    if (!userData) {
        return res.status(404).json({ error: 'Données utilisateur non trouvées' });
    }
    
    res.json(userData);
});

// API - Mettre à jour les crédits
app.post('/api/credits', requireAuth, (req, res) => {
    const { amount } = req.body;
    
    if (typeof amount !== 'number') {
        return res.status(400).json({ error: 'Montant invalide' });
    }
    
    const db = readDB();
    
    if (!db.userData[req.session.userId]) {
        db.userData[req.session.userId] = { credits: 0, unlockedPokemons: [], decks: [] };
    }
    
    db.userData[req.session.userId].credits = amount;
    writeDB(db);
    
    res.json({ success: true, credits: amount });
});

// API - Débloquer un Pokémon
app.post('/api/unlock-pokemon', requireAuth, (req, res) => {
    const { pokemonName, price } = req.body;
    
    if (!pokemonName || typeof price !== 'number') {
        return res.status(400).json({ error: 'Données invalides' });
    }
    
    const db = readDB();
    const userData = db.userData[req.session.userId];
    
    if (!userData) {
        return res.status(404).json({ error: 'Données utilisateur non trouvées' });
    }
    
    // Vérifier si le Pokémon est déjà débloqué
    if (userData.unlockedPokemons.includes(pokemonName)) {
        return res.status(400).json({ error: 'Pokémon déjà débloqué' });
    }
    
    // Vérifier si l'utilisateur a assez de crédits
    if (userData.credits < price) {
        return res.status(400).json({ error: 'Crédits insuffisants' });
    }
    
    // Débloquer le Pokémon et déduire les crédits
    userData.credits -= price;
    userData.unlockedPokemons.push(pokemonName);
    
    writeDB(db);
    
    res.json({ 
        success: true, 
        credits: userData.credits,
        unlockedPokemons: userData.unlockedPokemons
    });
});

// API - Sauvegarder les Pokémons débloqués
app.post('/api/unlocked-pokemons', requireAuth, (req, res) => {
    const { pokemons } = req.body;
    
    if (!Array.isArray(pokemons)) {
        return res.status(400).json({ error: 'Format invalide' });
    }
    
    const db = readDB();
    
    if (!db.userData[req.session.userId]) {
        db.userData[req.session.userId] = { credits: 1000, unlockedPokemons: [], decks: [] };
    }
    
    db.userData[req.session.userId].unlockedPokemons = pokemons;
    writeDB(db);
    
    res.json({ success: true });
});

// API - Créer un deck
app.post('/api/decks', requireAuth, (req, res) => {
    const { name, pokemons } = req.body;
    
    if (!name || !Array.isArray(pokemons) || pokemons.length !== 9) {
        return res.status(400).json({ error: 'Données invalides' });
    }
    
    const db = readDB();
    const userData = db.userData[req.session.userId];
    
    if (!userData) {
        return res.status(404).json({ error: 'Données utilisateur non trouvées' });
    }
    
    // Vérifier que tous les Pokémons sont débloqués
    const allUnlocked = pokemons.every(p => userData.unlockedPokemons.includes(p));
    if (!allUnlocked) {
        return res.status(400).json({ error: 'Certains Pokémons ne sont pas débloqués' });
    }
    
    // Créer le deck
    const deck = {
        id: Date.now(),
        name: name,
        pokemons: pokemons,
        createdAt: new Date().toISOString()
    };
    
    userData.decks.push(deck);
    writeDB(db);
    
    res.json({ success: true, deck: deck });
});

// API - Mettre à jour un deck
app.put('/api/decks/:id', requireAuth, (req, res) => {
    const deckId = parseInt(req.params.id);
    const { name, pokemons } = req.body;
    
    if (!name || !Array.isArray(pokemons) || pokemons.length !== 9) {
        return res.status(400).json({ error: 'Données invalides' });
    }
    
    const db = readDB();
    const userData = db.userData[req.session.userId];
    
    if (!userData) {
        return res.status(404).json({ error: 'Données utilisateur non trouvées' });
    }
    
    const deckIndex = userData.decks.findIndex(d => d.id === deckId);
    
    if (deckIndex === -1) {
        return res.status(404).json({ error: 'Deck non trouvé' });
    }
    
    // Vérifier que tous les Pokémons sont débloqués
    const allUnlocked = pokemons.every(p => userData.unlockedPokemons.includes(p));
    if (!allUnlocked) {
        return res.status(400).json({ error: 'Certains Pokémons ne sont pas débloqués' });
    }
    
    // Mettre à jour le deck
    userData.decks[deckIndex].name = name;
    userData.decks[deckIndex].pokemons = pokemons;
    
    writeDB(db);
    
    res.json({ success: true, deck: userData.decks[deckIndex] });
});

// API - Supprimer un deck
app.delete('/api/decks/:id', requireAuth, (req, res) => {
    const deckId = parseInt(req.params.id);
    
    const db = readDB();
    const userData = db.userData[req.session.userId];
    
    if (!userData) {
        return res.status(404).json({ error: 'Données utilisateur non trouvées' });
    }
    
    const deckIndex = userData.decks.findIndex(d => d.id === deckId);
    
    if (deckIndex === -1) {
        return res.status(404).json({ error: 'Deck non trouvé' });
    }
    
    userData.decks.splice(deckIndex, 1);
    writeDB(db);
    
    res.json({ success: true });
});

// API - Obtenir les decks
app.get('/api/decks', requireAuth, (req, res) => {
    const db = readDB();
    const userData = db.userData[req.session.userId];
    
    if (!userData) {
        return res.status(404).json({ error: 'Données utilisateur non trouvées' });
    }
    
    res.json({ decks: userData.decks || [] });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📁 Base de données: ${DB_FILE}`);
});
