// Importe les fonctions de hachage depuis votre module de hachage (doubleHashUtils.js)
import { generateSalt, doubleHashPassword } from '../utility/hashing.js';

/**
 * Gère le processus d'inscription d'un nouvel utilisateur.
 * @param {string} username Le nom d'utilisateur du nouvel utilisateur.
 * @param {string} password Le mot de passe du nouvel utilisateur.
 * @returns {Promise<Object>} Un objet indiquant le succès ou l'échec de l'inscription.
 */
async function registerUser(username, password) {
    let localStorageData = JSON.parse(localStorage.getItem('cinema-fictif')) || {};
    if (!localStorageData.users) {
        localStorageData.users = [];
    }

    // 1. Vérifier si l'utilisateur existe déjà
    const userExists = localStorageData.users.some(u => u.user === username);
    if (userExists) {
        return { success: false, message: "Ce nom d'utilisateur est déjà pris." };
    }

    // 2. Générer un sel et hacher le mot de passe
    const salt = generateSalt();
    const hashedPassword = doubleHashPassword(password, salt);

    // 3. Créer le nouvel objet utilisateur
    const newUser = {
        id: (localStorageData.users.length).toString(), // Assigner un nouvel ID basé sur la longueur du tableau
        user: username,
        // ATTENTION : Pour la sécurité, le champ 'mot_de_passe' en clair doit être supprimé ou vidé
        // avant de stocker dans le localStorage en production.
        // Je le laisse ici pour correspondre à votre structure donnée, mais soyez vigilant.
        mot_de_passe: password, // <= À SUPPRIMER OU VIDER EN PRODUCTION
        mot_de_passe_hash: hashedPassword,
        sel_hachage: salt, // Le sel est essentiel et doit être stocké avec le hachage
        est_membre: true, // Par défaut, un nouvel inscrit est membre. Adaptez si nécessaire.
        est_admin: false, // Par défaut, non admin.
        date_creation: new Date().toISOString() // Date de création au format ISO
    };

    // 4. Ajouter le nouvel utilisateur aux données du localStorage
    localStorageData.users.push(newUser);

    // 5. Mettre à jour le localStorage
    try {
        localStorage.setItem('mini-cinema-fictif', JSON.stringify(localStorageData));
        console.log(`Nouvel utilisateur '${username}' enregistré avec succès.`);
        return { success: true, message: "Inscription réussie !" };
    } catch (e) {
        console.error("Erreur lors de l'enregistrement dans localStorage:", e);
        return { success: false, message: "Erreur lors de l'enregistrement de l'utilisateur." };
    }
}

// Exportez la fonction pour qu'elle puisse être importée ailleurs
export {
    registerUser
};