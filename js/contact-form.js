/**
 * Contact Form Handler
 * This script handles the contact form using Cloudflare Pages Forms
 */

function initializeContactForm() {
     // Get form elements
     const form = document.getElementById("contactForm");
     if (!form) return; // Exit if no form found

     const nameInput = document.getElementById("name");
     const emailInput = document.getElementById("email");
     const subjectSelect = document.getElementById("subject");
     const messageInput = document.getElementById("message");
     const statusMessage = document.getElementById("statusMessage");
     const helpDiv = document.getElementById("submission-help");

     // Check for status parameters in URL (for when Cloudflare redirects back)
     checkUrlParameters();

     // Add form submission handler
     if (form) {
          form.addEventListener("submit", function (e) {
               // Validate form first
               if (!validateForm(e)) {
                    return false; // Stop if validation fails
               }

               // If validation passes, show sending status
               showSubmitStatus("Sending your message...", "sending");

               // Handle empty email - set to anonymous
               if (!emailInput.value.trim()) {
                    emailInput.value = "anonymous@example.com";
               }

               // Show help div after a timeout in case submission takes too long
               setTimeout(() => {
                    if (helpDiv) helpDiv.style.display = "block";
               }, 10000);

               // Let the form submit naturally to Cloudflare Pages Forms
               return true;
          });
     }

     /**
      * Validates the form fields
      * @param {Event} e - The submit event
      * @returns {boolean} True if all validations pass
      */
     function validateForm(e) {
          // Reset previous errors
          hideError(nameInput);
          hideError(emailInput);
          hideError(subjectSelect);
          hideError(messageInput);

          let isValid = true;

          // Validate name
          if (!nameInput.value.trim()) {
               e.preventDefault(); // Prevent form submission
               showError(nameInput, "Please enter your name");
               isValid = false;
          }

          // Email is optional, but if provided, validate format
          if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
               e.preventDefault(); // Prevent form submission
               showError(emailInput, "Please enter a valid email address");
               isValid = false;
          }

          // Validate subject
          if (!subjectSelect.value) {
               e.preventDefault(); // Prevent form submission
               showError(subjectSelect, "Please select a subject");
               isValid = false;
          }

          // Validate message
          if (!messageInput.value.trim()) {
               e.preventDefault(); // Prevent form submission
               showError(messageInput, "Please enter your message");
               isValid = false;
          }

          return isValid;
     }

     /**
      * Checks URL parameters for status and error messages
      */
     function checkUrlParameters() {
          const urlParams = new URLSearchParams(window.location.search);
          const formName = urlParams.get("form-name");
          const success = urlParams.get("success");

          // Check if we're returning from a form submission
          if (formName === "contact") {
               if (success === "true") {
                    showSubmitStatus(
                         "Message sent successfully! We'll be in touch soon.",
                         "success"
                    );
                    // Clear form if successful
                    if (form) form.reset();
               } else {
                    showSubmitStatus(
                         "Error sending message. Please try again or email us directly.",
                         "error"
                    );
                    if (helpDiv) helpDiv.style.display = "block";
               }

               // Scroll to status message after redirect
               const statusElement = document.getElementById("statusMessage");
               if (statusElement) {
                    setTimeout(() => {
                         statusElement.scrollIntoView({
                              behavior: "smooth",
                              block: "nearest",
                         });
                    }, 100);
               }
          }
     }
}

/**
 * Shows an error message for a form field
 * @param {HTMLElement} input - The input element
 * @param {string} message - The error message
 */
function showError(input, message) {
     const errorElement = document.createElement("div");
     errorElement.className = "error-message";
     errorElement.textContent = message;

     input.classList.add("error");
     input.parentNode.appendChild(errorElement);

     // Scroll to first error
     input.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * Hides error message for a form field
 * @param {HTMLElement} input - The input element
 */
function hideError(input) {
     input.classList.remove("error");

     const parent = input.parentNode;
     const errorElement = parent.querySelector(".error-message");
     if (errorElement) {
          parent.removeChild(errorElement);
     }
}

/**
 * Shows the form submission status message
 * @param {string} message - The status message
 * @param {string} type - The message type (success, error, sending)
 */
function showSubmitStatus(message, type) {
     const statusMessage = document.getElementById("statusMessage");
     if (!statusMessage) return;

     statusMessage.textContent = message;
     statusMessage.className = "status-message";
     statusMessage.classList.add(type);
     statusMessage.style.display = "block";

     // Scroll to status message
     statusMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidEmail(email) {
     const re =
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
     return re.test(String(email).toLowerCase());
}

// Initialize the contact form when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeContactForm);
