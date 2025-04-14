/**
 * Contact form handling
 * Sets up contact form functionality including anonymous submission
 * and simple math captcha for spam protection
 */
export function initializeContactForm() {
     document.addEventListener("DOMContentLoaded", function () {
          const form = document.getElementById("contactForm");
          const emailField = document.getElementById("email");
          const captchaQuestion = document.getElementById("captchaQuestion");
          const captchaAnswer = document.getElementById("captchaAnswer");
          const captchaExpected = document.getElementById("captchaExpected");
          const formError = document.getElementById("form-error");

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

               captchaExpected.value = answer;
               return answer;
          }

          if (
               form &&
               emailField &&
               captchaQuestion &&
               captchaAnswer &&
               captchaExpected
          ) {
               // Generate initial captcha
               generateCaptcha();

               form.addEventListener("submit", function (e) {
                    // Check if captcha is correct
                    if (
                         captchaAnswer.value === "" ||
                         parseInt(captchaAnswer.value) !==
                              parseInt(captchaExpected.value)
                    ) {
                         e.preventDefault();
                         formError.textContent =
                              "Incorrect answer to the security question. Please try again.";
                         generateCaptcha(); // Generate a new captcha
                         captchaAnswer.value = ""; // Clear the answer field
                         return false;
                    }

                    // Handle anonymous submission
                    if (!emailField.value.trim()) {
                         emailField.value = "anonymous@example.com";
                    }

                    formError.textContent = ""; // Clear any error messages
               });
          }
     });
}
