import { createBurgerMenu } from '../utility/burger.js';

createBurgerMenu({
    links: [
        { label: "Accueil", href: "../../index.html" },
        { label: "Connexion", href: "../../html/login.html" },
        { label: "Inscription", href: "../../html/signup.html" },
        { label: "Espace membre", href: "../../html/member_space.html" },
        { label: "Panneau administrateur", href: "../../html/admin_panel.html" },
        { label: "Deconnexion", href: "../../index.html" }
    ]
});