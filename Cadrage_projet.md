# Mini-CGR - Étape 1 : Cadrage du Projet et Besoins Fonctionnels

---

## 1. Définition du besoin, objectifs et public cible :

* **Besoin Principal :** Le Mini-CGR a besoin d'une application web pour moderniser l'expérience de ses clients en leur permettant de consulter les films à l'affiche, d'acheter leurs places en ligne, et d'accéder à un historique de leurs achats. Le gérant aura également un espace pour administrer les prix et suivre les ventes.

* **Objectifs du Projet :**
    * **Améliorer l'accessibilité :** Permettre aux utilisateurs de voir les films et acheter des places à tout moment, depuis n'importe où.
    * **Optimiser la gestion :** Fournir au gérant des outils pour gérer facilement le prix des places et suivre le chiffre d'affaires.
    * **Augmenter les ventes :** Faciliter l'achat de places en ligne pour stimuler la fréquentation.
    * **Moderniser l'image :** Offrir une expérience numérique contemporaine aux clients du CGR.

* **Public Cible :**
    * **Utilisateurs/Clients :** Toute personne souhaitant voir des films au Mini-CGR, qu'elle soit habituée des cinémas ou non, et qui est à l'aise avec les outils numériques pour la réservation en ligne.
    * **Gérant du Mini-CGR :** La personne responsable de la gestion des opérations et des prix des places de cinéma.

---

## 2. Identification des Fonctionnalités Clés :

* **Pour tous les utilisateurs (visiteurs et membres) :**
    * Affichage de la page d'accueil (index.html) avec 6 à 10 affiches de films maximum.
    * Affichage du prix par défaut (12€) si non modifié par le gérant.

* **Pour les utilisateurs non connectés :**
    * Accès à la page d'inscription (inscription.html).
    * Accès à la page de connexion (connexion.html).

* **Pour les utilisateurs membres (connectés) :**
    * Accès à leur espace membre (espace-membre.html).
    * Achat de places de cinéma depuis la page d'accueil ou l'espace membre.
    * Fonctionnalité d'incrémentation/décrémentation du nombre de places lors de l'achat.
    * Affichage du stock de places disponibles pour chaque film (maximum 50 places par film, stock décrémenté après chaque réservation).
    * Visualisation de l'historique de leurs achats.
    * Possibilité de se déconnecter.
    * Possibilité de supprimer entièrement leur compte et leurs données.

* **Pour le gérant (administrateur) :**
    * Accès à la page de connexion administrateur (connexion.html).
    * Accès à son espace administrateur (administrateur.html).
    * Possibilité de définir le prix d'une place de cinéma.
    * Visualisation du chiffre d'affaires réalisé en fonction des places vendues.

---

## 3. User Stories :

* **Fonctionnalités "Must-Have" (MVP) :**
    * **En tant que visiteur**, je veux voir les films à l'affiche sur la page d'accueil pour savoir ce qui est proposé.
    * **En tant que visiteur**, je veux pouvoir m'inscrire pour créer un compte membre.
    * **En tant que visiteur**, je veux pouvoir me connecter à mon compte membre pour accéder à mes fonctionnalités.
    * **En tant que membre connecté**, je veux pouvoir acheter des places de cinéma pour un film choisi, avec la possibilité d'ajuster le nombre de places.
    * **En tant que membre connecté**, je veux que le stock de places disponibles diminue après mon achat pour refléter la réalité.
    * **En tant que membre connecté**, je veux pouvoir voir mon historique d'achats pour suivre mes réservations.
    * **En tant qu'administrateur**, je veux pouvoir me connecter à mon espace pour gérer le cinéma.
    * **En tant qu'administrateur**, je veux pouvoir définir le prix d'une place de cinéma pour ajuster mes tarifs.
    * **En tant qu'administrateur**, je veux pouvoir voir le chiffre d'affaires réalisé pour suivre mes revenus.
    * **En tant qu'administrateur et utilisateur**, je veux que le prix par défaut soit de 12€ si aucun prix n'est spécifié.

* **Fonctionnalités "Nice-to-Have" (à développer ultérieurement si le temps le permet ou dans une phase future) :**
    * **En tant que membre connecté**, je veux pouvoir supprimer mon compte et mes données pour gérer ma vie privée.
    * **En tant qu'utilisateur**, je veux que l'application soit responsive pour pouvoir l'utiliser sur n'importe quel appareil.
    * **En tant qu'utilisateur**, je veux que mes données soient sécurisées et que mon compte soit protégé.

---

## 4. Priorisation des Fonctionnalités :

* **Priorité Haute (MVP - à inclure dans les premiers sprints) :**
    * Affichage des films sur `index.html` (6-10 affiches, prix par défaut 12€).
    * Inscription utilisateur.
    * Connexion utilisateur et administrateur.
    * Achat de places par le membre connecté (incrémentation/décrémentation, décrémentation du stock).
    * Historique d'achats pour l'utilisateur.
    * Définition du prix des places par l'administrateur.
    * Visualisation du chiffre d'affaires par l'administrateur.
    * Gestion du stock de 50 places maximum par film.
    * **Sécurité des authentifications et des transactions.**
    * **Design responsive.**

* **Priorité Moyenne (à inclure si le temps le permet ou dans un sprint suivant) :**
    * Suppression du compte utilisateur.
    * Fonctionnalités de paiement plus avancées (autres que le simple décompte).

* **Priorité Basse (pour de futures évolutions) :**
    * Gestion des séances/horaires de films.
    * Système de notation/commentaires pour les films.
    * Recherche de films.