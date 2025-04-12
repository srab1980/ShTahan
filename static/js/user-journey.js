/**
 * User Journey Map module for Sheikh Mustafa Al-Tahhan website
 * Provides personalized user journey visualization and activity tracking
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the user journey interface
    initUserJourney();
    
    // Set up preferences form listener
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', saveUserPreferences);
    }
});

/**
 * Initialize user journey interface by loading user data and activities
 */
async function initUserJourney() {
    // Check authentication status
    const authStatus = await checkAuthStatus();
    if (!authStatus.authenticated) {
        // Redirect to login if not authenticated
        window.location.href = '/login-form?redirect=/user-journey';
        return;
    }
    
    // Update user greeting
    updateUserGreeting(authStatus);
    
    // Load user activities
    await loadUserActivities();
    
    // Load statistics
    await loadActivityStatistics();
    
    // Load recommendations based on user activities
    await loadRecommendations();
    
    // Load user preferences
    await loadUserPreferences();
}

/**
 * Check if the user is authenticated
 * @returns {Object} Authentication status
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking authentication status:', error);
        return { authenticated: false };
    }
}

/**
 * Update user greeting with name and status
 * @param {Object} authData - Authentication data
 */
function updateUserGreeting(authData) {
    const userNameElement = document.getElementById('user-name');
    const userStatusElement = document.getElementById('user-status');
    
    if (userNameElement && authData.authenticated) {
        userNameElement.textContent = `أهلاً، ${authData.username}`;
    }
    
    if (userStatusElement && authData.last_login) {
        const lastLogin = new Date(authData.last_login);
        const timeDiff = Math.floor((new Date() - lastLogin) / (1000 * 60 * 60 * 24));
        
        if (timeDiff === 0) {
            userStatusElement.textContent = 'آخر زيارة: اليوم';
        } else if (timeDiff === 1) {
            userStatusElement.textContent = 'آخر زيارة: الأمس';
        } else {
            userStatusElement.textContent = `آخر زيارة: منذ ${timeDiff} أيام`;
        }
    }
}

/**
 * Load user activities from the API
 */
async function loadUserActivities() {
    const timelineContainer = document.getElementById('activities-timeline');
    if (!timelineContainer) return;
    
    try {
        const response = await fetch('/api/user/activities');
        
        if (!response.ok) {
            throw new Error('Failed to load activities');
        }
        
        const data = await response.json();
        renderActivitiesTimeline(data.activities);
    } catch (error) {
        console.error('Error loading user activities:', error);
        timelineContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>حدث خطأ أثناء تحميل الأنشطة</p>
                <button onclick="loadUserActivities()" class="btn btn-sm btn-primary">إعادة المحاولة</button>
            </div>
        `;
    }
}

/**
 * Render activities timeline
 * @param {Array} activities - User activities
 */
function renderActivitiesTimeline(activities) {
    const timelineContainer = document.getElementById('activities-timeline');
    if (!timelineContainer) return;
    
    // Clear loading indicator
    timelineContainer.innerHTML = '';
    
    if (!activities || activities.length === 0) {
        timelineContainer.innerHTML = `
            <div class="empty-timeline">
                <i class="fas fa-info-circle"></i>
                <p>لم يتم تسجيل أي نشاط بعد</p>
                <p class="sub-text">تصفح الكتب والمقالات وستظهر أنشطتك هنا</p>
            </div>
        `;
        return;
    }
    
    // Sort activities by date (newest first)
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Group activities by day
    const groupedActivities = groupActivitiesByDay(activities);
    
    // Create timeline HTML
    let timelineHTML = '';
    
    Object.keys(groupedActivities).forEach(day => {
        const dayActivities = groupedActivities[day];
        
        timelineHTML += `
            <div class="timeline-day">
                <div class="timeline-date">${formatDate(day)}</div>
                <div class="timeline-items">
        `;
        
        dayActivities.forEach(activity => {
            const activityIcon = getActivityIcon(activity.activity_type);
            const activityTitle = getActivityTitle(activity);
            const activityLink = getActivityLink(activity);
            
            timelineHTML += `
                <div class="timeline-item">
                    <div class="timeline-icon">
                        <i class="${activityIcon}"></i>
                    </div>
                    <div class="timeline-content">
                        <h4>${activityTitle}</h4>
                        <p>${formatTime(activity.created_at)}</p>
                        ${activityLink ? `<a href="${activityLink}" class="timeline-link">مشاهدة</a>` : ''}
                    </div>
                </div>
            `;
        });
        
        timelineHTML += `
                </div>
            </div>
        `;
    });
    
    timelineContainer.innerHTML = timelineHTML;
}

/**
 * Group activities by day
 * @param {Array} activities - User activities
 * @returns {Object} Activities grouped by day
 */
function groupActivitiesByDay(activities) {
    const grouped = {};
    
    activities.forEach(activity => {
        const date = new Date(activity.created_at);
        const day = date.toISOString().split('T')[0];
        
        if (!grouped[day]) {
            grouped[day] = [];
        }
        
        grouped[day].push(activity);
    });
    
    return grouped;
}

/**
 * Get icon for activity type
 * @param {string} activityType - Type of activity
 * @returns {string} Font Awesome icon class
 */
function getActivityIcon(activityType) {
    const icons = {
        'view_book': 'fas fa-book',
        'download_book': 'fas fa-file-download',
        'view_article': 'fas fa-newspaper',
        'view_gallery': 'fas fa-images',
        'login': 'fas fa-sign-in-alt',
        'update_preferences': 'fas fa-user-cog',
        'contact': 'fas fa-envelope'
    };
    
    return icons[activityType] || 'fas fa-history';
}

/**
 * Get readable title for activity
 * @param {Object} activity - Activity data
 * @returns {string} Activity title
 */
function getActivityTitle(activity) {
    const titles = {
        'view_book': `تصفح كتاب: ${activity.content_title || 'غير معروف'}`,
        'download_book': `تنزيل كتاب: ${activity.content_title || 'غير معروف'}`,
        'view_article': `قراءة مقال: ${activity.content_title || 'غير معروف'}`,
        'view_gallery': 'تصفح معرض الصور',
        'login': 'تسجيل الدخول',
        'update_preferences': 'تحديث التفضيلات الشخصية',
        'contact': 'إرسال رسالة تواصل'
    };
    
    return titles[activity.activity_type] || 'نشاط غير معروف';
}

/**
 * Get link for activity content
 * @param {Object} activity - Activity data
 * @returns {string|null} Link to content or null
 */
function getActivityLink(activity) {
    if (!activity.content_id) return null;
    
    const links = {
        'view_book': `/books?id=${activity.content_id}`,
        'download_book': `/books?id=${activity.content_id}`,
        'view_article': `/articles?id=${activity.content_id}`,
        'view_gallery': '/gallery'
    };
    
    return links[activity.activity_type] || null;
}

/**
 * Format date in Arabic
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'اليوم';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'الأمس';
    } else {
        // Format date in Arabic style
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ar-EG', options);
    }
}

/**
 * Format time in Arabic
 * @param {string} dateTimeStr - Date and time string
 * @returns {string} Formatted time
 */
function formatTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const options = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString('ar-EG', options);
}

/**
 * Load activity statistics for the user
 */
async function loadActivityStatistics() {
    const booksViewedElement = document.getElementById('books-viewed-count');
    const articlesViewedElement = document.getElementById('articles-viewed-count');
    const downloadsElement = document.getElementById('downloads-count');
    const activeDaysElement = document.getElementById('active-days-count');
    
    try {
        const response = await fetch('/api/user/statistics');
        
        if (!response.ok) {
            throw new Error('Failed to load statistics');
        }
        
        const data = await response.json();
        
        // Update statistics in the UI
        if (booksViewedElement) booksViewedElement.textContent = data.books_viewed || 0;
        if (articlesViewedElement) articlesViewedElement.textContent = data.articles_viewed || 0;
        if (downloadsElement) downloadsElement.textContent = data.downloads || 0;
        if (activeDaysElement) activeDaysElement.textContent = data.active_days || 0;
    } catch (error) {
        console.error('Error loading activity statistics:', error);
        
        // Set default values
        if (booksViewedElement) booksViewedElement.textContent = '0';
        if (articlesViewedElement) articlesViewedElement.textContent = '0';
        if (downloadsElement) downloadsElement.textContent = '0';
        if (activeDaysElement) activeDaysElement.textContent = '0';
    }
}

/**
 * Load content recommendations for the user
 */
async function loadRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) return;
    
    try {
        const response = await fetch('/api/user/recommendations');
        
        if (!response.ok) {
            throw new Error('Failed to load recommendations');
        }
        
        const data = await response.json();
        renderRecommendations(data.recommendations);
    } catch (error) {
        console.error('Error loading recommendations:', error);
        recommendationsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>حدث خطأ أثناء تحميل التوصيات</p>
                <button onclick="loadRecommendations()" class="btn btn-sm btn-primary">إعادة المحاولة</button>
            </div>
        `;
    }
}

/**
 * Render content recommendations
 * @param {Array} recommendations - Recommended content items
 */
function renderRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) return;
    
    // Clear loading indicator
    recommendationsContainer.innerHTML = '';
    
    if (!recommendations || recommendations.length === 0) {
        recommendationsContainer.innerHTML = `
            <div class="empty-recommendations">
                <i class="fas fa-info-circle"></i>
                <p>لم يتم إنشاء توصيات شخصية بعد</p>
                <p class="sub-text">تصفح المزيد من المحتوى لتحسين التوصيات الشخصية</p>
            </div>
        `;
        return;
    }
    
    // Render each recommendation
    recommendations.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `recommendation-item ${item.type}`;
        
        // Generate HTML based on content type
        if (item.type === 'book') {
            itemElement.innerHTML = `
                <div class="recommendation-cover">
                    <img src="${item.cover}" alt="${item.title}" loading="lazy">
                </div>
                <div class="recommendation-details">
                    <h4>${item.title}</h4>
                    <p class="recommendation-type">كتاب</p>
                    <a href="/books?id=${item.id}" class="btn btn-sm btn-primary">تصفح الكتاب</a>
                </div>
            `;
        } else if (item.type === 'article') {
            itemElement.innerHTML = `
                <div class="recommendation-details">
                    <h4>${item.title}</h4>
                    <p>${item.summary.substring(0, 100)}${item.summary.length > 100 ? '...' : ''}</p>
                    <p class="recommendation-type">مقال</p>
                    <a href="/articles?id=${item.id}" class="btn btn-sm btn-primary">قراءة المقال</a>
                </div>
            `;
        }
        
        recommendationsContainer.appendChild(itemElement);
    });
}

/**
 * Load user preferences
 */
async function loadUserPreferences() {
    const preferencesForm = document.getElementById('preferences-form');
    if (!preferencesForm) return;
    
    try {
        const response = await fetch('/api/user/preferences');
        
        if (!response.ok) {
            throw new Error('Failed to load preferences');
        }
        
        const data = await response.json();
        
        // Populate form fields with user preferences
        if (data.preferences) {
            const prefs = data.preferences;
            
            // Set preferred language
            const langSelect = document.getElementById('pref-language');
            if (langSelect && prefs.preferred_language) {
                langSelect.value = prefs.preferred_language;
            }
            
            // Set preferred categories
            if (prefs.categories) {
                const categoryCheckboxes = document.querySelectorAll('input[name="categories"]');
                categoryCheckboxes.forEach(checkbox => {
                    if (prefs.categories.includes(checkbox.value)) {
                        checkbox.checked = true;
                    }
                });
            }
            
            // Set notification preferences
            if (prefs.notifications) {
                const notificationCheckboxes = document.querySelectorAll('input[name="notifications"]');
                notificationCheckboxes.forEach(checkbox => {
                    if (prefs.notifications.includes(checkbox.value)) {
                        checkbox.checked = true;
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
}

/**
 * Save user preferences
 * @param {Event} e - Form submit event
 */
async function saveUserPreferences(e) {
    e.preventDefault();
    
    const preferencesForm = document.getElementById('preferences-form');
    if (!preferencesForm) return;
    
    // Collect form data
    const preferredLanguage = document.getElementById('pref-language').value;
    
    const categoryCheckboxes = document.querySelectorAll('input[name="categories"]:checked');
    const categories = Array.from(categoryCheckboxes).map(cb => cb.value);
    
    const notificationCheckboxes = document.querySelectorAll('input[name="notifications"]:checked');
    const notifications = Array.from(notificationCheckboxes).map(cb => cb.value);
    
    // Create preferences object
    const preferences = {
        preferred_language: preferredLanguage,
        categories: categories,
        notifications: notifications
    };
    
    try {
        const response = await fetch('/api/user/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ preferences })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save preferences');
        }
        
        // Show success message
        showNotification('تم حفظ التفضيلات بنجاح', 'success');
        
        // Record the activity
        recordActivity('update_preferences');
    } catch (error) {
        console.error('Error saving preferences:', error);
        showNotification('حدث خطأ أثناء حفظ التفضيلات', 'error');
    }
}

/**
 * Record user activity
 * @param {string} activityType - Type of activity
 * @param {Object} details - Additional activity details
 */
async function recordActivity(activityType, details = {}) {
    try {
        await fetch('/api/user/record-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                activity_type: activityType,
                ...details
            })
        });
    } catch (error) {
        console.error('Error recording activity:', error);
    }
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    
    // Set color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#d4edda';
        notification.style.color = '#155724';
        notification.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f8d7da';
        notification.style.color = '#721c24';
        notification.style.border = '1px solid #f5c6cb';
    } else {
        notification.style.backgroundColor = '#e2e3e5';
        notification.style.color = '#383d41';
        notification.style.border = '1px solid #d6d8db';
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}