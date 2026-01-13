// Gestion de l'affichage des formulaires
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    hideMessage();
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    hideMessage();
});

// Gestion de la connexion
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Connexion...';
    
    try {
        const response = await fetch(AppConfig.apiUrl('/api/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Connexion réussie ! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = AppConfig.pageUrl('index.html');
            }, 1000);
        } else {
            showMessage(data.error || 'Erreur de connexion', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion au serveur', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Se connecter';
    }
});

// Gestion de l'inscription
document.getElementById('formRegister').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('🔄 Tentative d\'inscription...');
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (!username || !password || !passwordConfirm) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Création du compte...';
    
    console.log('📤 Envoi de la requête d\'inscription pour:', username);
    
    try {
        const response = await fetch(AppConfig.apiUrl('/api/register'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('📥 Réponse reçue:', response.status);
        
        const data = await response.json();
        console.log('📦 Données:', data);
        
        if (response.ok) {
            showMessage('Compte créé avec succès ! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = AppConfig.pageUrl('index.html');
            }, 1000);
        } else {
            showMessage(data.error || 'Erreur lors de la création du compte', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Créer mon compte';
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion au serveur', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Créer mon compte';
    }
});

// Afficher un message
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove('hidden');
}

// Cacher le message
function hideMessage() {
    const messageEl = document.getElementById('message');
    messageEl.classList.add('hidden');
}

// Vérifier si déjà connecté
async function checkSession() {
    try {
        const response = await fetch(AppConfig.apiUrl('/api/session'));
        const data = await response.json();
        
        if (data.authenticated) {
            window.location.href = AppConfig.pageUrl('index.html');
        }
    } catch (error) {
        console.error('Erreur de vérification de session:', error);
    }
}

checkSession();
