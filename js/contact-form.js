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
     function showSubmitStatus() {
          if (submitStatus) {
               submitStatus.classList.add("visible");
          }
     }

     // Function to hide submit status
     function hideSubmitStatus() {
          if (submitStatus) {
               submitStatus.classList.remove("visible");
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

               const submitBtn = form.querySelector('button[type="submit"]');
               if (submitBtn) {
                    submitBtn.innerHTML = "Sending...";
                    submitBtn.disabled = true;
               }

               // Use fetch API for form submission
               const formData = new FormData(form);
               let fetchFailed = false;

               fetch(form.action, {
                    method: "POST",
                    body: formData,
                    headers: {
                         Accept: "application/json",
                    },
               })
                    .then((response) => {
                         console.log(
                              "Form submission response received:",
                              response
                         );
                         if (response.ok) {
                              // Handle successful form submission
                              console.log("Form submitted successfully");

                              // Try to get the redirect URL from the form
                              const redirectInput = form.querySelector(
                                   'input[name="redirect"]'
                              );
                              const redirectUrl = redirectInput
                                   ? redirectInput.value
                                   : "thank-you";

                              // Redirect the user
                              window.location.href = redirectUrl;
                         } else {
                              throw new Error("Form submission failed");
                         }
                    })
                    .catch((error) => {
                         console.error("Error submitting form:", error);
                         fetchFailed = true;

                         // If fetch fails due to CSP, try traditional form submission
                         if (
                              error
                                   .toString()
                                   .includes("Content Security Policy")
                         ) {
                              console.log(
                                   "Attempting traditional form submission due to CSP issues"
                              );
                              // Fallback to traditional form submission
                              setTimeout(() => {
                                   form.removeEventListener(
                                        "submit",
                                        handleFormSubmit
                                   );
                                   form.submit();
                              }, 100);
                              return;
                         }

                         // In case of other errors, enable the button again and show error message
                         if (submitBtn) {
                              submitBtn.innerHTML = "Send Message";
                              submitBtn.disabled = false;
                         }

                         hideSubmitStatus();
                         showError(
                              "There was a problem submitting the form. Please try again or email us directly."
                         );
                    });

               // Add a 15-second timeout in case the form gets stuck
               setTimeout(() => {
                    // Only act if we haven't redirected or already handled the error
                    if (
                         !fetchFailed &&
                         submitBtn &&
                         document.body.contains(submitBtn) &&
                         submitBtn.disabled
                    ) {
                         console.log("Form submission timeout reached");

                         // Try traditional form submission as a fallback
                         try {
                              console.log(
                                   "Attempting traditional form submission after timeout"
                              );
                              form.removeEventListener(
                                   "submit",
                                   handleFormSubmit
                              );
                              form.submit();
                              return;
                         } catch (e) {
                              console.error(
                                   "Error with fallback submission:",
                                   e
                              );
                              // If traditional form submission fails, show error
                              submitBtn.innerHTML = "Send Message";
                              submitBtn.disabled = false;

                              hideSubmitStatus();
                              showError(
                                   "The form submission is taking longer than expected. Please try again or email us directly."
                              );
                         }
                    }
               }, 15000);
          }

          // Intercept the form submission to handle it with fetch API
          form.addEventListener("submit", handleFormSubmit);
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
