// login.js

// Importe les fonctions nécessaires depuis votre gestionnaire de LocalStorage.
import { initializeLocalStorage, verifyUserPassword, setCurrentUser } from '../api/localStorageManager.js';

// Attendre que le DOM soit complètement chargé avant de manipuler les éléments HTML
document.addEventListener('DOMContentLoaded', async () => {
    // Initialise le LocalStorage si ce n'est pas déjà fait.
    initializeLocalStorage();

    const loginForm = document.getElementById('forms'); // L'ID de votre formulaire est 'forms'
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage'); // L'élément pour afficher les messages

    // Vérifie que le formulaire a bien été trouvé dans le DOM
    if (!loginForm) {
        console.error("Erreur: Le formulaire de connexion avec l'ID 'forms' n'a pas été trouvé.");
        return; // Arrête l'exécution si le formulaire n'est pas là
    }

    // Ajoute un écouteur d'événement pour la soumission du formulaire
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le comportement par défaut (rechargement de la page)

        const username = usernameInput.value.trim(); // .trim() pour enlever les espaces inutiles
        const password = passwordInput.value;

        // --- Validations côté client (simples) ---
        if (username === '' || password === '') {
            loginMessage.textContent = "Veuillez entrer un nom d'utilisateur et un mot de passe.";
            loginMessage.style.color = 'red';
            return;
        }

        loginMessage.textContent = "Connexion en cours...";
        loginMessage.style.color = 'blue';

        try {
            // Appelle la fonction `verifyUserPassword` du localStorageManager.
            // Elle gère le hachage et la comparaison du mot de passe saisi.
            const isValid = await verifyUserPassword(username, password);

            if (isValid) {
                // Si les identifiants sont valides, définir l'utilisateur comme courant.
                setCurrentUser(username); 
                loginMessage.textContent = `Connexion réussie ! Bienvenue, ${username}.`;
                loginMessage.style.color = 'green';
                loginForm.reset(); // Vide les champs du formulaire après succès

                // Optionnel: Rediriger l'utilisateur vers une page d'accueil/tableau de bord
                setTimeout(() => {
                    window.location.href = '../../index.html'; // Remplacez par votre page d'accueil
                }, 1500); // Redirection après 1.5 secondes pour laisser le temps de lire le message

            } else {
                loginMessage.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
                loginMessage.style.color = 'red';
            }
        } catch (error) {
            // Capture toute erreur inattendue (ex: problème avec localStorage, ou fonction de hachage)
            console.error("Erreur inattendue lors de la connexion :", error);
            loginMessage.textContent = "Une erreur est survenue lors de la tentative de connexion.";
            loginMessage.style.color = 'red';
        }
    });
});