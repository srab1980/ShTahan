/**
 * Admin Dashboard module for Sheikh Mustafa Al-Tahhan website
 * Handles admin dashboard functionality and statistics
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated and has admin/editor role
    checkAuthStatus();
    
    // Load dashboard statistics
    loadDashboardStats();
    
    // Add event listener for user management link (only visible to admins)
    const userManagementLink = document.getElementById('userManagementLink');
    if (userManagementLink) {
        userManagementLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirect to user management page or show user management UI
            // This would be implemented separately
        });
    }
    
    /**
     * Check if the user is authenticated and has appropriate role
     */
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
            
            // Hide user management link if not admin
            if (data.role !== 'admin' && userManagementLink) {
                userManagementLink.parentElement.style.display = 'none';
            }
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
     * Load dashboard statistics
     */
    async function loadDashboardStats() {
        try {
            // Fetch books count
            const booksResponse = await fetch('/api/books');
            const booksData = await booksResponse.json();
            document.getElementById('booksCount').textContent = booksData.books.length;
            
            // Fetch articles count
            const articlesResponse = await fetch('/api/articles');
            const articlesData = await articlesResponse.json();
            document.getElementById('articlesCount').textContent = articlesData.articles.length;
            
            // Fetch gallery count
            const galleryResponse = await fetch('/api/gallery');
            const galleryData = await galleryResponse.json();
            document.getElementById('galleryCount').textContent = galleryData.images.length;
            
            // For messages, we would need a dedicated API endpoint
            // For now, set to 0 or hide this stat
            document.getElementById('messagesCount').textContent = "0";
            
            // Generate some recent activity (in a real app, this would come from an API)
            generateRecentActivity(booksData.books, articlesData.articles, galleryData.images);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }
    
    /**
     * Generate recent activity list based on content timestamps
     * @param {Array} books - Books array
     * @param {Array} articles - Articles array
     * @param {Array} images - Gallery images array
     */
    function generateRecentActivity(books, articles, images) {
        const activityList = document.getElementById('activityList');
        const allItems = [];
        
        // Process books
        books.forEach(book => {
            allItems.push({
                type: 'book',
                title: book.title,
                timestamp: new Date(book.created_at),
                icon: 'fas fa-book'
            });
        });
        
        // Process articles
        articles.forEach(article => {
            allItems.push({
                type: 'article',
                title: article.title,
                timestamp: new Date(article.created_at),
                icon: 'fas fa-newspaper'
            });
        });
        
        // Process gallery images
        images.forEach(image => {
            allItems.push({
                type: 'image',
                title: image.caption,
                timestamp: new Date(image.created_at),
                icon: 'fas fa-image'
            });
        });
        
        // Sort by timestamp (newest first)
        allItems.sort((a, b) => b.timestamp - a.timestamp);
        
        // Take the 5 most recent items
        const recentItems = allItems.slice(0, 5);
        
        // Clear existing items
        activityList.innerHTML = '';
        
        // If no items, show a message
        if (recentItems.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'activity-item';
            emptyItem.innerHTML = '<p>لا توجد نشاطات حديثة</p>';
            activityList.appendChild(emptyItem);
            return;
        }
        
        // Add items to the list
        recentItems.forEach(item => {
            const activityItem = document.createElement('li');
            activityItem.className = 'activity-item';
            
            // Format timestamp relative to now
            const timeAgo = formatTimeAgo(item.timestamp);
            
            // Get type label in Arabic
            let typeLabel = '';
            switch(item.type) {
                case 'book':
                    typeLabel = 'كتاب';
                    break;
                case 'article':
                    typeLabel = 'مقال';
                    break;
                case 'image':
                    typeLabel = 'صورة';
                    break;
            }
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="${item.icon}"></i>
                </div>
                <div class="activity-details">
                    <h4>${item.title}</h4>
                    <p>تم إضافة ${typeLabel} جديد</p>
                </div>
                <div class="activity-time">${timeAgo}</div>
            `;
            
            activityList.appendChild(activityItem);
        });
    }
    
    /**
     * Format timestamp as relative time (e.g. "5 minutes ago")
     * @param {Date} timestamp - Date object
     * @returns {string} Formatted time string in Arabic
     */
    function formatTimeAgo(timestamp) {
        const now = new Date();
        const diff = Math.floor((now - timestamp) / 1000); // difference in seconds
        
        if (diff < 60) {
            return 'منذ لحظات';
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `منذ ${minutes} دقيقة`;
        } else if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `منذ ${hours} ساعة`;
        } else if (diff < 2592000) {
            const days = Math.floor(diff / 86400);
            return `منذ ${days} يوم`;
        } else {
            // Format as date for older items
            return `${timestamp.getDate()}/${timestamp.getMonth() + 1}/${timestamp.getFullYear()}`;
        }
    }
});