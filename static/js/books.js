/**
 * Books module for Sheikh Mustafa Al-Tahhan website
 * Handles book data loading, filtering, adding, editing and deleting books
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const booksContainer = document.getElementById('books-container');
    const languageFilter = document.getElementById('language-filter');
    const categoryFilter = document.getElementById('category-filter');
    const addBookForm = document.getElementById('add-book-form');
    const booksSection = document.getElementById('books');
    
    // Store books data
    let booksData = [];
    let currentEditingBookId = null;
    
    // Update Add Book form title and buttons for edit mode
    if (addBookForm) {
        const formTitle = addBookForm.previousElementSibling;
        if (formTitle && formTitle.tagName === 'H3') {
            // Create a hidden field for book ID
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.id = 'book-id';
            addBookForm.appendChild(hiddenField);
            
            // Create cancel button
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'btn btn-secondary';
            cancelButton.id = 'cancel-edit-book';
            cancelButton.style.marginRight = '10px';
            cancelButton.textContent = 'إلغاء';
            cancelButton.style.display = 'none';
            
            // Insert cancel button before submit button
            const submitButton = addBookForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.parentNode.insertBefore(cancelButton, submitButton);
            }
            
            // Add event listener to cancel button
            cancelButton.addEventListener('click', cancelEditBook);
        }
    }
    
    // Fetch books from API
    async function fetchBooks() {
        try {
            const response = await fetch('/api/books');
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
            bookCard.dataset.id = book.id;
            
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
                    <div class="book-actions">
                        <a href="${book.download}" class="btn btn-secondary" target="_blank">تحميل الكتاب</a>
                        <button class="btn edit-book" data-id="${book.id}">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn delete-book" data-id="${book.id}">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            `;
            
            booksContainer.appendChild(bookCard);
            
            // Add event listeners for edit and delete buttons
            const editBtn = bookCard.querySelector('.edit-book');
            editBtn.addEventListener('click', () => {
                populateEditForm(book);
            });
            
            const deleteBtn = bookCard.querySelector('.delete-book');
            deleteBtn.addEventListener('click', () => {
                confirmDeleteBook(book.id);
            });
        });
    }
    
    // Populate edit form with book data
    function populateEditForm(book) {
        if (!addBookForm) return;
        
        // Set hidden book ID
        const bookIdField = document.getElementById('book-id');
        if (bookIdField) {
            bookIdField.value = book.id;
        }
        
        // Populate form fields
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-language').value = book.language;
        document.getElementById('book-category').value = book.category;
        document.getElementById('book-cover').value = book.cover;
        document.getElementById('book-download').value = book.download;
        document.getElementById('book-description').value = book.description;
        
        // Update form title and button text
        const formTitle = addBookForm.previousElementSibling;
        if (formTitle && formTitle.tagName === 'H3') {
            formTitle.textContent = 'تعديل الكتاب';
        }
        
        const submitButton = addBookForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'حفظ التعديلات';
        }
        
        // Show cancel button
        const cancelButton = document.getElementById('cancel-edit-book');
        if (cancelButton) {
            cancelButton.style.display = 'inline-block';
        }
        
        // Set current editing book ID
        currentEditingBookId = book.id;
        
        // Scroll to form
        addBookForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Reset form to add mode
    function cancelEditBook() {
        if (!addBookForm) return;
        
        // Reset form
        addBookForm.reset();
        
        // Reset book ID
        const bookIdField = document.getElementById('book-id');
        if (bookIdField) {
            bookIdField.value = '';
        }
        
        // Update form title and button text
        const formTitle = addBookForm.previousElementSibling;
        if (formTitle && formTitle.tagName === 'H3') {
            formTitle.textContent = 'إضافة كتاب جديد';
        }
        
        const submitButton = addBookForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'إضافة الكتاب';
        }
        
        // Hide cancel button
        const cancelButton = document.getElementById('cancel-edit-book');
        if (cancelButton) {
            cancelButton.style.display = 'none';
        }
        
        // Reset current editing book ID
        currentEditingBookId = null;
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
    
    // Handle book form submission (add or edit)
    async function handleAddBook(e) {
        e.preventDefault();
        
        const bookData = {
            title: document.getElementById('book-title').value,
            language: document.getElementById('book-language').value,
            category: document.getElementById('book-category').value,
            cover: document.getElementById('book-cover').value,
            download: document.getElementById('book-download').value,
            description: document.getElementById('book-description').value
        };
        
        try {
            let response;
            let url;
            let method;
            
            // Check if we're editing or adding
            const bookIdField = document.getElementById('book-id');
            const bookId = bookIdField ? bookIdField.value : '';
            
            if (bookId) {
                // Editing existing book
                url = `/api/books/${bookId}`;
                method = 'PUT';
            } else {
                // Adding new book
                url = '/api/books';
                method = 'POST';
            }
            
            // Send the book data to the server
            response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Refresh the books data
                await fetchBooks();
                
                // Reset the form and UI
                addBookForm.reset();
                cancelEditBook();
                
                // Show success message
                showNotification(
                    bookId ? 'تم تحديث الكتاب بنجاح' : 'تمت إضافة الكتاب بنجاح',
                    'success'
                );
            } else {
                // Show error message
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء معالجة الطلب'}`, 'error');
            }
        } catch (error) {
            console.error('Error processing book:', error);
            showNotification('حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى', 'error');
        }
    }
    
    // Confirm and delete a book
    function confirmDeleteBook(bookId) {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا الكتاب؟')) {
            deleteBook(bookId);
        }
    }
    
    // Delete a book
    async function deleteBook(bookId) {
        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove book from the array
                booksData = booksData.filter(book => book.id !== bookId);
                
                // Re-render the books
                filterBooks();
                
                // Show success message
                showNotification('تم حذف الكتاب بنجاح', 'success');
                
                // If editing this book, reset the form
                if (currentEditingBookId === bookId) {
                    cancelEditBook();
                }
            } else {
                const result = await response.json();
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء حذف الكتاب'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            showNotification('حدث خطأ أثناء حذف الكتاب، يرجى المحاولة مرة أخرى', 'error');
        }
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
