/**
 * Meridian Contact Controller
 * Handles form validation and activity logging.
 */

$(document).ready(function () {
    $("#contact-form").on("submit", function (e) {
        e.preventDefault();

        // 1. Capture Form Data
        const name = $("#contact-name").val();
        const subject = $("#contact-subject").val();

        // 2. Simulate sending (Show success message)
        $("#contact-form").fadeOut(400, function() {
            $("#contact-success").removeClass("d-none").hide().fadeIn(400);
        });

        // 3. Log this action to the Home Page Activity Feed
        logContactActivity("Message Sent", `${name} (${subject})`);

        // Optional: Reset form for next use if needed
        // this.reset();
    });
});

/**
 * Reuses the activity logging pattern from tasks.js 
 * to ensure the Home Page stays updated.
 */
function logContactActivity(action, taskName) {
    const logs = JSON.parse(localStorage.getItem("meridian_activity")) || [];
    logs.unshift({ 
        action: action, 
        taskName: taskName, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    });
    
    // Maintain only the most recent logs
    localStorage.setItem("meridian_activity", JSON.stringify(logs.slice(0, 6))); 
}