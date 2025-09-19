/**
 * @file Manages the admin dashboard, including authentication, statistics, and activity feeds.
 * @author Your Name
 */

/**
 * Converts a user role string to its Arabic equivalent.
 * @param {string} role - The user role ('admin', 'editor', 'user').
 * @returns {string} The Arabic label for the role.
 */
function getRoleLabel(role) {
    const roles = {
        admin: 'مدير',
        editor: 'محرر',
        user: 'مستخدم'
    };
    return roles[role] || 'مستخدم';
}

/**
 * Checks the user's authentication status and updates the UI accordingly.
 * Redirects to login if not authenticated or an error occurs.
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = '/login';
            return;
        }

        document.getElementById('userName').innerHTML = `مرحباً، <strong>${data.username}</strong>`;
        document.getElementById('userRole').textContent = getRoleLabel(data.role);

        if (data.role !== 'admin') {
            const userManagementLink = document.getElementById('userManagementLink');
            if (userManagementLink) {
                userManagementLink.parentElement.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Auth status check error:', error);
        window.location.href = '/login';
    }
}

/**
 * Fetches and displays content counts for the dashboard statistics.
 */
async function loadDashboardStats() {
    try {
        const [booksRes, articlesRes, galleryRes] = await Promise.all([
            fetch('/api/books'),
            fetch('/api/articles'),
            fetch('/api/gallery')
        ]);

        const booksData = await booksRes.json();
        const articlesData = await articlesRes.json();
        const galleryData = await galleryRes.json();

        document.getElementById('booksCount').textContent = booksData.books.length;
        document.getElementById('articlesCount').textContent = articlesData.articles.length;
        document.getElementById('galleryCount').textContent = galleryData.images.length;
        document.getElementById('messagesCount').textContent = "0"; // Placeholder
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Formats a timestamp into a relative "time ago" string in Arabic.
 * @param {Date} timestamp - The date object to format.
 * @returns {string} The formatted relative time string.
 */
function formatTimeAgo(timestamp) {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    const minute = 60, hour = 3600, day = 86400;

    if (diff < minute) return 'منذ لحظات';
    if (diff < hour) return `منذ ${Math.floor(diff / minute)} دقيقة`;
    if (diff < day) return `منذ ${Math.floor(diff / hour)} ساعة`;
    if (diff < day * 30) return `منذ ${Math.floor(diff / day)} يوم`;
    return `${timestamp.getDate()}/${timestamp.getMonth() + 1}/${timestamp.getFullYear()}`;
}

/**
 * Renders the list of recent activities on the dashboard.
 * @param {Array<Object>} activities - An array of activity objects from the API.
 */
function renderRecentActivities(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    activityList.innerHTML = '';

    if (!activities || activities.length === 0) {
        activityList.innerHTML = '<li class="activity-item"><p>لا توجد نشاطات حديثة</p></li>';
        return;
    }

    activities.forEach(activity => {
        const item = document.createElement('li');
        item.className = 'activity-item';
        const timeAgo = formatTimeAgo(new Date(activity.created_at));
        const icon = getActivityIcon(activity.activity_type);
        const actionText = getActivityActionText(activity.activity_type);

        item.innerHTML = `
            <div class="activity-icon"><i class="${icon}"></i></div>
            <div class="activity-details">
                <h4>${activity.username}</h4>
                <p>${actionText}: ${activity.content_title || ''}</p>
            </div>
            <div class="activity-time">${timeAgo}</div>`;
        activityList.appendChild(item);
    });
}

/**
 * Gets an appropriate icon class based on the activity type.
 * @param {string} type - The activity type string.
 * @returns {string} A Font Awesome icon class.
 */
function getActivityIcon(type) {
    if (type.includes('book')) return 'fas fa-book';
    if (type.includes('article')) return 'fas fa-newspaper';
    if (type.includes('gallery')) return 'fas fa-image';
    if (type === 'login') return 'fas fa-sign-in-alt';
    return 'fas fa-star';
}

/**
 * Gets a descriptive action text based on the activity type.
 * @param {string} type - The activity type string.
 * @returns {string} A string describing the action in Arabic.
 */
function getActivityActionText(type) {
    switch (type) {
        case 'view_book': return 'شاهد كتاب';
        case 'download_book': return 'قام بتنزيل كتاب';
        case 'view_article': return 'قرأ مقال';
        case 'view_gallery': return 'شاهد صورة';
        case 'login': return 'قام بتسجيل الدخول';
        default: return 'قام بنشاط';
    }
}

/**
 * Fetches recent activities from the API and renders them.
 */
async function loadRecentActivities() {
    try {
        const response = await fetch('/api/admin/recent-activities');
        const data = await response.json();
        renderRecentActivities(data.activities);
    } catch (error) {
        console.error('Error loading recent activities:', error);
        const activityList = document.getElementById('activityList');
        if(activityList) activityList.innerHTML = '<li class="activity-item"><p>تعذر تحميل النشاطات الأخيرة</p></li>';
    }
}

/**
 * Initializes the admin dashboard functionality.
 */
function initAdminDashboard() {
    checkAuthStatus();
    loadDashboardStats();
    loadRecentActivities();
}

document.addEventListener('DOMContentLoaded', initAdminDashboard);