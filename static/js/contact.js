/**
 * @file Manages the contact form submission.
 * @description Handles validation and submission of the contact form via API.
 */

/**
 * Validates an email address format.
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Displays a status message for the form.
 * @param {string} type - The type of message ('success' or 'error').
 * @param {string} message - The message to display.
 */
function showFormStatus(type, message) {
    const formStatus = document.getElementById('form-status');
    if (!formStatus) return;
    formStatus.className = `form-status ${type}`;
    formStatus.textContent = message;
    formStatus.style.display = 'block';
    setTimeout(() => {
        formStatus.style.display = 'none';
    }, 5000);
}

/**
 * Handles the submission of the contact form.
 * @param {Event} e - The form submission event.
 */
async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = 'جاري الإرسال...';

    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;

    if (!name || !email || !message) {
        showFormStatus('error', 'يرجى ملء جميع الحقول المطلوبة');
        submitButton.disabled = false;
        submitButton.innerHTML = 'إرسال';
        return;
    }
    if (!validateEmail(email)) {
        showFormStatus('error', 'يرجى إدخال عنوان بريد إلكتروني صحيح');
        submitButton.disabled = false;
        submitButton.innerHTML = 'إرسال';
        return;
    }

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message }),
        });
        const result = await response.json();
        if (response.ok) {
            showFormStatus('success', 'تم إرسال رسالتك بنجاح');
            form.reset();
        } else {
            showFormStatus('error', `خطأ: ${result.error || 'حدث خطأ'}`);
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showFormStatus('error', 'حدث خطأ في الاتصال.');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'إرسال';
    }
}

/**
 * Initializes the contact form functionality.
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

document.addEventListener('DOMContentLoaded', initContactForm);