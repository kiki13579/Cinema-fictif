export function createBurgerMenu({
    links = [],
    container = document.body,
    logoText = "Cinéma Fictif",
    breakpoint = 1300
} = {}) {
    // Création des éléments
    const header = document.createElement("header");

    const logo = document.createElement("h1");
    logo.className = "logo";
    logo.textContent = logoText;

    const burger = document.createElement("div");
    burger.className = "burger-menu";
    burger.innerHTML = `<span></span><span></span><span></span>`;

    const mobileNav = document.createElement("div");
    mobileNav.className = "mobile-nav hidden";

    const desktopNav = document.createElement("nav");
    desktopNav.className = "desktop-menu";

    // Ajout des liens dans les deux menus
    links.forEach(link => {
        const mobileLink = document.createElement("a");
        const desktopLink = document.createElement("a");
        mobileLink.href = desktopLink.href = link.href;
        mobileLink.textContent = desktopLink.textContent = link.label;
        mobileNav.appendChild(mobileLink);
        desktopNav.appendChild(desktopLink);
    });

    // Ajout des composants au header
    header.appendChild(logo);
    header.appendChild(burger);
    header.appendChild(mobileNav);
    header.appendChild(desktopNav);

    container.prepend(header);

    // Interaction JS
    burger.addEventListener("click", () => {
        mobileNav.classList.toggle("active");
    });

    mobileNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mobileNav.classList.remove("active");
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > breakpoint) {
            mobileNav.classList.remove("active");
        }
    });
}