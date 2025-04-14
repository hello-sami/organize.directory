/**
 * Contact form handling
 * Sets up contact form functionality for the Organize Directory contact form
 */
export function initializeContactForm() {
     const form = document.getElementById("contactForm");
     const emailField = document.getElementById("email");
     const formError = document.getElementById("form-error");
     const submitStatus = document.getElementById("submit-status");
     const submitBtn = form
          ? form.querySelector('button[type="submit"]')
          : null;

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

     if (form) {
          console.log("Form initialized");

          // Add CSS classes for visibility
          if (formError) formError.classList.add("error-message");
          if (submitStatus) submitStatus.classList.add("submit-status");

          // Simple submission handler
          form.addEventListener("submit", function (e) {
               // Validate form - check the human verification
               const humanVerification =
                    document.getElementById("human_verification");

               if (
                    humanVerification &&
                    humanVerification.value.trim().toLowerCase() !== "human"
               ) {
                    e.preventDefault(); // Stop form submission
                    showError(
                         "Please type 'human' in the verification field to prove you're not a bot."
                    );
                    return false;
               }

               // Hide any previous errors
               hideError();

               // Anonymous submission
               if (emailField && !emailField.value.trim()) {
                    emailField.value = "anonymous@example.com";
               }

               // Show status message
               showSubmitStatus();

               if (submitBtn) {
                    submitBtn.innerHTML = "Sending...";
                    submitBtn.disabled = true;
               }

               // Let the form submit normally - the form has the correct action and redirect URL
               return true;
          });
     }
}
