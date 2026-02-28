/**
 * Meridian Main UI Controller
 * Handles modular component loading and global theme states.
 */

$(document).ready(function () {
    // 1. Load Shared Components
    loadComponent("#header-placeholder", "components/header.html", initNavigation);
    loadComponent("#footer-placeholder", "components/footer.html");

    // 2. Initialize Theme
    applySavedTheme();
});

/**
 * Fetches and injects HTML fragments into placeholders
 */
function loadComponent(placeholder, file, callback) {
    $(placeholder).load(file, function (response, status, xhr) {
        if (status == "error") {
            console.error(`Error loading ${file}: ${xhr.status} ${xhr.statusText}`);
        } else if (callback) {
            callback();
        }
    });
}

/**
 * Logic to run after Header is injected
 */
function initNavigation() {
    // Highlight active page link
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    $(`.navbar-nav a[href="${currentPath}"]`).addClass("active");

    // Dark Mode Toggle Event
    $("#theme-toggle").on("click", function () {
        $("body").toggleClass("dark-mode");
        
        // Save preference to localStorage
        const isDark = $("body").hasClass("dark-mode");
        localStorage.setItem("meridian-theme", isDark ? "dark" : "light");
        
        // Update Icon
        updateThemeIcon(isDark);
    });

    // Check saved theme to set initial icon state
    const savedTheme = localStorage.getItem("meridian-theme");
    updateThemeIcon(savedTheme === "dark");
}

/**
 * Applies the user's saved theme on page load
 */
function applySavedTheme() {
    const savedTheme = localStorage.getItem("meridian-theme");
    if (savedTheme === "dark") {
        $("body").addClass("dark-mode");
    }
}

/**
 * Toggles the icon between Sun and Moon
 */
function updateThemeIcon(isDark) {
    const icon = $("#theme-toggle i");
    if (isDark) {
        icon.removeClass("bi-moon-stars").addClass("bi-sun-fill");
    } else {
        icon.removeClass("bi-sun-fill").addClass("bi-moon-stars");
    }
}