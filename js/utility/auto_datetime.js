
/**
 * Met à jour dynamiquement l'année en cours dans le pied de page
 * et la date de dernière mise à jour sur les pages.
 */
function updateDates() {
    // Met à jour l'année en cours dans le pied de page
    const currentYearElement = document.getElementById('current-year-footer');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Met à jour la date de dernière mise à jour sur la page
    const lastUpdateDateElement = document.getElementById('last-update-date');
    if (lastUpdateDateElement) {
        // Ces options affichent l'année, le mois (en toutes lettres) et le jour.
        // Exemple de format : "12 juin 2025"
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        
        // Met la date actuelle formatée en français selon les options ci-dessus
        lastUpdateDateElement.textContent = new Date().toLocaleDateString('fr-FR', options);
    }
}

// Exécute la fonction une fois que le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', updateDates);

// Optionnel: Vous pouvez l'exporter si vous aviez besoin de l'appeler manuellement ailleurs,
// mais pour ce cas, l'écouteur DOMContentLoaded est suffisant.
// export { updateDates };