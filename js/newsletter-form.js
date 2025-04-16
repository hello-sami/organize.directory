/**
 * Newsletter subscription form handling
 */
document.addEventListener("DOMContentLoaded", function () {
     const form = document.getElementById("newsletterForm");
     const submitButton = document.getElementById("btn-base");
     const errorMessage = document.getElementById("error-message");

     if (!form) return;

     form.addEventListener("submit", async function (e) {
          e.preventDefault();

          // Validate name
          const nameInput = document.getElementById("name");
          if (!nameInput.value.trim()) {
               showError("Please enter your name.");
               return;
          }

          // Validate email format
          const emailInput = document.getElementById("email");
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!emailRegex.test(emailInput.value)) {
               showError("Please enter a valid email address.");
               return;
          }

          // Validate consent
          const consentInput = document.querySelector('input[name="consent"]');
          if (!consentInput.checked) {
               showError("You must consent to receive emails.");
               return;
          }

          // Hide any previous error message
          errorMessage.style.display = "none";

          // Disable submit button and show loading state
          submitButton.disabled = true;
          submitButton.textContent = "Subscribing...";

          try {
               // Send to Web3Forms
               const formData = new FormData(form);
               const response = await fetch(form.action, {
                    method: "POST",
                    body: formData,
               });

               const data = await response.json();

               if (response.ok) {
                    // Success - redirect to thank you page
                    window.location.href = form.querySelector(
                         'input[name="redirect"]'
                    ).value;
               } else {
                    // Show error message
                    showError(
                         data.message ||
                              "Something went wrong. Please try again later."
                    );
                    resetButton();
               }
          } catch (error) {
               showError(
                    "Network error. Please check your connection and try again."
               );
               resetButton();
          }
     });

     function showError(message) {
          errorMessage.textContent = message;
          errorMessage.style.display = "block";
     }

     function resetButton() {
          submitButton.disabled = false;
          submitButton.textContent = "Subscribe";
     }
});
