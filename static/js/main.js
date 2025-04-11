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
    
    // Enhanced Mobile menu toggle with animation
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const menuItems = document.querySelectorAll('.nav-menu li');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Add staggered animation to menu items
            if (navMenu.classList.contains('active')) {
                menuItems.forEach((item, index) => {
                    // Set a custom property for staggered animation
                    item.style.setProperty('--i', index);
                    // Reset animation
                    item.style.animation = 'none';
                    item.offsetHeight; // Trigger reflow
                    item.style.animation = null;
                });
            }
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && navMenu.classList.contains('active')) {
            // If clicked element is not part of the menu and not the toggle button
            if (!navMenu.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        }
    });
    
    // Close menu when clicking on a nav link (but don't interfere with the navigation)
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Just close the mobile menu - don't prevent default navigation
            if (navMenu) {
                navMenu.classList.remove('active');
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
                    
                    // Update URL without reloading the page
                    window.history.pushState(null, '', targetId);
                }
            } catch (error) {
                console.log('Smooth scroll error:', error);
            }
        });
    });
    
    // Enhanced header effects on scroll
    const header = document.getElementById('header');
    const logo = document.querySelector('.logo a');
    let lastScrollPosition = 0;
    let ticking = false;
    
    function handleScroll() {
        const currentScrollPosition = window.scrollY;
        
        // Adjust header size on scroll
        if (currentScrollPosition > 100) {
            header.classList.add('scrolled');
            if (logo) {
                logo.style.fontSize = '1.4rem';
            }
        } else {
            header.classList.remove('scrolled');
            if (logo) {
                logo.style.fontSize = '1.6rem';
            }
        }
        
        // Show/hide header on scroll up/down
        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 200) {
            // Scrolling down - hide header
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show header
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollPosition = currentScrollPosition;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    });
    
    // Add active class to current navigation item based on section visibility
    const sections = document.querySelectorAll('section[id]');
    
    function setActiveNavItem() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', setActiveNavItem);
    
    // Contact form submission with validation
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form fields
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            const formStatus = document.querySelector('.form-status');
            
            // Reset previous error styling
            [name, email, message].forEach(field => {
                field.classList.remove('error');
            });
            
            // Validation
            let isValid = true;
            
            if (!name.value.trim()) {
                name.classList.add('error');
                isValid = false;
            }
            
            if (!email.value.trim()) {
                email.classList.add('error');
                isValid = false;
            } else if (!isValidEmail(email.value)) {
                email.classList.add('error');
                isValid = false;
            }
            
            if (!message.value.trim()) {
                message.classList.add('error');
                isValid = false;
            }
            
            if (!isValid) {
                if (formStatus) {
                    formStatus.className = 'form-status error';
                    formStatus.textContent = 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح';
                    formStatus.style.display = 'block';
                }
                return;
            }
            
            // Submit form via fetch API to the backend
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'جاري الإرسال...';
            }
            
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.value,
                    email: email.value,
                    message: message.value
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (formStatus) {
                        formStatus.className = 'form-status success';
                        formStatus.textContent = 'تم إرسال رسالتك بنجاح، سنتواصل معك قريبًا';
                        formStatus.style.display = 'block';
                    }
                    contactForm.reset();
                } else {
                    if (formStatus) {
                        formStatus.className = 'form-status error';
                        formStatus.textContent = data.error || 'حدث خطأ ما، يرجى المحاولة مرة أخرى';
                        formStatus.style.display = 'block';
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (formStatus) {
                    formStatus.className = 'form-status error';
                    formStatus.textContent = 'حدث خطأ ما، يرجى المحاولة مرة أخرى';
                    formStatus.style.display = 'block';
                }
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'إرسال';
                }
            });
        });
    }
    
    // Email validation helper function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Add CSS classes for the active item in navigation
    // Add this to style.css if not already present
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu a.active {
            color: var(--gold-color);
            font-weight: 600;
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .nav-menu a.active::after {
            width: calc(100% - 30px);
        }
        
        #header {
            transition: transform 0.3s ease, padding 0.3s ease;
        }
        
        #header.scrolled {
            padding: 5px 0;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
        }
        
        .form-group input.error,
        .form-group textarea.error {
            border-color: #f44336;
            background-color: rgba(244, 67, 54, 0.05);
        }
    `;
    document.head.appendChild(style);
});
