// clickable-initiatives.js
// This script makes the entire initiative container clickable

document.addEventListener("DOMContentLoaded", function () {
     // Get all initiative containers
     const initiatives = document.querySelectorAll(".initiative");

     // For each initiative container
     initiatives.forEach((initiative) => {
          // Find the anchor tag within the initiative
          const link = initiative.querySelector("a");

          if (link) {
               // Get the URL from the anchor tag
               const url = link.getAttribute("href");
               const target = link.getAttribute("target") || "_self";

               // Make the entire initiative container behave like a link
               initiative.setAttribute("role", "link");
               initiative.setAttribute(
                    "aria-label",
                    link.textContent +
                         " - " +
                         (
                              initiative.querySelector("p")?.textContent || ""
                         ).trim()
               );

               // When hovering over the initiative, display the URL in the browser status bar
               initiative.addEventListener("mouseover", function () {
                    window.status = url;
               });

               initiative.addEventListener("mouseout", function () {
                    window.status = "";
               });

               // Make the entire initiative container clickable
               initiative.addEventListener("click", function (event) {
                    // Only trigger if the click wasn't on the anchor itself
                    // This prevents double-triggering
                    if (!event.target.closest("a")) {
                         if (target === "_blank") {
                              window.open(url, "_blank");
                         } else {
                              window.location.href = url;
                         }
                    }
               });

               // Enable keyboard accessibility
               initiative.setAttribute("tabindex", "0");
               initiative.addEventListener("keydown", function (event) {
                    // Trigger on Enter or Space key
                    if (event.key === "Enter" || event.key === " ") {
                         event.preventDefault();
                         if (target === "_blank") {
                              window.open(url, "_blank");
                         } else {
                              window.location.href = url;
                         }
                    }
               });
          }
     });
});
