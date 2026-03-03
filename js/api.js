/**
 * Meridian API Controller
 * Fetches professional insights from the ZenQuotes API.
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
        // ZenQuotes blocks direct browser calls (CORS). 
        // We use AllOrigins as a reliable proxy to bypass this for our frontend app.
        const targetUrl = 'https://zenquotes.io/api/random';
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // The proxy wraps the response in a 'contents' string
        const proxyData = await response.json();
        
        // Parse the actual ZenQuotes JSON
        const quoteData = JSON.parse(proxyData.contents); 

        // ZenQuotes returns an array: [{ q: "quote text", a: "author name", h: "html format" }]
        if (quoteData && quoteData.length > 0) {
            const quote = quoteData[0].q;
            const author = quoteData[0].a;

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