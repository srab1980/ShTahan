/**
 * @file Manages the multi-step password reset process.
 * @description Handles the three steps of password reset: request, verification, and confirmation.
 */

let userEmail = ''; // Store email across steps

/**
 * Displays the specified step of the password reset flow.
 * @param {number} stepNumber - The step to display (1, 2, or 3).
 */
function showStep(stepNumber) {
    document.querySelectorAll('.reset-step').forEach(step => step.classList.remove('active'));
    const steps = document.querySelectorAll('.reset-step');
    if (steps[stepNumber - 1]) {
        steps[stepNumber - 1].classList.add('active');
    }
}

/**
 * Handles the initial password reset request (Step 1).
 * @param {Event} e - The form submission event.
 */
async function handleResetRequest(e) {
    e.preventDefault();
    userEmail = document.getElementById('email').value;
    // UI feedback and API call logic here...
    console.log(`Requesting reset for ${userEmail}`);
    // Simulate success and move to next step
    showStep(2);
}

/**
 * Handles the verification code submission (Step 2).
 * @param {Event} e - The form submission event.
 */
async function handleVerification(e) {
    e.preventDefault();
    const code = document.getElementById('verificationCode').value;
    // UI feedback and API call logic here...
    console.log(`Verifying code ${code} for ${userEmail}`);
    // Simulate success and move to next step
    showStep(3);
}

/**
 * Handles the final new password submission (Step 3).
 * @param {Event} e - The form submission event.
 */
async function handlePasswordReset(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    // UI feedback and API call logic here...
    console.log(`Resetting password for ${userEmail}`);
    alert('Password has been reset successfully.');
    window.location.href = '/login-form';
}

/**
 * Initializes the password reset page event listeners.
 */
function initPasswordReset() {
    document.getElementById('resetRequestForm')?.addEventListener('submit', handleResetRequest);
    document.getElementById('verificationForm')?.addEventListener('submit', handleVerification);
    document.getElementById('newPasswordForm')?.addEventListener('submit', handlePasswordReset);
}

document.addEventListener('DOMContentLoaded', initPasswordReset);