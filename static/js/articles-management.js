/**
 * Articles Management module for Sheikh Mustafa Al-Tahhan website
 * Handles article administration in the dashboard including:
 * - Listing articles
 * - Adding new articles
 * - Editing existing articles
 * - Deleting articles
 * - Uploading article images
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Articles Management module loaded');
    
    // Check if user has admin or editor privileges
    checkAuthStatus();
    
    // Get DOM elements
    const articleModal = document.getElementById('articleModal');
    const modalTitle = document.getElementById('modalTitle');
    const articleForm = document.getElementById('articleForm');
    const articleIdInput = document.getElementById('articleId');
    const titleInput = document.getElementById('title');
    const summaryInput = document.getElementById('summary');
    const contentInput = document.getElementById('content');
    const addArticleBtn = document.getElementById('addArticleBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const articlesTableBody = document.getElementById('articlesTableBody');
    const articleImageUpload = document.getElementById('articleImageUpload');
    const imageProgress = document.getElementById('imageProgress');
    
    // Thumbnail elements
    const thumbnailUpload = document.getElementById('thumbnailUpload');
    const thumbnailUploadBtn = document.getElementById('thumbnailUploadBtn');
    const thumbnailPreview = document.getElementById('thumbnailPreview');
    const thumbnailUrl = document.getElementById('thumbnailUrl');
    const thumbnailProgress = document.getElementById('thumbnailProgress');
    
    // Log DOM elements to debug potential issues
    console.log('Article modal element:', articleModal);
    console.log('Save button element:', saveBtn);
    
    // Add event listeners
    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', openAddArticleModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeArticleModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeArticleModal);
    }
    
    if (saveBtn) {
        console.log('Save button event listener attached');
        saveBtn.addEventListener('click', handleArticleFormSubmit);
    }
    
    if (articleImageUpload) {
        articleImageUpload.addEventListener('change', handleImageUpload);
    }
    
    // Thumbnail upload event listeners
    if (thumbnailUploadBtn) {
        thumbnailUploadBtn.addEventListener('click', function() {
            if (thumbnailUpload) {
                thumbnailUpload.click();
            }
        });
    }
    
    if (thumbnailUpload) {
        thumbnailUpload.addEventListener('change', handleThumbnailUpload);
    }
    
    // Image upload button handler
    const addImageBtn = document.getElementById('add-article-image-btn');
    if (addImageBtn) {
        addImageBtn.addEventListener('click', function() {
            const uploadContainer = document.getElementById('article-image-upload-container');
            if (uploadContainer) {
                uploadContainer.style.display = uploadContainer.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    // Define global insertTag function for both normal and test pages
    window.insertTag = function(tagName) {
        const contentArea = document.getElementById('content');
        if (!contentArea) return;
        
        const start = contentArea.selectionStart;
        const end = contentArea.selectionEnd;
        const selectedText = contentArea.value.substring(start, end);
        let replacement = '';
        
        switch(tagName) {
            case 'h2':
                replacement = `<h2>${selectedText || 'عنوان رئيسي'}</h2>`;
                break;
            case 'h3':
                replacement = `<h3>${selectedText || 'عنوان فرعي'}</h3>`;
                break;
            case 'p':
                replacement = `<p>${selectedText || 'فقرة جديدة'}</p>`;
                break;
            case 'strong':
                replacement = `<strong>${selectedText || 'نص عريض'}</strong>`;
                break;
            case 'em':
                replacement = `<em>${selectedText || 'نص مائل'}</em>`;
                break;
            case 'ul':
                replacement = `<ul>\n    <li>عنصر 1</li>\n    <li>عنصر 2</li>\n</ul>`;
                break;
            case 'ol':
                replacement = `<ol>\n    <li>عنصر 1</li>\n    <li>عنصر 2</li>\n</ol>`;
                break;
            case 'li':
                replacement = `<li>${selectedText || 'عنصر جديد'}</li>`;
                break;
            case 'a':
                replacement = `<a href="https://example.com" target="_blank">${selectedText || 'رابط'}</a>`;
                break;
            default:
                replacement = selectedText;
        }
        
        // Insert the tag
        contentArea.focus();
        contentArea.value = contentArea.value.substring(0, start) + replacement + contentArea.value.substring(end);
        
        // Place cursor after insertion
        const newCursorPos = start + replacement.length;
        contentArea.setSelectionRange(newCursorPos, newCursorPos);
    };
    
    // Initialize - fetch articles
    fetchArticles();
    
    /**
     * Check if the user has admin or editor privileges
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
            const userRoleElement = document.getElementById('userRole');
            const userNameElement = document.getElementById('userName');
            const userManagementLink = document.getElementById('userManagementLink');
            
            if (userRoleElement) userRoleElement.textContent = getRoleLabel(data.role);
            if (userNameElement) userNameElement.innerHTML = `مرحباً، <strong>${data.username}</strong>`;
            
            // Hide user management link if not admin
            if (data.role !== 'admin' && userManagementLink) {
                userManagementLink.parentElement.style.display = 'none';
            }
            
            // Check if user is editor or admin
            if (data.role !== 'admin' && data.role !== 'editor') {
                // If not editor or admin, redirect to homepage
                window.location.href = '/';
                showNotification('غير مصرح لك بالوصول إلى هذه الصفحة', 'error');
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
     * Fetch all articles from the API
     */
    async function fetchArticles() {
        try {
            showLoadingIndicator();
            
            const response = await fetch('/api/articles');
            const data = await response.json();
            
            hideLoadingIndicator();
            renderArticles(data.articles);
        } catch (error) {
            hideLoadingIndicator();
            console.error('Error fetching articles:', error);
            showNotification('حدث خطأ أثناء تحميل المقالات', 'error');
        }
    }
    
    /**
     * Show loading indicator in the table body
     */
    function showLoadingIndicator() {
        if (articlesTableBody) {
            articlesTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px;">
                        <i class="fas fa-spinner fa-spin" style="margin-left: 10px;"></i>
                        جاري تحميل المقالات...
                    </td>
                </tr>
            `;
        }
    }
    
    /**
     * Hide loading indicator
     */
    function hideLoadingIndicator() {
        // Will be replaced by renderArticles
    }
    
    /**
     * Render articles in the table
     * @param {Array} articles - Array of article objects
     */
    function renderArticles(articles) {
        if (!articlesTableBody) {
            console.error('Articles table body element not found');
            return;
        }
        
        if (!articles || articles.length === 0) {
            articlesTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px;">
                        لا توجد مقالات للعرض
                    </td>
                </tr>
            `;
            return;
        }
        
        articlesTableBody.innerHTML = '';
        
        articles.forEach(article => {
            // Format date to Arabic format (YYYY/MM/DD)
            const dateStr = article.created_at;
            const formattedDate = dateStr ? dateStr.replace(/-/g, '/') : '---';
            
            // Truncate summary if too long
            const truncatedSummary = article.summary.length > 100 
                ? article.summary.substring(0, 100) + '...' 
                : article.summary;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${article.title}</td>
                <td>${truncatedSummary}</td>
                <td>${formattedDate}</td>
                <td class="article-actions">
                    <button class="view-btn" onclick="previewArticle(${article.id})">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                    <button class="edit-btn" data-id="${article.id}">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="delete-btn" data-id="${article.id}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </td>
            `;
            
            articlesTableBody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        addActionButtonListeners();
    }
    
    /**
     * Add event listeners to article action buttons
     */
    function addActionButtonListeners() {
        // Add listeners for edit buttons
        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const articleId = button.getAttribute('data-id');
                openEditArticleModal(articleId);
            });
        });
        
        // Add listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const articleId = button.getAttribute('data-id');
                confirmDeleteArticle(articleId);
            });
        });
    }
    
    /**
     * Open modal for adding a new article
     */
    function openAddArticleModal() {
        // Reset form
        articleForm.reset();
        articleIdInput.value = '';
        titleInput.value = '';
        summaryInput.value = '';
        contentInput.value = '';
        
        // Set modal title
        modalTitle.textContent = 'إضافة مقال جديد';
        
        // Show modal
        articleModal.style.display = 'block';
    }
    
    /**
     * Open modal for editing an existing article
     * @param {string} articleId - ID of the article to edit
     */
    async function openEditArticleModal(articleId) {
        try {
            const response = await fetch(`/api/articles/${articleId}`);
            const data = await response.json();
            
            if (data.article) {
                // Populate form with article data
                articleIdInput.value = data.article.id;
                titleInput.value = data.article.title;
                summaryInput.value = data.article.summary;
                contentInput.value = data.article.content;
                
                // Set thumbnail image if available
                if (data.article.image && thumbnailPreview && thumbnailUrl) {
                    thumbnailPreview.src = data.article.image;
                    thumbnailUrl.value = data.article.image;
                } else if (thumbnailPreview) {
                    thumbnailPreview.src = '/static/img/article-placeholder.jpg';
                    if (thumbnailUrl) thumbnailUrl.value = '';
                }
                
                // Set modal title
                modalTitle.textContent = 'تعديل المقال';
                
                // Show modal
                articleModal.style.display = 'block';
            } else {
                showNotification('لم يتم العثور على المقال', 'error');
            }
        } catch (error) {
            console.error('Error fetching article details:', error);
            showNotification('حدث خطأ أثناء تحميل بيانات المقال', 'error');
        }
    }
    
    /**
     * Close the article modal
     */
    function closeArticleModal() {
        articleModal.style.display = 'none';
    }
    
    /**
     * Handle article form submission
     */
    async function handleArticleFormSubmit() {
        try {
            // Get form data
            const articleId = articleIdInput.value.trim();
            const title = titleInput.value.trim();
            const summary = summaryInput.value.trim();
            const content = contentInput.value.trim();
            const image = thumbnailUrl ? thumbnailUrl.value.trim() : '';
            
            // Validate form data
            if (!title || !summary || !content) {
                showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
                return;
            }
            
            // Prepare article data
            const articleData = {
                title,
                summary,
                content,
                image
            };
            
            // Determine if this is an add or edit operation
            const isEdit = articleId !== '';
            const url = isEdit ? `/api/articles/${articleId}` : '/api/articles';
            const method = isEdit ? 'PUT' : 'POST';
            
            // Send request
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(articleData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification(
                    isEdit ? 'تم تحديث المقال بنجاح' : 'تمت إضافة المقال بنجاح', 
                    'success'
                );
                closeArticleModal();
                fetchArticles(); // Refresh the articles list
            } else {
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء حفظ المقال'}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting article form:', error);
            showNotification('حدث خطأ أثناء حفظ المقال', 'error');
        }
    }
    
    /**
     * Handle image upload for articles
     */
    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file
        if (!file.type.match('image.*')) {
            showNotification('يرجى اختيار ملف صورة صالح', 'error');
            return;
        }
        
        // Show progress bar
        if (imageProgress) {
            imageProgress.style.display = 'block';
            imageProgress.querySelector('.progress-bar').style.width = '0%';
        }
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload/article-image', {
                method: 'POST',
                body: formData,
                // Using XHR to track upload progress
                xhr: function() {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable && imageProgress) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            imageProgress.querySelector('.progress-bar').style.width = percentComplete + '%';
                        }
                    }, false);
                    return xhr;
                }
            });
            
            const result = await response.json();
            
            // Set progress to 100%
            if (imageProgress) {
                imageProgress.querySelector('.progress-bar').style.width = '100%';
            }
            
            if (result.file_url) {
                // Insert image URL into content at cursor position
                const contentTextarea = document.getElementById('content');
                if (!contentTextarea) return;
                
                const cursorPos = contentTextarea.selectionStart;
                const textBefore = contentTextarea.value.substring(0, cursorPos);
                const textAfter = contentTextarea.value.substring(cursorPos);
                
                // Create image HTML tag
                const imageTag = `<img src="${result.file_url}" alt="صورة المقال" style="max-width: 100%; display: block; margin: 20px auto; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">`;
                
                // Insert the image tag at cursor position
                contentTextarea.value = textBefore + imageTag + textAfter;
                
                // Hide image upload container
                const uploadContainer = document.getElementById('article-image-upload-container');
                if (uploadContainer) {
                    uploadContainer.style.display = 'none';
                }
                
                // Reset file input
                e.target.value = '';
                
                showNotification('تم رفع الصورة بنجاح', 'success');
            } else {
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء رفع الصورة'}`, 'error');
            }
            
            // Hide progress bar after a delay
            setTimeout(() => {
                if (imageProgress) {
                    imageProgress.style.display = 'none';
                }
            }, 1000);
        } catch (error) {
            console.error('Error uploading image:', error);
            showNotification('حدث خطأ أثناء رفع الصورة', 'error');
            
            // Hide progress bar
            if (imageProgress) {
                imageProgress.style.display = 'none';
            }
        }
    }
    
    /**
     * Handle thumbnail image upload
     */
    async function handleThumbnailUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file
        if (!file.type.match('image.*')) {
            showNotification('يرجى اختيار ملف صورة صالح', 'error');
            return;
        }
        
        // Show progress bar
        if (thumbnailProgress) {
            thumbnailProgress.style.display = 'block';
            thumbnailProgress.querySelector('.progress-bar').style.width = '0%';
        }
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload/article-image', {
                method: 'POST',
                body: formData,
                // Using XHR to track upload progress
                xhr: function() {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable && thumbnailProgress) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            thumbnailProgress.querySelector('.progress-bar').style.width = percentComplete + '%';
                        }
                    }, false);
                    return xhr;
                }
            });
            
            const result = await response.json();
            
            // Set progress to 100%
            if (thumbnailProgress) {
                thumbnailProgress.querySelector('.progress-bar').style.width = '100%';
            }
            
            if (result.file_url) {
                // Update thumbnail preview and hidden input
                if (thumbnailPreview) {
                    thumbnailPreview.src = result.file_url;
                }
                
                if (thumbnailUrl) {
                    thumbnailUrl.value = result.file_url;
                }
                
                showNotification('تم رفع الصورة المصغرة بنجاح', 'success');
            } else {
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء رفع الصورة المصغرة'}`, 'error');
            }
            
            // Hide progress bar after a delay
            setTimeout(() => {
                if (thumbnailProgress) {
                    thumbnailProgress.style.display = 'none';
                }
            }, 1000);
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
            showNotification('حدث خطأ أثناء رفع الصورة المصغرة', 'error');
            
            // Hide progress bar
            if (thumbnailProgress) {
                thumbnailProgress.style.display = 'none';
            }
        }
    }
    
    /**
     * Show confirmation dialog for deleting an article
     * @param {string} articleId - ID of the article to delete
     */
    function confirmDeleteArticle(articleId) {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا المقال؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            deleteArticle(articleId);
        }
    }
    
    /**
     * Delete an article
     * @param {string} articleId - ID of the article to delete
     */
    async function deleteArticle(articleId) {
        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification('تم حذف المقال بنجاح', 'success');
                fetchArticles(); // Refresh the articles list
            } else {
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء حذف المقال'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            showNotification('حدث خطأ أثناء حذف المقال', 'error');
        }
    }
    
    /**
     * Show notification message
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, success, error)
     */
    // تعريف الوظيفة كمتغير عالمي
    window.showNotification = function(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
    
    /**
     * Preview an article in a modal dialog
     * @param {number} articleId - ID of the article to preview
     */
    // تعريف الوظيفة كمتغير عالمي
    window.previewArticle = async function(articleId) {
        try {
            // Fetch article data
            const response = await fetch(`/api/articles/${articleId}`);
            const data = await response.json();
            
            if (!data.article) {
                showNotification('لم يتم العثور على المقال', 'error');
                return;
            }
            
            // Create modal elements if they don't exist
            let previewModal = document.getElementById('articlePreviewModal');
            if (!previewModal) {
                previewModal = document.createElement('div');
                previewModal.id = 'articlePreviewModal';
                previewModal.className = 'modal';
                
                previewModal.innerHTML = `
                    <div class="modal-content" style="max-width: 800px;">
                        <div class="modal-header">
                            <h3 class="modal-title" id="previewTitle"></h3>
                            <button class="close-btn" onclick="document.getElementById('articlePreviewModal').style.display = 'none';">&times;</button>
                        </div>
                        <div id="previewDate" style="margin-bottom: 15px; color: #6c757d;"></div>
                        <div id="previewSummary" style="font-weight: bold; margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;"></div>
                        <div id="previewContent" style="line-height: 1.6;"></div>
                    </div>
                `;
                
                document.body.appendChild(previewModal);
            }
            
            // Populate modal with article data
            document.getElementById('previewTitle').textContent = data.article.title;
            document.getElementById('previewDate').textContent = `تاريخ النشر: ${data.article.created_at}`;
            document.getElementById('previewSummary').textContent = data.article.summary;
            document.getElementById('previewContent').innerHTML = data.article.content;
            
            // Show the modal
            previewModal.style.display = 'block';
            
        } catch (error) {
            console.error('Error previewing article:', error);
            showNotification('حدث خطأ أثناء عرض المقال', 'error');
        }
    }
});