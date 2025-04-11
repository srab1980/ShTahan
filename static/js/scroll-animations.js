/**
 * Scroll Animations Module for Sheikh Mustafa Al-Tahhan website
 * Provides gentle scroll-triggered reveal animations for page elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add 'has-animation' class to all elements that should be animated
    const animatedSections = [
        '.section-title',
        '.section-description',
        '.book-card',
        '.article-card',
        '.gallery-item',
        '.quote-card',
        '.bio-card',
        '.contact-form'
    ];
    
    // Add animation classes to elements
    animatedSections.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Skip elements already initialized
            if (element.classList.contains('has-animation')) return;
            
            // Add animation class
            element.classList.add('has-animation');
            element.classList.add('animate-hidden');
        });
    });
    
    // Set up intersection observer for animation triggering
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If element is in viewport
            if (entry.isIntersecting) {
                // Add animation class
                entry.target.classList.add('animate-visible');
                // Remove from observer after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // Use viewport as root
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    });
    
    // Observe all elements with animation class
    const animatedElements = document.querySelectorAll('.has-animation');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Function to check if Intersection Observer API is supported
    function isIntersectionObserverSupported() {
        return 'IntersectionObserver' in window &&
               'IntersectionObserverEntry' in window &&
               'intersectionRatio' in window.IntersectionObserverEntry.prototype;
    }
    
    // Fallback for browsers that don't support Intersection Observer
    if (!isIntersectionObserverSupported()) {
        console.log('Intersection Observer not supported, using scroll event fallback');
        
        // Simple function to check if element is in viewport
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
        }
        
        // Check elements on scroll
        function checkVisibility() {
            const animatedElements = document.querySelectorAll('.animate-hidden');
            animatedElements.forEach(element => {
                if (isElementInViewport(element)) {
                    element.classList.remove('animate-hidden');
                    element.classList.add('animate-visible');
                }
            });
        }
        
        // Add scroll event listener
        window.addEventListener('scroll', checkVisibility);
        // Check initially
        checkVisibility();
    }
});