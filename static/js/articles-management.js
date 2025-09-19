/**
 * @file Manages the articles administration interface.
 * @description Handles listing, adding, editing, deleting, and previewing articles.
 */

/**
 * Inserts an HTML tag into a textarea at the current cursor position.
 * @param {string} tagName - The name of the HTML tag to insert (e.g., 'h2', 'p').
 */
window.insertTag = function(tagName) {
    const contentArea = document.getElementById('content');
    if (!contentArea) return;
    const start = contentArea.selectionStart;
    const end = contentArea.selectionEnd;
    const selectedText = contentArea.value.substring(start, end);
    let replacement = '';
    switch (tagName) {
        case 'h2': replacement = `<h2>${selectedText || 'عنوان رئيسي'}</h2>`; break;
        case 'p': replacement = `<p>${selectedText || 'فقرة جديدة'}</p>`; break;
        // Add other cases as needed
        default: replacement = selectedText;
    }
    contentArea.focus();
    document.execCommand('insertText', false, replacement);
};

/**
 * Shows a notification message to the user.
 * @param {string} message - The message to display.
 * @param {string} [type='info'] - The type of notification ('info', 'success', 'error').
 */
window.showNotification = function(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => notification.classList.remove('show'), 5000);
};

/**
 * Fetches articles and renders them in the management table.
 */
async function fetchArticles() {
    const articlesTableBody = document.getElementById('articlesTableBody');
    if (!articlesTableBody) return;
    articlesTableBody.innerHTML = '<tr><td colspan="4">جاري تحميل المقالات...</td></tr>';
    try {
        const response = await fetch('/api/articles');
        const data = await response.json();
        renderArticles(data.articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        articlesTableBody.innerHTML = '<tr><td colspan="4">حدث خطأ أثناء تحميل المقالات.</td></tr>';
    }
}

/**
 * Renders a list of articles into the main table.
 * @param {Array<Object>} articles - The array of article objects.
 */
function renderArticles(articles) {
    const articlesTableBody = document.getElementById('articlesTableBody');
    articlesTableBody.innerHTML = '';
    if (!articles || articles.length === 0) {
        articlesTableBody.innerHTML = '<tr><td colspan="4">لا توجد مقالات للعرض.</td></tr>';
        return;
    }
    articles.forEach(article => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${article.title}</td>
            <td>${article.summary.substring(0, 100)}...</td>
            <td>${new Date(article.created_at).toLocaleDateString()}</td>
            <td class="article-actions">
                <button class="view-btn" data-id="${article.id}"><i class="fas fa-eye"></i> عرض</button>
                <button class="edit-btn" data-id="${article.id}"><i class="fas fa-edit"></i> تعديل</button>
                <button class="delete-btn" data-id="${article.id}"><i class="fas fa-trash"></i> حذف</button>
            </td>`;
        articlesTableBody.appendChild(tr);
    });
    addActionButtonListeners();
}

/**
 * Adds event listeners to all action buttons in the articles table.
 */
function addActionButtonListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => openEditArticleModal(e.currentTarget.dataset.id)));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => confirmDeleteArticle(e.currentTarget.dataset.id)));
    document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', (e) => previewArticle(e.currentTarget.dataset.id)));
}

/**
 * Opens the article modal for adding a new article.
 */
function openAddArticleModal() {
    const articleForm = document.getElementById('articleForm');
    articleForm.reset();
    document.getElementById('articleId').value = '';
    document.getElementById('modalTitle').textContent = 'إضافة مقال جديد';
    document.getElementById('articleModal').style.display = 'block';
}

/**
 * Fetches an article's data and opens the modal for editing.
 * @param {number} articleId - The ID of the article to edit.
 */
async function openEditArticleModal(articleId) {
    try {
        const response = await fetch(`/api/articles/${articleId}`);
        const data = await response.json();
        if (data.article) {
            document.getElementById('articleId').value = data.article.id;
            document.getElementById('title').value = data.article.title;
            document.getElementById('summary').value = data.article.summary;
            document.getElementById('content').value = data.article.content;
            document.getElementById('thumbnailUrl').value = data.article.image || '';
            document.getElementById('thumbnailPreview').src = data.article.image || '/static/img/article-placeholder.jpg';
            document.getElementById('modalTitle').textContent = 'تعديل المقال';
            document.getElementById('articleModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching article for editing:', error);
    }
}

/**
 * Closes the article modal.
 */
function closeArticleModal() {
    document.getElementById('articleModal').style.display = 'none';
}

/**
 * Handles the submission of the article form (for both add and edit).
 */
async function handleArticleFormSubmit() {
    const articleId = document.getElementById('articleId').value;
    const articleData = {
        title: document.getElementById('title').value,
        summary: document.getElementById('summary').value,
        content: document.getElementById('content').value,
        image: document.getElementById('thumbnailUrl').value,
    };

    const url = articleId ? `/api/articles/${articleId}` : '/api/articles';
    const method = articleId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleData),
        });
        if (response.ok) {
            window.showNotification('تم حفظ المقال بنجاح', 'success');
            closeArticleModal();
            fetchArticles();
        } else {
            const result = await response.json();
            window.showNotification(result.error || 'حدث خطأ', 'error');
        }
    } catch (error) {
        console.error('Error saving article:', error);
    }
}

/**
 * Handles the upload of an image file.
 * @param {Event} e - The file input change event.
 * @param {string} endpoint - The API endpoint to upload the image to.
 * @param {HTMLInputElement} urlInput - The input field to store the returned URL.
 * @param {HTMLImageElement} previewElement - The image element for the preview.
 */
async function handleFileUpload(e, endpoint, urlInput, previewElement) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(endpoint, { method: 'POST', body: formData });
        const result = await response.json();
        if (response.ok) {
            if(urlInput) urlInput.value = result.file_url;
            if(previewElement) previewElement.src = result.file_url;
            window.showNotification('تم رفع الصورة بنجاح', 'success');
        } else {
            window.showNotification(result.error || 'فشل رفع الصورة', 'error');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

/**
 * Shows a confirmation dialog before deleting an article.
 * @param {number} articleId - The ID of the article to delete.
 */
function confirmDeleteArticle(articleId) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المقال؟')) {
        deleteArticle(articleId);
    }
}

/**
 * Deletes an article from the server.
 * @param {number} articleId - The ID of the article to delete.
 */
async function deleteArticle(articleId) {
    try {
        const response = await fetch(`/api/articles/${articleId}`, { method: 'DELETE' });
        if (response.ok) {
            window.showNotification('تم حذف المقال بنجاح', 'success');
            fetchArticles();
        } else {
            window.showNotification('فشل حذف المقال', 'error');
        }
    } catch (error) {
        console.error('Error deleting article:', error);
    }
}

/**
 * Initializes all event listeners for the article management page.
 */
function initializeEventListeners() {
    document.getElementById('addArticleBtn')?.addEventListener('click', openAddArticleModal);
    document.getElementById('closeModal')?.addEventListener('click', closeArticleModal);
    document.getElementById('cancelBtn')?.addEventListener('click', closeArticleModal);
    document.getElementById('saveBtn')?.addEventListener('click', handleArticleFormSubmit);
    document.getElementById('thumbnailUploadBtn')?.addEventListener('click', () => document.getElementById('thumbnailUpload').click());
    document.getElementById('thumbnailUpload')?.addEventListener('change', (e) => handleFileUpload(e, '/api/upload/article-image', document.getElementById('thumbnailUrl'), document.getElementById('thumbnailPreview')));
}

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    fetchArticles();
});