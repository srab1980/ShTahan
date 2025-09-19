/**
 * @file Manages the books page, including loading, filtering, and admin functionalities.
 * @author Your Name
 */

// State management
let booksData = [];
let currentEditingBookId = null;

/**
 * Renders a list of books to the DOM.
 * @param {Array<Object>} books - The array of book objects to render.
 * @param {HTMLElement} container - The container element to render the books into.
 */
function renderBooks(books, container) {
    if (!container) return;
    container.innerHTML = '';

    if (books.length === 0) {
        container.innerHTML = '<p class="no-books">لا توجد كتب متاحة بهذه المعايير</p>';
        return;
    }

    const sortedBooks = [...books].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const isHomepage = window.location.pathname === '/';
    const booksToDisplay = isHomepage ? sortedBooks.slice(0, 8) : sortedBooks;

    booksToDisplay.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.dataset.id = book.id;
        bookCard.innerHTML = `
            <div class="book-cover"><img src="${book.cover}" alt="${book.title}"></div>
            <div class="book-details">
                <h3>${book.title}</h3>
                <div class="book-meta">
                    <span class="book-language">${book.language}</span>
                    <span class="book-category">${book.category}</span>
                </div>
                <p class="book-description">${book.description}</p>
                <div class="book-actions">
                    <a href="${book.download}" class="btn btn-secondary" target="_blank">
                        <i class="fas fa-download"></i> تحميل الكتاب
                    </a>
                </div>
            </div>`;
        container.appendChild(bookCard);
    });

    if (isHomepage && books.length > 8) {
        const viewAllBtn = document.querySelector('.view-all-container a');
        if (viewAllBtn && !viewAllBtn.textContent.includes(`(${books.length})`)) {
            viewAllBtn.innerHTML = `<i class="fas fa-book"></i> عرض جميع الكتب (${books.length})`;
        }
    }
}

/**
 * Fetches books from the API and renders them.
 * @param {HTMLElement} container - The container element for the books.
 */
async function fetchAndRenderBooks(container) {
    if (!container) return;
    container.innerHTML = `<div class="loader-container"><div class="loader-spinner"></div><div class="loader-text">جاري تحميل الكتب...</div></div>`;
    try {
        const response = await fetch('/api/books');
        const data = await response.json();
        if (data.books) {
            booksData = data.books;
            renderBooks(booksData, container);
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        container.innerHTML = `<div class="error-message"><p>حدث خطأ في تحميل البيانات.</p><button onclick="location.reload()">إعادة المحاولة</button></div>`;
    }
}

/**
 * Filters the displayed books based on selected language and category.
 * @param {HTMLElement} container - The container element for the books.
 * @param {HTMLSelectElement} langFilter - The language filter dropdown.
 * @param {HTMLSelectElement} catFilter - The category filter dropdown.
 */
function filterBooks(container, langFilter, catFilter) {
    const selectedLanguage = langFilter.value;
    const selectedCategory = catFilter.value;
    let filteredBooks = booksData;

    if (selectedLanguage !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.language === selectedLanguage);
    }
    if (selectedCategory !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.category === selectedCategory);
    }
    renderBooks(filteredBooks, container);
}


/**
 * Initializes the book filtering functionality.
 */
function setupFiltering() {
    const booksContainer = document.getElementById('books-container');
    const languageFilter = document.getElementById('language-filter');
    const categoryFilter = document.getElementById('category-filter');

    if (languageFilter && categoryFilter) {
        languageFilter.addEventListener('change', () => filterBooks(booksContainer, languageFilter, categoryFilter));
        categoryFilter.addEventListener('change', () => filterBooks(booksContainer, languageFilter, categoryFilter));
    }
}

/**
 * Initializes the main functionality for the books page.
 */
function initBooksPage() {
    const booksContainer = document.getElementById('books-container');
    fetchAndRenderBooks(booksContainer);
    setupFiltering();
    // Assuming setupActivityTracking is a global function
    if (typeof setupActivityTracking === 'function') {
        setupActivityTracking();
    }
}

document.addEventListener('DOMContentLoaded', initBooksPage);