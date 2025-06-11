// Importe la fonction `createUser` et `getUserByUsername` depuis votre gestionnaire de LocalStorage.
// Assurez-vous que le chemin est correct.
import { createUser, getUserByUsername, initializeLocalStorage } from '../api/localStorageManager.js';

// Attendre que le DOM soit complètement chargé avant de manipuler les éléments HTML
document.addEventListener('DOMContentLoaded', async () => {
    // Initialise le LocalStorage si ce n'est pas déjà fait.
    // C'est une bonne pratique de s'assurer que la structure de base est en place.
    initializeLocalStorage(); 

    const signupForm = document.getElementById('signupForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const signupMessage = document.getElementById('signupMessage');

    // Vérifie que le formulaire a bien été trouvé dans le DOM
    if (!signupForm) {
        console.error("Erreur: Le formulaire avec l'ID 'signupForm' n'a pas été trouvé.");
        return; // Arrête l'exécution si le formulaire n'est pas là
    }

    // Ajoute un écouteur d'événement pour la soumission du formulaire
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le comportement par défaut du formulaire (rechargement de la page)

        const username = usernameInput.value.trim(); // .trim() pour enlever les espaces inutiles
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // --- Validations côté client ---
        if (username === '') {
            signupMessage.textContent = "Le nom d'utilisateur ne peut pas être vide.";
            signupMessage.style.color = 'red';
            return;
        }

        if (password === '') {
            signupMessage.textContent = "Le mot de passe ne peut pas être vide.";
            signupMessage.style.color = 'red';
            return;
        }

        if (password.length < 6) {
            signupMessage.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
            signupMessage.style.color = 'red';
            return;
        }

        if (password !== confirmPassword) {
            signupMessage.textContent = "Les mots de passe ne correspondent pas.";
            signupMessage.style.color = 'red';
            return;
        }

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
            // Elle gère le hachage et la sauvegarde dans le LocalStorage
            const newUser = await createUser(username, password);

            if (newUser) {
                signupMessage.textContent = `Bienvenue, ${username} ! Inscription réussie.`;
                signupMessage.style.color = 'green';
                signupForm.reset(); // Vide les champs du formulaire après succès

                setTimeout(() => {
                    window.location.href = '../../html/login.html'; // Remplacez par votre page de connexion
                }, 2000);
            } else {
                // createUser retourne null en cas d'échec (par exemple, nom d'utilisateur déjà pris, géré au-dessus)
                // ou si le hachage a échoué (géré par le manager lui-même)
                signupMessage.textContent = "Échec de l'inscription. Veuillez réessayer.";
                signupMessage.style.color = 'red';
            }
        } catch (error) {
            // Capture toute erreur inattendue lors de l'exécution
            console.error("Erreur inattendue lors de l'inscription :", error);
            signupMessage.textContent = "Une erreur est survenue lors de l'inscription.";
            signupMessage.style.color = 'red';
        }
    });
});