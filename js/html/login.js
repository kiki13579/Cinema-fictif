// login.js

// Importe les fonctions nécessaires depuis votre gestionnaire de LocalStorage.
// Le chemin est ajusté pour tenir compte de l'emplacement de login.js (ex: js/html/)
// et de localStorageManager.js (ex: js/api/).
import { getUserByUsername, verifyUserPassword, setCurrentUser, initializeLocalStorage } from '../api/localStorageManager.js';

// Fonction utilitaire pour afficher un message général de succès/erreur
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

// Fonction utilitaire pour masquer un message
function hideMessage(element) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
        element.style.backgroundColor = 'transparent';
        element.style.border = 'none';
    }
}

// Attendre que le DOM soit complètement chargé avant de manipuler les éléments HTML
document.addEventListener('DOMContentLoaded', async () => {
    // Initialise le LocalStorage si ce n'est pas déjà fait.
    initializeLocalStorage(); 

    // Cible le formulaire par son ID correct (id="forms" dans votre HTML)
    const loginForm = document.getElementById('forms');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage'); // Pour les messages de statut

    // Référence aux boutons de bascule de visibilité des mots de passe
    const passwordToggleButtons = document.querySelectorAll('.password-toggle');

    // Référence au bouton "S'inscrire" dans la deuxième section-card
    // Assurez-vous que ce bouton a une classe ou un ID unique si vous en avez d'autres.
    // Si c'est le seul bouton sans ID dans cette section, on peut le cibler ainsi.
    const signupButton = document.querySelector('main.main-hero > section.section-card:nth-of-type(2) .btn');


    // Vérifie que le formulaire a bien été trouvé dans le DOM
    if (!loginForm) {
        console.error("Erreur: Le formulaire avec l'ID 'forms' n'a pas été trouvé.");
        return; // Arrête l'exécution si le formulaire n'est pas là
    }

    // --- Logique de bascule de visibilité des mots de passe ---
    if (passwordToggleButtons.length > 0) {
        passwordToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Cherche l'input à l'intérieur du même élément parent que le bouton
                const inputField = button.parentElement.querySelector('input[type="password"], input[type="text"]'); 
                
                if (inputField) {
                    inputField.type = inputField.type === 'password' ? 'text' : 'password';
                    button.textContent = inputField.type === 'password' ? '👁️' : '🔒'; // Change l'icône
                    button.setAttribute('aria-label', inputField.type === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
                }
            });
        });
    }

    // --- Écouteurs d'événements pour masquer les messages quand l'utilisateur tape ---
    usernameInput.addEventListener('input', () => hideMessage(loginMessage));
    passwordInput.addEventListener('input', () => hideMessage(loginMessage));

    // Ajoute un écouteur d'événement pour la soumission du formulaire
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le comportement par défaut du formulaire

        hideMessage(loginMessage); // Masque tout message précédent

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // --- Validations côté client de base ---
        if (username === '' || password === '') {
            displayMessage(loginMessage, "Veuillez entrer un nom d'utilisateur et un mot de passe.", 'error');
            return;
        }

        displayMessage(loginMessage, "Connexion en cours...", 'info');

        try {
            // Vérifie le mot de passe de l'utilisateur via le localStorageManager
            const isValidUser = await verifyUserPassword(username, password);

            if (isValidUser) {
                // Définit l'utilisateur comme connecté dans le LocalStorage
                setCurrentUser(username); 
                displayMessage(loginMessage, `Connexion réussie ! Bienvenue, ${username}. Redirection...`, 'success');
                loginForm.reset(); // Vide les champs du formulaire

                // Redirige après un court délai
                setTimeout(() => {
                    // Redirige vers la page d'accueil ou l'espace membre
                    // Assurez-vous que le chemin est correct pour votre structure de fichiers
                    window.location.href = '../index.html'; // Exemple: vers la page d'accueil (retour au dossier parent)
                    // Si vous voulez rediriger vers l'espace membre : window.location.href = './member_space.html'; 
                }, 1500); // 1.5 secondes
            } else {
                // Mot de passe incorrect ou utilisateur non trouvé
                displayMessage(loginMessage, "Nom d'utilisateur ou mot de passe incorrect.", 'error');
            }
        } catch (error) {
            console.error("Erreur inattendue lors de la connexion :", error);
            displayMessage(loginMessage, "Une erreur est survenue lors de la connexion.", 'error');
        }
    });

    // --- Logique du bouton "S'inscrire" de la deuxième section ---
    if (signupButton) {
        signupButton.addEventListener('click', () => {
            window.location.href = './signup.html'; // Redirige vers la page d'inscription
        });
    } else {
        console.warn("Bouton 'S'inscrire' de la deuxième section non trouvé.");
    }
});
