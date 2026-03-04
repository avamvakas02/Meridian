/**
 * Meridian Contact Controller
 * Handles robust form validation, feedback, and activity logging.
 */

$(document).ready(function () {
    const $form = $("#contact-form");
    const $nameInput = $("#contact-name");

    // Ensure form is fully cleared on every page load/refresh
    if ($form.length && $form[0].reset) {
        $form[0].reset();
        $form.removeClass("was-validated");
    }

    function validateFullName() {
        const inputEl = $nameInput[0];
        const value = inputEl.value.trim();

        // Require at least 3 characters and at least two "words" (first + last name)
        const hasMinLength = value.length >= 3;
        const parts = value.split(/\s+/).filter(Boolean);
        const hasFirstAndLastName = parts.length >= 2;

        if (!hasMinLength) {
            inputEl.setCustomValidity("Full Name must be at least 3 characters.");
        } else if (!hasFirstAndLastName) {
            inputEl.setCustomValidity("Please enter your first and last name.");
        } else {
            inputEl.setCustomValidity("");
        }

        return inputEl.checkValidity();
    }

    $form.on("submit", function (event) {
        // 1. Access the underlying DOM element to use the checkValidity API
        const formElement = $form[0];

        // Custom validation for Full Name field
        validateFullName();

        // 2. Check if the form satisfies all HTML5 constraints
        if (!formElement.checkValidity()) {
            // If invalid, stop the form from "submitting"
            event.preventDefault();
            event.stopPropagation();
            console.log("Validation failed: Nonsense or empty fields detected.");
        } else {
            // --- VALIDATION SUCCESSFUL ---
            event.preventDefault(); // Prevent actual page reload

            const name = $("#contact-name").val();
            const subject = $("#contact-subject").val();

            // Visual Feedback: Hide form and show the success alert
            $form.fadeOut(400, function() {
                $("#contact-success").removeClass("d-none").hide().fadeIn(400);
            });

            // Synchronize with Home Page Activity Feed
            logContactActivity("Inquiry Sent", `${name} (${subject})`);
        }

        // 3. Always add this class to trigger Bootstrap's red/green CSS styles
        $form.addClass("was-validated");
    });

    // Real-time validation: updates errors as the user fixes them
    $form.find("input, textarea, select").on("input change", function() {
        if ($form.hasClass("was-validated")) {
            if (this === $nameInput[0]) {
                validateFullName();
            } else {
                this.checkValidity();
            }
        }
    });
});

/**
 * Standard Meridian Activity Logger
 * Finalized to save data back to localStorage.
 */
function logContactActivity(action, detail) {
    const logs = JSON.parse(localStorage.getItem("meridian_activity")) || [];
    
    // Add new log to the beginning of the array
    logs.unshift({ 
        action: action, 
        taskName: detail, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    });
    
    // Save updated array (max 6 items) back to storage
    localStorage.setItem("meridian_activity", JSON.stringify(logs.slice(0, 6))); 
}