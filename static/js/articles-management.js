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
                    <button class="view-btn" onclick="window.open('/articles/${article.id}', '_blank')">
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
            
            // Validate form data
            if (!title || !summary || !content) {
                showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
                return;
            }
            
            // Prepare article data
            const articleData = {
                title,
                summary,
                content
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
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
});