/**
 * @file Main JavaScript file for the Sheikh Mustafa Al-Tahhan website.
 * @description This file handles global site functionality, including mobile navigation,
 * smooth scrolling, header effects, and the contact form.
 */

/**
 * Toggles the mobile navigation menu.
 * @param {HTMLElement} menuToggle - The button element that toggles the menu.
 * @param {HTMLElement} navMenu - The navigation menu element.
 * @param {HTMLElement} navigation - The main navigation container.
 */
function toggleMobileMenu(menuToggle, navMenu, navigation) {
    const expanded = navMenu.classList.toggle('active');
    navigation.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', expanded);
    const icon = menuToggle.querySelector('i');
    if (expanded) {
        icon.classList.replace('fa-bars', 'fa-times');
        document.body.style.overflow = 'hidden';
    } else {
        icon.classList.replace('fa-times', 'fa-bars');
        document.body.style.overflow = '';
    }
    console.log("Menu state toggled:", expanded ? "open" : "closed");
}

/**
 * Closes the mobile navigation menu.
 * @param {HTMLElement} menuToggle - The button element that toggles the menu.
 * @param {HTMLElement} navMenu - The navigation menu element.
 * @param {HTMLElement} navigation - The main navigation container.
 */
function closeMobileMenu(menuToggle, navMenu, navigation) {
    navMenu.classList.remove('active');
    navigation.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    const icon = menuToggle.querySelector('i');
    if (icon) {
        icon.classList.replace('fa-times', 'fa-bars');
    }
    document.body.style.overflow = '';
    console.log("Menu closed");
}

/**
 * Initializes the mobile menu functionality.
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navigation = document.querySelector('.navigation');

    if (!menuToggle || !navMenu || !navigation) {
        console.warn("Mobile menu elements not found in document");
        return;
    }

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu(menuToggle, navMenu, navigation);
    });

    document.addEventListener('click', (event) => {
        if (navMenu.classList.contains('active')) {
            const isClickInside = navigation.contains(event.target) || menuToggle.contains(event.target);
            if (!isClickInside) {
                closeMobileMenu(menuToggle, navMenu, navigation);
            }
        }
    });

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 991 && navMenu.classList.contains('active')) {
                closeMobileMenu(menuToggle, navMenu, navigation);
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        setTimeout(() => {
                            window.scrollTo({ top: targetElement.offsetTop - 70, behavior: 'smooth' });
                        }, 300);
                    }
                }
            }
        });
    });
}

/**
 * Initializes smooth scrolling for on-page anchor links.
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (window.innerWidth > 991) {
                e.preventDefault();
                try {
                    const targetElement = document.querySelector(this.getAttribute('href'));
                    if (targetElement) {
                        window.scrollTo({ top: targetElement.offsetTop - 70, behavior: 'smooth' });
                    }
                } catch (error) {
                    console.error('Smooth scroll error:', error);
                }
            }
        });
    });
}

/**
 * Initializes the header scroll effect.
 * The header becomes more compact when the user scrolls down.
 */
function setupHeaderScrollEffect() {
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 100);
        });
    }
}

/**
 * Initializes the contact form submission logic.
 */
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                alert('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            alert('تم إرسال رسالتك بنجاح، سنتواصل معك قريبًا');
            contactForm.reset();
        });
    }
}

/**
 * Initializes the login button functionality.
 */
function setupLoginButton() {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = '/login';
        });
    }
}

/**
 * Main DOMContentLoaded event listener.
 * Initializes all the site's functionalities.
 */
document.addEventListener('DOMContentLoaded', function () {
    setupLoginButton();
    setupMobileMenu();
    setupSmoothScrolling();
    setupHeaderScrollEffect();
    setupContactForm();
});
