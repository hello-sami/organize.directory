// Immediately apply the saved theme or default to dark
(function() {
    document.documentElement.setAttribute(
        'data-theme',
        localStorage.getItem('theme') || 'dark'
    );
})(); 