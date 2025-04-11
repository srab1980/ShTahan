/**
 * Main JavaScript file for Sheikh Mustafa Al-Tahhan website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Login Button Functionality - Direct JavaScript redirect to login page
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            window.location.href = '/login';
        });
    }
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navigation = document.querySelector('.navigation');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            // Add an attribute for accessibility
            const expanded = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', expanded);
            
            // Change the icon based on state
            const icon = menuToggle.querySelector('i');
            if (expanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        // Check if the navigation exists and is open
        if (navigation && navMenu.classList.contains('active')) {
            // Check if click is outside the navigation
            const isClickInside = navigation.contains(event.target) || 
                                menuToggle.contains(event.target);
            
            if (!isClickInside) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
    
    // Close menu when clicking on a nav link (but don't interfere with the navigation)
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Just close the mobile menu - don't prevent default navigation
            navMenu.classList.remove('active');
            
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
            
            // Don't stop propagation, so the actual link still works
            // Let the regular navigation happen for links to other pages
        });
    });
    
    // Smooth scrolling for navigation links - ONLY for within-page links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Only apply to links that start with # (within-page links)
        // This excludes absolute links like /login or /admin
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip entirely if the href is just "#" (like in "Read More" buttons)
            if (targetId === '#') {
                // Let the default behavior happen for these links
                return;
            }
            
            // For actual section links (like #biography, #books, etc.)
            e.preventDefault();
            
            try {
                // Use getElementById instead of querySelector for better error handling with fragments
                const sectionId = targetId.substring(1); // Remove the # character
                const targetElement = document.getElementById(sectionId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            } catch (error) {
                console.log('Smooth scroll error:', error);
            }
        });
    });
    
    // Fixed header on scroll
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.padding = '10px 0';
        } else {
            header.style.padding = '15px 0';
        }
    });
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            
            // In a real application, you would send this data to the server
            // For this demo, we'll just show a success message
            alert('تم إرسال رسالتك بنجاح، سنتواصل معك قريبًا');
            contactForm.reset();
        });
    }
});
