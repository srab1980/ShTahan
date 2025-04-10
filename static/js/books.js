/**
 * Books module for Sheikh Mustafa Al-Tahhan website
 * Handles book data loading, filtering, and adding new books
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const booksContainer = document.getElementById('books-container');
    const languageFilter = document.getElementById('language-filter');
    const categoryFilter = document.getElementById('category-filter');
    const addBookForm = document.getElementById('add-book-form');
    
    // Store books data
    let booksData = [];
    
    // Fetch books from JSON file
    async function fetchBooks() {
        try {
            const response = await fetch('/static/data/books.json');
            const data = await response.json();
            booksData = data.books;
            renderBooks(booksData);
        } catch (error) {
            console.error('Error fetching books:', error);
            booksContainer.innerHTML = '<p class="error-message">حدث خطأ في تحميل البيانات</p>';
        }
    }
    
    // Render books to the DOM
    function renderBooks(books) {
        if (!booksContainer) return;
        
        if (books.length === 0) {
            booksContainer.innerHTML = '<p class="no-books">لا توجد كتب متاحة بهذه المعايير</p>';
            return;
        }
        
        booksContainer.innerHTML = '';
        
        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            bookCard.innerHTML = `
                <div class="book-cover">
                    <img src="${book.cover}" alt="${book.title}">
                </div>
                <div class="book-details">
                    <h3>${book.title}</h3>
                    <div class="book-meta">
                        <span class="book-language">${book.language}</span>
                        <span class="book-category">${book.category}</span>
                    </div>
                    <p class="book-description">${book.description}</p>
                    <a href="${book.download}" class="btn btn-secondary" target="_blank">تحميل الكتاب</a>
                </div>
            `;
            
            booksContainer.appendChild(bookCard);
        });
    }
    
    // Filter books by language and category
    function filterBooks() {
        if (!languageFilter || !categoryFilter) return;
        
        const selectedLanguage = languageFilter.value;
        const selectedCategory = categoryFilter.value;
        
        let filteredBooks = [...booksData];
        
        if (selectedLanguage !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.language === selectedLanguage);
        }
        
        if (selectedCategory !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === selectedCategory);
        }
        
        renderBooks(filteredBooks);
    }
    
    // Handle book form submission
    function handleAddBook(e) {
        e.preventDefault();
        
        const newBook = {
            id: booksData.length + 1,
            title: document.getElementById('book-title').value,
            language: document.getElementById('book-language').value,
            category: document.getElementById('book-category').value,
            cover: document.getElementById('book-cover').value,
            download: document.getElementById('book-download').value,
            description: document.getElementById('book-description').value
        };
        
        // Add the new book to the array (in a real app, this would be sent to the server)
        booksData.push(newBook);
        
        // Re-render the books
        filterBooks();
        
        // Reset the form
        addBookForm.reset();
        
        // Show success message
        alert('تمت إضافة الكتاب بنجاح');
    }
    
    // Add event listeners
    if (languageFilter && categoryFilter) {
        languageFilter.addEventListener('change', filterBooks);
        categoryFilter.addEventListener('change', filterBooks);
    }
    
    if (addBookForm) {
        addBookForm.addEventListener('submit', handleAddBook);
    }
    
    // Initialize the module
    fetchBooks();
});
