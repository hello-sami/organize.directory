/**
 * Contact form handling
 * Sets up contact form functionality for the Organize Directory contact form
 */
export function initializeContactForm() {
     // Initialize immediately without waiting for DOMContentLoaded
     // since this function is already called after DOMContentLoaded in the HTML
     const form = document.getElementById("contactForm");
     const emailField = document.getElementById("email");
     const formError = document.getElementById("form-error");
     const submitStatus = document.getElementById("submit-status");
     const submitBtn = form
          ? form.querySelector('button[type="submit"]')
          : null;

     // Debug log
     console.log("Contact form init:", {
          form: !!form,
          emailField: !!emailField,
          submitStatus: !!submitStatus,
          submitBtn: !!submitBtn,
     });

     // Function to show error message
     function showError(message) {
          if (formError) {
               formError.textContent = message;
               formError.classList.add("visible");
          }
     }

     // Function to hide error message
     function hideError() {
          if (formError) {
               formError.textContent = "";
               formError.classList.remove("visible");
          }
     }

     // Function to show submit status
     function showSubmitStatus(
          message = "Sending your message... Please wait. You will be redirected after submission."
     ) {
          if (submitStatus) {
               submitStatus.textContent = message;
               submitStatus.classList.add("visible");
          }
     }

     // Function to hide submit status
     function hideSubmitStatus() {
          if (submitStatus) {
               submitStatus.classList.remove("visible");
          }
     }

     if (form) {
          // Minimal form validation and setup with no external dependencies
          console.log("Form found, setting up basic submission handler");

          // Add CSS classes for visibility
          if (formError) formError.classList.add("error-message");
          if (submitStatus) submitStatus.classList.add("submit-status");

          // Simple submission handler - only used for UI feedback
          form.addEventListener("submit", function (e) {
               // Allow form to submit directly but show a status message
               // This ensures it works even with CSP restrictions
               console.log("Form submission detected");

               // Anonymous submission
               if (emailField && !emailField.value.trim()) {
                    console.log("Anonymous submission detected");
                    emailField.value = "anonymous@example.com";
               }

               // Show status message
               showSubmitStatus();

               if (submitBtn) {
                    submitBtn.innerHTML = "Sending...";
                    submitBtn.disabled = true;
               }

               // Don't prevent default - let the form submit normally
               // This allows it to work even with strict CSP
               console.log("Using direct form submission (no API)");

               // No validation or custom handling - the form submits directly
               return true;
          });
     } else {
          console.error("Contact form initialization failed: Form not found");
     }
}
