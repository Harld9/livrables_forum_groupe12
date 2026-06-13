const pseudo = sessionStorage.getItem('pseudo')
const boutonconnexion = document.getElementById('boutonconnexion')

if (boutonconnexion && pseudo) {
    boutonconnexion.textContent = "Bonjour, " + pseudo

    boutonconnexion.classList.add('desactive');
    boutonconnexion.style.cursor = "default";
}