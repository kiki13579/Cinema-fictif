// localStorageManager.js

// Importe les fonctions de hachage depuis votre module hashing.js.
// Assurez-vous que le chemin est correct selon l'organisation de vos fichiers.
// (Ex: si localStorageManager.js est dans 'js/api/' et hashing.js dans 'js/utility/', le chemin est '../utility/hashing.js')
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
    console.log("DEBUG: _getLocalStorageData() - Tentative de récupération des données du LocalStorage.");
    try {
        const data = localStorage.getItem(MAIN_LS_KEY);
        console.log("DEBUG: _getLocalStorageData() - Données brutes du LS :", data);
        const parsedData = data ? JSON.parse(data) : {};
        console.log("DEBUG: _getLocalStorageData() - Données parsées (avant validation) :", parsedData);

        // S'assure que toutes les propriétés attendues sont présentes, en ajoutant de nouvelles si nécessaire
        // (utile pour les mises à jour de structure de données)
        const result = {
            Current_user: parsedData.Current_user || null, // Utilisateur actuellement connecté
            users: parsedData.users || [],         // Tableau des utilisateurs enregistrés
            films: parsedData.films || [],         // Tableau des films
            paniers: parsedData.paniers || [],       // Tableau des éléments du panier
            reservations: parsedData.reservations || [],  // Tableau des réservations effectuées
            activities: parsedData.activities || []     // Tableau des activités des utilisateurs (NOUVEAU)
        };
        console.log("DEBUG: _getLocalStorageData() - Données retournées (après validation de structure) :", result);
        return result;
    } catch (e) {
        // En cas d'erreur de parsing (par exemple, données corrompues), affiche une erreur
        // et retourne la structure par défaut pour éviter de bloquer l'application.
        console.error("ERREUR: _getLocalStorageData() - Erreur lors du parsing des données du LocalStorage :", e);
        return {
            Current_user: null,
            users: [],
            films: [],
            paniers: [],
            reservations: [],
            activities: []
        };
    }
}

/**
 * Sauvegarde l'intégralité de la structure de données dans le LocalStorage.
 * @param {Object} data L'objet de données à sauvegarder.
 * @private
 */
function _setLocalStorageData(data) {
    console.log("DEBUG: _setLocalStorageData() - Tentative de sauvegarde des données dans le LocalStorage.", data);
    try {
        localStorage.setItem(MAIN_LS_KEY, JSON.stringify(data));
        console.log("DEBUG: _setLocalStorageData() - Données sauvegardées avec succès.");
    } catch (e) {
        // Gère les erreurs lors de la sauvegarde (par exemple, quota LocalStorage dépassé).
        console.error("ERREUR: _setLocalStorageData() - Erreur lors de la sauvegarde des données dans le LocalStorage :", e);
    }
}

// --- Initialisation ---

/**
 * Initialise le LocalStorage avec une structure par défaut vide si elle n'existe pas déjà.
 * Cette fonction est utile à la première exécution de l'application pour s'assurer
 * que la structure de données est toujours présente.
 */
export function initializeLocalStorage() {
    console.log("DEBUG: initializeLocalStorage() - Début de l'initialisation.");
    const data = _getLocalStorageData();
    const currentLsData = localStorage.getItem(MAIN_LS_KEY);
    console.log("DEBUG: initializeLocalStorage() - currentLsData:", currentLsData);

    // Vérifie si la clé principale n'existe pas ou si la structure est incomplète (par exemple, 'activities' manquant).
    // Une approche plus robuste serait de migrer les données si la version change.
    if (!currentLsData || !_getLocalStorageData().activities) {
        _setLocalStorageData(data);
        console.log("DEBUG: initializeLocalStorage() - LocalStorage initialisé/mis à jour avec la structure par défaut.");
    } else {
        console.log("DEBUG: initializeLocalStorage() - LocalStorage déjà initialisé et structure complète.");
    }
}

// --- Gestion de l'utilisateur Actuel ---

/**
 * Récupère le nom d'utilisateur actuellement connecté.
 * @returns {string | null} Le nom d'utilisateur ou null si aucun utilisateur n'est courant.
 */
export function getCurrentUser() {
    console.log("DEBUG: getCurrentUser() - Récupération de l'utilisateur courant.");
    const currentUser = _getLocalStorageData().Current_user;
    console.log("DEBUG: getCurrentUser() - Utilisateur courant :", currentUser);
    return currentUser;
}

/**
 * Définit le nom d'utilisateur actuellement connecté.
 * Enregistre une activité de connexion/déconnexion.
 * @param {string | null} username Le nom d'utilisateur à définir comme courant, ou null pour se déconnecter.
 */
export function setCurrentUser(username) {
    console.log("DEBUG: setCurrentUser() - Tentative de définir l'utilisateur courant à :", username);
    const data = _getLocalStorageData();
    const previousUser = data.Current_user;
    console.log("DEBUG: setCurrentUser() - Utilisateur précédent :", previousUser);

    // Si un utilisateur se connecte
    if (username && username !== previousUser) {
        const user = getUserByUsername(username);
        if (user) {
            console.log(`DEBUG: setCurrentUser() - Enregistrement de l'activité de connexion pour "${username}".`);
            addActivity(user.id, 'Authentification', `Connexion de l'utilisateur "${username}"`);
        } else {
            console.error(`ERREUR: setCurrentUser() - Utilisateur "${username}" non trouvé pour enregistrer l'activité de connexion.`, { username });
        }
    } 
    // Si un utilisateur se déconnecte
    else if (!username && previousUser) {
        const user = getUserByUsername(previousUser);
        if (user) {
            console.log(`DEBUG: setCurrentUser() - Enregistrement de l'activité de déconnexion pour "${previousUser}".`);
            addActivity(user.id, 'Authentification', `Déconnexion de l'utilisateur "${previousUser}"`);
        } else {
            console.error(`ERREUR: setCurrentUser() - Utilisateur précédent "${previousUser}" non trouvé pour enregistrer l'activité de déconnexion.`, { previousUser });
        }
    } else {
        console.log("DEBUG: setCurrentUser() - Aucun changement d'utilisateur ou même utilisateur, pas d'activité spécifique enregistrée.");
    }

    data.Current_user = username;
    _setLocalStorageData(data);
    console.log("DEBUG: setCurrentUser() - Utilisateur courant mis à jour dans LS.");
}


// --- Gestion des Utilisateurs (CRUD - Créer, Lire, Mettre à jour, Supprimer) ---

/**
 * Récupère tous les utilisateurs enregistrés.
 * @returns {Array<Object>} Un tableau d'objets utilisateur.
 */
export function getUsers() {
    console.log("DEBUG: getUsers() - Récupération de tous les utilisateurs.");
    const users = _getLocalStorageData().users;
    console.log("DEBUG: getUsers() - Utilisateurs récupérés :", users);
    return users;
}

/**
 * Récupère un utilisateur par son ID.
 * @param {string} id L'ID de l'utilisateur.
 * @returns {Object | undefined} L'objet utilisateur ou undefined si non trouvé.
 */
export function getUserById(id) {
    console.log("DEBUG: getUserById() - Recherche utilisateur par ID :", id);
    const user = _getLocalStorageData().users.find(u => u.id === id);
    console.log("DEBUG: getUserById() - Utilisateur trouvé :", user);
    return user;
}

/**
 * Récupère un utilisateur par son nom d'utilisateur.
 * @param {string} username Le nom d'utilisateur.
 * @returns {Object | undefined} L'objet utilisateur ou undefined si non trouvé.
 */
export function getUserByUsername(username) {
    console.log("DEBUG: getUserByUsername() - Recherche utilisateur par nom d'utilisateur :", username);
    const user = _getLocalStorageData().users.find(u => u.user === username);
    console.log("DEBUG: getUserByUsername() - Utilisateur trouvé :", user);
    return user;
}

/**
 * Crée et ajoute un nouvel utilisateur au LocalStorage.
 * Enregistre une activité de création de compte.
 * Si le nom d'utilisateur commence et se termine par '&' (ex: &Admin&),
 * l'utilisateur sera créé comme administrateur et non-membre,
 * et les symboles '&' seront retirés du nom d'utilisateur stocké.
 * Gère la génération du sel et le double hachage du mot de passe.
 * @param {string} username Le nom d'utilisateur pour le nouvel utilisateur.
 * @param {string} password Le mot de passe en texte brut pour le nouvel utilisateur.
 * @returns {Object | null} Le nouvel objet utilisateur créé ou null si la création a échoué (ex: nom d'utilisateur déjà pris, échec du hachage).
 */
export async function createUser(username, password) {
    console.log("DEBUG: createUser() - Tentative de création d'utilisateur pour :", username);
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
        console.log(`DEBUG: createUser() - Détection d'un administrateur, nom final: ${finalUsername}`);
    }

    // Vérifie si un utilisateur avec ce nom (final ou original) existe déjà.
    if (users.some(u => u.user === finalUsername)) {
        console.warn(`DEBUG: createUser() - Un utilisateur avec le nom d'utilisateur '${finalUsername}' existe déjà.`);
        return null; // Nom d'utilisateur déjà pris.
    }

    // Génère un sel et hache le mot de passe en utilisant le module importé.
    console.log("DEBUG: createUser() - Génération du sel et hachage du mot de passe.");
    const salt = generateSalt();
    const hashedPassword = doubleHashPassword(password, salt);

    // Vérifie si le hachage a réussi.
    if (!hashedPassword) {
        console.error("ERREUR: createUser() - Échec du hachage du mot de passe. Utilisateur non créé.");
        return null;
    }

    // Génère un ID unique pour le nouvel utilisateur.
    // Utilisation de Date.now() pour un ID robuste et unique basé sur le temps.
    const newUserId = `user_${Date.now()}`;
    console.log("DEBUG: createUser() - Nouvel ID utilisateur généré :", newUserId);

    // Crée le nouvel objet utilisateur avec les propriétés définies.
    const newUser = {
        id: newUserId,
        user: finalUsername,
        mot_de_passe: password, // À SUPPRIMER EN PRODUCTION
        mot_de_passe_hash: hashedPassword,
        sel_hachage: salt,
        est_membre: estMembre,
        est_admin: estAdmin,
        date_creation: new Date().toISOString()
    };
    console.log("DEBUG: createUser() - Nouvel objet utilisateur créé :", newUser);

    // Ajoute le nouvel utilisateur au tableau des utilisateurs.
    data.users.push(newUser);
    // Sauvegarde les données mises à jour dans le LocalStorage.
    _setLocalStorageData(data); // _setLocalStorageData() gère déjà son propre console.error
    console.log(`DEBUG: createUser() - Utilisateur '${finalUsername}' ajouté et sauvegardé.`);

    // Enregistre une activité pour la création du compte
    addActivity(newUserId, 'Authentification', `Création du compte "${finalUsername}"`);
    console.log("DEBUG: createUser() - Activité de création de compte enregistrée.");

    return newUser;
}

/**
 * Met à jour les propriétés d'un utilisateur existant.
 * @param {string} userId L'ID de l'utilisateur à mettre à jour.
 * @param {Object} updates Un objet contenant les propriétés à mettre à jour (ex: { est_membre: false }).
 * @returns {boolean} True si la mise à jour a réussi, false sinon.
 */
export function updateUser(userId, updates) {
    console.log("DEBUG: updateUser() - Tentative de mise à jour de l'utilisateur ID :", userId, "avec updates :", updates);
    const data = _getLocalStorageData();
    // Trouve l'index de l'utilisateur dans le tableau.
    const userIndex = data.users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        const oldUsername = data.users[userIndex].user;
        const newUsername = updates.user || oldUsername;
        console.log(`DEBUG: updateUser() - Utilisateur trouvé à l'index ${userIndex}. Ancien nom: ${oldUsername}, Nouveau nom potentiel: ${newUsername}`);

        // Met à jour l'utilisateur en fusionnant les propriétés existantes avec les nouvelles.
        data.users[userIndex] = { ...data.users[userIndex], ...updates };
        _setLocalStorageData(data); // _setLocalStorageData() gère déjà son propre console.error
        console.log(`DEBUG: updateUser() - Utilisateur '${userId}' mis à jour et sauvegardé. Nouvelles données:`, data.users[userIndex]);

        // Enregistre une activité si le nom d'utilisateur a changé
        if (newUsername !== oldUsername) {
            addActivity(userId, 'Profil', `Nom d'utilisateur mis à jour de "${oldUsername}" à "${newUsername}"`);
            console.log(`DEBUG: updateUser() - Activité: Changement de nom d'utilisateur enregistrée.`);
        }
        // Enregistre une activité si le mot de passe a été mis à jour
        if (updates.mot_de_passe_hash) {
            addActivity(userId, 'Sécurité', `Mot de passe mis à jour pour "${newUsername}"`);
            console.log(`DEBUG: updateUser() - Activité: Mot de passe mis à jour enregistrée.`);
        }
        
        return true;
    }
    console.error(`ERREUR: updateUser() - Utilisateur avec l'ID '${userId}' non trouvé pour la mise à jour.`, { userId, updates });
    return false;
}

/**
 * Vérifie si le mot de passe fourni correspond à celui de l'utilisateur stocké.
 * @param {string} username Le nom d'utilisateur.
 * @param {string} password Le mot de passe en texte brut à vérifier.
 * @returns {Promise<boolean>} Une promesse qui résout à true si le mot de passe est valide, false sinon.
 */
export async function verifyUserPassword(username, password) {
    console.log("DEBUG: verifyUserPassword() - Tentative de vérification du mot de passe pour :", username);
    const user = getUserByUsername(username);
    if (!user) {
        console.warn(`DEBUG: verifyUserPassword() - Tentative de vérification pour un utilisateur non trouvé: ${username}`);
        return false;
    }
    if (!user.mot_de_passe_hash || !user.sel_hachage) {
        console.error(`ERREUR: verifyUserPassword() - Informations de hachage (hash ou sel) manquantes pour l'utilisateur: ${username}`);
        return false;
    }
    console.log("DEBUG: verifyUserPassword() - Utilisateur trouvé. Hachage et sel pour vérification :", user.mot_de_passe_hash, user.sel_hachage);
    // Utilisez la fonction de vérification du module de hachage
    const isValid = await verifyDoublePassword(password, user.mot_de_passe_hash, user.sel_hachage);
    console.log(`DEBUG: verifyUserPassword() - Résultat de la vérification pour ${username}: ${isValid}`);
    return isValid;
}

// --- Gestion des Activités ---

/**
 * Ajoute une nouvelle activité pour un utilisateur.
 * @param {string} userId L'ID de l'utilisateur concerné.
 * @param {string} category La catégorie de l'activité (ex: "Authentification", "Profil", "Réservation").
 * @param {string} description Une description détaillée de l'activité.
 */
export function addActivity(userId, category, description) {
    console.log(`DEBUG: addActivity() - Ajout d'une activité pour UserId: ${userId}, Catégorie: ${category}, Description: ${description}`);
    const data = _getLocalStorageData();
    const newActivity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ID unique
        userId: userId,
        category: category,
        description: description,
        timestamp: new Date().toISOString() // Horodatage ISO
    };
    data.activities.push(newActivity);
    _setLocalStorageData(data); // _setLocalStorageData() gère déjà son propre console.error
    console.log("DEBUG: addActivity() - Activité ajoutée et sauvegardée :", newActivity);
}

/**
 * Récupère toutes les activités pour un utilisateur donné.
 * @param {string} userId L'ID de l'utilisateur.
 * @returns {Array<Object>} Un tableau des activités de l'utilisateur, triées par date (les plus anciennes en premier).
 */
export function getActivitiesForUser(userId) {
    console.log("DEBUG: getActivitiesForUser() - Récupération des activités pour UserId :", userId);
    const data = _getLocalStorageData();
    const userActivities = data.activities
        .filter(activity => activity.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Changement ici pour trier du plus récent au plus ancien
    console.log(`DEBUG: getActivitiesForUser() - Activités trouvées pour ${userId} :`, userActivities);
    return userActivities;
}

// --- Gestion des Films (CRUD) ---

/**
 * Récupère tous les films.
 * @returns {Array<Object>} Un tableau d'objets film.
 */
export function getFilms() {
    console.log("DEBUG: getFilms() - Récupération de tous les films.");
    const films = _getLocalStorageData().films;
    console.log("DEBUG: getFilms() - Films récupérés :", films);
    return films;
}

/**
 * Récupère un film par son ID.
 * @param {string} id L'ID du film.
 * @returns {Object | undefined} L'objet film ou undefined si non trouvé.
 */
export function getFilmById(id) {
    console.log("DEBUG: getFilmById() - Recherche film par ID :", id);
    const film = _getLocalStorageData().films.find(f => f.id === id);
    console.log("DEBUG: getFilmById() - Film trouvé :", film);
    return film;
}

/**
 * Crée et ajoute un nouveau film au LocalStorage.
 * @param {string} title Le titre du film.
 * @param {number} stockPlaces Le nombre total de places disponibles pour ce film.
 * @param {number} prixPlace Le prix par place pour ce film.
 * @returns {Object} Le nouvel objet film créé.
 */
export function createFilm(title, stockPlaces, prixPlace) {
    console.log(`DEBUG: createFilm() - Création du film : ${title}`);
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
    _setLocalStorageData(data); // _setLocalStorageData() gère déjà son propre console.error
    console.log(`DEBUG: createFilm() - Film '${title}' créé et sauvegardé.`, newFilm);
    return newFilm;
}

/**
 * Met à jour les propriétés d'un film existant.
 * @param {string} filmId L'ID du film à mettre à jour.
 * @param {Object} updates Un objet contenant les propriétés à mettre à jour (ex: { stock_places: 45 }).
 * @returns {boolean} True si la mise à jour a réussi, false sinon.
 */
export function updateFilm(filmId, updates) {
    console.log(`DEBUG: updateFilm() - Mise à jour du film ID: ${filmId}, Updates:`, updates);
    const data = _getLocalStorageData();
    const filmIndex = data.films.findIndex(f => f.id === filmId);

    if (filmIndex !== -1) {
        // Met à jour le film en fusionnant les propriétés existantes avec les nouvelles.
        data.films[filmIndex] = { ...data.films[filmIndex], ...updates };
        _setLocalStorageData(data); // _setLocalStorageData() gère déjà son propre console.error
        console.log(`DEBUG: updateFilm() - Film '${filmId}' mis à jour et sauvegardé.`, data.films[filmIndex]);
        return true;
    }
    console.error(`ERREUR: updateFilm() - Film avec l'ID '${filmId}' non trouvé pour la mise à jour.`, { filmId, updates });
    return false;
}

// --- Gestion du Panier (CRUD) ---

/**
 * Récupère tous les éléments du panier.
 * @returns {Array<Object>} Un tableau d'objets représentant les éléments du panier.
 */
export function getPaniers() {
    console.log("DEBUG: getPaniers() - Récupération des paniers.");
    const paniers = _getLocalStorageData().paniers;
    console.log("DEBUG: getPaniers() - Paniers récupérés :", paniers);
    return paniers;
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
    console.log(`DEBUG: addPanierItem() - Ajout d'un élément au panier pour UserId: ${idUtilisateur}, FilmId: ${idFilm}, Places: ${nombrePlaces}`);
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
    _setLocalStorageData(data);       // _setLocalStorageData() gère déjà son propre console.error
    console.log(`DEBUG: addPanierItem() - Élément panier ajouté et sauvegardé.`, newPanierItem);
    return newPanierItem;
}

/**
 * Vide tous les éléments du tableau des paniers.
 */
export function clearPaniers() {
    console.log("DEBUG: clearPaniers() - Vidage de tous les paniers.");
    const data = _getLocalStorageData();
    data.paniers = [];      // Réinitialise le tableau des paniers.
    _setLocalStorageData(data); // _setLocalStorageData() gère déjà son propre console.error
    console.log('DEBUG: clearPaniers() - Tous les paniers ont été vidés et sauvegardés.');
}

// --- Gestion des Réservations (CRUD) ---

/**
 * Récupère toutes les réservations.
 * @returns {Array<Object>} Un tableau d'objets réservation.
 */
export function getReservations() {
    console.log("DEBUG: getReservations() - Récupération de toutes les réservations.");
    const reservations = _getLocalStorageData().reservations;
    console.log("DEBUG: getReservations() - Réservations récupérées :", reservations);
    return reservations;
}

/**
 * Ajoute une nouvelle réservation.
 * Enregistre une activité de réservation.
 * @param {string} idUtilisateur L'ID de l'utilisateur qui effectue la réservation.
 * @param {string} idFilm L'ID du film réservé.
 * @param {number} nombrePlaces Le nombre de places réservées.
 * @param {number} prixTotal Le prix total de la réservation.
 * @returns {Object} Le nouvel objet réservation créé.
 */
export function addReservation(idUtilisateur, idFilm, nombrePlaces, prixTotal) {
    console.log(`DEBUG: addReservation() - Ajout d'une réservation pour UserId: ${idUtilisateur}, FilmId: ${idFilm}, Places: ${nombrePlaces}`);
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
    _setLocalStorageData(data);             // _setLocalStorageData() gère déjà son propre console.error
    console.log(`DEBUG: addReservation() - Réservation créée et sauvegardée.`, newReservation);
    
    // Enregistre une activité pour la réservation
    const film = getFilmById(idFilm);
    const filmTitle = film ? `"${film.titre}"` : 'film inconnu';
    addActivity(idUtilisateur, 'Réservation', `Réservation de ${nombrePlaces} place(s) pour ${filmTitle}`);
    console.log("DEBUG: addReservation() - Activité de réservation enregistrée.");

    return newReservation;
}
