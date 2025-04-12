/**
 * User Journey module for Sheikh Mustafa Al-Tahhan website
 * Handles personal user journey visualization and preferences
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize user journey functionality
    initUserJourney();
});

/**
 * Initialize the user journey page
 */
async function initUserJourney() {
    try {
        // Check if the user is authenticated
        const authResponse = await fetch('/api/auth-status');
        const authData = await authResponse.json();
        
        if (!authData.authenticated) {
            // Show login required message instead of redirecting
            showLoginRequiredMessage();
            return;
        }
        
        // Update user greeting
        updateUserGreeting(authData);
        
        // Load user statistics
        loadUserStatistics();
        
        // Load user activities timeline
        loadUserActivities();
        
        // Load content recommendations
        loadRecommendations();
        
        // Load user preferences
        loadUserPreferences();
        
        // Set up preference form handler
        setupPreferencesForm();
    } catch (error) {
        console.error('Error initializing user journey:', error);
        showError('حدث خطأ أثناء تحميل رحلة المستخدم. يرجى المحاولة مرة أخرى.');
    }
}

/**
 * Update the user greeting section with user info
 * @param {Object} user - User information object
 */
function updateUserGreeting(user) {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = `أهلاً بك، ${user.username}`;
    }
}

/**
 * Load and display user statistics
 */
async function loadUserStatistics() {
    try {
        const response = await fetch('/api/user/statistics');
        const data = await response.json();
        
        // Check for authentication error
        if (!response.ok) {
            if (data.error) {
                console.error('Authentication error:', data.error);
            }
            return;
        }
        
        // Update statistics cards
        document.getElementById('books-viewed-count').textContent = data.books_viewed || 0;
        document.getElementById('articles-viewed-count').textContent = data.articles_viewed || 0;
        document.getElementById('downloads-count').textContent = data.downloads || 0;
        document.getElementById('active-days-count').textContent = data.active_days || 0;
    } catch (error) {
        console.error('Error loading user statistics:', error);
        showError('تعذر تحميل إحصائيات المستخدم');
    }
}

/**
 * Load and display user activities timeline
 */
async function loadUserActivities() {
    try {
        const timelineContainer = document.getElementById('activities-timeline');
        
        // Show loading indicator
        timelineContainer.innerHTML = `
            <div class="timeline-loading">
                <div class="loader-pulse"></div>
                <p>جاري تحميل الأنشطة...</p>
            </div>
        `;
        
        // Fetch user activities
        const response = await fetch('/api/user/activities');
        const data = await response.json();
        
        // Clear loading indicator
        timelineContainer.innerHTML = '';
        
        // Check for authentication error
        if (!response.ok) {
            if (data.error) {
                console.error('Authentication error:', data.error);
            }
            return;
        }
        
        // Check if there are any activities
        if (!data.activities || data.activities.length === 0) {
            timelineContainer.innerHTML = `
                <div class="no-activities">
                    <p>لا توجد أنشطة مسجلة بعد. تصفح المحتوى لبدء رحلتك!</p>
                </div>
            `;
            return;
        }
        
        // Render activities timeline
        data.activities.forEach(activity => {
            const activityElement = createActivityElement(activity);
            timelineContainer.appendChild(activityElement);
        });
    } catch (error) {
        console.error('Error loading user activities:', error);
        const timelineContainer = document.getElementById('activities-timeline');
        timelineContainer.innerHTML = `
            <div class="error-message">
                <p>تعذر تحميل الأنشطة. يرجى المحاولة مرة أخرى.</p>
            </div>
        `;
    }
}

/**
 * Create an activity element for the timeline
 * @param {Object} activity - Activity data object
 * @returns {HTMLElement} The created activity element
 */
function createActivityElement(activity) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    
    // Choose icon based on activity type
    let icon = 'fa-star';
    if (activity.activity_type.includes('book')) {
        icon = 'fa-book';
    } else if (activity.activity_type.includes('article')) {
        icon = 'fa-newspaper';
    } else if (activity.activity_type.includes('gallery')) {
        icon = 'fa-image';
    } else if (activity.activity_type === 'login') {
        icon = 'fa-sign-in-alt';
    }
    
    // Format activity title
    let title = 'نشاط جديد';
    if (activity.activity_type === 'view_book') {
        title = `اطلعت على كتاب: ${activity.content_title}`;
    } else if (activity.activity_type === 'download_book') {
        title = `قمت بتنزيل كتاب: ${activity.content_title}`;
    } else if (activity.activity_type === 'view_article') {
        title = `قرأت مقالة: ${activity.content_title}`;
    } else if (activity.activity_type === 'view_gallery') {
        title = 'زرت معرض الصور';
    } else if (activity.activity_type === 'view_gallery_image') {
        title = `شاهدت صورة: ${activity.content_title}`;
    } else if (activity.activity_type === 'login') {
        title = 'قمت بتسجيل الدخول';
    }
    
    // Format date
    const activityDate = new Date(activity.created_at);
    const formattedDate = formatDate(activityDate);
    
    // Create HTML for activity item
    item.innerHTML = `
        <div class="timeline-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="timeline-content">
            <h4>${title}</h4>
            <p class="timeline-date">${formattedDate}</p>
        </div>
    `;
    
    return item;
}

/**
 * Format date in Arabic-friendly format
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    // Check if the date is today
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
        // Format time only for today
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `اليوم، الساعة ${hours}:${minutes}`;
    } else {
        // Format date and time for other days
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year}، الساعة ${hours}:${minutes}`;
    }
}

/**
 * Load and display content recommendations
 */
async function loadRecommendations() {
    try {
        const recommendationsContainer = document.getElementById('recommendations-container');
        
        // Show loading indicator
        recommendationsContainer.innerHTML = `
            <div class="recommendations-loading">
                <div class="loader-pulse"></div>
                <p>جاري تحميل التوصيات...</p>
            </div>
        `;
        
        // Fetch recommendations
        const response = await fetch('/api/user/recommendations');
        const data = await response.json();
        
        // Clear loading indicator
        recommendationsContainer.innerHTML = '';
        
        // Check for authentication error
        if (!response.ok) {
            if (data.error) {
                console.error('Authentication error:', data.error);
            }
            return;
        }
        
        // Check if there are any recommendations
        if (!data.recommendations || data.recommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <div class="no-recommendations">
                    <p>لا توجد توصيات متاحة حالياً.</p>
                </div>
            `;
            return;
        }
        
        // Render recommendations
        data.recommendations.forEach(recommendation => {
            const recommendationElement = createRecommendationElement(recommendation);
            recommendationsContainer.appendChild(recommendationElement);
        });
    } catch (error) {
        console.error('Error loading recommendations:', error);
        const recommendationsContainer = document.getElementById('recommendations-container');
        recommendationsContainer.innerHTML = `
            <div class="error-message">
                <p>تعذر تحميل التوصيات. يرجى المحاولة مرة أخرى.</p>
            </div>
        `;
    }
}

/**
 * Create a recommendation element
 * @param {Object} recommendation - Recommendation data object
 * @returns {HTMLElement} The created recommendation element
 */
function createRecommendationElement(recommendation) {
    const item = document.createElement('div');
    item.className = 'recommendation-card';
    
    // Format type label in Arabic
    let typeLabel = 'محتوى';
    if (recommendation.type === 'book') {
        typeLabel = 'كتاب';
    } else if (recommendation.type === 'article') {
        typeLabel = 'مقالة';
    }
    
    // Generate proper link based on content type
    let link = '#';
    if (recommendation.type === 'book') {
        link = `/#books?id=${recommendation.id}`;
    } else if (recommendation.type === 'article') {
        link = `/#articles?id=${recommendation.id}`;
    }
    
    // Set default image if not provided
    let imageUrl = recommendation.cover || '/static/img/default/default-cover.jpg';
    if (recommendation.type === 'article') {
        imageUrl = '/static/img/default/article-default.jpg';
    }
    
    // Create HTML for recommendation item
    item.innerHTML = `
        <div class="recommendation-image">
            <img src="${imageUrl}" alt="${recommendation.title}">
            <span class="recommendation-type">${typeLabel}</span>
        </div>
        <div class="recommendation-content">
            <h4>${recommendation.title}</h4>
            <p>${recommendation.summary || recommendation.category || ''}</p>
            <a href="${link}" class="btn btn-sm btn-primary mt-2">عرض المحتوى</a>
        </div>
    `;
    
    return item;
}

/**
 * Load user preferences
 */
async function loadUserPreferences() {
    try {
        const response = await fetch('/api/user/preferences');
        const data = await response.json();
        
        // Check for authentication error
        if (!response.ok) {
            if (data.error) {
                console.error('Authentication error:', data.error);
            }
            return;
        }
        
        // Fill form with user preferences
        const preferences = data.preferences || {};
        
        // Set language preference
        const langSelect = document.getElementById('pref-language');
        if (langSelect && preferences.preferred_language) {
            langSelect.value = preferences.preferred_language;
        }
        
        // Set category checkboxes
        if (preferences.categories && Array.isArray(preferences.categories)) {
            const categoryCheckboxes = document.querySelectorAll('input[name="categories"]');
            categoryCheckboxes.forEach(checkbox => {
                if (preferences.categories.includes(checkbox.value)) {
                    checkbox.checked = true;
                }
            });
        }
        
        // Set notification preferences
        if (preferences.notifications && Array.isArray(preferences.notifications)) {
            const notificationCheckboxes = document.querySelectorAll('input[name="notifications"]');
            notificationCheckboxes.forEach(checkbox => {
                if (preferences.notifications.includes(checkbox.value)) {
                    checkbox.checked = true;
                }
            });
        }
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
}

/**
 * Set up preferences form submission handler
 */
function setupPreferencesForm() {
    const form = document.getElementById('preferences-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Collect form data
            const language = document.getElementById('pref-language').value;
            
            // Get selected categories
            const categoryCheckboxes = document.querySelectorAll('input[name="categories"]:checked');
            const categories = Array.from(categoryCheckboxes).map(cb => cb.value);
            
            // Get notification preferences
            const notificationCheckboxes = document.querySelectorAll('input[name="notifications"]:checked');
            const notifications = Array.from(notificationCheckboxes).map(cb => cb.value);
            
            // Prepare preferences object
            const preferences = {
                preferred_language: language,
                categories: categories,
                notifications: notifications
            };
            
            // Submit preferences
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ preferences })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('تم حفظ التفضيلات بنجاح');
                
                // Reload recommendations based on new preferences
                setTimeout(() => {
                    loadRecommendations();
                }, 1000);
            } else {
                // Check for authentication error
                if (data.error && data.authenticated === false) {
                    showLoginRequiredMessage();
                    return;
                }
                showError('فشل حفظ التفضيلات');
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            showError('حدث خطأ أثناء حفظ التفضيلات');
        }
    });
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    // Create a success message element
    const successElement = document.createElement('div');
    successElement.className = 'alert alert-success';
    successElement.style.position = 'fixed';
    successElement.style.bottom = '20px';
    successElement.style.right = '20px';
    successElement.style.padding = '10px 20px';
    successElement.style.backgroundColor = '#4CAF50';
    successElement.style.color = 'white';
    successElement.style.borderRadius = '4px';
    successElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    successElement.style.zIndex = '9999';
    successElement.textContent = message;
    
    // Add to the DOM
    document.body.appendChild(successElement);
    
    // Remove after a few seconds
    setTimeout(() => {
        successElement.style.opacity = '0';
        successElement.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(successElement);
        }, 500);
    }, 3000);
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Create an error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'alert alert-danger';
    errorElement.style.position = 'fixed';
    errorElement.style.bottom = '20px';
    errorElement.style.right = '20px';
    errorElement.style.padding = '10px 20px';
    errorElement.style.backgroundColor = '#f44336';
    errorElement.style.color = 'white';
    errorElement.style.borderRadius = '4px';
    errorElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    errorElement.style.zIndex = '9999';
    errorElement.textContent = message;
    
    // Add to the DOM
    document.body.appendChild(errorElement);
    
    // Remove after a few seconds
    setTimeout(() => {
        errorElement.style.opacity = '0';
        errorElement.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(errorElement);
        }, 500);
    }, 4000);
}

/**
 * Show login required message in the journey container
 */
function showLoginRequiredMessage() {
    // Get all the main content areas
    const journeyContainer = document.querySelector('.journey-container');
    
    if (journeyContainer) {
        // Replace contents with login message
        journeyContainer.innerHTML = `
            <div class="login-required-message">
                <div class="icon">
                    <i class="fas fa-user-lock fa-3x"></i>
                </div>
                <h3>يرجى تسجيل الدخول</h3>
                <p>لعرض رحلة التعلم الشخصية الخاصة بك، يجب عليك تسجيل الدخول أولاً.</p>
                <a href="/login-form?redirect=/user-journey" class="btn btn-primary">تسجيل الدخول</a>
            </div>
        `;
        
        // Add some basic styling for the message
        const style = document.createElement('style');
        style.textContent = `
            .login-required-message {
                text-align: center;
                padding: 40px 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                max-width: 500px;
                margin: 30px auto;
            }
            .login-required-message .icon {
                color: #1a2a3a;
                margin-bottom: 20px;
            }
            .login-required-message h3 {
                color: #1a2a3a;
                margin-bottom: 15px;
            }
            .login-required-message p {
                color: #6c757d;
                margin-bottom: 25px;
            }
        `;
        document.head.appendChild(style);
    }
}