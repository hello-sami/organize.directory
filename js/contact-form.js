/**
 * Contact form handling
 * Sets up contact form functionality including anonymous submission
 * and simple math captcha for spam protection
 */
export function initializeContactForm() {
     // Initialize immediately without waiting for DOMContentLoaded
     // since this function is already called after DOMContentLoaded in the HTML
     const form = document.getElementById("contactForm");
     const emailField = document.getElementById("email");
     const captchaQuestion = document.getElementById("captchaQuestion");
     const captchaAnswer = document.getElementById("captchaAnswer");
     const captchaExpected = document.getElementById("captchaExpected");
     const formError = document.getElementById("form-error");
     const submitStatus = document.getElementById("submit-status");
     const submitBtn = form
          ? form.querySelector('button[type="submit"]')
          : null;

     // Debug log
     console.log("Contact form init:", {
          form: !!form,
          emailField: !!emailField,
          captchaQuestion: !!captchaQuestion,
          captchaAnswer: !!captchaAnswer,
          captchaExpected: !!captchaExpected,
     });

     // Generate captcha
     function generateCaptcha() {
          const num1 = Math.floor(Math.random() * 10) + 1;
          const num2 = Math.floor(Math.random() * 10) + 1;
          const operation = Math.random() > 0.5 ? "+" : "-";
          let answer;

          if (operation === "+") {
               answer = num1 + num2;
               captchaQuestion.textContent = `What is ${num1} + ${num2}?`;
          } else {
               // Ensure we don't have negative answers
               const larger = Math.max(num1, num2);
               const smaller = Math.min(num1, num2);
               answer = larger - smaller;
               captchaQuestion.textContent = `What is ${larger} - ${smaller}?`;
          }

          console.log("Generated captcha with answer:", answer);
          captchaExpected.value = answer;
          return answer;
     }

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

     // Fallback function - if form submission hasn't completed after a timeout
     function submissionFallback() {
          console.log("Using submission fallback");
          // Show a message that we're having trouble and suggest a manual redirect
          showSubmitStatus(
               "Your message has been sent, but we're having trouble redirecting you. Please click the link below to continue."
          );

          // Add a link for manual navigation
          if (submitStatus) {
               const redirectLink = document.createElement("a");
               redirectLink.href = "https://organize.directory/thank-you";
               redirectLink.textContent = "Continue to Thank You page";
               redirectLink.className = "manual-redirect-link";
               redirectLink.style.display = "block";
               redirectLink.style.marginTop = "1rem";
               redirectLink.style.textAlign = "center";
               submitStatus.appendChild(redirectLink);
          }
     }

     if (
          form &&
          emailField &&
          captchaQuestion &&
          captchaAnswer &&
          captchaExpected
     ) {
          // Generate initial captcha
          try {
               generateCaptcha();
               // Add required attribute to captchaAnswer field when JS is working
               if (captchaAnswer) {
                    captchaAnswer.setAttribute("required", "required");
               }
               console.log("Captcha generated successfully");
          } catch (err) {
               console.error("Error generating captcha:", err);
               showError(
                    "Unable to load security check. Please reload the page or contact us directly."
               );
          }

          // Add CSS classes for visibility
          if (formError) formError.classList.add("error-message");
          if (submitStatus) submitStatus.classList.add("submit-status");

          // Function to handle form submission
          function handleFormSubmit(e) {
               e.preventDefault(); // Always prevent default form submission
               console.log("Form submission attempt");

               // Check if captcha is correct
               const userAnswer = parseInt(captchaAnswer.value);
               const expectedAnswer = parseInt(captchaExpected.value);

               console.log("Captcha validation:", {
                    userAnswer,
                    expectedAnswer,
                    isMatch: userAnswer === expectedAnswer,
               });

               if (isNaN(userAnswer) || userAnswer !== expectedAnswer) {
                    showError(
                         "Incorrect answer to the security question. Please try again."
                    );
                    generateCaptcha(); // Generate a new captcha
                    captchaAnswer.value = ""; // Clear the answer field
                    return false;
               }

               // Handle anonymous submission
               if (!emailField.value.trim()) {
                    emailField.value = "anonymous@example.com";
               }

               // Clear error message
               hideError();

               // Show status message and disable submit button
               showSubmitStatus();

               if (submitBtn) {
                    submitBtn.innerHTML = "Sending...";
                    submitBtn.disabled = true;
               }

               // Set a fallback timer in case the form submission gets stuck
               const fallbackTimer = setTimeout(submissionFallback, 8000);

               // Create a hidden field to track submission
               const submissionFlag = document.createElement("input");
               submissionFlag.type = "hidden";
               submissionFlag.name = "submission_started";
               submissionFlag.value = Date.now().toString();
               form.appendChild(submissionFlag);

               // Always use traditional form submission method
               // This works even when CSP blocks fetch API requests
               console.log("Using traditional form submission");
               form.submit();

               // Clear the event listener to prevent duplicate submissions
               form.removeEventListener("submit", handleFormSubmit);

               return false;
          }

          // Intercept the form submission to handle it with our custom logic
          form.addEventListener("submit", handleFormSubmit);

          // If returning to this page after submission (e.g., back button)
          // Reset the form and re-enable the submit button
          if (submitBtn && submitBtn.disabled) {
               submitBtn.disabled = false;
               submitBtn.innerHTML = "Send Message";
               hideSubmitStatus();
               hideError();
          }
     } else {
          console.error(
               "Contact form initialization failed: Missing elements",
               {
                    form: !!form,
                    emailField: !!emailField,
                    captchaQuestion: !!captchaQuestion,
                    captchaAnswer: !!captchaAnswer,
                    captchaExpected: !!captchaExpected,
               }
          );
          showError(
               "There was a problem loading the contact form. Please refresh the page or contact us directly via email."
          );
     }
}
