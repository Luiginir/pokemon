#!/usr/bin/env node

// Script de démarrage pour AlwaysData
// Ce fichier affiche des informations de débogage utiles

console.log('═══════════════════════════════════════');
console.log('🎮 Pokemon Battle - AlwaysData');
console.log('═══════════════════════════════════════');
console.log('');
console.log('📋 Variables d\'environnement:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'non défini');
console.log('  PORT:', process.env.PORT || 'non défini');
console.log('  DB_HOST:', process.env.DB_HOST ? '✅ défini' : '❌ non défini');
console.log('  DB_USER:', process.env.DB_USER ? '✅ défini' : '❌ non défini');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ défini' : '❌ non défini');
console.log('  DB_NAME:', process.env.DB_NAME ? '✅ défini' : '❌ non défini');
console.log('  SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ défini' : '❌ non défini');
console.log('');
console.log('═══════════════════════════════════════');
console.log('');

// Démarrer le serveur
require('./server.js');
