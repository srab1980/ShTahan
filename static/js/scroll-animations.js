/**
 * Enhanced Scroll Animations Module for Sheikh Mustafa Al-Tahhan website
 * Provides gentle scroll-triggered reveal animations for page elements with various effects
 */

document.addEventListener('DOMContentLoaded', function() {
    // Animation configurations for different elements
    const animationConfig = [
        { selector: '.section-title', animationClass: 'slide-up' },
        { selector: '.section-description', animationClass: 'fade-in' },
        { selector: '.bio-card', animationClass: 'slide-right' },
        { selector: '.bio-image', animationClass: 'slide-left' },
        { selector: '.book-card:nth-child(odd)', animationClass: 'slide-right' },
        { selector: '.book-card:nth-child(even)', animationClass: 'slide-up' },
        { selector: '.article-card:nth-child(3n+1)', animationClass: 'slide-up' },
        { selector: '.article-card:nth-child(3n+2)', animationClass: 'zoom-in' },
        { selector: '.article-card:nth-child(3n+3)', animationClass: 'slide-left' },
        { selector: '.gallery-item', animationClass: 'zoom-in' },
        { selector: '.testimonial-card', animationClass: 'fade-in' },
        { selector: '.achievement-item:nth-child(odd)', animationClass: 'slide-right' },
        { selector: '.achievement-item:nth-child(even)', animationClass: 'slide-left' },
        { selector: '.contact-form', animationClass: 'zoom-in' },
        { selector: '.contact-info', animationClass: 'slide-right' }
    ];
    
    // Apply animation classes to elements
    animationConfig.forEach(config => {
        const elements = document.querySelectorAll(config.selector);
        elements.forEach((element, index) => {
            // Skip elements already initialized
            if (element.classList.contains('has-animation')) return;
            
            // Add animation classes
            element.classList.add('has-animation');
            element.classList.add(config.animationClass);
            element.classList.add('animate-hidden');
            
            // Add staggered delay for some elements
            if (config.selector.includes('card') || config.selector.includes('item')) {
                element.style.transitionDelay = `${index * 0.1}s`;
            }
        });
    });
    
    // For any elements that didn't match the specific selectors but should be animated
    const additionalElements = [
        '.quote-card',
        '.team-member',
        '.footer-links',
        '.footer-social'
    ];
    
    additionalElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (!element.classList.contains('has-animation')) {
                element.classList.add('has-animation');
                element.classList.add('fade-in');
                element.classList.add('animate-hidden');
            }
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