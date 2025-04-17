/**
 * Google Analytics initialization
 */
(function () {
     // Load Google Analytics script
     const script = document.createElement("script");
     script.async = true;
     script.src = "https://www.googletagmanager.com/gtag/js?id=G-QJ03RCM35H";
     document.head.appendChild(script);

     // Initialize Google Analytics
     window.dataLayer = window.dataLayer || [];
     function gtag() {
          dataLayer.push(arguments);
     }
     gtag("js", new Date());
     gtag("config", "G-QJ03RCM35H");
})();
