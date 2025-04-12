/**
 * Articles module for Sheikh Mustafa Al-Tahhan website
 * Handles articles loading, display, creation and editing
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Articles module loaded');
    
    // References to DOM elements
    const articlesContainer = document.querySelector('.articles-container');
    const addArticleForm = document.getElementById('add-article-form');
    const articlesSection = document.getElementById('articles');
    
    // Log DOM elements to check if they're found correctly
    console.log('Articles container element:', articlesContainer);
    console.log('Articles section element:', articlesSection);
    
    // We've removed the Add New Article button and form for public facing pages
    
    // Fetch articles from API with caching for improved performance
    async function fetchArticles() {
        console.log('Fetching articles from API');
        
        // Find the container again in case it wasn't found earlier
        const articlesContainer = document.querySelector('.articles-container');
        console.log('Articles container when fetching:', articlesContainer);
        
        if (!articlesContainer) {
            console.error('Articles container not found!');
            return;
        }
        
        // Check if we have cached articles data
        const cachedArticles = sessionStorage.getItem('cachedArticles');
        const cachedTimestamp = sessionStorage.getItem('articlesTimestamp');
        const currentTime = new Date().getTime();
        
        // Use cached data if available and less than 5 minutes old
        if (cachedArticles && cachedTimestamp && (currentTime - parseInt(cachedTimestamp) < 5 * 60 * 1000)) {
            console.log('Using cached articles data');
            renderArticles(JSON.parse(cachedArticles));
            
            // Refresh cache in background after 3 seconds
            setTimeout(refreshArticlesCache, 3000);
            return;
        }
        
        // Show animated loading state with enhanced design
        articlesContainer.innerHTML = `
            <div class="loader-container">
                <div class="loader-pulse"></div>
                <div class="loader-text">جاري تحميل المقالات...</div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: 30%;"></div>
                </div>
            </div>
        `;
        
        // Simulate progress animation for better user experience
        const progressBar = articlesContainer.querySelector('.progress-bar');
        let width = 30;
        const progressInterval = setInterval(() => {
            if (width >= 80) {
                clearInterval(progressInterval);
            } else {
                width += 5;
                progressBar.style.width = `${width}%`;
            }
        }, 200);
        
        try {
            console.log('Sending request to /api/articles');
            const response = await fetch('/api/articles');
            console.log('Response received:', response.status);
            const data = await response.json();
            console.log('Articles data:', data);
            
            // Complete progress bar animation
            if (progressBar) {
                clearInterval(progressInterval);
                progressBar.style.width = '100%';
                progressBar.style.transition = 'width 0.3s ease-in-out';
            }
            
            // Cache the articles data
            sessionStorage.setItem('cachedArticles', JSON.stringify(data.articles));
            sessionStorage.setItem('articlesTimestamp', currentTime.toString());
            
            // Minor delay before rendering to show the completed loading animation
            setTimeout(() => {
                renderArticles(data.articles);
            }, 300);
        } catch (error) {
            console.error('Error fetching articles:', error);
            
            // Stop loading animation
            if (progressBar) {
                clearInterval(progressInterval);
            }
            
            if (articlesContainer) {
                articlesContainer.innerHTML = `
                    <div class="error-message" style="text-align: center; padding: 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 32px; color: #dc3545; margin-bottom: 15px; display: block;"></i>
                        <p>حدث خطأ في تحميل المقالات. يرجى المحاولة مرة أخرى لاحقًا.</p>
                        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">
                            <i class="fas fa-sync-alt"></i> إعادة المحاولة
                        </button>
                    </div>
                `;
            }
        }
    }
    
    // Refresh articles cache in background without affecting UI
    async function refreshArticlesCache() {
        try {
            const response = await fetch('/api/articles');
            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('cachedArticles', JSON.stringify(data.articles));
                sessionStorage.setItem('articlesTimestamp', new Date().getTime().toString());
                console.log('Articles cache updated in background');
            }
        } catch (error) {
            console.error('Error refreshing articles cache:', error);
        }
    }
    
    // Render articles to the DOM
    function renderArticles(articles) {
        console.log('Rendering articles:', articles);
        
        // Get the container again in case it wasn't found earlier
        const articlesContainer = document.querySelector('.articles-container');
        console.log('Articles container when rendering:', articlesContainer);
        
        if (!articlesContainer) {
            console.error('Articles container not found for rendering!');
            return;
        }
        
        if (!articles || articles.length === 0) {
            articlesContainer.innerHTML = '<p class="no-articles" style="text-align: center; padding: 20px; color: #666;">لا توجد مقالات متاحة</p>';
            return;
        }
        
        articlesContainer.innerHTML = '';
        
        // Sort articles by date (newest first)
        const sortedArticles = [...articles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Limit to 6 articles on the homepage
        const isHomepage = window.location.pathname === '/';
        const articlesToDisplay = isHomepage ? sortedArticles.slice(0, 6) : sortedArticles;
        
        articlesToDisplay.forEach(article => {
            console.log('Rendering article:', article.id, article.title);
            
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            articleCard.dataset.id = article.id;
            
            articleCard.innerHTML = `
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <div class="article-actions">
                    <a href="javascript:void(0);" class="btn btn-secondary read-more" data-article-id="${article.id}">اقرأ المزيد</a>
                </div>
            `;
            
            articlesContainer.appendChild(articleCard);
            
            // Add event listener for read more button
            const readMoreBtn = articleCard.querySelector('.read-more');
            readMoreBtn.addEventListener('click', () => openArticleModal(article));
        });
        
        // Add "View All Articles" button if on homepage and there are more articles
        if (isHomepage && articles.length > 6) {
            // Add view all button directly after the articles container
            if (articlesContainer && articlesContainer.parentNode) {
                // Check if view-all container doesn't already exist
                if (!document.querySelector('.view-all-articles-container')) {
                    const viewAllContainer = document.createElement('div');
                    viewAllContainer.className = 'view-all-articles-container';
                    viewAllContainer.style.textAlign = 'center';
                    viewAllContainer.style.marginTop = '2rem';
                    
                    viewAllContainer.innerHTML = `
                        <a href="/articles" class="btn btn-primary" style="padding: 10px 20px; font-size: 1.1rem;">
                            <i class="fas fa-newspaper"></i>
                            عرض جميع المقالات (${articles.length})
                        </a>
                    `;
                    
                    // Insert after the articles container
                    articlesContainer.parentNode.insertBefore(viewAllContainer, articlesContainer.nextSibling);
                    
                    console.log("Added 'View All Articles' button");
                }
            } else {
                console.log("Could not find articles container parent to add 'View All' button");
            }
        }
        
        console.log('Articles rendered successfully');
    }
    
    // Show the add article form
    function showAddArticleForm() {
        const formContainer = document.getElementById('article-form-container');
        const formTitle = document.getElementById('form-title');
        const articleIdField = document.getElementById('article-id');
        const titleField = document.getElementById('article-title');
        const summaryField = document.getElementById('article-summary');
        const contentField = document.getElementById('article-content');
        
        // Reset form fields
        formTitle.textContent = 'إضافة مقال جديد';
        articleIdField.value = '';
        titleField.value = '';
        summaryField.value = '';
        contentField.value = '';
        
        // Show the form
        formContainer.style.display = 'block';
    }
    
    // Show the edit article form with data
    function showEditArticleForm(article) {
        const formContainer = document.getElementById('article-form-container');
        const formTitle = document.getElementById('form-title');
        const articleIdField = document.getElementById('article-id');
        const titleField = document.getElementById('article-title');
        const summaryField = document.getElementById('article-summary');
        const contentField = document.getElementById('article-content');
        
        // Set form fields
        formTitle.textContent = 'تعديل المقال';
        articleIdField.value = article.id;
        titleField.value = article.title;
        summaryField.value = article.summary;
        contentField.value = article.content;
        
        // Show the form
        formContainer.style.display = 'block';
    }
    
    // Hide the article form
    function hideArticleForm() {
        const formContainer = document.getElementById('article-form-container');
        if (formContainer) {
            formContainer.style.display = 'none';
        }
    }
    
    // Handle article form submission
    async function handleArticleSubmit(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
        console.log('Form submission started');
        
        const articleId = document.getElementById('article-id').value;
        const title = document.getElementById('article-title').value;
        const summary = document.getElementById('article-summary').value;
        const content = document.getElementById('article-content').value;
        
        // Validate required fields
        if (!title || !summary || !content) {
            console.log('Missing required fields. Form validation failed.');
            
            // Log which fields are missing for debugging
            if (!title) console.log('Missing title');
            if (!summary) console.log('Missing summary');
            if (!content) console.log('Missing content');
            
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        const articleData = {
            title,
            summary,
            content
        };
        
        // Log the data being sent
        console.log('Submitting article data:', articleData);
        
        try {
            let response;
            let method;
            let url;
            
            if (articleId) {
                // Update existing article
                method = 'PUT';
                url = `/api/articles/${articleId}`;
                articleData.id = articleId; // Make sure we include the ID
            } else {
                // Create new article
                method = 'POST';
                url = '/api/articles';
            }
            
            showNotification('جاري حفظ البيانات...', 'info');
            
            console.log(`Sending ${method} request to ${url}`);
            response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(articleData)
            });
            
            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);
            
            if (response.ok) {
                hideArticleForm();
                fetchArticles(); // Refresh the articles list
                
                // Show success message
                showNotification(
                    articleId ? 'تم تحديث المقال بنجاح' : 'تم إضافة المقال بنجاح', 
                    'success'
                );
            } else {
                showNotification(`خطأ: ${result.error || 'حدث خطأ ما'}`, 'error');
                console.error('Server error:', result.error);
            }
        } catch (error) {
            console.error('Error submitting article:', error);
            showNotification('حدث خطأ أثناء معالجة الطلب', 'error');
        }
    }
    
    // Confirm article deletion
    function confirmDeleteArticle(articleId) {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا المقال؟')) {
            deleteArticle(articleId);
        }
    }
    
    // Delete an article
    async function deleteArticle(articleId) {
        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove article from DOM
                const articleCard = document.querySelector(`.article-card[data-id="${articleId}"]`);
                if (articleCard) {
                    articleCard.remove();
                }
                
                // Refresh articles list
                fetchArticles();
                
                // Show success message
                showNotification('تم حذف المقال بنجاح', 'success');
            } else {
                const result = await response.json();
                showNotification(`خطأ: ${result.error || 'حدث خطأ ما'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            showNotification('حدث خطأ أثناء حذف المقال', 'error');
        }
    }
    
    // Show article modal with full content
    function openArticleModal(article) {
        // Check if modal already exists, remove it if it does
        const existingModal = document.getElementById('article-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'article-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="article-full">
                    <h2>${article.title}</h2>
                    <div class="article-meta">
                        <span class="article-date">${article.created_at}</span>
                    </div>
                    <div class="article-content">
                        ${article.content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.style.display = 'block';
        }, 10);
        
        // Add event listener to close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
        
        // Close modal when clicking outside content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal) {
                modal.style.display = 'none';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        });
    }
    
    // Show notification
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
    
    // Upload article image
    async function uploadArticleImage(file) {
        if (!file) return null;
        
        const imagePreview = document.getElementById('article-image-preview');
        const imageProgress = document.getElementById('article-image-progress');
        
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            showNotification('يرجى اختيار ملف صورة صالح', 'error');
            return null;
        }
        
        console.log('Uploading article image file:', file.name);
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            // Show progress bar
            if (imageProgress) {
                imageProgress.style.display = 'block';
                imageProgress.querySelector('.progress-bar').style.width = '50%';
            }
            
            // Send the file to the server
            const response = await fetch('/api/upload/article-image', {
                method: 'POST',
                body: formData
            });
            
            // Update progress bar to 100%
            if (imageProgress) {
                imageProgress.querySelector('.progress-bar').style.width = '100%';
            }
            
            const result = await response.json();
            console.log('Server response for image upload:', result);
            
            if (response.ok) {
                // Show success notification
                showNotification('تم رفع الصورة بنجاح', 'success');
                
                // Show preview
                if (imagePreview) {
                    imagePreview.style.display = 'block';
                    imagePreview.innerHTML = `<img src="${result.file_url}" alt="Article Image Preview" style="max-width: 100%; max-height: 150px; border-radius: 5px;">`;
                }
                
                // Insert image URL to the content textarea
                const contentTextarea = document.getElementById('article-content');
                const cursorPos = contentTextarea.selectionStart;
                const textBefore = contentTextarea.value.substring(0, cursorPos);
                const textAfter = contentTextarea.value.substring(cursorPos);
                
                // Create image HTML tag
                const imageTag = `<img src="${result.file_url}" alt="صورة المقال" style="max-width: 100%; display: block; margin: 20px auto; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">`;
                
                // Insert the image tag at cursor position
                contentTextarea.value = textBefore + imageTag + textAfter;
                
                // Hide progress bar after a delay
                setTimeout(() => {
                    if (imageProgress) imageProgress.style.display = 'none';
                }, 1000);
                
                return result.file_url;
            } else {
                // Show error notification
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء رفع الصورة'}`, 'error');
                console.error('Error uploading image:', result.error);
                
                // Hide progress bar
                if (imageProgress) imageProgress.style.display = 'none';
                
                return null;
            }
        } catch (error) {
            console.error('Error uploading article image:', error);
            showNotification('حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى', 'error');
            
            // Hide progress bar
            if (imageProgress) imageProgress.style.display = 'none';
            
            return null;
        }
    }
    
    // Add event listener for the add image button
    const addImageBtn = document.getElementById('add-article-image-btn');
    if (addImageBtn) {
        addImageBtn.addEventListener('click', function() {
            const uploadContainer = document.getElementById('article-image-upload-container');
            if (uploadContainer) {
                uploadContainer.style.display = uploadContainer.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    // Add event listener for image upload
    const imageUpload = document.getElementById('article-image-upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                uploadArticleImage(e.target.files[0]);
            }
        });
    }
    
    // Initialize the module
    console.log('Initializing articles module and fetching articles');
    
    // Use setTimeout to ensure DOM is fully loaded before fetching
    setTimeout(() => {
        fetchArticles();
    }, 500);
    
    console.log('Articles module initialization complete');
});