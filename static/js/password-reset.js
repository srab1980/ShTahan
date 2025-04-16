/**
 * Password Reset module for Sheikh Mustafa Al-Tahhan website
 * Handles password reset functionality with multiple steps
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the forms
    const resetRequestForm = document.getElementById('resetRequestForm');
    const verificationForm = document.getElementById('verificationForm');
    const newPasswordForm = document.getElementById('newPasswordForm');
    
    // Get reference to the error and success messages
    const emailErrorMessage = document.getElementById('emailErrorMessage');
    const emailSuccessMessage = document.getElementById('emailSuccessMessage');
    const verificationErrorMessage = document.getElementById('verificationErrorMessage');
    const passwordErrorMessage = document.getElementById('passwordErrorMessage');
    const passwordSuccessMessage = document.getElementById('passwordSuccessMessage');
    
    // Store user email for the process
    let userEmail = '';
    
    // Add event listeners for form submissions
    if (resetRequestForm) {
        resetRequestForm.addEventListener('submit', handleResetRequest);
    }
    
    if (verificationForm) {
        verificationForm.addEventListener('submit', handleVerification);
    }
    
    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', handlePasswordReset);
    }
    
    /**
     * Handle reset request form submission (Step 1)
     * @param {Event} e - Form submit event
     */
    async function handleResetRequest(e) {
        e.preventDefault();
        
        // Get email
        const email = document.getElementById('email').value;
        userEmail = email;
        
        // Reset messages
        emailErrorMessage.style.display = 'none';
        emailSuccessMessage.style.display = 'none';
        
        try {
            // Send reset request to server
            const response = await fetch('/password-reset/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Successfully sent reset email
                emailSuccessMessage.textContent = data.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني';
                emailSuccessMessage.style.display = 'block';
                
                // In a real application, transition to verification step
                // For demonstration, we'll simulate this transition
                setTimeout(() => {
                    showStep(2);
                }, 2000);
            } else {
                // Show error message
                emailErrorMessage.textContent = data.error || 'لم يتم العثور على حساب بهذا البريد الإلكتروني';
                emailErrorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Reset request error:', error);
            emailErrorMessage.textContent = 'حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.';
            emailErrorMessage.style.display = 'block';
        }
    }
    
    /**
     * Handle verification code form submission (Step 2)
     * @param {Event} e - Form submit event
     */
    async function handleVerification(e) {
        e.preventDefault();
        
        // Get verification code
        const code = document.getElementById('verificationCode').value;
        
        // Reset messages
        verificationErrorMessage.style.display = 'none';
        
        try {
            // Send verification request to server
            const response = await fetch('/password-reset/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: userEmail,
                    code 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Successfully verified code
                // Transition to password reset step
                showStep(3);
            } else {
                // Show error message
                verificationErrorMessage.textContent = data.error || 'رمز التحقق غير صحيح';
                verificationErrorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Verification error:', error);
            verificationErrorMessage.textContent = 'حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.';
            verificationErrorMessage.style.display = 'block';
        }
    }
    
    /**
     * Handle new password form submission (Step 3)
     * @param {Event} e - Form submit event
     */
    async function handlePasswordReset(e) {
        e.preventDefault();
        
        // Get new passwords
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Reset messages
        passwordErrorMessage.style.display = 'none';
        passwordSuccessMessage.style.display = 'none';
        
        // Basic validation
        if (newPassword !== confirmPassword) {
            passwordErrorMessage.textContent = 'كلمات المرور غير متطابقة';
            passwordErrorMessage.style.display = 'block';
            return;
        }
        
        if (newPassword.length < 8) {
            passwordErrorMessage.textContent = 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل';
            passwordErrorMessage.style.display = 'block';
            return;
        }
        
        try {
            // Send password reset request to server
            const response = await fetch('/password-reset/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: userEmail,
                    password: newPassword 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Successfully reset password
                passwordSuccessMessage.textContent = data.message || 'تم تغيير كلمة المرور بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول';
                passwordSuccessMessage.style.display = 'block';
                
                // Redirect to login page after delay
                setTimeout(() => {
                    window.location.href = '/login-form';
                }, 3000);
            } else {
                // Show error message
                passwordErrorMessage.textContent = data.error || 'حدث خطأ أثناء تغيير كلمة المرور. الرجاء المحاولة مرة أخرى.';
                passwordErrorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Password reset error:', error);
            passwordErrorMessage.textContent = 'حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.';
            passwordErrorMessage.style.display = 'block';
        }
    }
    
    /**
     * Show the specified step in the password reset process
     * @param {number} stepNumber - The step number to show (1, 2, or 3)
     */
    function showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.reset-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show the requested step
        const steps = document.querySelectorAll('.reset-step');
        if (stepNumber > 0 && stepNumber <= steps.length) {
            steps[stepNumber - 1].classList.add('active');
        }
        
        // Update header text based on step
        const headerText = document.querySelector('.reset-header p');
        if (headerText) {
            switch (stepNumber) {
                case 1:
                    headerText.textContent = 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور';
                    break;
                case 2:
                    headerText.textContent = 'أدخل رمز التحقق المرسل إلى بريدك الإلكتروني';
                    break;
                case 3:
                    headerText.textContent = 'أدخل كلمة المرور الجديدة';
                    break;
            }
        }
    }
});