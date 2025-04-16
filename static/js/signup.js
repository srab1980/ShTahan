/**
 * Signup module for Sheikh Mustafa Al-Tahhan website
 * Handles user registration functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the signup form
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Add event listener for form submission
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    /**
     * Handle signup form submission
     * @param {Event} e - Form submit event
     */
    async function handleSignup(e) {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Reset messages
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        // Basic validation
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
            // Send signup request to server
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Successful signup
                successMessage.textContent = data.message || 'تم إنشاء الحساب بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول.';
                successMessage.style.display = 'block';
                
                // Clear form
                signupForm.reset();
                
                // Redirect to login page after delay
                setTimeout(() => {
                    window.location.href = '/login-form';
                }, 3000);
            } else {
                // Show error message
                errorMessage.textContent = data.error || 'حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Signup error:', error);
            errorMessage.textContent = 'حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.';
            errorMessage.style.display = 'block';
        }
    }
    
    // Password strength validation (optional enhancement)
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            // Password strength checking could be added here
        });
    }
});