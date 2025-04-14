/**
 * Contact Form Handler
 * This script handles the contact form using a direct mailto approach
 * to avoid server errors with form submissions
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

     // Add form submission handler
     if (form) {
          form.addEventListener("submit", function (e) {
               // Always prevent the default form submission
               e.preventDefault();

               // Validate form
               if (!validateForm(e)) {
                    return false;
               }

               // If validation passes, show sending status
               showSubmitStatus("Opening your email client...", "sending");

               // Get form values
               const name = nameInput.value.trim();
               const email = emailInput.value.trim() || "Anonymous";

               // Get selected subject text
               let subjectText = "Contact Form Submission";
               if (subjectSelect.value) {
                    const selectedOption =
                         subjectSelect.options[subjectSelect.selectedIndex];
                    if (selectedOption) {
                         subjectText = selectedOption.textContent;
                    }
               }

               const message = messageInput.value.trim();

               // Format the email body
               const bodyText = `
Name: ${name}
Email: ${email}

${message}

---
Sent from The Organize Directory contact form
`;

               // Create and open mailto link
               const mailtoUrl = `mailto:hello@organize.directory?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;

               try {
                    // Log for debugging
                    console.log("Opening mailto link");

                    // Open the email client
                    window.location.href = mailtoUrl;

                    // Show success message
                    showSubmitStatus(
                         "Email client opened. Please send the email to complete your submission.",
                         "success"
                    );

                    // Clear the form
                    setTimeout(() => {
                         form.reset();
                    }, 2000);
               } catch (error) {
                    console.error("Error opening mailto link:", error);

                    // Show error message
                    showSubmitStatus(
                         "There was an issue opening your email client. Please try the alternative contact method below.",
                         "error"
                    );

                    // Show help div
                    if (helpDiv) helpDiv.style.display = "block";
               }

               return false;
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
               showError(nameInput, "Please enter your name");
               isValid = false;
          }

          // Email is optional, but if provided, validate format
          if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
               showError(emailInput, "Please enter a valid email address");
               isValid = false;
          }

          // Validate subject
          if (!subjectSelect.value) {
               showError(subjectSelect, "Please select a subject");
               isValid = false;
          }

          // Validate message
          if (!messageInput.value.trim()) {
               showError(messageInput, "Please enter your message");
               isValid = false;
          }

          return isValid;
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
