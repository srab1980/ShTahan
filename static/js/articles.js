/**
 * Articles module for Sheikh Mustafa Al-Tahhan website
 * Handles articles loading and display
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const articlesContainer = document.querySelector('.articles-container');
    
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
            
            articleCard.innerHTML = `
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <a href="javascript:void(0);" class="btn btn-secondary" data-article-id="${article.id}">اقرأ المزيد</a>
            `;
            
            articlesContainer.appendChild(articleCard);
            
            // Add event listener to the "Read More" button
            const readMoreBtn = articleCard.querySelector('.btn');
            readMoreBtn.addEventListener('click', () => openArticleModal(article));
        });
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
    
    // Initialize the module
    fetchArticles();
});