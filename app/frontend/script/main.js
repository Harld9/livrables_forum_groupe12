const boutonconnexion = document.getElementById('boutonconnexion')
const pseudo = sessionStorage.getItem('pseudo')

if (boutonconnexion && pseudo) {
    boutonconnexion.remove()
}