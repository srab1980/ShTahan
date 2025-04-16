/**
 * Change Password module for Sheikh Mustafa Al-Tahhan website
 * Handles password change functionality for authenticated users
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Check authentication status
    checkAuthStatus();
    
    // Add event listener for form submission
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
    
    /**
     * Check if the user is authenticated
     */
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth-status');
            const data = await response.json();
            
            // If not authenticated, redirect to login page
            if (!data.authenticated) {
                window.location.href = '/login-form';
            }
        } catch (error) {
            console.error('Auth status check error:', error);
            // Redirect to login page on error as a safe fallback
            window.location.href = '/login-form';
        }
    }
    
    /**
     * Handle password change form submission
     * @param {Event} e - Form submit event
     */
    async function handlePasswordChange(e) {
        e.preventDefault();
        
        // Get form values
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Reset messages
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        // Basic validation
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
        
        if (currentPassword === newPassword) {
            errorMessage.textContent = 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية';
            errorMessage.style.display = 'block';
            return;
        }
        
        try {
            // Send password change request to server
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Successfully changed password
                successMessage.textContent = data.message || 'تم تغيير كلمة المرور بنجاح!';
                successMessage.style.display = 'block';
                
                // Clear form
                changePasswordForm.reset();
                
                // Add a slight delay before redirecting if needed
                // setTimeout(() => {
                //     window.location.href = '/admin';
                // }, 3000);
            } else {
                // Show error message
                errorMessage.textContent = data.error || 'حدث خطأ أثناء تغيير كلمة المرور. الرجاء المحاولة مرة أخرى.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Password change error:', error);
            errorMessage.textContent = 'حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.';
            errorMessage.style.display = 'block';
        }
    }
    
    // Password strength validation (optional enhancement)
    const passwordInput = document.getElementById('newPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            // Password strength checking could be added here
        });
    }
});