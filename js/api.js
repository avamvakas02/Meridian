/**
 * Meridian API Controller
 * Fetches professional insights from a CORS-friendly quotes API.
 */

$(document).ready(function () {
    // Only fetch the quote if the container actually exists on the current page
    if ($("#api-quote-container").length > 0) {
        fetchZenQuote();
    }
});

async function fetchZenQuote() {
    const $quoteText = $("#quote-text");
    const $quoteAuthor = $("#quote-author");

    try {
        // Use a CORS-friendly API so this works without a backend/proxy.
        // Response shape: { id, quote, author }
        const targetUrl = "https://dummyjson.com/quotes/random";
        const response = await fetch(targetUrl, { cache: "no-store" });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const quoteData = await response.json();

        if (quoteData && typeof quoteData.quote === "string" && quoteData.quote.trim()) {
            const quote = quoteData.quote.trim();
            const author = (quoteData.author || "Unknown").toString().trim();

            // Apply a smooth fade-in effect for a premium UI feel
            $quoteText.hide().text(`"${quote}"`).fadeIn(800);
            $quoteAuthor.hide().text(author).fadeIn(800);
        } else {
            throw new Error("Invalid data structure received from API");
        }

    } catch (error) {
        console.error("Meridian API Error:", error);
        
        // Professional Fallback: If the user is offline or the API fails, show this instead of a broken UI
        $quoteText.text('"Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort."');
        $quoteAuthor.text("Paul J. Meyer");
    }
}