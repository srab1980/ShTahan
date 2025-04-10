/**
 * User Management module for Sheikh Mustafa Al-Tahhan website
 * Handles user CRUD operations and manages roles/permissions
 * This module is only accessible to administrators
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated and has admin role
    checkAuthStatus();
    
    // DOM elements
    const usersTableBody = document.getElementById('usersTableBody');
    const userModal = document.getElementById('userModal');
    const userForm = document.getElementById('userForm');
    const modalTitle = document.getElementById('modalTitle');
    const addUserBtn = document.getElementById('addUserBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const passwordField = document.getElementById('password');
    const passwordHint = document.getElementById('passwordHint');
    
    // Check if current user is admin and can access this page
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth-status');
            const data = await response.json();
            
            if (!data.authenticated) {
                // If not authenticated, redirect to login page
                window.location.href = '/login';
                return;
            }
            
            // Update UI with user information
            document.getElementById('userName').innerHTML = `مرحباً، <strong>${data.username}</strong>`;
            document.getElementById('userRole').textContent = getRoleLabel(data.role);
            
            // Only allow admins to access this page
            if (data.role !== 'admin') {
                alert('عذراً، لا تملك صلاحية الوصول إلى هذه الصفحة');
                window.location.href = '/admin';
                return;
            }
            
            // Load users data
            loadUsers();
        } catch (error) {
            console.error('Auth status check error:', error);
            // Redirect to login on error
            window.location.href = '/login';
        }
    }
    
    /**
     * Get Arabic label for user role
     * @param {string} role - User role (admin, editor, user)
     * @returns {string} Arabic role label
     */
    function getRoleLabel(role) {
        switch(role) {
            case 'admin':
                return 'مدير';
            case 'editor':
                return 'محرر';
            default:
                return 'مستخدم';
        }
    }
    
    /**
     * Load users from the server
     */
    async function loadUsers() {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            renderUsers(data.users);
        } catch (error) {
            console.error('Error loading users:', error);
            showErrorMessage('حدث خطأ أثناء تحميل بيانات المستخدمين');
        }
    }
    
    /**
     * Render users in the table
     * @param {Array} users - Array of user objects
     */
    function renderUsers(users) {
        usersTableBody.innerHTML = '';
        
        if (users.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" style="text-align: center;">لا يوجد مستخدمين</td>';
            usersTableBody.appendChild(emptyRow);
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Format last login date
            const lastLogin = user.last_login ? new Date(user.last_login).toLocaleString('ar-SA') : 'لم يتم تسجيل الدخول بعد';
            
            // Create role badge class
            const roleBadgeClass = `role-badge role-${user.role}`;
            
            // Create status class
            const statusClass = user.active ? 'status-active' : 'status-inactive';
            const statusIcon = user.active ? 'fa-check-circle' : 'fa-times-circle';
            
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="${roleBadgeClass}">${getRoleLabel(user.role)}</span></td>
                <td><i class="fas ${statusIcon} ${statusClass}"></i> ${user.active ? 'نشط' : 'غير نشط'}</td>
                <td>${lastLogin}</td>
                <td class="user-actions">
                    <button class="action-btn edit-btn" data-id="${user.id}">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="action-btn toggle-btn" data-id="${user.id}" data-active="${user.active}">
                        ${user.active ? '<i class="fas fa-ban"></i> تعطيل' : '<i class="fas fa-check"></i> تفعيل'}
                    </button>
                    <button class="action-btn delete-btn" data-id="${user.id}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        addActionButtonListeners();
    }
    
    /**
     * Add event listeners to user action buttons
     */
    function addActionButtonListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.id;
                openEditUserModal(userId);
            });
        });
        
        // Toggle active status buttons
        document.querySelectorAll('.toggle-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.id;
                const currentlyActive = this.dataset.active === 'true';
                toggleUserStatus(userId, !currentlyActive);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.id;
                confirmDeleteUser(userId);
            });
        });
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    function showErrorMessage(message) {
        alert(message); // Simple alert for now, can be replaced with a better UI
    }
    
    /**
     * Open user modal for adding a new user
     */
    function openAddUserModal() {
        // Reset form
        userForm.reset();
        document.getElementById('userId').value = '';
        passwordField.required = true;
        passwordHint.style.display = 'none';
        
        // Update modal title
        modalTitle.textContent = 'إضافة مستخدم جديد';
        
        // Show modal
        userModal.style.display = 'block';
    }
    
    /**
     * Open user modal for editing an existing user
     * @param {string} userId - ID of the user to edit
     */
    async function openEditUserModal(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch user data');
            }
            
            const user = data.user;
            
            // Populate form
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('role').value = user.role;
            document.getElementById('active').checked = user.active;
            
            // Clear password field and make it optional
            document.getElementById('password').value = '';
            passwordField.required = false;
            passwordHint.style.display = 'block';
            
            // Update modal title
            modalTitle.textContent = 'تعديل المستخدم';
            
            // Show modal
            userModal.style.display = 'block';
        } catch (error) {
            console.error('Error loading user data:', error);
            showErrorMessage('حدث خطأ أثناء تحميل بيانات المستخدم');
        }
    }
    
    /**
     * Close the user modal
     */
    function closeUserModal() {
        userModal.style.display = 'none';
    }
    
    /**
     * Handle user form submission
     * @param {Event} e - Form submit event
     */
    async function handleUserFormSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const userId = document.getElementById('userId').value;
        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            active: document.getElementById('active').checked
        };
        
        // Add password if provided
        const password = document.getElementById('password').value;
        if (password) {
            userData.password = password;
        }
        
        try {
            let response;
            
            if (userId) {
                // Update existing user
                response = await fetch(`/api/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                // Add new user
                response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save user');
            }
            
            // Close modal and refresh user list
            closeUserModal();
            loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            showErrorMessage('حدث خطأ أثناء حفظ بيانات المستخدم');
        }
    }
    
    /**
     * Toggle user active status
     * @param {string} userId - ID of the user
     * @param {boolean} newStatus - New active status
     */
    async function toggleUserStatus(userId, newStatus) {
        try {
            const response = await fetch(`/api/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    active: newStatus
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user status');
            }
            
            // Refresh user list
            loadUsers();
        } catch (error) {
            console.error('Error updating user status:', error);
            showErrorMessage('حدث خطأ أثناء تحديث حالة المستخدم');
        }
    }
    
    /**
     * Show confirmation dialog for deleting a user
     * @param {string} userId - ID of the user to delete
     */
    function confirmDeleteUser(userId) {
        if (confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
            deleteUser(userId);
        }
    }
    
    /**
     * Delete a user
     * @param {string} userId - ID of the user to delete
     */
    async function deleteUser(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete user');
            }
            
            // Refresh user list
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            showErrorMessage('حدث خطأ أثناء حذف المستخدم');
        }
    }
    
    // Event listeners
    addUserBtn.addEventListener('click', openAddUserModal);
    closeModal.addEventListener('click', closeUserModal);
    cancelBtn.addEventListener('click', closeUserModal);
    userForm.addEventListener('submit', handleUserFormSubmit);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === userModal) {
            closeUserModal();
        }
    });
});