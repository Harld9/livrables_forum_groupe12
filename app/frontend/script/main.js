document.addEventListener('DOMContentLoaded', () => {
    const typeCompte = sessionStorage.getItem('typeCompte');
    const btnAdmin = document.getElementById('btn-nav-admin');

    if (btnAdmin && typeCompte === 'admin') {
        btnAdmin.style.display = 'inline-block';
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const boutonConnexion = document.getElementById('boutonconnexion');
    const token = sessionStorage.getItem('token');
    const pseudo = sessionStorage.getItem('pseudo');

    if (boutonConnexion) {
        if (token && pseudo) {

            boutonConnexion.innerHTML = `Bonjour, <strong>${pseudo}</strong> <span style="font-size: 0.85em; opacity: 0.8; margin-left: 8px;">[Déconnexion]</span>`;
            boutonConnexion.href = '#';
        } else {

            boutonConnexion.textContent = "Se connecter / S'inscrire";
            boutonConnexion.href = '/connexion';
        }
    }


    const cheminActuel = window.location.pathname;
    if (cheminActuel === '/create-topic' && !token) {
        alert("Vous devez être connecté pour pouvoir créer un topic.");
        window.location.href = '/connexion';
    }
});


document.addEventListener('click', (e) => {

    const bouton = e.target.closest('#boutonconnexion');


    if (bouton && sessionStorage.getItem('token')) {
        e.preventDefault();
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('pseudo');
        window.location.href = '/';
    }
});