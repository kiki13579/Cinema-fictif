// admin_dashboard.js
import { requireAdmin } from '../api/pageAccessManager.js';
// ... autres imports

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAdmin()) {
        return; // Redirection déjà effectuée par la fonction
    }
    // Le reste du code de votre tableau de bord administrateur
    console.log("Page d'administration chargée pour l'administrateur !");
});