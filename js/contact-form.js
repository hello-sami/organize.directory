/**
 * Contact Form Handler
 * This script handles the contact form using Cloudflare Pages Forms
 * with a fallback mechanism if the primary method fails
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
               // Validate form
               if (!validateForm(e)) {
                    return false;
               }

               // If validation passes, show sending status
               showSubmitStatus("Sending your message...", "sending");

               // Handle empty email - set to anonymous
               if (!emailInput.value.trim()) {
                    emailInput.value = "anonymous@example.com";
               }

               // Format the subject for better readability
               let subjectText = "Contact Form Submission";
               if (subjectSelect.value) {
                    const selectedOption =
                         subjectSelect.options[subjectSelect.selectedIndex];
                    if (selectedOption) {
                         subjectText = selectedOption.textContent;
                    }
               }

               // Log form submission for debugging purposes
               console.log("Form submitted with Cloudflare Pages Forms");

               // Show help div after a delay in case submission hangs
               setTimeout(() => {
                    if (helpDiv) helpDiv.style.display = "block";
               }, 10000);

               try {
                    // Add a hidden field to track submission method
                    const methodInput = document.createElement("input");
                    methodInput.type = "hidden";
                    methodInput.name = "submission_method";
                    methodInput.value = "cloudflare_pages_forms";
                    form.appendChild(methodInput);

                    // We're letting the form submit naturally to Cloudflare Pages Forms
                    return true;
               } catch (error) {
                    console.error("Error during form submission:", error);

                    // If we get here, something went wrong with the standard submission
                    // Show error message and fallback options
                    showSubmitStatus(
                         "There was an issue submitting the form. Please try the alternative contact method below.",
                         "error"
                    );
                    if (helpDiv) helpDiv.style.display = "block";

                    // Create a mailto link as fallback
                    createMailtoFallback(
                         nameInput.value,
                         emailInput.value,
                         subjectText,
                         messageInput.value
                    );

                    return false;
               }
          });
     }

     /**
      * Creates a mailto fallback when form submission fails
      */
     function createMailtoFallback(name, email, subject, message) {
          // Create fallback container if it doesn't exist
          let fallbackDiv = document.getElementById("mailto-fallback");
          if (!fallbackDiv) {
               fallbackDiv = document.createElement("div");
               fallbackDiv.id = "mailto-fallback";
               fallbackDiv.className = "mailto-fallback";
               fallbackDiv.style.marginTop = "20px";
               fallbackDiv.style.padding = "15px";
               fallbackDiv.style.backgroundColor = "#f9f9f9";
               fallbackDiv.style.borderRadius = "4px";
               fallbackDiv.style.border = "1px solid #ddd";

               // Insert after the help div or form
               const insertAfter = helpDiv || form;
               insertAfter.parentNode.insertBefore(
                    fallbackDiv,
                    insertAfter.nextSibling
               );
          }

          // Format email body
          const bodyText = `
Name: ${name}
Email: ${email || "Anonymous"}

${message}

---
Sent via fallback from the Organize Directory contact form
`;

          // Create mailto link
          const mailtoUrl = `mailto:hello@organize.directory?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

          // Update fallback div content
          fallbackDiv.innerHTML = `
               <h3>Send Email Directly</h3>
               <p>Click the button below to open your email client and send your message directly:</p>
               <a href="${mailtoUrl}" style="display: inline-block; background: #a30000; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
                    Send via Email Client
               </a>
               <p style="margin-top: 15px; font-size: 0.9em;">
                    If the button doesn't work, email us directly at 
                    <a href="mailto:hello@organize.directory">hello@organize.directory</a>
               </p>
          `;
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
