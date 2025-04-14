/**
 * Contact Form Handler
 * This script initializes the contact form, handles captcha generation and validation.
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

     // Add form submission handler - simplified approach
     if (form) {
          form.addEventListener("submit", function (e) {
               // Only validate the captcha, don't interfere with form submission otherwise
               if (captchaInput.value.trim() !== captchaValue) {
                    e.preventDefault();
                    hideError(captchaInput);
                    showError(captchaInput, "Incorrect captcha value");
                    captchaValue = generateCaptcha(captchaContainer);
                    captchaInput.value = "";
                    return false;
               }

               // Handle empty email field - set to anonymous if blank
               if (emailInput.value.trim() === "") {
                    emailInput.value = "anonymous@example.com";
               }

               // Show sending message
               showSubmitStatus("Sending your message...", "sending");

               // Let the form submit naturally - no preventDefault()
               console.log("Form submitting to Web3Forms...");
          });
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

// Initialize the contact form when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeContactForm);
