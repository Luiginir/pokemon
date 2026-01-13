const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const config = require('./config');

const app = express();
const PORT = config.port;

// Créer le pool de connexions MySQL
const pool = mysql.createPool(config.db);

// Fonction pour initialiser la base de données
async function initDatabase() {
    try {
        console.log('🔄 Tentative de connexion à MySQL...');
        console.log('📊 Configuration:', {
            host: config.db.host,
            user: config.db.user,
            database: config.db.database,
            port: config.db.port
        });
        
        const connection = await pool.getConnection();
        console.log('✅ Connexion MySQL établie avec succès');
        
        // Tester une requête simple
        await connection.query('SELECT 1');
        console.log('✅ Test de requête réussi');
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion MySQL:', error.message);
        console.error('📝 Détails:', error);
        console.log('💡 Vérifications à faire:');
        console.log('  1. MySQL est-il installé et démarré ?');
        console.log('  2. La base de données existe-t-elle ?');
        console.log('  3. Les identifiants sont-ils corrects ?');
        console.log('  4. Les variables d\'environnement sont-elles définies ?');
        
        // Ne pas quitter, laisser le serveur démarrer pour voir les logs
        return false;
    }
}

// Middleware globaux
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(config.session));

// Middleware pour vérifier l'authentification
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    next();
}

// Créer un router pour le préfixe /pokemon
const router = express.Router();

// Fichiers statiques sur /pokemon (servir depuis la racine du projet)
router.use(express.static(path.join(__dirname)));

// Route principale - rediriger vers login si non authentifié
router.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.sendFile(path.join(__dirname, 'login.html'));
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API - Inscription
router.post('/api/register', async (req, res) => {
    console.log('📝 Tentative d\'inscription:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    
    try {
        // Vérifier si l'utilisateur existe déjà
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
        }
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Créer l'utilisateur avec 1000 crédits de départ
        const [result] = await pool.query(
            'INSERT INTO users (username, password, credits) VALUES (?, ?, 1000)',
            [username, hashedPassword]
        );
        
        const userId = result.insertId;
        
        // Débloquer les 10 Pokémons de départ (les plus faibles)
        const pokemonData = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'data', 'pokemons.json'), 'utf8'));
        
        // Calculer la puissance et trier
        const pokemonsWithPower = pokemonData.map(p => ({
            ...p,
            power: p.HP + p.Attack + p.Defense + (p['Sp. Atk'] || 0) + (p['Sp. Def'] || 0) + (p.Speed || 0)
        }));
        pokemonsWithPower.sort((a, b) => a.power - b.power);
        
        // Prendre les 10 premiers
        const starterPokemons = pokemonsWithPower.slice(0, 10).map(p => p.Name);
        
        // Insérer les Pokémons de départ
        if (starterPokemons.length > 0) {
            const values = starterPokemons.map(name => [userId, name]);
            await pool.query(
                'INSERT INTO unlocked_pokemons (user_id, pokemon_name) VALUES ?',
                [values]
            );
            console.log('🎁 Pokémons de départ débloqués pour:', username, starterPokemons);
        }
        
        // Connecter automatiquement après l'inscription
        req.session.userId = userId;
        req.session.username = username;
        
        console.log('✅ Compte créé avec succès pour:', username);
        
        res.json({ 
            success: true, 
            message: 'Compte créé avec succès',
            username: username
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
});

// API - Connexion
router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    try {
        // Récupérer l'utilisateur
        const [users] = await pool.query(
            'SELECT id, username, password FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        const user = users[0];
        
        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        // Créer la session
        req.session.userId = user.id;
        req.session.username = user.username;
        
        res.json({ 
            success: true, 
            message: 'Connexion réussie',
            username: user.username
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// API - Déconnexion
router.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        res.json({ success: true, message: 'Déconnexion réussie' });
    });
});

// API - Vérifier la session
router.get('/api/session', (req, res) => {
    if (!req.session.userId) {
        return res.json({ authenticated: false });
    }
    
    res.json({ 
        authenticated: true, 
        username: req.session.username 
    });
});

// API - Obtenir les données utilisateur
router.get('/api/userdata', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        // Récupérer les crédits
        const [users] = await pool.query(
            'SELECT credits FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        // Récupérer les Pokémons débloqués
        const [unlockedPokemons] = await pool.query(
            'SELECT pokemon_name FROM unlocked_pokemons WHERE user_id = ?',
            [userId]
        );
        
        // Récupérer les decks avec leurs Pokémons
        const [decks] = await pool.query(
            'SELECT id, name, created_at, updated_at FROM decks WHERE user_id = ?',
            [userId]
        );
        
        // Pour chaque deck, récupérer ses Pokémons
        for (let deck of decks) {
            const [deckPokemons] = await pool.query(
                'SELECT pokemon_name FROM deck_pokemons WHERE deck_id = ? ORDER BY position',
                [deck.id]
            );
            deck.pokemons = deckPokemons.map(p => p.pokemon_name);
        }
        
        res.json({
            credits: users[0].credits,
            unlockedPokemons: unlockedPokemons.map(p => p.pokemon_name),
            decks: decks
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API - Mettre à jour les crédits
router.post('/api/credits', requireAuth, async (req, res) => {
    const { amount } = req.body;
    
    if (typeof amount !== 'number') {
        return res.status(400).json({ error: 'Montant invalide' });
    }
    
    try {
        await pool.query(
            'UPDATE users SET credits = ? WHERE id = ?',
            [amount, req.session.userId]
        );
        
        res.json({ success: true, credits: amount });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des crédits:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API - Débloquer un Pokémon
router.post('/api/unlock-pokemon', requireAuth, async (req, res) => {
    const { pokemonName, price } = req.body;
    
    if (!pokemonName || typeof price !== 'number') {
        return res.status(400).json({ error: 'Données invalides' });
    }
    
    try {
        const userId = req.session.userId;
        
        // Vérifier si le Pokémon est déjà débloqué
        const [existing] = await pool.query(
            'SELECT id FROM unlocked_pokemons WHERE user_id = ? AND pokemon_name = ?',
            [userId, pokemonName]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Pokémon déjà débloqué' });
        }
        
        // Récupérer les crédits actuels
        const [users] = await pool.query(
            'SELECT credits FROM users WHERE id = ?',
            [userId]
        );
        
        const currentCredits = users[0].credits;
        
        if (currentCredits < price) {
            return res.status(400).json({ error: 'Crédits insuffisants' });
        }
        
        // Débloquer le Pokémon et déduire les crédits (transaction)
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        try {
            await connection.query(
                'UPDATE users SET credits = credits - ? WHERE id = ?',
                [price, userId]
            );
            
            await connection.query(
                'INSERT INTO unlocked_pokemons (user_id, pokemon_name) VALUES (?, ?)',
                [userId, pokemonName]
            );
            
            await connection.commit();
            
            // Récupérer les nouvelles données
            const [newUsers] = await connection.query(
                'SELECT credits FROM users WHERE id = ?',
                [userId]
            );
            
            const [unlockedPokemons] = await connection.query(
                'SELECT pokemon_name FROM unlocked_pokemons WHERE user_id = ?',
                [userId]
            );
            
            connection.release();
            
            res.json({ 
                success: true, 
                credits: newUsers[0].credits,
                unlockedPokemons: unlockedPokemons.map(p => p.pokemon_name)
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Erreur lors du déblocage:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API - Sauvegarder les Pokémons débloqués
router.post('/api/unlocked-pokemons', requireAuth, async (req, res) => {
    const { pokemons } = req.body;
    
    if (!Array.isArray(pokemons)) {
        return res.status(400).json({ error: 'Format invalide' });
    }
    
    try {
        const userId = req.session.userId;
        
        // Supprimer les anciens et insérer les nouveaux
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        try {
            await connection.query(
                'DELETE FROM unlocked_pokemons WHERE user_id = ?',
                [userId]
            );
            
            if (pokemons.length > 0) {
                const values = pokemons.map(name => [userId, name]);
                await connection.query(
                    'INSERT INTO unlocked_pokemons (user_id, pokemon_name) VALUES ?',
                    [values]
                );
            }
            
            await connection.commit();
            connection.release();
            
            res.json({ success: true });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API - Créer un deck
router.post('/api/decks', requireAuth, async (req, res) => {
    const { name, pokemons } = req.body;
    
    if (!name || !Array.isArray(pokemons) || pokemons.length !== 9) {
        return res.status(400).json({ error: 'Données invalides' });
    }
    
    try {
        const userId = req.session.userId;
        
        // Vérifier que tous les Pokémons sont débloqués
        const [unlockedPokemons] = await pool.query(
            'SELECT pokemon_name FROM unlocked_pokemons WHERE user_id = ?',
            [userId]
        );
        
        const unlockedNames = unlockedPokemons.map(p => p.pokemon_name);
        const allUnlocked = pokemons.every(p => unlockedNames.includes(p));
        
        if (!allUnlocked) {
            return res.status(400).json({ error: 'Certains Pokémons ne sont pas débloqués' });
        }
        
        // Créer le deck
        const [result] = await pool.query(
            'INSERT INTO decks (user_id, name) VALUES (?, ?)',
            [userId, name]
        );
        
        const deckId = result.insertId;
        
        // Insérer les Pokémons du deck
        const values = pokemons.map((pokemonName, index) => [deckId, pokemonName, index + 1]);
        await pool.query(
            'INSERT INTO deck_pokemons (deck_id, pokemon_name, position) VALUES ?',
            [values]
        );
        
        // Récupérer le deck créé
        const [decks] = await pool.query(
            'SELECT id, name, created_at, updated_at FROM decks WHERE id = ?',
            [deckId]
        );
        
        const deck = decks[0];
        deck.pokemons = pokemons;
        
        res.json({ success: true, deck: deck });
    } catch (error) {
        console.error('Erreur lors de la création du deck:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API - Mettre à jour un deck
router.put('/api/decks/:id', requireAuth, async (req, res) => {
    const deckId = parseInt(req.params.id);
    const { name, pokemons } = req.body;
    
    if (!name || !Array.isArray(pokemons) || pokemons.length !== 9) {
        return res.status(400).json({ error: 'Données invalides' });
    }
    
    try {
        const userId = req.session.userId;
        
        // Vérifier que le deck appartient à l'utilisateur
        const [decks] = await pool.query(
            'SELECT id FROM decks WHERE id = ? AND user_id = ?',
            [deckId, userId]
        );
        
        if (decks.length === 0) {
            return res.status(404).json({ error: 'Deck non trouvé' });
        }
        
        // Vérifier que tous les Pokémons sont débloqués
        const [unlockedPokemons] = await pool.query(
            'SELECT pokemon_name FROM unlocked_pokemons WHERE user_id = ?',
            [userId]
        );
        
        const unlockedNames = unlockedPokemons.map(p => p.pokemon_name);
        const allUnlocked = pokemons.every(p => unlockedNames.includes(p));
        
        if (!allUnlocked) {
            return res.status(400).json({ error: 'Certains Pokémons ne sont pas débloqués' });
        }
        
        // Mettre à jour le deck
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        try {
            await connection.query(
                'UPDATE decks SET name = ? WHERE id = ?',
                [name, deckId]
            );
            
            await connection.query(
                'DELETE FROM deck_pokemons WHERE deck_id = ?',
                [deckId]
            );
            
            const values = pokemons.map((pokemonName, index) => [deckId, pokemonName, index + 1]);
            await connection.query(
                'INSERT INTO deck_pokemons (deck_id, pokemon_name, position) VALUES ?',
                [values]
            );
            
            await connection.commit();
            
            const [updatedDecks] = await connection.query(
                'SELECT id, name, created_at, updated_at FROM decks WHERE id = ?',
                [deckId]
            );
            
            connection.release();
            
            const deck = updatedDecks[0];
            deck.pokemons = pokemons;
            
            res.json({ success: true, deck: deck });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du deck:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API - Supprimer un deck
router.delete('/api/decks/:id', requireAuth, async (req, res) => {
    const deckId = parseInt(req.params.id);
    
    try {
        const userId = req.session.userId;
        
        // Vérifier que le deck appartient à l'utilisateur
        const [decks] = await pool.query(
            'SELECT id FROM decks WHERE id = ? AND user_id = ?',
            [deckId, userId]
        );
        
        if (decks.length === 0) {
            return res.status(404).json({ error: 'Deck non trouvé' });
        }
        
        // Supprimer le deck (les deck_pokemons seront supprimés automatiquement par CASCADE)
        await pool.query(
            'DELETE FROM decks WHERE id = ?',
            [deckId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression du deck:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API - Obtenir les decks
router.get('/api/decks', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        const [decks] = await pool.query(
            'SELECT id, name, created_at, updated_at FROM decks WHERE user_id = ?',
            [userId]
        );
        
        // Pour chaque deck, récupérer ses Pokémons
        for (let deck of decks) {
            const [deckPokemons] = await pool.query(
                'SELECT pokemon_name FROM deck_pokemons WHERE deck_id = ? ORDER BY position',
                [deck.id]
            );
            deck.pokemons = deckPokemons.map(p => p.pokemon_name);
        }
        
        res.json({ decks: decks });
    } catch (error) {
        console.error('Erreur lors de la récupération des decks:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Monter le router sur /pokemon
// Monter le router sur /pokemon (pour AlwaysData)
app.use('/pokemon', router);

// Monter aussi sur la racine / (pour le développement local)
app.use('/', router);

// Démarrer le serveur
async function startServer() {
    console.log('🚀 Démarrage du serveur Pokemon Battle...');
    console.log('🌍 Environnement:', process.env.NODE_ENV || 'development');
    console.log('🔌 Port:', PORT);
    
    const dbConnected = await initDatabase();
    
    if (!dbConnected) {
        console.warn('⚠️  Le serveur démarre SANS connexion à la base de données');
        console.warn('⚠️  Les fonctionnalités seront limitées');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Serveur démarré sur le port ${PORT}`);
        console.log(`📊 Base de données: ${dbConnected ? 'Connectée ✅' : 'Non connectée ❌'}`);
        console.log(`🔗 Accès: http://localhost:${PORT}`);
        
        if (process.env.NODE_ENV === 'production') {
            console.log('🔒 Mode production activé');
        }
    });
}

startServer().catch(err => {
    console.error('❌ Erreur fatale lors du démarrage:', err);
    console.error(err.stack);
    process.exit(1);
});
