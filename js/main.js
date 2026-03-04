/**
 * Meridian Main UI Controller
 * Handles loading the shared header/footer, applying the saved theme and updating the Home page activity feed.
 */

$(document).ready(function () {
    // Load the shared header and footer HTML into their placeholders
    loadComponent("#header-placeholder", "header.html", initNavigation);
    loadComponent("#footer-placeholder", "footer.html");

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
    // When opened directly from the file system (file://), some browsers block AJAX.
    // In that case, fall back to injecting the shared markup directly so navigation still works.
    if (window.location.protocol === "file:") {
        let html = "";

        if (file === "header.html") {
            html = `
<!-- Shared header: navigation bar -->
<nav class="navbar navbar-expand-lg sticky-header navbar-light bg-light py-3" role="navigation" aria-label="Primary">
    <div class="container">
        <a class="navbar-brand" href="index.html">
            <span class="brand-accent">MERI</span>DIAN
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#meridianNav" aria-controls="meridianNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="meridianNav">
            <!-- Main navigation links for all the pages in the app -->
            <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
                <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="tasks.html">Tasks</a></li>
                <li class="nav-item"><a class="nav-link" href="analytics.html">Analytics</a></li>
                <li class="nav-item"><a class="nav-link" href="about-us.html">About Us</a></li>
                <li class="nav-item"><a class="nav-link" href="contact-us.html">Contact Us</a></li>
            </ul>

            <div class="d-flex align-items-center gap-3">
                <button id="theme-toggle" class="btn btn-outline-secondary btn-sm" type="button" title="Toggle Dark Mode" aria-label="Toggle dark mode" aria-pressed="false">
                    <i class="bi bi-moon-stars"></i>
                </button>
            </div>
        </div>
    </div>
</nav>`;
        } else if (file === "footer.html") {
            html = `
<!-- Shared footer -->
<footer class="py-5 mt-auto border-top bg-light">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-4 text-center text-md-start">
               <a class="navbar-brand" href="index.html">
                  <span class="brand-accent">MERI</span>DIAN
               </a>
                <p class="text-muted small">Elevating professional productivity through modern task management.</p>
            </div>
            
            <div class="col-md-4 text-center">
                <nav aria-label="Footer navigation" class="mb-3">
                    <ul class="nav justify-content-center gap-3">
                        <li class="nav-item"><a class="nav-link px-0 py-0 small link-secondary" href="index.html">Home</a></li>
                        <li class="nav-item"><a class="nav-link px-0 py-0 small link-secondary" href="tasks.html">Tasks</a></li>
                        <li class="nav-item"><a class="nav-link px-0 py-0 small link-secondary" href="analytics.html">Analytics</a></li>
                        <li class="nav-item"><a class="nav-link px-0 py-0 small link-secondary" href="about-us.html">About Us</a></li>
                        <li class="nav-item"><a class="nav-link px-0 py-0 small link-secondary" href="contact-us.html">Contact Us</a></li>
                    </ul>
                </nav>

                <span class="text-muted">All rights reserved &copy; 2026 Meridian Systems</span>
            </div>

            <div class="col-md-4 text-center text-md-end">
                <div class="d-flex justify-content-center justify-content-md-end gap-3 mb-2">
                    <a href="https://github.com/avamvakas02/Meridian" class="footer-social-link link-secondary" target="_blank" rel="noopener noreferrer" aria-label="Meridian GitHub repository"><i class="bi bi-github">GitHub</i></a>
                    <a href="https://www.linkedin.com" class="footer-social-link link-secondary" target="_blank" rel="noopener noreferrer" aria-label="Meridian LinkedIn profile"><i class="bi bi-linkedin">LinkedIn</i></a>   
                </div>
                <p class="mb-0 text-muted">Contact Us: support@meridiantasks.com</p>
            </div>
        </div>
    </div>
</footer>`;
        }

        if (html) {
            $(placeholder).html(html);
            if (callback) {
                callback();
            }
            return;
        }
    }

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