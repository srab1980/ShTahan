/**
 * Scroll To Top Button Module for Sheikh Mustafa Al-Tahhan website
 * Handles the back to top button functionality using a simple anchor approach
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get the button element
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    if (!scrollToTopBtn) {
        console.error('Scroll to top button not found');
        return;
    }
    
    // Add click event listener
    scrollToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Scroll to top button clicked');
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    console.log('Scroll to top button initialized');
});