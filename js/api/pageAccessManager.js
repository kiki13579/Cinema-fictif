// pageAccessManager.js - API de gestion d'accès aux pages par rôle

// Importe les fonctions nécessaires depuis votre gestionnaire de LocalStorage.
// Assurez-vous que le chemin est correct selon l'organisation de vos fichiers.
// (Ex: si pageAccessManager.js est dans 'js/utility/' et localStorageManager.js dans 'js/api/')
import { getCurrentUser, getUserByUsername } from './localStorageManager.js';

/**
 * Redirige l'utilisateur vers la page de connexion si aucun utilisateur n'est authentifié.
 * @returns {boolean} True si l'utilisateur est authentifié, False si une redirection a été effectuée.
 * @private
 */
function _redirectToLoginIfNotAuthenticated() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.warn("Accès refusé : Aucun utilisateur authentifié. Redirection vers la page de connexion.");
        window.location.href = '../../index.html'; 
        return false; 
    }
    return true; 
}

/**
 * Redirige l'utilisateur vers la page d'accès refusé.
 * @private
 */
function _redirectToAccessDenied() {
    console.warn("Accès refusé : L'utilisateur n'a pas les permissions requises. Redirection.");
    window.location.href = '../../html/access_deny.html'; // Assurez-vous que cette page existe
}

/**
 * Vérifie si l'utilisateur est connecté et possède le rôle d'administrateur.
 * Si l'utilisateur n'est pas connecté ou n'est pas administrateur, il est redirigé.
 * C'est l'équivalent de "est_admin: true" pour un accès.
 * @returns {boolean} True si l'utilisateur est administrateur, False si une redirection a été effectuée.
 */
export function requireAdmin() {
    console.log("DEBUG: requireAdmin() - Vérification des droits d'administrateur.");
    if (!_redirectToLoginIfNotAuthenticated()) {
        return false; // Redirection déjà effectuée
    }

    const currentUser = getCurrentUser();
    const user = getUserByUsername(currentUser);

    if (!user || !user.est_admin) {
        console.warn(`Accès refusé : L'utilisateur "${currentUser}" n'est pas administrateur.`);
        _redirectToAccessDenied();
        return false;
    }

    console.log(`DEBUG: requireAdmin() - Accès administrateur autorisé pour '${currentUser}'.`);
    return true;
}

/**
 * Vérifie si l'utilisateur est connecté et possède le rôle de membre OU le rôle d'administrateur.
 * Si l'utilisateur n'est pas connecté, n'est ni membre ni administrateur, il est redirigé.
 * C'est l'équivalent de "est_membre: true OU est_admin: true" pour un accès.
 * @returns {boolean} True si l'utilisateur est membre ou administrateur, False si une redirection a été effectuée.
 */
export function requireMemberOrAdmin() {
    console.log("DEBUG: requireMemberOrAdmin() - Vérification des droits de membre ou administrateur.");
    if (!_redirectToLoginIfNotAuthenticated()) {
        return false; // Redirection déjà effectuée
    }

    const currentUser = getCurrentUser();
    const user = getUserByUsername(currentUser);

    if (!user || (!user.est_membre && !user.est_admin)) {
        console.warn(`Accès refusé : L'utilisateur "${currentUser}" n'est ni membre ni administrateur.`);
        _redirectToAccessDenied();
        return false;
    }

    console.log(`DEBUG: requireMemberOrAdmin() - Accès membre/administrateur autorisé pour '${currentUser}'.`);
    return true;
}

/**
 * Fonction générique pour vérifier l'accès à une page basée sur les rôles requis.
 * @param {Array<string>} roles Un tableau de rôles requis (ex: ['admin'], ['membre'], ['admin', 'membre']).
 * Si le tableau est vide ou non fourni, seule l'authentification est requise.
 * @returns {boolean} True si l'accès est autorisé, False si une redirection a été effectuée.
 */
export function checkPageAccess(roles = []) {
    console.log(`DEBUG: checkPageAccess() - Vérification d'accès avec rôles : [${roles.join(', ')}]`);

    if (!_redirectToLoginIfNotAuthenticated()) {
        return false; // Déjà redirigé vers la page de connexion
    }

    const currentUser = getCurrentUser();
    const user = getUserByUsername(currentUser);

    if (!user) {
        console.error(`ERREUR: checkPageAccess() - Données utilisateur introuvables pour "${currentUser}". Redirection.`);
        _redirectToAccessDenied(); // Ou vers login.html si c'est une erreur de données
        return false;
    }

    if (roles.length === 0) {
        console.log(`DEBUG: checkPageAccess() - Seule l'authentification est requise. Accès autorisé pour '${currentUser}'.`);
        return true; // Si aucun rôle n'est spécifié, seule l'authentification est suffisante
    }

    let hasRequiredRole = false;
    for (const role of roles) {
        if (role === 'admin' && user.est_admin) {
            hasRequiredRole = true;
            break;
        }
        if (role === 'membre' && user.est_membre) {
            hasRequiredRole = true;
            break;
        }
        // Vous pouvez ajouter d'autres rôles ici si nécessaire
    }

    if (!hasRequiredRole) {
        console.warn(`Accès refusé : L'utilisateur "${currentUser}" ne possède aucun des rôles requis : [${roles.join(', ')}]`);
        _redirectToAccessDenied();
        return false;
    }

    console.log(`DEBUG: checkPageAccess() - Accès autorisé pour '${currentUser}' avec les rôles : [${roles.join(', ')}]`);
    return true;
}
