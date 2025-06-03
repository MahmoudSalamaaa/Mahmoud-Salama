// Theme Switcher
document.addEventListener('DOMContentLoaded', function() {
    // Get theme buttons and theme style link
    const themeButtons = document.querySelectorAll('.theme-btn');
    const themeStyleLink = document.getElementById('theme-style');
    
    // Check if there's a saved theme in localStorage
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    
    // Set initial theme
    themeStyleLink.href = `css/theme-${savedTheme}.css`;
    
    // Mark the active theme button
    themeButtons.forEach(button => {
        if (button.getAttribute('data-theme') === savedTheme) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Add click event listeners to theme buttons
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            
            // Update theme stylesheet
            themeStyleLink.href = `css/theme-${theme}.css`;
            
            // Save theme preference to localStorage
            localStorage.setItem('selectedTheme', theme);
            
            // Update active button state
            themeButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
});
