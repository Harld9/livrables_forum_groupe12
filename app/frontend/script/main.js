const pseudo = sessionStorage.getItem('pseudo')

if (document.getElementById('boutonconnexion')) {
    const boutonconnexion = document.getElementById('boutonconnexion')
    if (boutonconnexion && pseudo) {
        boutonconnexion.remove()
    }
}

