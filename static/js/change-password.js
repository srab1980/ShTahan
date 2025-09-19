/**
 * @file Manages the "Change Password" form for authenticated users.
 * @description Handles form validation and submission for changing a user's password.
 */

/**
 * Checks if the user is authenticated before allowing access to the page.
 * Redirects to the login page if the user is not authenticated.
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        if (!data.authenticated) {
            window.location.href = '/login-form';
        }
    } catch (error) {
        console.error('Auth status check error:', error);
        window.location.href = '/login-form';
    }
}

/**
 * Handles the submission of the change password form.
 * @param {Event} e - The form submission event.
 */
async function handlePasswordChange(e) {
    e.preventDefault();
    const form = e.target;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    if (newPassword !== confirmPassword) {
        errorMessage.textContent = 'كلمات المرور الجديدة غير متطابقة';
        errorMessage.style.display = 'block';
        return;
    }
    if (newPassword.length < 8) {
        errorMessage.textContent = 'يجب أن تحتوي كلمة المرور الجديدة على 8 أحرف على الأقل';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        });
        const data = await response.json();
        if (response.ok) {
            successMessage.textContent = data.message || 'تم تغيير كلمة المرور بنجاح!';
            successMessage.style.display = 'block';
            form.reset();
        } else {
            errorMessage.textContent = data.error || 'حدث خطأ ما.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Password change error:', error);
        errorMessage.textContent = 'حدث خطأ في الاتصال بالخادم.';
        errorMessage.style.display = 'block';
    }
}

/**
 * Initializes the change password page functionality.
 */
function initChangePasswordPage() {
    checkAuthStatus();
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
}

document.addEventListener('DOMContentLoaded', initChangePasswordPage);