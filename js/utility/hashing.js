// ATTENTION: Cette fonction est une version très basique et non cryptographique de SHA-256.
// NE L'UTILISEZ PAS POUR DES APPLICATIONS DE PRODUCTION AVEC DES DONNÉES SENSIBLES.
// Pour la production, utilisez une bibliothèque SHA-256 robuste ou l'API Web Cryptography.
function simpleSha256(str) {
    let hash = 0;
    if (str.length === 0) return '0';
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char; // Opération bitwise pour la performance
        hash |= 0; // Convertit en entier 32 bits
    }
    // Retourne le hash en hexadécimal et assure une longueur fixe en le paddant avec des zéros
    return (Math.abs(hash) + 0x100000000).toString(16).substring(1);
}
// --- Fin Implémentation Simplifiée de SHA-256 ---


/**
 * Génère une chaîne de caractères aléatoire (sel) pour le hachage.
 * @returns {string} Le sel généré.
 */
function generateSalt() {
    // Génère un sel simple en utilisant Math.random().
    // Pour une meilleure entropie dans un environnement non-API, vous pourriez concaténer plus d'appels.
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Hashe un mot de passe en double couche avec un sel donné en utilisant simpleSha256.
 * Hash1 = SHA256(password + salt)
 * Hash2 = SHA256(Hash1 + salt)
 * @param {string} password Le mot de passe à hacher.
 * @param {string} salt Le sel à utiliser pour le hachage.
 * @returns {string} Le mot de passe doublement haché.
 */
function doubleHashPassword(password, salt) {
    // Premier hachage
    const firstHash = simpleSha256(password + salt);
    // Deuxième hachage avec le résultat du premier hash et le même sel
    const finalHash = simpleSha256(firstHash + salt);
    return finalHash;
}

/**
 * Vérifie si un mot de passe donné correspond à un double hachage stocké, en utilisant le sel stocké.
 * @param {string} password Le mot de passe à vérifier.
 * @param {string} storedDoubleHash Le double hachage stocké à comparer.
 * @param {string} storedSalt Le sel stocké qui a été utilisé pour générer le hachage.
 * @returns {boolean} True si le mot de passe correspond, sinon False.
 */
function verifyDoublePassword(password, storedDoubleHash, storedSalt) {
    const newDoubleHash = doubleHashPassword(password, storedSalt);
    return newDoubleHash === storedDoubleHash;
}

// Exportez les fonctions pour qu'elles puissent être importées ailleurs
export {
    generateSalt,
    doubleHashPassword,
    verifyDoublePassword
};