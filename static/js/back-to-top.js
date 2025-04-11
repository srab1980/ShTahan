/**
 * Back To Top Button Module for Sheikh Mustafa Al-Tahhan website
 * Handles the back to top button functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get the button element
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) {
        console.error('Back to top button not found');
        return;
    }
    
    // Add click event listener
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Back to top button clicked');
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    console.log('Back to top button initialized');
});