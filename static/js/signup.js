/**
 * @file Manages the user signup form and registration process.
 * @description Handles form validation, submission, and user feedback for new user registration.
 */

/**
 * Handles the submission of the signup form.
 * @param {Event} e - The form submission event.
 */
async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    if (password !== confirmPassword) {
        errorMessage.textContent = 'كلمات المرور غير متطابقة';
        errorMessage.style.display = 'block';
        return;
    }
    if (password.length < 8) {
        errorMessage.textContent = 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            successMessage.textContent = data.message || 'تم إنشاء الحساب بنجاح!';
            successMessage.style.display = 'block';
            form.reset();
            setTimeout(() => { window.location.href = '/login-form'; }, 3000);
        } else {
            errorMessage.textContent = data.error || 'حدث خطأ ما.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorMessage.textContent = 'حدث خطأ في الاتصال بالخادم.';
        errorMessage.style.display = 'block';
    }
}

/**
 * Initializes the signup page functionality.
 */
function initSignupPage() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

document.addEventListener('DOMContentLoaded', initSignupPage);