// Configuration des chemins API
const AppConfig = {
    // Déterminer le chemin de base
    // Si on est sur alwaysdata avec /pokemon dans l'URL, on l'utilise
    // Sinon on utilise la racine /
    getBasePath() {
        // Vérifier si l'URL contient /pokemon
        const path = window.location.pathname;
        if (path.startsWith('/pokemon')) {
            return '/pokemon';
        }
        return '';
    },
    
    // Construire une URL d'API
    apiUrl(endpoint) {
        return this.getBasePath() + endpoint;
    },
    
    // Construire une URL de page
    pageUrl(page) {
        const basePath = this.getBasePath();
        if (basePath) {
            return basePath + '/' + page;
        }
        return '/' + page;
    }
};
