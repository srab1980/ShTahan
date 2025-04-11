/**
 * Login module for Sheikh Mustafa Al-Tahhan website
 * Handles user authentication and login/logout functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the login form
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    // Add a parameter to URL to control whether to check auth status
    const urlParams = new URLSearchParams(window.location.search);
    const shouldCheckAuth = urlParams.get('check_auth') !== 'false';
    
    // Only check auth status if the parameter is not set to false
    if (shouldCheckAuth) {
        // Check if user is already logged in
        checkAuthStatus();
    }
    
    // Add event listener for form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    /**
     * Handle login form submission
     * @param {Event} e - Form submit event
     */
    async function handleLogin(e) {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Reset error message
        errorMessage.style.display = 'none';
        
        try {
            // Send login request to server
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Successful login, redirect based on user role
                if (data.user && data.user.role === 'admin') {
                    window.location.href = '/admin';
                } else if (data.user && data.user.role === 'editor') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            } else {
                // Show error message
                errorMessage.textContent = data.error || 'Invalid username or password';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        }
    }
    
    /**
     * Check if the user is already authenticated
     */
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth-status');
            const data = await response.json();
            
            // Only redirect if on login form page and already authenticated
            if (data.authenticated && window.location.pathname === '/login-form') {
                if (data.role === 'admin' || data.role === 'editor') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            }
        } catch (error) {
            console.error('Auth status check error:', error);
            // Don't redirect on error, just stay on current page
        }
    }
});