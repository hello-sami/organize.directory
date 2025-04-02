/**
 * Contact form handling
 * Sets up contact form functionality including anonymous submission
 */
export function initializeContactForm() {
     document.addEventListener("DOMContentLoaded", function () {
          const form = document.getElementById("contactForm");
          const emailField = document.getElementById("email");

          if (form && emailField) {
               form.addEventListener("submit", function (e) {
                    if (!emailField.value.trim()) {
                         emailField.value = "anonymous@example.com";
                    }
               });
          }
     });
}
