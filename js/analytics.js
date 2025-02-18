// Google Analytics with respect for privacy
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Initialize GA with restricted data collection
gtag('js', new Date());
gtag('config', 'G-QJ03RCM35H', {
    'cookie_flags': 'SameSite=None;Secure',
    'anonymize_ip': true,
    'allow_google_signals': false,
    'allow_ad_personalization_signals': false
});

// Load GA script with privacy-first settings
const gaScript = document.createElement('script');
gaScript.async = true;
gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-QJ03RCM35H';
document.head.appendChild(gaScript); 