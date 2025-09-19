/**
 * @file Manages the public-facing articles page.
 * @description Handles fetching, rendering, and displaying articles in a modal view.
 */

/**
 * Fetches articles from the API and renders them.
 * Caches results in sessionStorage to improve performance.
 */
async function fetchArticles() {
    const articlesContainer = document.querySelector('.articles-container');
    if (!articlesContainer) return;

    const cachedArticles = sessionStorage.getItem('cachedArticles');
    if (cachedArticles) {
        renderArticles(JSON.parse(cachedArticles));
        return;
    }

    articlesContainer.innerHTML = '<div class="loader-container"><div class="loader-pulse"></div></div>';
    try {
        const response = await fetch('/api/articles');
        const data = await response.json();
        sessionStorage.setItem('cachedArticles', JSON.stringify(data.articles));
        renderArticles(data.articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        articlesContainer.innerHTML = '<p class="error-message">حدث خطأ في تحميل المقالات.</p>';
    }
}

/**
 * Renders a list of articles to the DOM.
 * @param {Array<Object>} articles - An array of article objects.
 */
function renderArticles(articles) {
    const articlesContainer = document.querySelector('.articles-container');
    if (!articlesContainer) return;
    articlesContainer.innerHTML = '';

    if (!articles || articles.length === 0) {
        articlesContainer.innerHTML = '<p class="no-articles">لا توجد مقالات متاحة.</p>';
        return;
    }

    const sortedArticles = [...articles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const isHomepage = window.location.pathname === '/';
    const articlesToDisplay = isHomepage ? sortedArticles.slice(0, 6) : sortedArticles;

    articlesToDisplay.forEach(article => {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        articleCard.dataset.id = article.id;
        const thumbnailSrc = article.image || '/static/img/article-placeholder.jpg';
        articleCard.innerHTML = `
            <div class="article-image">
                <img src="${thumbnailSrc}" alt="${article.title}" loading="lazy" onerror="this.src='/static/img/article-placeholder.jpg'">
            </div>
            <div class="article-details">
                <h3 class="article-title">${article.title}</h3>
                <p class="article-summary">${article.summary}</p>
                <div class="article-actions">
                    <a href="#" class="btn btn-secondary read-more" data-article-id="${article.id}">اقرأ المزيد</a>
                </div>
            </div>`;
        articlesContainer.appendChild(articleCard);
    });

    document.querySelectorAll('.read-more').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const articleId = e.target.dataset.articleId;
            const article = articles.find(a => a.id == articleId);
            if (article) openArticleModal(article);
        });
    });
}

/**
 * Opens a modal to display the full content of an article.
 * @param {Object} article - The article object to display.
 */
function openArticleModal(article) {
    const existingModal = document.getElementById('article-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'article-modal';
    modal.className = 'modal';
    const thumbnailSrc = article.image || '/static/img/article-placeholder.jpg';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="article-full">
                <h2>${article.title}</h2>
                <div class="article-meta"><span class="article-date">${article.created_at}</span></div>
                <div class="article-featured-image"><img src="${thumbnailSrc}" alt="${article.title}" onerror="this.src='/static/img/article-placeholder.jpg'"></div>
                <div class="article-summary">${article.summary}</div>
                <div class="article-content">${article.content}</div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const closeModal = () => {
        modal.style.display = 'none';
        modal.remove();
        document.removeEventListener('keydown', onKeyDown);
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') closeModal();
    };

    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', onKeyDown);

    modal.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', fetchArticles);