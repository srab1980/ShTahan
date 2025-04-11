/**
 * Back To Top Button Module for Sheikh Mustafa Al-Tahhan website
 * Handles the back to top button functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) {
        console.error('Back to top button not found');
        return;
    }
    
    // Show/hide the button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Force check on page load in case we're already scrolled down
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    }
    
    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', function() {
        console.log('Back to top button clicked');
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Debug info
    console.log('Back to top button initialized');
});