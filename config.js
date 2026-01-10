// Configuration de la base de données
// Pour le développement local, vous pouvez utiliser ces valeurs par défaut
// Pour la production sur AlwaysData, configurez les variables d'environnement

module.exports = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pokemon_game',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    },
    session: {
        secret: process.env.SESSION_SECRET || 'pokemon-secret-key-2026-change-me-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === 'production', // true en production avec HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        }
    },
    port: process.env.PORT || 3000
};
