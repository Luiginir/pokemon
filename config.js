// Configuration de la base de données
// Pour le développement local, vous pouvez utiliser ces valeurs par défaut
// Pour la production sur AlwaysData, configurez les variables d'environnement

module.exports = {
    db: {
        host: process.env.DB_HOST || 'mysql-lthomassin.alwaysdata.net',
        user: process.env.DB_USER || '374918',
        password: process.env.DB_PASSWORD || 'Ingretho452004!',
        database: process.env.DB_NAME || 'lthomassin_pokemon',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000
    },
    session: {
        secret: process.env.SESSION_SECRET || '54dc1d8f2c356dfb5d54e1629cb5ad50',
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === 'production', // true en production avec HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        }
    },
    port: parseInt(process.env.PORT) || 8080
};
