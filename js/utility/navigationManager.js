// navigationManager.js

// Importe les fonctions nécessaires depuis votre gestionnaire de LocalStorage.
import { initializeLocalStorage, getCurrentUser, getUserByUsername, setCurrentUser } from '../api/localStorageManager.js';

/**
 * Gère la déconnexion de l'utilisateur.
 * Efface l'utilisateur courant du LocalStorage et redirige vers la page d'accueil.
 */
export function handleLogout() {
    setCurrentUser(null); // Définir l'utilisateur courant à null (déconnexion)
    console.log("Utilisateur déconnecté.");
    // Redirige vers la page d'accueil (ajustez le chemin si nécessaire)
    window.location.href = 'https://mini-cinema-fictif.kamihate.fr/index.html'; // Remplacez par le chemin relatif correct de votre index.html
}

/**
 * Met à jour la visibilité des liens de navigation en fonction du statut de l'utilisateur.
 */
async function updateNavigationVisibility() {
    // S'assure que la structure de base du LocalStorage est en place.
    initializeLocalStorage();

    const currentUsername = getCurrentUser();
    let isConnected = false;
    let isMember = false;
    let isAdmin = false;

    // Détermine le statut de l'utilisateur (connecté, membre, admin)
    if (currentUsername) {
        isConnected = true;
        const user = getUserByUsername(currentUsername);
        if (user) {
            isMember = user.est_membre;
            isAdmin = user.est_admin;
        }
    }

    // Sélectionne tous les liens de navigation (desktop et mobile)
    const navLinks = document.querySelectorAll('.header-nav .list-link');

    navLinks.forEach(link => {
        // Par défaut, masquer tous les liens
        link.style.display = 'none';

        // --- Logique d'affichage basée sur les nouvelles classes et le statut de l'utilisateur ---

        // Liens avec la classe '-activeall' (ex: Accueil) : Toujours visibles
        if (link.classList.contains('-activeall')) {
            link.style.display = 'block'; // Ou 'inline-block' selon votre CSS et la structure du menu
        }
        
        // Liens avec la classe '-activenotmember' (ex: Inscription, Connexion) : Visibles si NON connecté
        if (link.classList.contains('-activenotmember') && !isConnected) {
            link.style.display = 'block';
        }

        // Liens avec la classe '-activemember' (ex: Espace membre) : Visibles si CONNECTÉ ET MEMBRE (et non admin)
        // Note : Si un admin est aussi considéré membre, il faudrait ajuster la condition (ex: isMember)
        if (link.classList.contains('-activemember') && isConnected && isMember && !isAdmin) {
            link.style.display = 'block';
        }

        // Liens avec la classe '-activeadmin' (ex: Panneau d'administration) : Visibles si CONNECTÉ ET ADMIN
        if (link.classList.contains('-activeadmin') && isConnected && isAdmin) {
            link.style.display = 'block';
        }
        
        // Liens avec la classe '-activeconnect' (ex: Déconnexion) : Visibles si CONNECTÉ
        if (link.classList.contains('-activeconnect') && isConnected) {
            link.style.display = 'block';
            // Attache l'événement de déconnexion au clic sur ces liens
            // Important : On s'assure que l'événement n'est pas attaché plusieurs fois
            link.onclick = handleLogout;
        }
    });
}

// --- Gestion du menu burger (mobile) ---
// Ce code bascule la visibilité du menu mobile et l'animation du burger.
document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.getElementById('burger-menu');
    const mobileNav = document.querySelector('.mobile-nav');

    if (burgerMenu && mobileNav) {
        burgerMenu.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden'); // Bascule la classe 'hidden' pour afficher/masquer
            burgerMenu.classList.toggle('open');  // Pour animer l'icône du burger (nécessite CSS)
        });
    } else {
        console.warn("Éléments du menu burger ou mobile introuvables. Vérifiez les ID et classes.");
    }
});

// Exécute la mise à jour de la navigation au chargement complet du DOM pour chaque page.
document.addEventListener('DOMContentLoaded', updateNavigationVisibility);

// Exportez la fonction principale si vous deviez l'appeler manuellement ailleurs (rarement nécessaire si elle s'exécute au DOMContentLoaded)
export { updateNavigationVisibility };