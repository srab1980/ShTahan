/**
 * Articles module for Sheikh Mustafa Al-Tahhan website
 * Handles articles loading, display, creation and editing
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const articlesContainer = document.querySelector('.articles-container');
    const addArticleForm = document.getElementById('add-article-form');
    const articlesSection = document.getElementById('articles');
    
    // Add a container for the "Add New Article" button if articles section exists
    if (articlesSection) {
        const sectionTitle = articlesSection.querySelector('.section-title');
        if (sectionTitle) {
            const addButtonContainer = document.createElement('div');
            addButtonContainer.className = 'text-center';
            addButtonContainer.style.marginTop = '30px';
            addButtonContainer.innerHTML = `
                <button id="show-add-article-form" class="btn btn-primary">
                    <i class="fas fa-plus" style="margin-left: 8px;"></i> إضافة مقال جديد
                </button>
            `;
            sectionTitle.appendChild(addButtonContainer);
            
            // Create the form but don't append it yet
            const formContainer = document.createElement('div');
            formContainer.id = 'article-form-container';
            formContainer.className = 'article-form-container';
            formContainer.style.display = 'none';
            formContainer.style.maxWidth = '800px';
            formContainer.style.margin = '30px auto';
            formContainer.style.backgroundColor = 'white';
            formContainer.style.padding = '30px';
            formContainer.style.borderRadius = '10px';
            formContainer.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            
            formContainer.innerHTML = `
                <div class="form-header">
                    <h3 id="form-title">إضافة مقال جديد</h3>
                    <span class="close-form">&times;</span>
                </div>
                <form id="article-form">
                    <input type="hidden" id="article-id" value="">
                    <div class="form-group">
                        <label for="article-title">العنوان:</label>
                        <input type="text" id="article-title" required>
                    </div>
                    <div class="form-group">
                        <label for="article-summary">ملخص المقال:</label>
                        <textarea id="article-summary" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="article-content">محتوى المقال:</label>
                        <textarea id="article-content" rows="10" required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">حفظ</button>
                        <button type="button" class="btn btn-secondary cancel-form">إلغاء</button>
                    </div>
                </form>
            `;
            
            articlesSection.appendChild(formContainer);
            
            // Event listener for add article button
            document.getElementById('show-add-article-form').addEventListener('click', showAddArticleForm);
            
            // Event listener for close form button
            const closeFormBtn = formContainer.querySelector('.close-form');
            closeFormBtn.addEventListener('click', hideArticleForm);
            
            // Event listener for cancel button
            const cancelBtn = formContainer.querySelector('.cancel-form');
            cancelBtn.addEventListener('click', hideArticleForm);
            
            // Event listener for form submission
            const articleForm = document.getElementById('article-form');
            articleForm.addEventListener('submit', handleArticleSubmit);
        }
    }
    
    // Fetch articles from API
    async function fetchArticles() {
        try {
            const response = await fetch('/api/articles');
            const data = await response.json();
            renderArticles(data.articles);
        } catch (error) {
            console.error('Error fetching articles:', error);
            if (articlesContainer) {
                articlesContainer.innerHTML = '<p class="error-message">حدث خطأ في تحميل المقالات</p>';
            }
        }
    }
    
    // Render articles to the DOM
    function renderArticles(articles) {
        if (!articlesContainer) return;
        
        if (articles.length === 0) {
            articlesContainer.innerHTML = '<p class="no-articles">لا توجد مقالات متاحة</p>';
            return;
        }
        
        articlesContainer.innerHTML = '';
        
        articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            articleCard.dataset.id = article.id;
            
            articleCard.innerHTML = `
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <div class="article-actions">
                    <a href="javascript:void(0);" class="btn btn-secondary read-more" data-article-id="${article.id}">اقرأ المزيد</a>
                    <button class="btn edit-article" data-article-id="${article.id}">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn delete-article" data-article-id="${article.id}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            `;
            
            articlesContainer.appendChild(articleCard);
            
            // Add event listeners
            const readMoreBtn = articleCard.querySelector('.read-more');
            readMoreBtn.addEventListener('click', () => openArticleModal(article));
            
            const editBtn = articleCard.querySelector('.edit-article');
            editBtn.addEventListener('click', () => showEditArticleForm(article));
            
            const deleteBtn = articleCard.querySelector('.delete-article');
            deleteBtn.addEventListener('click', () => confirmDeleteArticle(article.id));
        });
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
        e.preventDefault();
        
        const articleId = document.getElementById('article-id').value;
        const title = document.getElementById('article-title').value;
        const summary = document.getElementById('article-summary').value;
        const content = document.getElementById('article-content').value;
        
        const articleData = {
            title,
            summary,
            content
        };
        
        try {
            let response;
            let method;
            let url;
            
            if (articleId) {
                // Update existing article
                method = 'PUT';
                url = `/api/articles/${articleId}`;
            } else {
                // Create new article
                method = 'POST';
                url = '/api/articles';
            }
            
            response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(articleData)
            });
            
            const result = await response.json();
            
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
                    <div class="article-actions" style="margin-top: 30px; text-align: center;">
                        <button class="btn btn-secondary edit-article-modal" data-article-id="${article.id}">
                            <i class="fas fa-edit"></i> تعديل المقال
                        </button>
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
        
        // Add event listener to edit button in modal
        const editBtn = modal.querySelector('.edit-article-modal');
        editBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
                showEditArticleForm(article);
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
    
    // Initialize the module
    fetchArticles();
});