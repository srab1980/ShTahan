/**
 * @file Manages the "Back to Top" button functionality.
 * @description Shows a button that smoothly scrolls the page to the top when clicked.
 */

/**
 * Initializes the "Back to Top" button.
 * Sets up an event listener to scroll the window to the top smoothly.
 */
function initBackToTop() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    if (!scrollToTopBtn) {
        console.error('Scroll to top button not found');
        return;
    }

    // Show or hide the button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Scroll to top on click
    scrollToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

document.addEventListener('DOMContentLoaded', initBackToTop);