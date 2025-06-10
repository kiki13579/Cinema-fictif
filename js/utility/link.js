import { registerUser } from '../html/signup.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const signupMessage = document.getElementById('signupMessage');

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // <-- C'est l'élément CRUCIAL ici !

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Ajoutons quelques console.log() pour le débogage
            console.log("Formulaire soumis !");
            console.log("Username:", username);
            console.log("Password:", password);

            if (password !== confirmPassword) {
                signupMessage.textContent = "Les mots de passe ne correspondent pas.";
                signupMessage.style.color = 'red';
                return; // Important: arrête l'exécution si les mots de passe ne matchent pas
            }

            if (password.length < 6) {
                signupMessage.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
                signupMessage.style.color = 'red';
                return; // Important: arrête l'exécution si le mot de passe est trop court
            }

            signupMessage.textContent = "Inscription en cours...";
            signupMessage.style.color = 'blue';

            try {
                const result = await registerUser(username, password); // Appel de la fonction asynchrone

                if (result.success) {
                    signupMessage.textContent = result.message;
                    signupMessage.style.color = 'green';
                    // Optionnel: Réinitialiser le formulaire ou rediriger
                    signupForm.reset();
                } else {
                    signupMessage.textContent = result.message;
                    signupMessage.style.color = 'red';
                }
            } catch (error) {
                console.error("Erreur inattendue lors de l'inscription:", error);
                signupMessage.textContent = "Une erreur inattendue est survenue.";
                signupMessage.style.color = 'red';
            }
        });
    } else {
        console.error("Erreur: Le formulaire avec l'ID 'signupForm' n'a pas été trouvé dans le DOM.");
    }
});