/**
 * Contact form module for Sheikh Mustafa Al-Tahhan website
 * Handles contact form submission
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.querySelector('#contact-form button[type="submit"]');
    const formStatus = document.getElementById('form-status');
    
    // Handle contact form submission
    async function handleContactSubmit(e) {
        e.preventDefault();
        
        if (!contactForm) return;
        
        // Disable submit button to prevent multiple submissions
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = 'جاري الإرسال...';
        }
        
        // Get form data
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;
        
        // Validate form data
        if (!name || !email || !message) {
            showFormStatus('error', 'يرجى ملء جميع الحقول المطلوبة');
            resetSubmitButton();
            return;
        }
        
        // Basic email validation
        if (!validateEmail(email)) {
            showFormStatus('error', 'يرجى إدخال عنوان بريد إلكتروني صحيح');
            resetSubmitButton();
            return;
        }
        
        try {
            // Send form data to server
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Show success message
                showFormStatus('success', 'تم إرسال رسالتك بنجاح');
                
                // Reset form
                contactForm.reset();
            } else {
                // Show error message
                showFormStatus('error', `خطأ: ${result.error || 'حدث خطأ أثناء إرسال الرسالة'}`);
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            showFormStatus('error', 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى');
        } finally {
            resetSubmitButton();
        }
    }
    
    // Show form status message
    function showFormStatus(type, message) {
        if (!formStatus) return;
        
        formStatus.className = `form-status ${type}`;
        formStatus.textContent = message;
        formStatus.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
    
    // Reset submit button
    function resetSubmitButton() {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'إرسال';
        }
    }
    
    // Validate email format
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Add event listeners
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});