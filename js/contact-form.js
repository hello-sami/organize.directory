/**
 * Contact Form Handler
 * This script initializes the contact form, handles captcha generation,
 * validation, and form submission.
 */

function initializeContactForm() {
     // Get form elements
     const form = document.getElementById("contactForm");
     if (!form) return; // Exit if no form found

     const captchaContainer = document.getElementById("captcha");
     const captchaInput = document.getElementById("captchaInput");
     const captchaRefresh = document.getElementById("refreshCaptcha");
     const nameInput = document.getElementById("name");
     const emailInput = document.getElementById("email");
     const messageInput = document.getElementById("message");
     const statusMessage = document.getElementById("statusMessage");

     // Generate initial captcha
     let captchaValue = generateCaptcha(captchaContainer);

     // Refresh captcha when the refresh button is clicked
     if (captchaRefresh) {
          captchaRefresh.addEventListener("click", function (e) {
               e.preventDefault();
               captchaValue = generateCaptcha(captchaContainer);
          });
     }

     // Check for status parameters in URL (for when returning from form submission)
     checkUrlParameters();

     // Add form submission handling
     if (form) {
          form.addEventListener("submit", function (e) {
               // Only prevent default submission if validation fails
               if (!validateForm()) {
                    e.preventDefault();
                    return false;
               }

               // Handle empty email field - set to anonymous if blank
               if (!emailInput.value.trim()) {
                    emailInput.value = "anonymous@example.com";
               }

               // Show "Sending..." message
               showSubmitStatus("Sending your message...", "sending");

               // Let the form submit naturally to allow Web3Forms redirect to work
               // No need to prevent default or use fetch API
               console.log("Form submitting to Web3Forms...");

               // The rest of the submission is handled by Web3Forms
               // and the redirect is handled by the redirect hidden field
          });
     }

     /**
      * Validates the form inputs
      * @returns {boolean} True if valid, false otherwise
      */
     function validateForm() {
          // Reset previous errors
          hideError(nameInput);
          hideError(emailInput);
          hideError(messageInput);
          hideError(captchaInput);

          let isValid = true;

          // Validate name
          if (!nameInput.value.trim()) {
               showError(nameInput, "Please enter your name");
               isValid = false;
          }

          // Email is optional, but if provided, validate format
          if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
               showError(emailInput, "Please enter a valid email address");
               isValid = false;
          }

          // Validate message
          if (!messageInput.value.trim()) {
               showError(messageInput, "Please enter your message");
               isValid = false;
          }

          // Validate captcha
          if (!captchaInput.value.trim()) {
               showError(captchaInput, "Please enter the captcha");
               isValid = false;
          } else if (captchaInput.value.trim() !== captchaValue) {
               showError(captchaInput, "Incorrect captcha value");
               captchaValue = generateCaptcha(captchaContainer);
               captchaInput.value = "";
               isValid = false;
          }

          return isValid;
     }

     /**
      * Checks URL parameters for status and error messages
      */
     function checkUrlParameters() {
          const urlParams = new URLSearchParams(window.location.search);
          const status = urlParams.get("status");
          const error = urlParams.get("error");

          if (status === "success") {
               showSubmitStatus("Message sent successfully!", "success");
          } else if (status === "error") {
               if (error) {
                    showSubmitStatus(`Error: ${error}`, "error");
               } else {
                    showSubmitStatus(
                         "Error sending message. Please try again.",
                         "error"
                    );
               }
          }
     }
}

/**
 * Generates a simple math captcha
 * @param {HTMLElement} container - The container to display the captcha
 * @returns {string} The captcha answer as a string
 */
function generateCaptcha(container) {
     if (!container) return "";

     // Generate two random numbers between 1 and 10
     const num1 = Math.floor(Math.random() * 10) + 1;
     const num2 = Math.floor(Math.random() * 10) + 1;
     const answer = num1 + num2;

     // Set the captcha text
     container.textContent = `${num1} + ${num2} = ?`;

     return answer.toString();
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
