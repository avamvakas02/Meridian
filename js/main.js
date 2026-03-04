/**
 * Meridian Main UI Controller
 * Handles loading the shared header/footer, applying the saved theme and updating the Home page activity feed.
 */

$(document).ready(function () {
    // Load the shared header and footer HTML into their placeholders
    loadComponent("#header-placeholder", "components/header.html", initNavigation);
    loadComponent("#footer-placeholder", "components/footer.html");

    // Apply theme (light / dark) based on what is saved in localStorage
    applySavedTheme();

    // If we are on the Home page, render the activity feed and wire up the "Clear Log" button
    if ($("#activity-list").length > 0) {
        renderActivityFeed();
        
        // Handle "Clear Log" Button
        $("#clear-activity").on("click", function() {
            localStorage.removeItem("meridian_activity");
            renderActivityFeed();
        });
    }
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
        const isDark = $("body").hasClass("dark-mode");
        localStorage.setItem("meridian-theme", isDark ? "dark" : "light");
        updateThemeIcon(isDark);
    });

    // Set initial icon and accessibility state
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
 * Toggles the navigation icon between Sun and Moon
 */
function updateThemeIcon(isDark) {
    const $toggle = $("#theme-toggle");
    const icon = $toggle.find("i");
    if (isDark) {
        icon.removeClass("bi-moon-stars").addClass("bi-sun-fill");
        $toggle.attr("aria-pressed", "true");
    } else {
        icon.removeClass("bi-sun-fill").addClass("bi-moon-stars");
        $toggle.attr("aria-pressed", "false");
    }
}

/**
 * Reads activity from local storage and injects it into the Home timeline
 */
function renderActivityFeed() {
    const logs = JSON.parse(localStorage.getItem("meridian_activity")) || [];
    const $list = $("#activity-list");
    $list.empty();

    if (logs.length === 0) {
        $list.append(`
            <li class="text-muted py-2">
                <i class="bi bi-info-circle me-2 text-primary"></i> System log is empty.
            </li>
        `);
        return;
    }

    logs.forEach(log => {
        let icon = "bi-arrow-right-short";
        let color = "text-secondary";

        // Assign colors and icons based on the action
        if (log.action.includes("Added")) { icon = "bi-plus-lg"; color = "text-primary"; }
        else if (log.action.includes("Completed")) { icon = "bi-check2-all"; color = "text-success"; }
        else if (log.action.includes("Deleted")) { icon = "bi-trash"; color = "text-danger"; }

        const logItem = `
            <li class="activity-item d-flex align-items-start mb-3">
                <div class="me-3 mt-1 ${color}">
                    <i class="bi ${icon} fs-5"></i>
                </div>
                <div>
                    <div class="fw-bold">${log.action}</div>
                    <div class="small text-muted">"${log.taskName}" &bull; <span class="fst-italic">${log.time}</span></div>
                </div>
            </li>
        `;
        $list.append(logItem);
    });
}