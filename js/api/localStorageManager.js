// localStorageManager.js

// Importe les fonctions de hachage depuis votre module doubleHashUtils.js.
// Assurez-vous que le chemin est correct selon l'organisation de vos fichiers.
import { generateSalt, doubleHashPassword, verifyDoublePassword } from '../utility/hashing.js';

// --- Configuration ---
// Clé principale utilisée pour stocker toutes les données de l'application dans le LocalStorage.
const MAIN_LS_KEY = 'mini-cinema-fictif';

// --- Opérations de base sur le LocalStorage (Usage Interne) ---

/**
 * Récupère l'intégralité de la structure de données depuis le LocalStorage.
 * Si aucune donnée n'existe pour la clé principale, retourne une structure par défaut vide.
 * @returns {Object} Les données parsées du LocalStorage.
 * @private
 */
function _getLocalStorageData() {
    try {
        const data = localStorage.getItem(MAIN_LS_KEY);
        // Initialise avec des tableaux vides par défaut si les données n'existent pas.
        // Cela garantit que toutes les propriétés attendues sont présentes.
        return data ? JSON.parse(data) : {
            Current_user: null, // Utilisateur actuellement connecté
            users: [],         // Tableau des utilisateurs enregistrés
            films: [],         // Tableau des films
            paniers: [],       // Tableau des éléments du panier (peut-être par utilisateur ou session)
            reservations: []   // Tableau des réservations effectuées
        };
    } catch (e) {
        // En cas d'erreur de parsing (par exemple, données corrompues), affiche une erreur
        // et retourne la structure par défaut pour éviter de bloquer l'application.
        console.error("Erreur lors du parsing des données du LocalStorage :", e);
        return {
            Current_user: null,
            users: [],
            films: [],
            paniers: [],
            reservations: []
        };
    }
}

/**
 * Sauvegarde l'intégralité de la structure de données dans le LocalStorage.
 * @param {Object} data L'objet de données à sauvegarder.
 * @private
 */
function _setLocalStorageData(data) {
    try {
        localStorage.setItem(MAIN_LS_KEY, JSON.stringify(data));
    } catch (e) {
        // Gère les erreurs lors de la sauvegarde (par exemple, quota LocalStorage dépassé).
        console.error("Erreur lors de la sauvegarde des données dans le LocalStorage :", e);
    }
}

// --- Initialisation ---

/**
 * Initialise le LocalStorage avec une structure par défaut vide si elle n'existe pas déjà.
 * Cette fonction est utile à la première exécution de l'application pour s'assurer
 * que la structure de données est toujours présente.
 */
export function initializeLocalStorage() {
    // Récupère les données ; si elles n'existent pas, _getLocalStorageData() retourne la structure par défaut.
    const data = _getLocalStorageData();
    // Ne définit la clé principale que si elle n'existe pas encore dans le LocalStorage.
    if (!localStorage.getItem(MAIN_LS_KEY)) {
        _setLocalStorageData(data);
        console.log("LocalStorage initialisé avec la structure par défaut.");
    }
}

// --- Gestion de l'utilisateur Actuel ---

/**
 * Récupère le nom d'utilisateur actuellement connecté.
 * @returns {string | null} Le nom d'utilisateur ou null si aucun utilisateur n'est connecté.
 */
export function getCurrentUser() {
    return _getLocalStorageData().Current_user;
}

/**
 * Définit le nom d'utilisateur actuellement connecté.
 * @param {string | null} username Le nom d'utilisateur à définir comme actuel, ou null pour se déconnecter.
 */
export function setCurrentUser(username) {
    const data = _getLocalStorageData();
    data.Current_user = username;
    _setLocalStorageData(data);
}

// --- Gestion des Utilisateurs (CRUD - Créer, Lire, Mettre à jour, Supprimer) ---

/**
 * Récupère tous les utilisateurs enregistrés.
 * @returns {Array<Object>} Un tableau d'objets utilisateur.
 */
export function getUsers() {
    return _getLocalStorageData().users;
}

/**
 * Récupère un utilisateur par son ID.
 * @param {string} id L'ID de l'utilisateur.
 * @returns {Object | undefined} L'objet utilisateur ou undefined si non trouvé.
 */
export function getUserById(id) {
    return _getLocalStorageData().users.find(u => u.id === id);
}

/**
 * Récupère un utilisateur par son nom d'utilisateur.
 * @param {string} username Le nom d'utilisateur.
 * @returns {Object | undefined} L'objet utilisateur ou undefined si non trouvé.
 */
export function getUserByUsername(username) {
    return _getLocalStorageData().users.find(u => u.user === username);
}

/**
 * Crée et ajoute un nouvel utilisateur au LocalStorage.
 * Gère la génération du sel et le double hachage du mot de passe.
 * @param {string} username Le nom d'utilisateur pour le nouvel utilisateur.
 * @param {string} password Le mot de passe en texte brut pour le nouvel utilisateur.
 * @param {boolean} [estMembre=true] Indique si l'utilisateur est membre par défaut.
 * @param {boolean} [estAdmin=false] Indique si l'utilisateur a des privilèges d'administrateur.
 * @returns {Object | null} Le nouvel objet utilisateur créé ou null si la création a échoué (ex: nom d'utilisateur déjà pris, échec du hachage).
 */
export async function createUser(username, password) {
    const data = _getLocalStorageData();
    const users = data.users;

    let finalUsername = username;
    let estMembre = true;
    let estAdmin = false;

    // Logique pour détecter l'administrateur par le symbole '&'
    if (username.startsWith('&') && username.endsWith('&') && username.length > 2) {
        finalUsername = username.slice(1, -1); // Retire le '&' du début et de la fin
        estMembre = false; // Les administrateurs ne sont pas considérés comme des "membres" réguliers
        estAdmin = true;   // Définit comme administrateur
        console.log(`Tentative de création d'un administrateur: ${finalUsername}`);
    }

    // Vérifie si un utilisateur avec ce nom (final ou original) existe déjà.
    if (users.some(u => u.user === finalUsername)) {
        console.warn(`Un utilisateur avec le nom d'utilisateur '${finalUsername}' existe déjà.`);
        return null; // Nom d'utilisateur déjà pris.
    }

    // Génère un sel et hache le mot de passe en utilisant le module importé.
    const salt = generateSalt();
    const hashedPassword = doubleHashPassword(password, salt);

    // Vérifie si le hachage a réussi.
    if (!hashedPassword) {
        console.error("Échec du hachage du mot de passe. Utilisateur non créé.");
        return null;
    }

    // Génère un ID unique pour le nouvel utilisateur.
    // Utilisation de Date.now() pour un ID robuste et unique basé sur le temps.
    const newUserId = `user_${Date.now()}`;

    // Crée le nouvel objet utilisateur avec les propriétés définies.
    const newUser = {
        id: newUserId,
        user: finalUsername, // Utilise le nom d'utilisateur potentiellement modifié
        // ATTENTION : Stocker le mot de passe en clair n'est PAS sécurisé.
        // Supprimez cette ligne en production si la sécurité est une préoccupation majeure.
        mot_de_passe: password, // Pour la démonstration, à supprimer en production !
        mot_de_passe_hash: hashedPassword, // Le mot de passe haché (sécurisé)
        sel_hachage: salt, // Le sel DOIT être stocké avec le hachage pour la vérification.
        est_membre: estMembre, // Défini par la logique ci-dessus
        est_admin: estAdmin,   // Défini par la logique ci-dessus
        date_creation: new Date().toISOString() // Date de création au format ISO 8601
    };

    // Ajoute le nouvel utilisateur au tableau des utilisateurs.
    data.users.push(newUser);
    // Sauvegarde les données mises à jour dans le LocalStorage.
    _setLocalStorageData(data);
    console.log(`Utilisateur '${finalUsername}' créé.`, newUser);
    return newUser;
}

/**
 * Met à jour les propriétés d'un utilisateur existant.
 * @param {string} userId L'ID de l'utilisateur à mettre à jour.
 * @param {Object} updates Un objet contenant les propriétés à mettre à jour (ex: { est_membre: false }).
 * @returns {boolean} True si la mise à jour a réussi, false sinon.
 */
export function updateUser(userId, updates) {
    const data = _getLocalStorageData();
    // Trouve l'index de l'utilisateur dans le tableau.
    const userIndex = data.users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        // Met à jour l'utilisateur en fusionnant les propriétés existantes avec les nouvelles.
        data.users[userIndex] = { ...data.users[userIndex], ...updates };
        _setLocalStorageData(data); // Sauvegarde les modifications.
        console.log(`Utilisateur '${userId}' mis à jour.`, data.users[userIndex]);
        return true;
    }
    console.warn(`Utilisateur avec l'ID '${userId}' non trouvé pour la mise à jour.`);
    return false;
}

/**
 * Vérifie le mot de passe d'un utilisateur.
 * Utilise la fonction de vérification du module de hachage.
 * @param {string} username Le nom d'utilisateur à vérifier.
 * @param {string} passwordAttempt Le mot de passe saisi par l'utilisateur.
 * @returns {Promise<boolean>} True si le mot de passe est valide, false sinon.
 */
export async function verifyUserPassword(username, passwordAttempt) {
    // Récupère l'utilisateur par son nom d'utilisateur.
    const user = getUserByUsername(username);
    // Vérifie si l'utilisateur existe et si les informations de hachage/sel sont présentes.
    if (!user || !user.mot_de_passe_hash || !user.sel_hachage) {
        return false; // Utilisateur non trouvé ou informations de hachage/sel manquantes.
    }
    // Utilise la fonction verifyDoublePassword du module de hachage.
    return verifyDoublePassword(passwordAttempt, user.mot_de_passe_hash, user.sel_hachage);
}

// --- Gestion des Films (CRUD) ---

/**
 * Récupère tous les films.
 * @returns {Array<Object>} Un tableau d'objets film.
 */
export function getFilms() {
    return _getLocalStorageData().films;
}

/**
 * Récupère un film par son ID.
 * @param {string} id L'ID du film.
 * @returns {Object | undefined} L'objet film ou undefined si non trouvé.
 */
export function getFilmById(id) {
    return _getLocalStorageData().films.find(f => f.id === id);
}

/**
 * Crée et ajoute un nouveau film au LocalStorage.
 * @param {string} title Le titre du film.
 * @param {number} stockPlaces Le nombre total de places disponibles pour ce film.
 * @param {number} prixPlace Le prix par place pour ce film.
 * @returns {Object} Le nouvel objet film créé.
 */
export function createFilm(title, stockPlaces, prixPlace) {
    const data = _getLocalStorageData();
    // Génère un ID unique pour le nouveau film.
    const newFilmId = `film_${Date.now()}`;

    const newFilm = {
        id: newFilmId,
        titre: title,
        stock_places: stockPlaces, // Stock initial de places
        prix_place: prixPlace      // Prix d'une place
    };

    data.films.push(newFilm); // Ajoute le film au tableau.
    _setLocalStorageData(data); // Sauvegarde les données.
    console.log(`Film '${title}' créé.`, newFilm);
    return newFilm;
}

/**
 * Met à jour les propriétés d'un film existant.
 * @param {string} filmId L'ID du film à mettre à jour.
 * @param {Object} updates Un objet contenant les propriétés à mettre à jour (ex: { stock_places: 45 }).
 * @returns {boolean} True si la mise à jour a réussi, false sinon.
 */
export function updateFilm(filmId, updates) {
    const data = _getLocalStorageData();
    const filmIndex = data.films.findIndex(f => f.id === filmId);

    if (filmIndex !== -1) {
        // Met à jour le film en fusionnant les propriétés existantes avec les nouvelles.
        data.films[filmIndex] = { ...data.films[filmIndex], ...updates };
        _setLocalStorageData(data); // Sauvegarde les modifications.
        console.log(`Film '${filmId}' mis à jour.`, data.films[filmIndex]);
        return true;
    }
    console.warn(`Film avec l'ID '${filmId}' non trouvé pour la mise à jour.`);
    return false;
}

// --- Gestion du Panier (CRUD) ---

/**
 * Récupère tous les éléments du panier.
 * @returns {Array<Object>} Un tableau d'objets représentant les éléments du panier.
 */
export function getPaniers() {
    return _getLocalStorageData().paniers;
}

/**
 * Ajoute un élément au tableau des paniers.
 * Note : Cette fonction ajoute un élément brut au panier. Une logique plus complexe
 * pour vérifier les stocks ou les utilisateurs pourrait être ajoutée en amont.
 * @param {string} idUtilisateur L'ID de l'utilisateur associé à l'élément du panier.
 * @param {string} idFilm L'ID du film ajouté.
 * @param {number} nombrePlaces Le nombre de places ajoutées.
 * @param {number} prixTotal Le prix total pour cet élément du panier.
 * @returns {Object} Le nouvel élément du panier créé.
 */
export function addPanierItem(idUtilisateur, idFilm, nombrePlaces, prixTotal) {
    const data = _getLocalStorageData();
    // Génère un ID unique pour l'élément du panier.
    const newPanierId = `panier_${Date.now()}`;

    const newPanierItem = {
        id: newPanierId,
        id_utilisateur: idUtilisateur,
        id_film: idFilm,
        nombre_places: nombrePlaces,
        prix_total: prixTotal
    };

    data.paniers.push(newPanierItem); // Ajoute l'élément au panier.
    _setLocalStorageData(data);       // Sauvegarde les données.
    console.log(`Élément panier ajouté pour l'utilisateur ${idUtilisateur} et le film ${idFilm}.`, newPanierItem);
    return newPanierItem;
}

/**
 * Vide tous les éléments du tableau des paniers.
 */
export function clearPaniers() {
    const data = _getLocalStorageData();
    data.paniers = [];      // Réinitialise le tableau des paniers.
    _setLocalStorageData(data); // Sauvegarde l'état vide.
    console.log('Tous les paniers ont été vidés.');
}

// --- Gestion des Réservations (CRUD) ---

/**
 * Récupère toutes les réservations.
 * @returns {Array<Object>} Un tableau d'objets réservation.
 */
export function getReservations() {
    return _getLocalStorageData().reservations;
}

/**
 * Ajoute une nouvelle réservation.
 * @param {string} idUtilisateur L'ID de l'utilisateur qui effectue la réservation.
 * @param {string} idFilm L'ID du film réservé.
 * @param {number} nombrePlaces Le nombre de places réservées.
 * @param {number} prixTotal Le prix total de la réservation.
 * @returns {Object} Le nouvel objet réservation créé.
 */
export function addReservation(idUtilisateur, idFilm, nombrePlaces, prixTotal) {
    const data = _getLocalStorageData();
    // Génère un ID unique pour la réservation.
    const newReservationId = `res_${Date.now()}`;

    const newReservation = {
        id: newReservationId,
        id_utilisateur: idUtilisateur,
        id_film: idFilm,
        nombre_places: nombrePlaces,
        prix_total: prixTotal,
        date_reservation: new Date().toISOString() // Horodatage de la réservation.
    };

    data.reservations.push(newReservation); // Ajoute la réservation.
    _setLocalStorageData(data);             // Sauvegarde les données.
    console.log(`Réservation créée pour l'utilisateur ${idUtilisateur} et le film ${idFilm}.`, newReservation);
    return newReservation;
}