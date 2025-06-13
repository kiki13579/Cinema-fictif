// admin_dashboard.js

// Importe les fonctions nécessaires depuis vos gestionnaires de données et de sécurité.
import { 
    getCurrentUser, getUserByUsername, getUsers, updateUser, deleteUser,
    getFilms, createFilm, updateFilm, /* deleteFilm */ // Pas de suppression active de films pour le moment
    getReservations, getSiteModifications, addSiteModification, initializeLocalStorage
} from '../api/localStorageManager.js';
import { handleLogout } from '../utility/navigationManager.js';
import { checkPageAccess } from '../api/pageAccessManager.js'; // Pour la sécurité des pages (chemin corrigé)

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DEBUG: admin_panel.js - DOMContentLoaded - Début du script.");

    // --- Contrôle d'accès : Seuls les administrateurs peuvent accéder à cette page ---
    // Cette fonction redirigera si l'utilisateur n'est pas un administrateur.
    const hasAccess = checkPageAccess(['admin']); 
    if (!hasAccess) {
        console.warn("DEBUG: admin_panel.js - Accès non autorisé. Redirection effectuée par pageAccessManager.");
        return; // Arrête l'exécution du script si l'accès est refusé.
    }

    // Initialise le LocalStorage si ce n'est pas déjà fait (assure la structure des données)
    initializeLocalStorage();

    // --- Références aux éléments DOM ---
    const sidebarButtons = document.querySelectorAll('.admin-sidebar .btn-sidebar');
    const cardContainer = document.querySelector('.admin-content .card-container'); // Conteneur pour le contenu dynamique
    const dashboardTitle = document.querySelector('.admin-content .dashboard-title'); // Titre principal de la section active
    
    // Références aux boutons de déconnexion (si présents dans le header de la page admin)
    const logoutDesktopButton = document.getElementById('logoutDesktop'); 
    const logoutMobileButton = document.getElementById('logoutMobile'); 


    // --- Fonctions utilitaires pour les messages ---
    function displayMessage(element, message, type) {
        console.log(`DEBUG: displayMessage() - Affichage message: "${message}", type: "${type}"`);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            element.style.padding = '10px';
            element.style.borderRadius = '5px';
            element.style.marginBottom = '15px';
            element.style.textAlign = 'center';
            element.style.fontWeight = 'bold';

            if (type === 'success') {
                element.style.color = '#155724'; // Vert foncé
                element.style.backgroundColor = '#d4edda'; // Fond vert clair
                element.style.border = '1px solid #c3e6cb';
            } else if (type === 'error') {
                element.style.color = '#721c24'; // Rouge foncé
                element.style.backgroundColor = '#f8d7da'; // Fond rouge clair
                element.style.border = '1px solid #f5c6cb';
            } else if (type === 'info') {
                element.style.color = '#0c5460'; // Bleu foncé
                element.style.backgroundColor = '#d1ecf1'; // Fond bleu clair
                element.style.border = '1px solid #bee5eb';
            } else { // Styles par défaut si le type n'est pas reconnu
                element.style.color = 'var(--text-primary)';
                element.style.backgroundColor = 'var(--background-secondary)';
                element.style.border = '1px solid var(--border-color)';
            }
        } else {
            console.error("ERREUR: displayMessage() - Élément cible du message non trouvé.");
        }
    }

    function hideMessage(element) {
        console.log("DEBUG: hideMessage() - Masquage du message.");
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
            element.style.backgroundColor = 'transparent';
            element.style.border = 'none';
        } else {
            console.warn("DEBUG: hideMessage() - Élément à masquer non trouvé.");
        }
    }

    // --- Fonctions de rendu du contenu dynamique ---

    /**
     * Rend le contenu du tableau de bord pour l'administrateur.
     */
    function renderDashboardContent() {
        console.log("DEBUG: renderDashboardContent() - Rendu du Tableau de bord Admin.");
        dashboardTitle.textContent = "Tableau de bord Administrateur";

        const allUsers = getUsers();
        const allFilms = getFilms();
        const allReservations = getReservations();
        const siteModifications = getSiteModifications(); // Récupère les modifications du site

        const totalUsers = allUsers.length;
        const totalFilms = allFilms.length;
        const totalReservations = allReservations.length;

        // Calcul du chiffre d'affaires
        const totalRevenue = allReservations.reduce((sum, res) => sum + res.prix_total, 0);

        // HTML pour les 5 dernières modifications du site
        let modificationsHtml = '';
        if (siteModifications && siteModifications.length > 0) {
            const latestMods = siteModifications.slice(0, 5); // Affiche les 5 plus récentes (déjà triées)
            modificationsHtml = latestMods.map(mod => {
                const modDate = new Date(mod.timestamp);
                const dateDisplay = modDate.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                return `
                    <li><strong>${mod.category}</strong>: ${mod.description} (le ${dateDisplay})</li>
                `;
            }).join('');
        } else {
            modificationsHtml = `<li>Aucune modification récente enregistrée.</li>`;
        }

        cardContainer.innerHTML = `
            <section class="admin-info-cards-grid">
                <div class="info-card">
                    <h2 class="card-title">Utilisateurs Enregistrés</h2>
                    <p class="card-value">${totalUsers}</p>
                </div>
                <div class="info-card">
                    <h2 class="card-title">Films Proposés</h2>
                    <p class="card-value">${totalFilms}</p>
                </div>
                <div class="info-card">
                    <h2 class="card-title">Total Réservations</h2>
                    <p class="card-value">${totalReservations}</p>
                </div>
                <div class="info-card">
                    <h2 class="card-title">Chiffre d'Affaires (CA)</h2>
                    <p class="card-value">${totalRevenue.toFixed(2)} €</p>
                </div>
            </section>

            <section class="admin-recent-activity">
                <h2 class="section-heading">Activités Récentes du Site</h2>
                <ul class="activity-list">
                    ${modificationsHtml}
                </ul>
                <button type="button" class="btn-primary" id="addSiteModificationBtn">Ajouter une modification</button>
                <div id="addModificationFormContainer" style="display:none; margin-top: 20px;">
                    <form id="addModificationForm" class="form-style">
                        <div class="form-field">
                            <label for="modDescription">Description :</label>
                            <textarea id="modDescription" rows="3" required></textarea>
                        </div>
                        <div class="form-field">
                            <label for="modCategory">Catégorie :</label>
                            <input type="text" id="modCategory" value="Général" required>
                        </div>
                        <button type="submit" class="btn">Enregistrer</button>
                        <button type="button" class="btn-secondary" id="cancelAddModification">Annuler</button>
                        <p id="modificationMessage" class="message"></p>
                    </form>
                </div>
            </section>

            <section class="admin-overall-stats">
                <h2 class="section-heading">Statistiques Générales (Simulées)</h2>
                <p>Graphiques et analyses avancées viendront ici.</p>
            </section>
        `;

        // Logique pour ajouter une modification du site
        const addModBtn = cardContainer.querySelector('#addSiteModificationBtn');
        const addModFormContainer = cardContainer.querySelector('#addModificationFormContainer');
        const addModForm = cardContainer.querySelector('#addModificationForm');
        const modDescriptionInput = cardContainer.querySelector('#modDescription');
        const modCategoryInput = cardContainer.querySelector('#modCategory');
        const modificationMessage = cardContainer.querySelector('#modificationMessage');
        const cancelAddModBtn = cardContainer.querySelector('#cancelAddModification');

        if (addModBtn) {
            addModBtn.addEventListener('click', () => {
                addModFormContainer.style.display = 'block';
                addModBtn.style.display = 'none'; // Cache le bouton "Ajouter"
                console.log("DEBUG: addSiteModificationBtn cliqué, formulaire affiché.");
            });
        }
        if (cancelAddModBtn) {
            cancelAddModBtn.addEventListener('click', () => {
                addModFormContainer.style.display = 'none';
                addModBtn.style.display = 'block'; // Ré-affiche le bouton "Ajouter"
                hideMessage(modificationMessage);
                modDescriptionInput.value = ''; // Réinitialise les champs
                modCategoryInput.value = 'Général';
                console.log("DEBUG: Annulation d'ajout de modification.");
            });
        }
        if (addModForm) {
            addModForm.addEventListener('submit', (e) => {
                e.preventDefault();
                hideMessage(modificationMessage);
                const description = modDescriptionInput.value.trim();
                const category = modCategoryInput.value.trim();
                console.log(`DEBUG: Soumission formulaire modification. Description: "${description}", Catégorie: "${category}"`);

                if (description) {
                    addSiteModification(description, category);
                    displayMessage(modificationMessage, "Modification enregistrée avec succès !", 'success');
                    modDescriptionInput.value = '';
                    modCategoryInput.value = 'Général';
                    // Re-render le tableau de bord pour afficher la nouvelle modification
                    setTimeout(() => renderDashboardContent(), 1000); // Petit délai pour voir le message
                } else {
                    displayMessage(modificationMessage, "La description ne peut pas être vide.", 'error');
                    console.error("ERREUR: Description de modification vide.");
                }
            });
        }
    }

    /**
     * Rend la liste des films avec leurs prix.
     */
    function renderPriceListContent() {
        console.log("DEBUG: renderPriceListContent() - Rendu de la Liste des prix des films.");
        dashboardTitle.textContent = "Liste des Prix des Films";
        const films = getFilms();

        let filmsListHtml = '';
        if (films && films.length > 0) {
            filmsListHtml = films.map(film => `
                <tr data-film-id="${film.id}">
                    <td>${film.titre}</td>
                    <td><input type="number" step="0.01" value="${film.prix_place}" class="edit-prix" data-field="prix_place"> €</td>
                    <td><input type="number" value="${film.stock_places}" class="edit-stock" data-field="stock_places"></td>
                    <td>
                        <button class="btn-update-film btn-small">Mettre à jour</button>
                        <button class="btn-delete-film btn-small btn-danger">Supprimer</button>
                    </td>
                </tr>
            `).join('');
        } else {
            filmsListHtml = `<tr><td colspan="4" style="text-align: center;">Aucun film enregistré.</td></tr>`;
        }

        cardContainer.innerHTML = `
            <section class="admin-films-list-section">
                <h2 class="section-heading">Films et Tarifs</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Titre</th>
                            <th>Prix Place</th>
                            <th>Places en Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filmsListHtml}
                    </tbody>
                </table>
                <button type="button" class="btn-primary" id="addFilmBtn">Ajouter un nouveau film</button>
                <div id="addFilmFormContainer" style="display:none; margin-top: 20px;">
                    <form id="addFilmForm" class="form-style">
                        <div class="form-field">
                            <label for="newFilmTitle">Titre du film :</label>
                            <input type="text" id="newFilmTitle" required>
                        </div>
                        <div class="form-field">
                            <label for="newFilmStock">Stock de places :</label>
                            <input type="number" id="newFilmStock" min="0" value="0" required>
                        </div>
                        <div class="form-field">
                            <label for="newFilmPrice">Prix par place :</label>
                            <input type="number" step="0.01" id="newFilmPrice" min="0" value="0.00" required>
                        </div>
                        <button type="submit" class="btn">Ajouter Film</button>
                        <button type="button" class="btn-secondary" id="cancelAddFilm">Annuler</button>
                        <p id="filmMessage" class="message"></p>
                    </form>
                </div>
            </section>
        `;

        // Logique pour ajouter un film
        const addFilmBtn = cardContainer.querySelector('#addFilmBtn');
        const addFilmFormContainer = cardContainer.querySelector('#addFilmFormContainer');
        const addFilmForm = cardContainer.querySelector('#addFilmForm');
        const newFilmTitleInput = cardContainer.querySelector('#newFilmTitle');
        const newFilmStockInput = cardContainer.querySelector('#newFilmStock');
        const newFilmPriceInput = cardContainer.querySelector('#newFilmPrice');
        const filmMessage = cardContainer.querySelector('#filmMessage');
        const cancelAddFilmBtn = cardContainer.querySelector('#cancelAddFilm');

        if (addFilmBtn) {
            addFilmBtn.addEventListener('click', () => {
                addFilmFormContainer.style.display = 'block';
                addFilmBtn.style.display = 'none';
                console.log("DEBUG: addFilmBtn cliqué, formulaire affiché.");
            });
        }
        if (cancelAddFilmBtn) {
            cancelAddFilmBtn.addEventListener('click', () => {
                addFilmFormContainer.style.display = 'none';
                addFilmBtn.style.display = 'block';
                hideMessage(filmMessage);
                newFilmTitleInput.value = '';
                newFilmStockInput.value = '0';
                newFilmPriceInput.value = '0.00';
                console.log("DEBUG: Annulation d'ajout de film.");
            });
        }
        if (addFilmForm) {
            addFilmForm.addEventListener('submit', (e) => {
                e.preventDefault();
                hideMessage(filmMessage);
                const title = newFilmTitleInput.value.trim();
                const stock = parseInt(newFilmStockInput.value, 10);
                const price = parseFloat(newFilmPriceInput.value);
                console.log(`DEBUG: Soumission formulaire film. Titre: "${title}", Stock: ${stock}, Prix: ${price}`);

                if (title && !isNaN(stock) && !isNaN(price)) {
                    const newFilm = createFilm(title, stock, price);
                    if (newFilm) {
                        displayMessage(filmMessage, `Film "${title}" ajouté avec succès !`, 'success');
                        newFilmTitleInput.value = '';
                        newFilmStockInput.value = '0';
                        newFilmPriceInput.value = '0.00';
                        setTimeout(() => renderPriceListContent(), 1000); // Re-render la liste
                    } else {
                        displayMessage(filmMessage, "Erreur lors de l'ajout du film.", 'error');
                        console.error("ERREUR: Échec de la création du film via createFilm.");
                    }
                } else {
                    displayMessage(filmMessage, "Veuillez remplir tous les champs correctement.", 'error');
                    console.error("ERREUR: Champs de film incomplets ou invalides.");
                }
            });
        }


        // Logique pour la mise à jour des films
        cardContainer.querySelectorAll('.btn-update-film').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const filmId = row.dataset.filmId;
                const prixInput = row.querySelector('.edit-prix');
                const stockInput = row.querySelector('.edit-stock');

                const newPrix = parseFloat(prixInput.value);
                const newStock = parseInt(stockInput.value, 10);
                console.log(`DEBUG: Mise à jour film ID: ${filmId}, Nouveau prix: ${newPrix}, Nouveau stock: ${newStock}`);

                if (!isNaN(newPrix) && !isNaN(newStock) && newPrix >= 0 && newStock >= 0) {
                    const success = updateFilm(filmId, { prix_place: newPrix, stock_places: newStock });
                    if (success) {
                        displayMessage(filmMessage, "Film mis à jour avec succès !", 'success');
                        setTimeout(() => hideMessage(filmMessage), 2000);
                    } else {
                        displayMessage(filmMessage, "Échec de la mise à jour du film.", 'error');
                        console.error("ERREUR: Échec de la mise à jour du film via updateFilm.");
                    }
                } else {
                    displayMessage(filmMessage, "Veuillez entrer des valeurs valides pour le prix et le stock.", 'error');
                    console.error("ERREUR: Valeurs prix/stock invalides pour mise à jour film.");
                }
            });
        });

        // Logique pour la suppression des films (MODIFIÉE : Désactivée)
        cardContainer.querySelectorAll('.btn-delete-film').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const filmTitle = row.querySelector('td:first-child').textContent; // Récupère le titre du film
                console.log(`DEBUG: Tentative de suppression du film "${filmTitle}".`);

                // Affiche un message indiquant que la suppression n'est pas possible
                displayMessage(filmMessage, `Suppression impossible du film "${filmTitle}" : Cette fonctionnalité est désactivée dans la version actuelle.`, 'info');

                // Optionnel: Réinitialiser le bouton si nécessaire, bien que le message info soit déjà explicite
                setTimeout(() => hideMessage(filmMessage), 5000); // Cache le message après 5 secondes
            });
        });
    }

    /**
     * Rend la liste complète des films proposés.
     * (Peut être similaire à renderPriceListContent mais avec plus d'options/détails sur les films)
     */
    function renderFilmListContent() {
        console.log("DEBUG: renderFilmListContent() - Rendu de la Liste des films proposés.");
        dashboardTitle.textContent = "Liste des Films Proposés";
        const films = getFilms();

        let filmsListHtml = '';
        if (films && films.length > 0) {
            filmsListHtml = films.map(film => `
                <tr>
                    <td>${film.titre}</td>
                    <td>${film.stock_places}</td>
                    <td>${film.prix_place.toFixed(2)} €</td>
                    <td>${film.id}</td>
                </tr>
            `).join('');
        } else {
            filmsListHtml = `<tr><td colspan="4" style="text-align: center;">Aucun film enregistré.</td></tr>`;
        }

        cardContainer.innerHTML = `
            <section class="admin-full-films-list-section">
                <h2 class="section-heading">Tous les Films Enregistrés</h2>
                <p>Ceci affiche la liste complète de tous les films et leurs détails.</p>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Titre</th>
                            <th>Stock Places</th>
                            <th>Prix Place</th>
                            <th>ID Film</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filmsListHtml}
                    </tbody>
                </table>
                <p style="margin-top: 20px;">Pour modifier ou supprimer des films, utilisez la section "Liste des Prix".</p>
            </section>
        `;
    }


    /**
     * Rend la liste des utilisateurs enregistrés.
     */
    function renderUserListContent() {
        console.log("DEBUG: renderUserListContent() - Rendu de la Liste des utilisateurs.");
        dashboardTitle.textContent = "Liste des Utilisateurs Enregistrés";
        const users = getUsers();
        const currentAdminUser = getCurrentUser(); // L'administrateur actuellement connecté

        let usersListHtml = '';
        if (users && users.length > 0) {
            usersListHtml = users.map(user => `
                <tr data-user-id="${user.id}">
                    <td>${user.user}</td>
                    <td>
                        <input type="checkbox" class="edit-membre" data-field="est_membre" ${user.est_membre ? 'checked' : ''} ${user.user === currentAdminUser ? 'disabled' : ''}>
                        <span>Membre</span>
                    </td>
                    <td>
                        <input type="checkbox" class="edit-admin" data-field="est_admin" ${user.est_admin ? 'checked' : ''} ${user.user === currentAdminUser ? 'disabled' : ''}>
                        <span>Admin</span>
                    </td>
                    <td>${new Date(user.date_creation).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <button class="btn-update-user btn-small" ${user.user === currentAdminUser ? 'disabled' : ''}>Mettre à jour</button>
                        <button class="btn-delete-user btn-small btn-danger" ${user.user === currentAdminUser ? 'disabled' : ''}>Supprimer</button>
                    </td>
                </tr>
            `).join('');
        } else {
            usersListHtml = `<tr><td colspan="5" style="text-align: center;">Aucun utilisateur enregistré.</td></tr>`;
        }

        cardContainer.innerHTML = `
            <section class="admin-users-list-section">
                <h2 class="section-heading">Gestion des Utilisateurs</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nom d'utilisateur</th>
                            <th>Statut Membre</th>
                            <th>Statut Admin</th>
                            <th>Date Création</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${usersListHtml}
                    </tbody>
                </table>
                <p id="userMessage" class="message" style="margin-top: 20px;"></p>
            </section>
        `;

        const userMessageElement = cardContainer.querySelector('#userMessage');

        // Logique pour la mise à jour des utilisateurs
        cardContainer.querySelectorAll('.btn-update-user').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const userId = row.dataset.userId;
                const estMembreCheckbox = row.querySelector('.edit-membre');
                const estAdminCheckbox = row.querySelector('.edit-admin');
                const username = row.querySelector('td:first-child').textContent;
                console.log(`DEBUG: Mise à jour utilisateur ID: ${userId}, Membre: ${estMembreCheckbox.checked}, Admin: ${estAdminCheckbox.checked}`);

                const updates = {
                    est_membre: estMembreCheckbox.checked,
                    est_admin: estAdminCheckbox.checked
                };

                const success = updateUser(userId, updates);
                if (success) {
                    displayMessage(userMessageElement, `Utilisateur "${username}" mis à jour avec succès !`, 'success');
                    setTimeout(() => hideMessage(userMessageElement), 2000);
                } else {
                    displayMessage(userMessageElement, `Échec de la mise à jour de l'utilisateur "${username}".`, 'error');
                    console.error("ERREUR: Échec de la mise à jour utilisateur via updateUser.");
                }
            });
        });

        // Logique pour la suppression des utilisateurs
        cardContainer.querySelectorAll('.btn-delete-user').forEach(button => {
            button.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const userId = row.dataset.userId;
                const username = row.querySelector('td:first-child').textContent;
                console.log(`DEBUG: Tentative de suppression de l'utilisateur "${username}" ID: ${userId}.`);

                displayMessage(userMessageElement, `Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ? Cette action est irréversible. Cliquez à nouveau pour confirmer.`, 'error');

                e.target.removeEventListener('click', arguments.callee); // Supprime l'écouteur actuel
                e.target.textContent = "Confirmer";
                e.target.classList.add('btn-confirm-delete');

                const confirmDeleteHandler = () => {
                    const success = deleteUser(userId);
                    if (success) {
                        displayMessage(userMessageElement, `Utilisateur "${username}" supprimé avec succès !`, 'success');
                        setTimeout(() => renderUserListContent(), 1000); // Re-render la liste après suppression
                    } else {
                        displayMessage(userMessageElement, `Échec de la suppression de l'utilisateur "${username}".`, 'error');
                        console.error("ERREUR: Échec de la suppression utilisateur via deleteUser.");
                        // Réinitialise le bouton si la suppression échoue
                        e.target.textContent = "Supprimer";
                        e.target.classList.remove('btn-confirm-delete');
                        e.target.addEventListener('click', arguments.callee); // Ré-ajoute l'écouteur initial
                    }
                };
                e.target.addEventListener('click', confirmDeleteHandler, { once: true });

                setTimeout(() => {
                    if (e.target.classList.contains('btn-confirm-delete')) {
                        e.target.textContent = "Supprimer";
                        e.target.classList.remove('btn-confirm-delete');
                        e.target.removeEventListener('click', confirmDeleteHandler);
                        e.target.addEventListener('click', arguments.callee);
                        hideMessage(userMessageElement);
                        console.log("DEBUG: Confirmation de suppression utilisateur annulée par timeout.");
                    }
                }, 5000);
            });
        });
    }

    /**
     * Rend le contenu du chiffre d'affaires.
     */
    function renderRevenueContent() {
        console.log("DEBUG: renderRevenueContent() - Rendu du Chiffre d'affaires.");
        dashboardTitle.textContent = "Chiffre d'Affaires";
        const allReservations = getReservations();
        const totalRevenue = allReservations.reduce((sum, res) => sum + res.prix_total, 0);

        cardContainer.innerHTML = `
            <section class="admin-revenue-section">
                <h2 class="section-heading">Synthèse du Chiffre d'Affaires</h2>
                <p><strong>Total du Chiffre d'Affaires Généré :</strong> <span class="revenue-value">${totalRevenue.toFixed(2)} €</span></p>
                <div class="revenue-details">
                    <h3>Détails des Réservations :</h3>
                    ${allReservations.length > 0 ? `
                        <ul class="reservation-list">
                            ${allReservations.map(res => {
                                const film = getFilms().find(f => f.id === res.id_film);
                                const filmTitle = film ? film.titre : 'Film Inconnu';
                                const resDate = new Date(res.date_reservation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                return `<li>Réservation ID: ${res.id} - ${filmTitle} (${res.nombre_places} places) - Prix: ${res.prix_total.toFixed(2)} € - Date: ${resDate}</li>`;
                            }).join('')}
                        </ul>
                    ` : `<p>Aucune réservation enregistrée pour le moment.</p>`}
                </div>
            </section>
        `;
        console.log("DEBUG: renderRevenueContent() - Contenu Chiffre d'affaires généré.");
    }

    // --- Gestion de l'affichage du contenu par défaut et des clics sur la barre latérale ---
    
    // Fonction pour activer/désactiver le bouton de la sidebar
    function setActiveSidebarButton(clickedButton) {
        console.log("DEBUG: setActiveSidebarButton() - Activation du bouton de la sidebar :", clickedButton.textContent);
        sidebarButtons.forEach(button => {
            button.classList.remove('active');
        });
        clickedButton.classList.add('active');
    }

    // Initialise l'affichage du tableau de bord au chargement de la page
    renderDashboardContent();
    // Active le bouton "Tableau de bord" par défaut
    const defaultDashboardButton = Array.from(sidebarButtons).find(button => button.textContent.includes('Tableau de bord'));
    if (defaultDashboardButton) {
        setActiveSidebarButton(defaultDashboardButton);
        console.log("DEBUG: admin_panel.js - Bouton 'Tableau de bord' activé par défaut.");
    } else {
        console.warn("DEBUG: admin_panel.js - Bouton 'Tableau de bord' non trouvé pour activation par défaut.");
    }

    sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log("DEBUG: admin_panel.js - Clic sur le bouton sidebar :", button.textContent);
            setActiveSidebarButton(button); // Définit le bouton cliqué comme actif
            const buttonText = button.textContent.trim(); // Texte du bouton pour décider quel contenu afficher

            switch (buttonText) {
                case 'Tableau de bord':
                    renderDashboardContent();
                    break;
                case 'Liste des prix':
                    renderPriceListContent();
                    break;
                case 'Liste des film proposer':
                    renderFilmListContent();
                    break;
                case 'Liste des utilisateur enregistrer':
                    renderUserListContent();
                    break;
                case 'Chiffre d\'affaires':
                    renderRevenueContent();
                    break;
                default:
                    cardContainer.innerHTML = `<div class="info-card"><p>Contenu pour "${buttonText}" non implémenté.</p></div>`;
                    dashboardTitle.textContent = buttonText;
                    console.warn(`DEBUG: admin_panel.js - Contenu non implémenté pour "${buttonText}".`);
                    break;
            }
        });
    });
    console.log("DEBUG: admin_panel.js - Fin du script.");
});
