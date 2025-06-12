import { createUser, getUserByUsername, initializeLocalStorage } from '../api/localStorageManager.js';

// Fonction utilitaire pour afficher un message d'erreur spécifique à un champ
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block'; // Affiche le message
        element.style.color = 'red';     // Style pour les erreurs
    }
}

// Fonction utilitaire pour masquer un message d'erreur spécifique à un champ
function hideError(element) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none'; // Masque le message
    }
}

// Attendre que le DOM soit complètement chargé avant de manipuler les éléments HTML
document.addEventListener('DOMContentLoaded', async () => {
    // Initialise le LocalStorage si ce n'est pas déjà fait.
    initializeLocalStorage(); 

    const signupForm = document.getElementById('signupForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const consentCheckbox = document.getElementById('consent'); // Référence à la checkbox
    const signupMessage = document.getElementById('signupMessage'); // Message général succès/échec

    // Références aux éléments de messages d'erreur spécifiques aux champs
    const passwordErrorP = document.getElementById('password-error');
    const confirmPasswordErrorP = document.getElementById('confirm-password-error');
    const consentTextP = document.getElementById('consent-text'); // Texte d'erreur pour le consentement

    // Référence aux boutons de bascule de visibilité des mots de passe
    const passwordToggleButtons = document.querySelectorAll('.password-toggle');

    // Vérifie que le formulaire a bien été trouvé dans le DOM
    if (!signupForm) {
        console.error("Erreur: Le formulaire avec l'ID 'signupForm' n'a pas été trouvé.");
        return; // Arrête l'exécution si le formulaire n'est pas là
    }

    // --- Logique de bascule de visibilité des mots de passe ---
    passwordToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // CORRECTION ICI : Cherche l'input à l'intérieur du même élément parent que le bouton
            const inputField = button.parentElement.querySelector('input[type="password"], input[type="text"]'); 
            
            if (inputField) { // S'assurer que l'input a été trouvé
                inputField.type = inputField.type === 'password' ? 'text' : 'password';
                button.textContent = inputField.type === 'password' ? '👁️' : '🔒'; // Change l'icône
                button.setAttribute('aria-label', inputField.type === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
            }
        });
    });

    // --- Écouteurs d'événements pour masquer les erreurs quand l'utilisateur corrige ---
    usernameInput.addEventListener('input', () => hideError(signupMessage)); // Masquer le message général
    passwordInput.addEventListener('input', () => {
        hideError(passwordErrorP);
        hideError(signupMessage);
        if (confirmPasswordInput.value) { // Si la confirmation a déjà du texte, vérifier de nouveau la correspondance
            if (passwordInput.value !== confirmPasswordInput.value) {
                showError(confirmPasswordErrorP, "Les mots de passe ne correspondent pas.");
            } else {
                hideError(confirmPasswordErrorP);
            }
        }
    });
    confirmPasswordInput.addEventListener('input', () => {
        hideError(confirmPasswordErrorP);
        hideError(signupMessage);
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordErrorP, "Les mots de passe ne correspondent pas.");
        }
    });
    consentCheckbox.addEventListener('change', () => hideError(consentTextP));


    // Ajoute un écouteur d'événement pour la soumission du formulaire
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le comportement par défaut du formulaire (rechargement de la page)

        // Masque tous les messages d'erreur précédents avant de re-valider
        hideError(signupMessage);
        hideError(passwordErrorP);
        hideError(confirmPasswordErrorP);
        hideError(consentTextP);

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const consentGiven = consentCheckbox.checked; // État de la checkbox

        // --- Validations côté client plus détaillées ---
        let hasError = false; // Flag pour suivre les erreurs

        // Validation du nom d'utilisateur
        if (username === '') {
            showError(signupMessage, "Le nom d'utilisateur ne peut pas être vide.");
            hasError = true;
        } else if (username.length < 3 || username.length > 50) {
            showError(signupMessage, "Le nom d'utilisateur doit contenir entre 3 et 50 caractères.");
            hasError = true;
        }

        // Validation du mot de passe
        if (password === '') {
            showError(passwordErrorP, "Le mot de passe ne peut pas être vide.");
            hasError = true;
        } else if (password.length < 8) {
            showError(passwordErrorP, "Le mot de passe doit contenir au moins 8 caractères.");
            hasError = true;
        }

        // Validation de la confirmation du mot de passe
        if (password !== confirmPassword) {
            showError(confirmPasswordErrorP, "Les mots de passe ne correspondent pas.");
            hasError = true;
        }

        // Validation du consentement
        if (!consentGiven) {
            showError(consentTextP, "Vous devez accepter les conditions pour continuer.");
            hasError = true;
        }

        // Arrête le processus si des erreurs sont trouvées
        if (hasError) {
            signupMessage.textContent = "Veuillez corriger les erreurs dans le formulaire.";
            signupMessage.style.color = 'red';
            return;
        }

        // Si toutes les validations passent, tente l'inscription
        signupMessage.textContent = "Inscription en cours...";
        signupMessage.style.color = 'blue';

        try {
            // Vérifie d'abord si l'utilisateur existe déjà via le manager
            const existingUser = getUserByUsername(username);
            if (existingUser) {
                signupMessage.textContent = "Ce nom d'utilisateur est déjà pris. Veuillez en choisir un autre.";
                signupMessage.style.color = 'red';
                return;
            }

            // Appelle la fonction `createUser` du localStorageManager
            const newUser = await createUser(username, password);

            if (newUser) {
                signupMessage.textContent = `Bienvenue, ${newUser.user} ! Inscription réussie. Redirection vers la page de connexion...`;
                signupMessage.style.color = 'green';
                signupForm.reset(); // Vide les champs du formulaire après succès

                setTimeout(() => {
                    window.location.href = './login.html'; // Remplacez par votre page de connexion. Chemin relatif pour rester dans le dossier 'html'
                }, 2000);
            } else {
                // createUser retourne null en cas d'échec (ex: nom d'utilisateur déjà pris, géré au-dessus)
                signupMessage.textContent = "Échec de l'inscription. Veuillez réessayer. (Vérifiez la console pour plus de détails)";
                signupMessage.style.color = 'red';
            }
        } catch (error) {
            console.error("Erreur inattendue lors de l'inscription :", error);
            signupMessage.textContent = "Une erreur est survenue lors de l'inscription.";
            signupMessage.style.color = 'red';
        }
    });
});
