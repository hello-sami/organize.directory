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
          console.error("Form error:", message);
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
          console.log("Submit status shown:", message);
     }

     // Function to hide submit status
     function hideSubmitStatus() {
          if (submitStatus) {
               submitStatus.classList.remove("visible");
          }
     }

     // Function to manually redirect to thank you page
     function redirectToThankYou() {
          const thankYouUrl = "https://organize.directory/thank-you";
          console.log("Manually redirecting to:", thankYouUrl);
          window.location.href = thankYouUrl;
     }

     // Function to manually submit form data via fetch API
     async function manuallySubmitForm(formData) {
          try {
               console.log("Manually submitting form data via fetch API");
               const response = await fetch(
                    "https://api.web3forms.com/submit",
                    {
                         method: "POST",
                         body: formData,
                         headers: {
                              Accept: "application/json",
                         },
                    }
               );

               const data = await response.json();
               console.log("Manual form submission response:", data);

               if (data.success) {
                    showSubmitStatus(
                         "Your message has been sent! Redirecting to thank you page..."
                    );
                    setTimeout(redirectToThankYou, 1500);
                    return true;
               } else {
                    showError(
                         `Form submission failed: ${data.message || "Unknown error"}`
                    );
                    return false;
               }
          } catch (error) {
               console.error("Manual form submission error:", error);
               showError(`Network error: ${error.message}`);
               return false;
          }
     }

     if (form) {
          // Minimal form validation and setup with no external dependencies
          console.log("Form found, setting up basic submission handler");

          // Add CSS classes for visibility
          if (formError) formError.classList.add("error-message");
          if (submitStatus) submitStatus.classList.add("submit-status");

          // Debug - log the form action and method
          console.log("Form configuration:", {
               action: form.action,
               method: form.method,
               hasRedirect: !!form.querySelector('input[name="redirect"]'),
               redirectValue: form.querySelector('input[name="redirect"]')
                    ?.value,
          });

          // Simple submission handler - only used for UI feedback
          form.addEventListener("submit", function (e) {
               // Debug the submission event
               console.log("Form submission event triggered");

               // Get form action and redirect URL
               const formAction = form.getAttribute("action");
               const redirectUrl =
                    form.querySelector('input[name="redirect"]')?.value ||
                    "https://organize.directory/thank-you";

               // Allow form to submit directly but show a status message
               // This ensures it works even with CSP restrictions
               console.log("Form submission detected");

               // Validate form - check the human verification
               const humanVerification =
                    document.getElementById("human_verification");
               console.log("Human verification:", {
                    exists: !!humanVerification,
                    value: humanVerification ? humanVerification.value : null,
               });

               // Check if human verification is valid
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
                    console.log("Anonymous submission detected");
                    emailField.value = "anonymous@example.com";
               }

               // Show status message
               showSubmitStatus();

               if (submitBtn) {
                    submitBtn.innerHTML = "Sending...";
                    submitBtn.disabled = true;
                    console.log(
                         "Submit button disabled and text changed to 'Sending...'"
                    );
               }

               // IMPORTANT: Try both submission methods for better reliability
               // 1. Standard form submission (this happens automatically without preventDefault)
               // 2. Manual submission as a fallback after a delay

               // Add a fallback for manual submission if the standard form submission doesn't work
               setTimeout(async function () {
                    // If we're still on the same page after 4 seconds, try manual submission
                    if (!window.location.href.includes("thank-you")) {
                         console.log(
                              "Form did not redirect automatically after 4 seconds, trying manual submission"
                         );

                         // Create a FormData object from the form
                         const formData = new FormData(form);

                         // Log what we're sending
                         console.log("Sending form data manually:");
                         for (let pair of formData.entries()) {
                              console.log(pair[0] + ": " + pair[1]);
                         }

                         // Try to manually submit the form
                         const manualSubmitResult =
                              await manuallySubmitForm(formData);

                         if (manualSubmitResult) {
                              console.log("Manual submission successful");
                         } else {
                              console.error("Manual submission failed");

                              // Enable the submit button again in case they need to retry
                              if (submitBtn) {
                                   submitBtn.innerHTML = "Send Message";
                                   submitBtn.disabled = false;
                              }

                              // Show help message after failed manual submission
                              document.getElementById(
                                   "submission-help"
                              ).style.display = "block";
                         }
                    }
               }, 4000);

               // Don't prevent default - let the form submit normally
               // This allows it to work even with strict CSP
               console.log("Form will submit normally to: " + formAction);

               // No validation or custom handling - the form submits directly
               return true;
          });

          // Additional check for the thank-you page redirect
          console.log("Current URL:", window.location.href);
          if (window.location.href.includes("thank-you")) {
               console.log("Thank you page detected");
          }
     } else {
          console.error("Contact form initialization failed: Form not found");
     }
}
