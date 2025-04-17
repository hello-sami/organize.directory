document.addEventListener("DOMContentLoaded", function () {
     const form = document.getElementById("contactForm");
     const statusMessage = document.getElementById("statusMessage");
     const formFailureHelp = document.getElementById("formFailureHelp");

     // Generate captcha on page load
     generateCaptcha();

     // Check URL parameters for successful form submission
     const urlParams = new URLSearchParams(window.location.search);
     if (urlParams.get("success") === "true") {
          statusMessage.textContent =
               "Thank you! Your message has been sent successfully.";
          statusMessage.className = "status-message success";
          statusMessage.style.display = "block";
          form.reset();

          // Generate new captcha
          generateCaptcha();

          // Scroll to status message
          statusMessage.scrollIntoView({
               behavior: "smooth",
               block: "nearest",
          });
     }

     // Basic client-side validation
     form.addEventListener("submit", function (e) {
          // Reset previous errors
          resetErrors();

          // Validate form
          if (!validateForm()) {
               e.preventDefault(); // Prevent form submission
               return false;
          }

          // Handle anonymous email
          const emailInput = document.getElementById("email");
          if (!emailInput.value.trim()) {
               emailInput.value = "anonymous@organize.directory";
          }

          // Show help div after a delay in case submission is slow
          setTimeout(() => {
               formFailureHelp.style.display = "block";
          }, 15000);

          return true; // Allow form submission
     });

     // Generate a simple math captcha
     function generateCaptcha() {
          const captchaQuestion = document.getElementById("captchaQuestion");
          const captchaAnswer = document.getElementById("captchaAnswer");

          // Get two random numbers between 1 and 10
          const num1 = Math.floor(Math.random() * 10) + 1;
          const num2 = Math.floor(Math.random() * 10) + 1;

          // Set the question and store the answer
          captchaQuestion.textContent = `${num1} + ${num2} = ?`;
          captchaAnswer.value = num1 + num2;
     }

     // Form validation function
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

          // Validate email if provided
          const emailInput = document.getElementById("email");
          const emailError = document.getElementById("emailError");
          if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
               emailInput.classList.add("error");
               emailError.style.display = "block";
               isValid = false;
          }

          // Validate inquiry
          const inquiryInput = document.getElementById("inquiry");
          const inquiryError = document.getElementById("inquiryError");
          if (!inquiryInput.value) {
               inquiryInput.classList.add("error");
               inquiryError.style.display = "block";
               isValid = false;
          }

          // Validate message
          const messageInput = document.getElementById("message");
          const messageError = document.getElementById("messageError");
          if (!messageInput.value.trim()) {
               messageInput.classList.add("error");
               messageError.style.display = "block";
               isValid = false;
          }

          // Validate captcha
          const captchaInput = document.getElementById("captcha");
          const captchaAnswer = document.getElementById("captchaAnswer");
          const captchaError = document.getElementById("captchaError");
          if (captchaInput.value.trim() !== captchaAnswer.value) {
               captchaInput.classList.add("error");
               captchaError.style.display = "block";
               isValid = false;
               // Generate a new captcha if the answer was wrong
               generateCaptcha();
          }

          // If not valid, scroll to first error
          if (!isValid) {
               document
                    .querySelector(".error")
                    .scrollIntoView({ behavior: "smooth", block: "center" });
          }

          return isValid;
     }

     // Reset error messages
     function resetErrors() {
          const errorInputs = document.querySelectorAll(".error");
          const errorTexts = document.querySelectorAll(".error-text");

          errorInputs.forEach((input) => input.classList.remove("error"));
          errorTexts.forEach((text) => (text.style.display = "none"));
     }

     // Email validation
     function isValidEmail(email) {
          const re =
               /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(String(email).toLowerCase());
     }

     // Input event listeners to clear errors on typing
     document.querySelectorAll("input, select, textarea").forEach((el) => {
          el.addEventListener("input", function () {
               this.classList.remove("error");
               const errorEl = document.getElementById(this.id + "Error");
               if (errorEl) errorEl.style.display = "none";
          });
     });

     // Add button to refresh captcha
     const captchaContainer = document.getElementById("captchaContainer");
     const refreshButton = document.createElement("button");
     refreshButton.type = "button";
     refreshButton.className = "captcha-refresh";
     refreshButton.innerHTML = "↻";
     refreshButton.title = "Get a new question";
     refreshButton.onclick = generateCaptcha;
     captchaContainer
          .querySelector(".captcha-challenge")
          .appendChild(refreshButton);
});
