/**
 * @file Manages the user administration interface.
 * @description Handles CRUD operations for users, including role and status management.
 */

/**
 * Checks if the current user is an admin and loads user data.
 */
async function checkAuthAndLoadUsers() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        if (!data.authenticated || data.role !== 'admin') {
            alert('Access denied.');
            window.location.href = '/';
            return;
        }
        loadUsers();
    } catch (error) {
        console.error('Authentication check failed:', error);
    }
}

/**
 * Fetches users from the API and renders them in the table.
 */
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const data = await response.json();
        renderUsers(data.users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

/**
 * Renders a list of users into the main table.
 * @param {Array<Object>} users - The array of user objects.
 */
function renderUsers(users) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
        return;
    }
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.active ? 'Active' : 'Inactive'}</td>
            <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</td>
            <td class="user-actions">
                <button class="edit-btn" data-id="${user.id}">Edit</button>
                <button class="toggle-btn" data-id="${user.id}" data-active="${user.active}">${user.active ? 'Disable' : 'Enable'}</button>
                <button class="delete-btn" data-id="${user.id}">Delete</button>
            </td>`;
        tableBody.appendChild(row);
    });
    addTableButtonListeners();
}

/**
 * Adds event listeners to all action buttons in the users table.
 */
function addTableButtonListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => openEditUserModal(e.currentTarget.dataset.id)));
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.addEventListener('click', (e) => toggleUserStatus(e.currentTarget.dataset.id, e.currentTarget.dataset.active === 'false')));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => confirmDeleteUser(e.currentTarget.dataset.id)));
}

/**
 * Initializes the user management page.
 */
function initUserManagement() {
    checkAuthAndLoadUsers();
    // Add event listeners for modal buttons, form submissions etc.
}

document.addEventListener('DOMContentLoaded', initUserManagement);