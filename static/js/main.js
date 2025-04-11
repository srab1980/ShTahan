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
    
    // Enhanced Mobile menu toggle with animation and improved accessibility
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navigation = document.querySelector('.navigation');
    
    if (menuToggle && navMenu && navigation) {
        console.log("Mobile menu elements found, setting up interactions");
        
        // Toggle menu on hamburger click
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            
            // Toggle classes on both menu and navigation for layered effects
            navMenu.classList.toggle('active');
            navigation.classList.toggle('active');
            
            // Update ARIA attributes for accessibility
            const expanded = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', expanded);
            
            // Change icon based on menu state
            const icon = menuToggle.querySelector('i');
            if (expanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = ''; // Restore scrolling
            }
            
            console.log("Menu state toggled:", expanded ? "open" : "closed");
        });
    } else {
        console.warn("Mobile menu elements not found in document");
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        // Check if the navigation exists and menu is open
        if (navigation && navMenu && navMenu.classList.contains('active')) {
            // Check if click is outside the navigation and menu toggle
            const isClickInside = navigation.contains(event.target) || 
                                menuToggle.contains(event.target);
            
            if (!isClickInside) {
                // Close the menu
                navMenu.classList.remove('active');
                navigation.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                
                // Reset icon
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
                
                // Restore scrolling
                document.body.style.overflow = '';
                
                console.log("Menu closed by outside click");
            }
        }
    });
    
    // Close menu when clicking on a nav link (for better mobile experience)
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Only for mobile menu state
            if (window.innerWidth <= 991 && navMenu.classList.contains('active')) {
                // Close the menu
                navMenu.classList.remove('active');
                navigation.classList.remove('active');
                
                if (menuToggle) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
                
                // Restore scrolling
                document.body.style.overflow = '';
                
                console.log("Menu closed by nav link click");
                
                // If it's an on-page link, handle the smooth scroll manually
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetElement = document.getElementById(targetId.substring(1));
                    
                    if (targetElement) {
                        // Small delay to allow menu closing animation to complete
                        setTimeout(() => {
                            window.scrollTo({
                                top: targetElement.offsetTop - 70,
                                behavior: 'smooth'
                            });
                        }, 300);
                    }
                }
            }
        });
    });
    
    // Enhanced smooth scrolling for navigation links - ONLY for within-page links
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Only handle desktop clicks here - mobile is handled in the section above
            if (window.innerWidth > 991) {
                e.preventDefault();
                
                try {
                    const targetId = this.getAttribute('href');
                    const sectionId = targetId.substring(1);
                    const targetElement = document.getElementById(sectionId);
                    
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 70,
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    console.error('Smooth scroll error:', error);
                }
            }
        });
    });
    
    // Refined header scroll behavior
    const header = document.getElementById('header');
    
    if (header) {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Compact header on scroll down
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
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
