/**
 * Activity tracking module for Sheikh Mustafa Al-Tahhan website
 * Records user interactions with content for the user journey feature
 */

// Set up event listeners for activity tracking
document.addEventListener('DOMContentLoaded', function() {
    setupActivityTracking();
});

// Setup activity tracking for different content types
function setupActivityTracking() {
    // Track book views and downloads
    setupBookActivityTracking();
    
    // Track article views
    setupArticleActivityTracking();
    
    // Track gallery views
    setupGalleryActivityTracking();
    
    // Track specific activity on login
    trackLoginActivity();
}

// Setup book activity tracking
function setupBookActivityTracking() {
    // Check if we're on a page with books
    const booksContainer = document.getElementById('books-container');
    if (!booksContainer) return;
    
    // Add event delegation for book interactions
    booksContainer.addEventListener('click', function(e) {
        // Check for book view (clicking on title or image)
        if (e.target && (e.target.closest('.book-card h3') || e.target.closest('.book-cover'))) {
            const bookCard = e.target.closest('.book-card');
            if (bookCard) {
                const bookId = bookCard.dataset.id;
                const bookTitle = bookCard.querySelector('h3').textContent;
                
                // Record view activity
                recordActivity('view_book', bookId, 'book', bookTitle);
            }
        }
        
        // Check for book download
        if (e.target && (e.target.classList.contains('fa-download') || 
                         (e.target.closest('a') && e.target.closest('a').textContent.includes('تحميل')))) {
            const bookCard = e.target.closest('.book-card');
            if (bookCard) {
                const bookId = bookCard.dataset.id;
                const bookTitle = bookCard.querySelector('h3').textContent;
                
                // Record download activity
                recordActivity('download_book', bookId, 'book', bookTitle);
            }
        }
    });
}

// Setup article activity tracking
function setupArticleActivityTracking() {
    // Check if we're on a page with articles
    const articlesContainer = document.querySelector('.articles-container');
    if (!articlesContainer) return;
    
    // Add event delegation for article interactions
    articlesContainer.addEventListener('click', function(e) {
        // Check for article view (clicking on title, read more, or content)
        if (e.target && (e.target.closest('.article-title') || 
                         e.target.closest('.article-content') || 
                         (e.target.closest('a') && e.target.closest('a').textContent.includes('قراءة')))) {
            const articleItem = e.target.closest('.article-item');
            if (articleItem) {
                const articleId = articleItem.dataset.id;
                const articleTitle = articleItem.querySelector('.article-title').textContent;
                
                // Record view activity
                recordActivity('view_article', articleId, 'article', articleTitle);
            }
        }
    });
}

// Setup gallery activity tracking
function setupGalleryActivityTracking() {
    // Check if we're on the gallery page
    const galleryContainer = document.querySelector('.gallery-container, .responsive-gallery');
    if (!galleryContainer) return;
    
    // Record gallery view once per session
    const hasViewedGallery = sessionStorage.getItem('gallery_viewed');
    if (!hasViewedGallery) {
        recordActivity('view_gallery');
        sessionStorage.setItem('gallery_viewed', 'true');
    }
    
    // Add event delegation for gallery image views
    galleryContainer.addEventListener('click', function(e) {
        // Check for gallery image click (opening full view)
        if (e.target && e.target.tagName === 'IMG') {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const imageId = galleryItem.dataset.id;
                const imageCaption = galleryItem.querySelector('.gallery-caption')?.textContent || 'صورة معرض';
                
                // Record image view activity
                recordActivity('view_gallery_image', imageId, 'gallery_image', imageCaption);
            }
        }
    });
}

// Track login activity
function trackLoginActivity() {
    // Only record login once per session
    const hasLoggedInThisSession = sessionStorage.getItem('logged_in_this_session');
    if (hasLoggedInThisSession) return;
    
    // Check if user is already logged in
    fetch('/api/auth-status')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                recordActivity('login');
                sessionStorage.setItem('logged_in_this_session', 'true');
            }
        })
        .catch(error => {
            console.error('Error checking authentication status:', error);
        });
}

// Record user activity via API
async function recordActivity(activityType, contentId, contentType, contentTitle) {
    try {
        // Check if user is authenticated (don't record for non-authenticated users)
        const authResponse = await fetch('/api/auth-status');
        const authData = await authResponse.json();
        
        if (!authData.authenticated) {
            console.log('User not authenticated, activity not recorded');
            return;
        }
        
        // Make API call to record activity
        await fetch('/api/user/record-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                activity_type: activityType,
                content_id: contentId,
                content_type: contentType,
                content_title: contentTitle
            })
        });
        
        console.log(`Activity ${activityType} recorded for ${contentType || 'user'} ${contentId || ''}: ${contentTitle || ''}`);
    } catch (error) {
        // Silently fail - we don't want to interrupt user experience for activity tracking errors
        console.error('Error recording activity:', error);
    }
}