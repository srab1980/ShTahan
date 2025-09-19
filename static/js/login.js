/**
 * @file Manages the user login form and authentication process.
 * @description Handles form submission, API requests, and redirection upon successful login.
 */

/**
 * Checks if the user is already authenticated and redirects them if so.
 * Prevents logged-in users from seeing the login page unnecessarily.
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        if (data.authenticated && window.location.pathname === '/login-form') {
            window.location.href = (data.role === 'admin' || data.role === 'editor') ? '/admin' : '/';
        }
    } catch (error) {
        console.error('Auth status check error:', error);
    }
}

/**
 * Handles the login form submission.
 * @param {Event} e - The form submission event.
 */
async function handleLogin(e) {
    e.preventDefault();
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';

    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            // On successful login, redirect to the appropriate page.
            window.location.href = (data.user && (data.user.role === 'admin' || data.user.role === 'editor')) ? '/admin' : '/';
        } else {
            errorMessage.textContent = data.error || 'Invalid username or password.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
}

/**
 * Initializes the login page functionality.
 */
function initLoginPage() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('check_auth') !== 'false') {
        checkAuthStatus();
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

document.addEventListener('DOMContentLoaded', initLoginPage);