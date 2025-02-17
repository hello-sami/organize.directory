// Prevent flash of unstyled content by immediately setting the theme
(function() {
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
        }
    } catch (e) {
        // Fallback if localStorage is not available
        document.documentElement.setAttribute('data-theme', 'light');
    }
})(); 