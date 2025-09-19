/**
 * @file Manages scroll-triggered animations for page elements.
 * @description Uses IntersectionObserver to efficiently trigger animations when elements enter the viewport.
 */

/**
 * Checks if the IntersectionObserver API is supported by the browser.
 * @returns {boolean} True if IntersectionObserver is supported, false otherwise.
 */
function isIntersectionObserverSupported() {
    return 'IntersectionObserver' in window;
}

/**
 * Initializes scroll animations using IntersectionObserver.
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.section-title, .book-card, .article-card, .gallery-item, .bio-card');
    
    if (!isIntersectionObserverSupported()) {
        // Fallback for older browsers: just show all elements.
        animatedElements.forEach(el => el.classList.add('animate-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        element.classList.add('animate-hidden');
        observer.observe(element);
    });
}

document.addEventListener('DOMContentLoaded', initScrollAnimations);