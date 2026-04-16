if (reponse.ok) {
    const boiteMessage = document.getElementById('boiteMessage');
    boiteMessage.textContent = "Inscription réussie ! Redirection en cours...";

    boiteMessage.style.display = "block";
    boiteMessage.style.backgroundColor = "#d4edda";
    boiteMessage.style.color = "#155724";

    setTimeout(() => {
        window.location.href = "/connexion";
    }, 2000);
}