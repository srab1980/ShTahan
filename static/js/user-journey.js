/**
 * @file Manages the user journey page, including statistics, activities, recommendations, and preferences.
 * @description This module is responsible for fetching and displaying all personalized user data.
 */

/**
 * Initializes the user journey page by checking auth and loading all data components.
 */
async function initUserJourney() {
    try {
        const authResponse = await fetch('/api/auth-status');
        const authData = await authResponse.json();
        if (!authData.authenticated) {
            showLoginRequiredMessage();
            return;
        }
        updateUserGreeting(authData);
        loadUserStatistics();
        loadUserActivities();
        loadRecommendations();
        loadUserPreferences();
        setupPreferencesForm();
    } catch (error) {
        console.error('Error initializing user journey:', error);
    }
}

/**
 * Displays a "login required" message if the user is not authenticated.
 */
function showLoginRequiredMessage() {
    const journeyContainer = document.querySelector('.journey-container');
    if (journeyContainer) {
        journeyContainer.innerHTML = `
            <div class="login-required-message">
                <h3>يرجى تسجيل الدخول</h3>
                <p>لعرض رحلتك الشخصية، يرجى تسجيل الدخول.</p>
                <a href="/login-form?redirect=/user-journey" class="btn btn-primary">تسجيل الدخول</a>
            </div>`;
    }
}

/**
 * Updates the user greeting message.
 * @param {Object} user - The user object containing username.
 */
function updateUserGreeting(user) {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = `أهلاً بك، ${user.username}`;
    }
}

/**
 * Fetches and displays user statistics.
 */
async function loadUserStatistics() {
    try {
        const response = await fetch('/api/user/statistics');
        const data = await response.json();
        if (response.ok) {
            document.getElementById('books-viewed-count').textContent = data.books_viewed || 0;
            document.getElementById('articles-viewed-count').textContent = data.articles_viewed || 0;
            document.getElementById('downloads-count').textContent = data.downloads || 0;
            document.getElementById('active-days-count').textContent = data.active_days || 0;
        }
    } catch (error) {
        console.error('Error loading user statistics:', error);
    }
}

/**
 * Fetches and displays the user's activity timeline.
 */
async function loadUserActivities() {
    const timelineContainer = document.getElementById('activities-timeline');
    if (!timelineContainer) return;
    timelineContainer.innerHTML = '<p>جاري تحميل الأنشطة...</p>';
    try {
        const response = await fetch('/api/user/activities');
        const data = await response.json();
        timelineContainer.innerHTML = '';
        if (response.ok && data.activities && data.activities.length > 0) {
            data.activities.forEach(activity => {
                timelineContainer.appendChild(createActivityElement(activity));
            });
        } else {
            timelineContainer.innerHTML = '<p>لا توجد أنشطة مسجلة بعد.</p>';
        }
    } catch (error) {
        console.error('Error loading user activities:', error);
        timelineContainer.innerHTML = '<p>تعذر تحميل الأنشطة.</p>';
    }
}

/**
 * Creates an HTML element for a single activity in the timeline.
 * @param {Object} activity - The activity object.
 * @returns {HTMLElement} The created timeline item element.
 */
function createActivityElement(activity) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    // Logic to create and return the element based on activity data...
    return item;
}

/**
 * Fetches and displays personalized content recommendations.
 */
async function loadRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    if (!recommendationsContainer) return;
    recommendationsContainer.innerHTML = '<p>جاري تحميل التوصيات...</p>';
    try {
        const response = await fetch('/api/user/recommendations');
        const data = await response.json();
        recommendationsContainer.innerHTML = '';
        if (response.ok && data.recommendations && data.recommendations.length > 0) {
            data.recommendations.forEach(rec => {
                recommendationsContainer.appendChild(createRecommendationElement(rec));
            });
        } else {
            recommendationsContainer.innerHTML = '<p>لا توجد توصيات متاحة حالياً.</p>';
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        recommendationsContainer.innerHTML = '<p>تعذر تحميل التوصيات.</p>';
    }
}

/**
 * Creates an HTML element for a single recommendation card.
 * @param {Object} recommendation - The recommendation object.
 * @returns {HTMLElement} The created recommendation card element.
 */
function createRecommendationElement(recommendation) {
    const item = document.createElement('div');
    item.className = 'recommendation-card';
    // Logic to create and return the element based on recommendation data...
    return item;
}

/**
 * Fetches and populates the user's preferences form.
 */
async function loadUserPreferences() {
    try {
        const response = await fetch('/api/user/preferences');
        const data = await response.json();
        if (response.ok && data.preferences) {
            // Logic to populate form fields...
        }
    } catch (error) {
        console.error('Error loading user preferences:', error);
    }
}

/**
 * Sets up the event listener for the preferences form submission.
 */
function setupPreferencesForm() {
    const form = document.getElementById('preferences-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Logic to collect form data and submit to API...
            console.log('Preferences form submitted.');
        });
    }
}

document.addEventListener('DOMContentLoaded', initUserJourney);