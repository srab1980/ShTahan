/**
 * Main JavaScript file for Sheikh Mustafa Al-Tahhan website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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
