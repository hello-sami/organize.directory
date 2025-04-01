addEventListener("fetch", (event) => {
     event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
     // Clone the request to add custom headers
     const url = new URL(request.url);

     // Only apply to HTML pages
     if (
          url.pathname.endsWith(".html") ||
          url.pathname === "/" ||
          !url.pathname.includes(".")
     ) {
          // Clone the request with new headers to bypass cache
          const modifiedRequest = new Request(request, {
               headers: {
                    ...Object.fromEntries(request.headers),
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
               },
          });

          // Fetch with the modified request
          let response = await fetch(modifiedRequest);

          // Clone the response to add custom headers
          response = new Response(response.body, response);

          // Add cache-busting headers to the response
          response.headers.set(
               "Cache-Control",
               "no-cache, no-store, must-revalidate"
          );
          response.headers.set("Pragma", "no-cache");
          response.headers.set("Expires", "0");
          response.headers.set("cf-cache-status", "BYPASS");

          return response;
     }

     // Pass through all other requests
     return fetch(request);
}
