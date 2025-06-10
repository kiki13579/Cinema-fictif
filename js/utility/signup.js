document.getElementById('forms').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const consent = document.getElementById('consent').checked;

    // Vérification de base
    if (!consent) {
      alert("Vous devez accepter la collecte de données.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    let db = JSON.parse(localStorage.getItem("db")) || {
      Current_user: null,
      users: [],
      films: [],
      paniers: [],
      reservations: []
    };

    // Vérification de l'existence de l'utilisateur
    const userExists = db.users.some(u => u.user.toLowerCase() === username.toLowerCase());
    if (userExists) {
      alert("Ce nom d'utilisateur existe déjà.");
      return;
    }

    // Simuler un hash simple
    function fakeHash(pwd) {
      return btoa(pwd + "_salt");
    }

    // Création du nouvel utilisateur
    const newUser = {
      id: db.users.length.toString(),
      user: username,
      mot_de_passe: password,
      mot_de_passe_hash: fakeHash(password),
      est_membre: true,
      est_admin: false,
      date_creation: new Date().toISOString()
    };

    db.users.push(newUser);
    localStorage.setItem("db", JSON.stringify(db));
    alert("Inscription réussie !");
    document.getElementById('forms').reset();
});