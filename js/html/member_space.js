// memberSpace.js

// Importe les fonctions nécessaires depuis votre gestionnaire de LocalStorage.
// Assurez-vous que le chemin est correct en fonction de l'organisation de vos dossiers.
// Si memberSpace.js est dans js/ et localStorageManager.js est dans js/api/
import { getCurrentUser, getActivitiesForUser, setCurrentUser, initializeLocalStorage, getUserByUsername, verifyUserPassword, updateUser } from '../api/localStorageManager.js';
import { requireMemberOrAdmin } from '../api/pageAccessManager.js';

// Importe la fonction de déconnexion depuis votre gestionnaire de navigation.
import { handleLogout } from '../utility/navigationManager.js'; // Assurez-vous que handleLogout est exporté

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireMemberOrAdmin()) {
        return; // Redirection déjà effectuée par la fonction
    }
    // Initialise le LocalStorage si ce n'est pas déjà fait.
    initializeLocalStorage();

    // --- Vérification de l'authentification et redirection ---
    const currentUser = getCurrentUser();
    // Si aucun utilisateur n'est connecté, redirige vers la page de connexion.
    if (!currentUser) {
        console.warn("Aucun utilisateur connecté. Redirection vers la page de connexion.");
        window.location.href = '../../index.html'; // Assurez-vous que le chemin est correct
        return; // Arrête l'exécution du script
    }

    // --- Références aux éléments DOM ---
    const sidebarButtons = document.querySelectorAll('.sidebar-menu .btn-sidebar');
    const cardContainer = document.querySelector('.card-container'); // Conteneur pour le contenu dynamique
    const dashboardTitle = document.querySelector('.dashboard-title'); // Titre principal de la section active
    
    // Références aux boutons de déconnexion (présents dans le header de toutes les pages)
    const logoutDesktopButton = document.getElementById('logoutDesktop');
    const logoutMobileButton = document.getElementById('logoutMobile');

    // --- Fonctions utilitaires pour les messages ---
    function displayMessage(element, message, type) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            // Utilise les couleurs prédéfinies par votre CSS pour les messages
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
            }
        }
    }

    function hideMessage(element) {
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
            element.style.backgroundColor = 'transparent';
            element.style.border = 'none';
        }
    }

    // --- Fonctions de rendu du contenu dynamique ---

    /**
     * Rend le contenu du tableau de bord.
     * @param {string} username Le nom d'utilisateur actuel.
     */
    function renderDashboardContent(username) {
    console.log("DEBUG: renderDashboardContent() - Rendu du Tableau de bord pour :", username);
    dashboardTitle.textContent = "Tableau de bord";
    const user = getUserByUsername(username); // Récupère les données complètes de l'utilisateur

    if (!user) {
        console.error("ERREUR: renderDashboardContent() - Données utilisateur non trouvées pour le tableau de bord.");
        cardContainer.innerHTML = `
            <section class="info-cards-grid">
                <div class="info-card" style="grid-column: 1 / -1; text-align: center;">
                    <h2 class="card-title" style="color: var(--color-error);">Erreur de chargement</h2>
                    <p>Impossible de charger le tableau de bord. Utilisateur introuvable.</p>
                </div>
            </section>
        `;
        return;
    }
    
    // NOUVEAU : Récupère les activités réelles de l'utilisateur
    const userActivities = getActivitiesForUser(user.id);
    let activitiesRowsHtml = '';
    if (userActivities && userActivities.length > 0) {
        // Limite aux 5 dernières activités pour éviter une table trop longue
        // La fonction getActivitiesForUser devrait déjà retourner les activités triées du plus récent au plus ancien.
        const latestActivities = userActivities.slice(0, 5); 
        activitiesRowsHtml = latestActivities.map(activity => {
            const activityDate = new Date(activity.timestamp);
            let dateDisplay;
            // Si l'activité a eu lieu aujourd'hui, affiche l'heure, sinon la date complète.
            if (activityDate.toDateString() === new Date().toDateString()) {
                dateDisplay = activityDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            } else {
                dateDisplay = activityDate.toLocaleDateString('fr-FR');
            }
            return `
                <tr>
                    <td>${activity.category}</td>
                    <td>${activity.description}</td>
                    <td>${dateDisplay}</td>
                </tr>
            `;
        }).join('');
        console.log("DEBUG: renderDashboardContent() - Activités récentes générées :", activitiesRowsHtml);
    } else {
        activitiesRowsHtml = `<tr><td colspan="3" style="text-align: center; color: var(--background-tertiary);">Aucune activité récente trouvée.</td></tr>`;
        console.log("DEBUG: renderDashboardContent() - Aucune activité récente à afficher.");
    }
    
    cardContainer.innerHTML = `
        <section class="info-cards-grid ss">
            <div class="info-card">
                <h2 class="card-title">Utilisateur actuel</h2>
                <p class="card-value">${username}</p>
            </div>
            <div class="info-card">
                <h2 class="card-title">Statut de membre</h2>
                <p class="card-value">${user?.est_membre ? 'Membre Actif' : 'Visiteur'}</p>
            </div>
            <div class="info-card server-info-card">
                <h2 class="card-title">Date d'inscription</h2>
                <p class="card-value">${user?.date_creation ? new Date(user.date_creation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                <p class="card-sub-value">ID: ${user?.id || 'N/A'}</p>
            </div>
        </section>

        <section class="performance-section ss">
            <h2 class="section-heading">Performances (Simulées)</h2>
            <a href="#" class="details-link">Plus de détails</a>
            <div class="performance-chart">
                <div class="chart-legend">
                    <span class="legend-item blue">Activité Fictive (Ko/s)</span>
                    <span class="legend-item green">Stabilité (Ko/s)</span>
                </div>
                <div class="chart-area">
                    <!-- Simulation de barres de graphique -->
                    <div class="chart-bar blue-bar" style="height: 60%; width: 2%;"></div>
                    <div class="chart-bar green-bar" style="height: 40%; width: 2%;"></div>
                    <div class="chart-bar blue-bar" style="height: 70%; width: 2%;"></div>
                    <div class="chart-bar green-bar" style="height: 50%; width: 2%;"></div>
                    <div class="chart-bar blue-bar" style="height: 55%; width: 2%;"></div>
                    <div class="chart-bar green-bar" style="height: 65%; width: 2%;"></div>
                    <div class="chart-line"></div> </div>
                <div class="chart-dates">
                    <span>Début</span>
                    <span>Fin</span>
                </div>
            </div>
        </section>

        <section class="most-visited-domains-section ss">
            <h2 class="section-heading">Activités récentes</h2>
            <table class="domains-table">
                <thead>
                    <tr>
                        <th>Catégorie</th>
                        <th>Description</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${activitiesRowsHtml}
                </tbody>
            </table>
        </section>

        <section class="change-log-section ss">
            <h2 class="section-heading">Journal des mises à jour du site</h2>
            <button type="button" class="expand-log-btn" aria-label="Dérouler le journal de changements">ℹ️</button>
            <div class="log-entries">
                <p class="log-date">12-06-2025</p>
                <ul class="log-list">
                    <li>Optimisation de la performance des modules JS.</li>
                    <li>Amélioration de l'expérience utilisateur mobile.</li>
                    <li>Mise à jour des règles de sécurité CSP.</li>
                    <li>Ajout de la page "Droits d'Auteur".</li>
                    <li>Correction de bugs mineurs sur les formulaires.</li>
                </ul>
            </div>
        </section>
    `;

    // Ré-attacher les écouteurs d'événements pour le contenu dynamique
    const expandLogButton = cardContainer.querySelector('.expand-log-btn');
    const logEntries = cardContainer.querySelector('.log-entries');

    if (expandLogButton && logEntries) {
        console.log("DEBUG: renderDashboardContent() - Ajout écouteur pour expandLogButton.");
        expandLogButton.addEventListener('click', () => {
            logEntries.classList.toggle('expanded');
            expandLogButton.setAttribute('aria-label', logEntries.classList.contains('expanded') ? 'Réduire le journal de changements' : 'Dérouler le journal de changements');
            console.log("DEBUG: renderDashboardContent() - Log-entries basculé en:", logEntries.classList.contains('expanded') ? 'expanded' : 'compact');
        });
    } else {
        console.warn("DEBUG: renderDashboardContent() - Bouton d'extension du log ou entrées de log non trouvés.");
    }
}

    /**
     * Rend le contenu pour la modification des informations utilisateur.
     */
    function renderProfileContent() {
        dashboardTitle.textContent = "Modifier vos informations";
        cardContainer.innerHTML = `
            <div class="profile-edit-form-container info-card">
                <h2 class="card-title">Mettre à jour votre profil</h2>
                <form id="profileEditForm" class="form-style">
                    <div class="form-field">
                        <label for="newUsername">Nouveau nom d'utilisateur :</label>
                        <input type="text" id="newUsername" name="newUsername" value="${currentUser}" placeholder="Votre nouveau nom d'utilisateur">
                    </div>
                    <div class="form-field password-field">
                        <label for="oldPassword">Ancien mot de passe :</label>
                        <input type="password" id="oldPassword" name="oldPassword" placeholder="Ancien mot de passe">
                        <button type="button" class="password-toggle" aria-label="Afficher le mot de passe">👁️</button>
                    </div>
                    <div class="form-field password-field">
                        <label for="newPassword">Nouveau mot de passe :</label>
                        <input type="password" id="newPassword" name="newPassword" placeholder="Nouveau mot de passe">
                        <button type="button" class="password-toggle" aria-label="Afficher le mot de passe">👁️</button>
                    </div>
                    <div class="form-field password-field">
                        <label for="confirmNewPassword">Confirmer nouveau mot de passe :</label>
                        <input type="password" id="confirmNewPassword" name="confirmNewPassword" placeholder="Confirmer nouveau mot de passe">
                        <button type="button" class="password-toggle" aria-label="Afficher le mot de passe">👁️</button>
                    </div>
                    <button type="submit" class="btn">Enregistrer les modifications</button>
                    <p id="profileMessage" class="message"></p>
                </form>
            </div>
        `;
        // Logique spécifique pour le formulaire de profil (à implémenter)
        const profileEditForm = cardContainer.querySelector('#profileEditForm');
        const profileMessage = cardContainer.querySelector('#profileMessage');
        const newUsernameInput = cardContainer.querySelector('#newUsername');
        const oldPasswordInput = cardContainer.querySelector('#oldPassword');
        const newPasswordInput = cardContainer.querySelector('#newPassword');
        const confirmNewPasswordInput = cardContainer.querySelector('#confirmNewPassword');
        const profilePasswordToggles = cardContainer.querySelectorAll('.password-toggle');

        // Ré-attacher la logique de bascule de visibilité des mots de passe pour le nouveau formulaire
        profilePasswordToggles.forEach(button => {
            button.addEventListener('click', () => {
                const inputField = button.parentElement.querySelector('input[type="password"], input[type="text"]');
                if (inputField) {
                    inputField.type = inputField.type === 'password' ? 'text' : 'password';
                    button.textContent = inputField.type === 'password' ? '👁️' : '🔒';
                    button.setAttribute('aria-label', inputField.type === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
                }
            });
        });

        // Gestion de la soumission du formulaire de profil
        if (profileEditForm) {
            profileEditForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                hideMessage(profileMessage);

                const currentLoggedInUser = getUserByUsername(currentUser);
                if (!currentLoggedInUser) {
                    displayMessage(profileMessage, "Erreur : Utilisateur non trouvé.", 'error');
                    return;
                }

                const newUsername = newUsernameInput.value.trim();
                const oldPassword = oldPasswordInput.value;
                const newPassword = newPasswordInput.value;
                const confirmNewPassword = confirmNewPasswordInput.value;
                
                let hasError = false;

                // Validation du nom d'utilisateur
                if (newUsername !== currentUser && getUserByUsername(newUsername)) {
                    displayMessage(profileMessage, "Ce nouveau nom d'utilisateur est déjà pris.", 'error');
                    hasError = true;
                }

                // Validation du mot de passe
                if (oldPassword && newPassword) { // Si l'utilisateur essaie de changer de mot de passe
                    const isOldPasswordCorrect = await verifyUserPassword(currentUser, oldPassword);
                    if (!isOldPasswordCorrect) {
                        displayMessage(profileMessage, "L'ancien mot de passe est incorrect.", 'error');
                        hasError = true;
                    } else if (newPassword.length < 8) {
                        displayMessage(profileMessage, "Le nouveau mot de passe doit contenir au moins 8 caractères.", 'error');
                        hasError = true;
                    } else if (newPassword !== confirmNewPassword) {
                        displayMessage(profileMessage, "Les nouveaux mots de passe ne correspondent pas.", 'error');
                        hasError = true;
                    }
                } else if ((oldPassword && !newPassword) || (!oldPassword && newPassword)) {
                    // Si l'un est rempli mais pas l'autre
                    displayMessage(profileMessage, "Veuillez remplir à la fois l'ancien et le nouveau mot de passe si vous souhaitez le modifier.", 'error');
                    hasError = true;
                }

                if (hasError) {
                    return;
                }

                displayMessage(profileMessage, "Mise à jour en cours...", 'info');
                
                let updates = {};
                let userUpdated = false;

                if (newUsername !== currentUser) {
                    updates.user = newUsername;
                    // Mettre à jour l'utilisateur courant si le nom change
                    setCurrentUser(newUsername); 
                    // Important: Si le nom d'utilisateur change, il faut aussi mettre à jour la référence currentUser
                    // pour les futures opérations après cette mise à jour.
                    // Pour simplifier, nous allons recharger la page ou redéfinir currentUser ici.
                    // Si vous ne voulez pas recharger, assurez-vous que toutes les fonctions suivantes utilisent getCurrentUser()
                    // pour obtenir le nom d'utilisateur le plus récent.
                    userUpdated = true;
                }

                if (newPassword && !hasError) { // S'il n'y a pas d'erreur sur le mot de passe
                    // Si le mot de passe est changé, il faut regénérer le hash et le sel
                    const { generateSalt, doubleHashPassword } = await import('./utility/hashing.js'); // Importe ici si besoin
                    const newSalt = generateSalt();
                    const newHashedPassword = doubleHashPassword(newPassword, newSalt);
                    updates.mot_de_passe_hash = newHashedPassword;
                    updates.sel_hachage = newSalt;
                    userUpdated = true;
                }

                if (userUpdated) {
                    // Appelle la fonction updateUser de localStorageManager
                    const success = await updateUser(currentLoggedInUser.id, updates);
                    if (success) {
                        displayMessage(profileMessage, "Profil mis à jour avec succès !", 'success');
                        // Re-render le tableau de bord pour refléter les changements
                        renderDashboardContent(getCurrentUser()); 
                        // Réinitialise les champs de mot de passe après succès
                        oldPasswordInput.value = '';
                        newPasswordInput.value = '';
                        confirmNewPasswordInput.value = '';
                    } else {
                        displayMessage(profileMessage, "Échec de la mise à jour du profil.", 'error');
                    }
                } else {
                    displayMessage(profileMessage, "Aucune modification à enregistrer.", 'info');
                }
            });
        }
    }

    /**
     * Rend le contenu de l'historique des activités.
     */
    function renderHistoryContent() {
        dashboardTitle.textContent = "Votre historique";
        cardContainer.innerHTML = `
            <div class="history-list-container info-card">
                <h2 class="card-title">Historique des réservations</h2>
                <p>Ceci est une section d'historique de vos réservations.</p>
                <ul class="history-list">
                    <li>Film : Le Grand Voyage, Places : 2, Date : 10/05/2025</li>
                    <li>Film : L'Ombre du Dragon, Places : 1, Date : 01/04/2025</li>
                    <li>Film : La Dernière Étoile, Places : 3, Date : 15/03/2025</li>
                </ul>
                <p class="no-history-message" style="display:none;">Aucune réservation trouvée pour le moment.</p>
            </div>
        `;
        // Vous pouvez remplir cette liste dynamiquement avec des données de localStorage.reservations
    }

    /**
     * Rend le contenu des informations du compte.
     */
    function renderAccountContent() {
        dashboardTitle.textContent = "Votre compte";
        const user = getUserByUsername(currentUser);
        cardContainer.innerHTML = `
            <div class="account-details-container info-card">
                <h2 class="card-title">Détails de votre compte</h2>
                <p><strong>Type de compte :</strong> ${user?.est_admin ? 'Administrateur' : (user?.est_membre ? 'Membre' : 'Visiteur')}</p>
                <p><strong>Identifiant Unique :</strong> ${user?.id || 'N/A'}</p>
                <p><strong>Date de création du compte :</strong> ${user?.date_creation ? new Date(user.date_creation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                <p>Gérez vos préférences de communication et vos paramètres de sécurité ici.</p>
            </div>
        `;
    }

    // --- Gestion de l'affichage du contenu par défaut et des clics sur la barre latérale ---
    
    // Fonction pour activer/désactiver le bouton de la sidebar
    function setActiveSidebarButton(clickedButton) {
        sidebarButtons.forEach(button => {
            button.classList.remove('active');
        });
        clickedButton.classList.add('active');
    }

    // Initialise l'affichage du tableau de bord au chargement de la page
    renderDashboardContent(currentUser);
    // Active le bouton "Tableau de bord" par défaut
    const defaultDashboardButton = Array.from(sidebarButtons).find(button => button.textContent.includes('Tableau de bord'));
    if (defaultDashboardButton) {
        setActiveSidebarButton(defaultDashboardButton);
    }

    sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveSidebarButton(button); // Définit le bouton cliqué comme actif
            const buttonText = button.textContent.trim(); // Texte du bouton pour décider quel contenu afficher

            switch (buttonText) {
                case 'Tableau de bord':
                    renderDashboardContent(currentUser);
                    break;
                case 'Modifier vos informations':
                    renderProfileContent();
                    break;
                case 'Votre historiques':
                    renderHistoryContent();
                    break;
                case 'Votre compte':
                    renderAccountContent();
                    break;
                default:
                    cardContainer.innerHTML = `<div class="info-card"><p>Contenu pour "${buttonText}" non implémenté.</p></div>`;
                    dashboardTitle.textContent = buttonText;
                    break;
            }
        });
    });

    // --- Logique du bouton de déconnexion (présent dans le header) ---
    if (logoutDesktopButton) {
        logoutDesktopButton.addEventListener('click', (event) => {
            event.preventDefault(); // Empêche la navigation par défaut du lien
            handleLogout(); // Appelle la fonction de déconnexion
        });
    }

    if (logoutMobileButton) {
        logoutMobileButton.addEventListener('click', (event) => {
            event.preventDefault(); // Empêche la navigation par défaut du lien
            handleLogout(); // Appelle la fonction de déconnexion
        });
    }
});
