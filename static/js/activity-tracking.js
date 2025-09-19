/**
 * @file Activity tracking module for the website.
 * @description Records user interactions with content for the user journey feature.
 */

/**
 * Main function to set up all activity tracking event listeners.
 */
function setupActivityTracking() {
    setupBookActivityTracking();
    setupArticleActivityTracking();
    setupGalleryActivityTracking();
    trackLoginActivity();
}

/**
 * Sets up event listeners for tracking book views and downloads.
 */
function setupBookActivityTracking() {
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;

    booksContainer.addEventListener('click', function(e) {
        const bookCard = e.target.closest('.book-card');
        if (!bookCard) return;

        const bookId = bookCard.dataset.id;
        const bookTitle = bookCard.querySelector('h3').textContent;

        if (e.target.closest('.book-cover') || e.target.closest('.book-card h3')) {
            recordActivity('view_book', bookId, 'book', bookTitle);
        } else if (e.target.closest('.btn-secondary')) {
            recordActivity('download_book', bookId, 'book', bookTitle);
        }
    });
}

/**
 * Sets up event listeners for tracking article views.
 */
function setupArticleActivityTracking() {
    const articlesContainer = document.querySelector('.articles-container');
    if (!articlesContainer) return;

    articlesContainer.addEventListener('click', function(e) {
        const articleItem = e.target.closest('.article-item');
        if (articleItem) {
            const articleId = articleItem.dataset.id;
            const articleTitle = articleItem.querySelector('.article-title').textContent;
            recordActivity('view_article', articleId, 'article', articleTitle);
        }
    });
}

/**
 * Sets up event listeners for tracking gallery views.
 */
function setupGalleryActivityTracking() {
    const galleryContainer = document.querySelector('.gallery-container, .responsive-gallery');
    if (!galleryContainer) return;

    if (!sessionStorage.getItem('gallery_viewed')) {
        recordActivity('view_gallery');
        sessionStorage.setItem('gallery_viewed', 'true');
    }

    galleryContainer.addEventListener('click', function(e) {
        if (e.target.tagName === 'IMG') {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const imageId = galleryItem.dataset.id;
                const imageCaption = galleryItem.querySelector('.gallery-caption')?.textContent || 'صورة معرض';
                recordActivity('view_gallery_image', imageId, 'gallery_image', imageCaption);
            }
        }
    });
}

/**
 * Tracks a login event once per session.
 */
function trackLoginActivity() {
    if (sessionStorage.getItem('logged_in_this_session')) return;

    fetch('/api/auth-status')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                recordActivity('login');
                sessionStorage.setItem('logged_in_this_session', 'true');
            }
        })
        .catch(error => console.error('Error checking authentication status:', error));
}

/**
 * Sends an activity record to the server API.
 * @param {string} activityType - The type of activity (e.g., 'view_book').
 * @param {number} [contentId] - The ID of the related content.
 * @param {string} [contentType] - The type of the related content (e.g., 'book').
 * @param {string} [contentTitle] - The title of the related content.
 */
async function recordActivity(activityType, contentId, contentType, contentTitle) {
    try {
        const authResponse = await fetch('/api/auth-status');
        const authData = await authResponse.json();
        if (!authData.authenticated) return;

        await fetch('/api/user/record-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activity_type: activityType, content_id: contentId, content_type: contentType, content_title: contentTitle })
        });
        console.log(`Activity recorded: ${activityType}`);
    } catch (error) {
        console.error('Error recording activity:', error);
    }
}

// Initialize tracking when the DOM is loaded.
document.addEventListener('DOMContentLoaded', setupActivityTracking);