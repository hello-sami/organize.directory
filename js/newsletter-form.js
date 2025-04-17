/**
 * Newsletter subscription form handling
 */
document.addEventListener("DOMContentLoaded", function () {
     const form = document.getElementById("newsletterForm");
     const submitButton = document.getElementById("submit-button");
     const errorMessage = document.getElementById("error-message");
     const statusMessage = document.getElementById("statusMessage");

     if (!form) return;

     // Check URL parameters for successful form submission
     const urlParams = new URLSearchParams(window.location.search);
     if (urlParams.get("success") === "true") {
          statusMessage.textContent =
               "Thank you! You have been successfully subscribed.";
          statusMessage.className = "status-message success";
          statusMessage.style.display = "block";
          form.reset();

          // Scroll to status message
          statusMessage.scrollIntoView({
               behavior: "smooth",
               block: "nearest",
          });
     }

     // Setup error clearing on input
     document.querySelectorAll("input, select, textarea").forEach((el) => {
          el.addEventListener("input", function () {
               this.classList.remove("error");
               const errorId = this.id + "Error";
               const errorEl = document.getElementById(errorId);
               if (errorEl) errorEl.style.display = "none";
          });
     });

     form.addEventListener("submit", function (e) {
          e.preventDefault();

          // Reset previous errors
          resetErrors();

          // Validate form
          if (!validateForm()) {
               return false;
          }

          // Hide any previous error message
          errorMessage.style.display = "none";

          // Disable submit button and show loading state
          submitButton.disabled = true;
          submitButton.textContent = "Subscribing...";

          // Submit the form
          submitForm();
     });

     /**
      * Validates all form fields
      * @returns {boolean} Whether the form is valid
      */
     function validateForm() {
          let isValid = true;

          // Validate name
          const nameInput = document.getElementById("name");
          const nameError = document.getElementById("nameError");
          if (!nameInput.value.trim()) {
               nameInput.classList.add("error");
               nameError.style.display = "block";
               isValid = false;
          }

          // Validate email
          const emailInput = document.getElementById("email");
          const emailError = document.getElementById("emailError");
          if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
               emailInput.classList.add("error");
               emailError.style.display = "block";
               isValid = false;
          }

          // Validate consent
          const consentInput = document.querySelector('input[name="consent"]');
          const consentError = document.getElementById("consentError");
          if (!consentInput.checked) {
               consentInput.classList.add("error");
               consentError.style.display = "block";
               isValid = false;
          }

          // If not valid, scroll to first error
          if (!isValid) {
               document
                    .querySelector(".error")
                    .scrollIntoView({ behavior: "smooth", block: "center" });
          }

          return isValid;
     }

     /**
      * Submits the form data to the API endpoint
      */
     async function submitForm() {
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
     }

     /**
      * Resets all error messages and classes
      */
     function resetErrors() {
          const errorInputs = document.querySelectorAll(".error");
          const errorTexts = document.querySelectorAll(".error-text");

          errorInputs.forEach((input) => input.classList.remove("error"));
          errorTexts.forEach((text) => (text.style.display = "none"));
     }

     /**
      * Validates an email address format
      * @param {string} email - The email to validate
      * @returns {boolean} Whether the email is valid
      */
     function isValidEmail(email) {
          const re =
               /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(String(email).toLowerCase());
     }

     /**
      * Shows an error message
      * @param {string} message - The error message to display
      */
     function showError(message) {
          errorMessage.textContent = message;
          errorMessage.style.display = "block";
     }

     /**
      * Resets the submit button to its original state
      */
     function resetButton() {
          submitButton.disabled = false;
          submitButton.textContent = "Subscribe";
     }
});
