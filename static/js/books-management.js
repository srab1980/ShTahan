/**
 * Books Management module for Sheikh Mustafa Al-Tahhan website
 * Handles book administration in the dashboard including:
 * - Listing books with filters
 * - Adding new books
 * - Editing existing books
 * - Deleting books
 * - Uploading book covers and PDFs
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const booksTableBody = document.getElementById('booksTableBody');
    const addBookBtn = document.getElementById('addBookBtn');
    const bookModal = document.getElementById('bookModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const bookForm = document.getElementById('bookForm');
    const modalTitle = document.getElementById('modalTitle');
    const coverUpload = document.getElementById('coverUpload');
    const pdfUpload = document.getElementById('pdfUpload');
    const coverPreview = document.getElementById('coverPreview');
    const coverProgress = document.getElementById('coverProgress');
    const pdfProgress = document.getElementById('pdfProgress');
    const languageFilter = document.getElementById('language-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    // Store all books data for filtering
    let booksData = [];
    
    // Initial data loading
    fetchBooks();
    
    // Check auth status to confirm admin/editor role
    checkAuthStatus();
    
    // Event listeners
    if (addBookBtn) {
        addBookBtn.addEventListener('click', openAddBookModal);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeBookModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeBookModal);
    }
    
    // Add event listener to the save button
    const saveBookBtn = document.getElementById('saveBookBtn');
    if (saveBookBtn) {
        saveBookBtn.addEventListener('click', handleBookFormSubmit);
        console.log('Save button event listener attached');
    }
    
    // Keep form submit as a backup, but it shouldn't be used now
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted via standard submit');
            handleBookFormSubmit(e);
        });
    }
    
    if (coverUpload) {
        coverUpload.addEventListener('change', handleCoverUpload);
    }
    
    // Add event listener for cover URL input
    const coverUrlInput = document.getElementById('cover');
    if (coverUrlInput) {
        coverUrlInput.addEventListener('input', function() {
            const url = this.value.trim();
            if (url) {
                // Show preview
                if (coverPreview) {
                    coverPreview.innerHTML = `
                        <img src="${url}" alt="Cover Preview" style="max-width: 100%; max-height: 150px; border-radius: 5px;" 
                            onerror="this.src='/static/img/default-book-cover.svg'; this.onerror=null; console.error('فشل تحميل الصورة من الرابط:', '${url}')">
                    `;
                    
                    // تسجيل محاولة تحميل الصورة
                    console.log('محاولة تحميل صورة الغلاف من الرابط:', url);
                }
            } else {
                // Clear preview
                if (coverPreview) {
                    coverPreview.innerHTML = '';
                }
            }
        });
    }
    
    if (pdfUpload) {
        pdfUpload.addEventListener('change', handlePdfUpload);
    }
    
    if (languageFilter && categoryFilter) {
        languageFilter.addEventListener('change', filterBooks);
        categoryFilter.addEventListener('change', filterBooks);
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === bookModal) {
            closeBookModal();
        }
    });
    
    /**
     * Check if the user has admin or editor privileges
     */
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth-status');
            const data = await response.json();
            
            if (!data.authenticated) {
                window.location.href = '/login-form?check_auth=false';
                return;
            }
            
            // Update user info in the header
            const userRole = document.getElementById('userRole');
            const userName = document.getElementById('userName');
            
            if (userRole) {
                userRole.textContent = getRoleLabel(data.role);
            }
            
            if (userName) {
                userName.innerHTML = `مرحباً، <strong>${data.username}</strong>`;
            }
            
            // If not admin or editor, redirect to home
            if (data.role !== 'admin' && data.role !== 'editor') {
                showNotification('ليس لديك صلاحية الوصول إلى هذه الصفحة', 'error');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        } catch (error) {
            console.error('Auth status check error:', error);
        }
    }
    
    /**
     * Get Arabic label for user role
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
     * Fetch all books from the API
     */
    async function fetchBooks() {
        try {
            const response = await fetch('/api/books');
            const data = await response.json();
            
            if (response.ok) {
                booksData = data.books;
                renderBooks(booksData);
            } else {
                showNotification(`خطأ: ${data.error || 'حدث خطأ في تحميل البيانات'}`, 'error');
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            showNotification('حدث خطأ في الاتصال بالخادم', 'error');
        }
    }
    
    /**
     * Render books in the table
     */
    function renderBooks(books) {
        if (!booksTableBody) return;
        
        if (books.length === 0) {
            booksTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px;">
                        لا توجد كتب متاحة بهذه المعايير
                    </td>
                </tr>
            `;
            return;
        }
        
        booksTableBody.innerHTML = '';
        
        books.forEach(book => {
            const row = document.createElement('tr');
            
            // Truncate description
            const shortDescription = book.description.length > 100 
                ? book.description.substring(0, 100) + '...' 
                : book.description;
            
            row.innerHTML = `
                <td>
                    <img src="${book.cover}" alt="${book.title}" class="book-cover-thumbnail" 
                        onerror="this.src='/static/img/default-book-cover.svg'; this.onerror=null;">
                </td>
                <td>${book.title}</td>
                <td>${book.language}</td>
                <td>${book.category}</td>
                <td>${shortDescription}</td>
                <td class="book-actions">
                    <button class="view-btn" data-id="${book.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="edit-btn" data-id="${book.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-id="${book.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            booksTableBody.appendChild(row);
            
            // Add event listeners to the buttons
            const viewBtn = row.querySelector('.view-btn');
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            viewBtn.addEventListener('click', () => {
                // Open a new window and display book details in a readable format
                const win = window.open('', '_blank');
                win.document.write(`
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${book.title} - معلومات الكتاب</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                padding: 20px;
                                max-width: 800px;
                                margin: 0 auto;
                            }
                            .book-container {
                                display: flex;
                                gap: 20px;
                                margin-bottom: 30px;
                            }
                            .book-cover {
                                flex: 0 0 200px;
                            }
                            .book-cover img {
                                max-width: 100%;
                                border-radius: 5px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
                            }
                            .book-info {
                                flex: 1;
                            }
                            h1 {
                                margin-top: 0;
                                color: #1a2a3a;
                            }
                            .book-meta {
                                display: flex;
                                gap: 10px;
                                margin-bottom: 20px;
                            }
                            .book-meta span {
                                background-color: #f0f0f0;
                                padding: 5px 10px;
                                border-radius: 3px;
                                font-size: 14px;
                            }
                            .download-btn {
                                display: inline-block;
                                padding: 10px 20px;
                                background-color: #1a2a3a;
                                color: white;
                                text-decoration: none;
                                border-radius: 5px;
                                margin-top: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="book-container">
                            <div class="book-cover">
                                <img src="${book.cover}" alt="${book.title}" onerror="this.src='/static/img/default-book-cover.svg'; this.onerror=null;">
                            </div>
                            <div class="book-info">
                                <h1>${book.title}</h1>
                                <div class="book-meta">
                                    <span>اللغة: ${book.language}</span>
                                    <span>التصنيف: ${book.category}</span>
                                </div>
                                <h3>الوصف:</h3>
                                <p>${book.description}</p>
                                <a href="${book.download}" class="download-btn" target="_blank">تحميل الكتاب</a>
                            </div>
                        </div>
                        <button onclick="window.close()">إغلاق</button>
                    </body>
                    </html>
                `);
            });
            
            editBtn.addEventListener('click', () => {
                openEditBookModal(book.id);
            });
            
            deleteBtn.addEventListener('click', () => {
                confirmDeleteBook(book.id);
            });
        });
    }
    
    /**
     * Filter books by language and category
     */
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
    
    /**
     * Open modal for adding a new book
     */
    function openAddBookModal() {
        if (!bookModal || !bookForm) return;
        
        // Clear the form
        bookForm.reset();
        
        // Reset hidden book ID
        document.getElementById('bookId').value = '';
        
        // Clear preview
        if (coverPreview) {
            coverPreview.innerHTML = '';
        }
        
        // Update modal title
        if (modalTitle) {
            modalTitle.textContent = 'إضافة كتاب جديد';
        }
        
        // Update submit button text
        const submitBtn = bookForm.querySelector('.save-btn');
        if (submitBtn) {
            submitBtn.textContent = 'حفظ';
        }
        
        // Show the modal
        bookModal.style.display = 'block';
    }
    
    /**
     * Open modal for editing an existing book
     */
    async function openEditBookModal(bookId) {
        if (!bookModal || !bookForm) return;
        
        try {
            const response = await fetch(`/api/books/${bookId}`);
            const data = await response.json();
            
            // Check if response contains book data
            if (response.ok && data.book) {
                const book = data.book;
                
                // Log received data for debugging
                console.log('Book data received:', book);
                
                // Set form values
                document.getElementById('bookId').value = book.id;
                document.getElementById('title').value = book.title;
                document.getElementById('language').value = book.language;
                document.getElementById('category').value = book.category;
                document.getElementById('cover').value = book.cover;
                document.getElementById('download').value = book.download;
                document.getElementById('description').value = book.description;
                
                // Show cover preview
                if (coverPreview) {
                    coverPreview.innerHTML = `
                        <img src="${book.cover}" alt="${book.title}" style="max-width: 100%; max-height: 150px; border-radius: 5px;" 
                            onerror="this.src='/static/img/default-book-cover.svg'; this.onerror=null;">
                    `;
                }
                
                // Update modal title
                if (modalTitle) {
                    modalTitle.textContent = 'تعديل الكتاب';
                }
                
                // Update submit button text
                const submitBtn = bookForm.querySelector('.save-btn');
                if (submitBtn) {
                    submitBtn.textContent = 'حفظ التعديلات';
                }
                
                // Show the modal
                bookModal.style.display = 'block';
            } else {
                showNotification(`خطأ: ${data.error || 'حدث خطأ في تحميل بيانات الكتاب'}`, 'error');
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
            showNotification('حدث خطأ في الاتصال بالخادم', 'error');
        }
    }
    
    /**
     * Close the book modal
     */
    function closeBookModal() {
        if (!bookModal) return;
        
        bookModal.style.display = 'none';
    }
    
    /**
     * Handle book form submission (add or edit)
     */
    async function handleBookFormSubmit(e) {
        if (e) e.preventDefault();
        console.log('Form submission started - triggered by', e ? e.type : 'direct call');
        
        // Get all form values
        const bookId = document.getElementById('bookId').value;
        const title = document.getElementById('title').value;
        const language = document.getElementById('language').value;
        const category = document.getElementById('category').value;
        const cover = document.getElementById('cover').value;
        let download = document.getElementById('download').value;
        const description = document.getElementById('description').value;
        
        // Check mandatory fields (don't include download)
        if (!title || !language || !category || !cover || !description) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            console.log('Missing required fields. Form validation failed.');
            
            // Log which fields are missing
            if (!title) console.log('Missing title');
            if (!language) console.log('Missing language');
            if (!category) console.log('Missing category');
            if (!cover) console.log('Missing cover');
            if (!description) console.log('Missing description');
            
            return;
        }
        
        // Always ensure download has a value
        // If download URL is not set, use a default value
        if (!download || download.trim() === '') {
            download = '#';
            console.log('Using default download URL: #');
            
            // Update the download field to avoid browser validation issues
            document.getElementById('download').value = '#';
        }
        
        const bookData = {
            title,
            language,
            category,
            cover,
            download,
            description
        };
        
        // Log the data being sent
        console.log('Submitting book data:', bookData);
        
        try {
            let url = '/api/books';
            let method = 'POST';
            
            // If editing an existing book
            if (bookId) {
                url = `/api/books/${bookId}`;
                method = 'PUT';
                bookData.id = bookId; // Make sure we include the ID
            }
            
            showNotification('جاري حفظ البيانات...', 'info');
            
            // Use the fetch API to send the data
            console.log(`Sending ${method} request to ${url}`);
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
            
            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);
            
            if (response.ok) {
                showNotification(
                    bookId ? 'تم تحديث الكتاب بنجاح' : 'تمت إضافة الكتاب بنجاح',
                    'success'
                );
                
                // Close the modal and refresh the book list
                closeBookModal();
                fetchBooks();
            } else {
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء معالجة الطلب'}`, 'error');
                console.error('Server error:', result.error);
            }
        } catch (error) {
            console.error('Error saving book:', error);
            showNotification('حدث خطأ في الاتصال بالخادم', 'error');
        }
    }
    
    /**
     * Handle cover image upload
     */
    async function handleCoverUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            showNotification('يرجى اختيار ملف صورة صالح', 'error');
            return;
        }
        
        // Upload the file
        try {
            // Show progress bar
            if (coverProgress) {
                coverProgress.style.display = 'block';
                coverProgress.querySelector('.progress-bar').style.width = '50%';
            }
            
            // Create form data and append file
            const formData = new FormData();
            formData.append('file', file);
            
            // Send the file to the server
            const response = await fetch('/api/upload/book-cover', {
                method: 'POST',
                body: formData
            });
            
            // Update progress bar to 100%
            if (coverProgress) {
                coverProgress.querySelector('.progress-bar').style.width = '100%';
            }
            
            const result = await response.json();
            
            if (response.ok) {
                // Show success notification
                showNotification('تم رفع صورة الغلاف بنجاح', 'success');
                
                // Update the cover URL field
                document.getElementById('cover').value = result.file_url;
                
                // Show preview
                if (coverPreview) {
                    coverPreview.innerHTML = `
                        <img src="${result.file_url}" alt="Cover Preview" style="max-width: 100%; max-height: 150px; border-radius: 5px;"
                            onerror="this.src='/static/img/default-book-cover.svg'; this.onerror=null;">
                    `;
                }
                
                // Hide progress bar after a delay
                setTimeout(() => {
                    if (coverProgress) coverProgress.style.display = 'none';
                }, 1000);
            } else {
                // Show error notification
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء رفع الصورة'}`, 'error');
                
                // Hide progress bar
                if (coverProgress) coverProgress.style.display = 'none';
            }
        } catch (error) {
            console.error('Error uploading cover:', error);
            showNotification('حدث خطأ في الاتصال بالخادم', 'error');
            
            // Hide progress bar
            if (coverProgress) coverProgress.style.display = 'none';
        }
    }
    
    /**
     * Handle PDF file upload
     */
    async function handlePdfUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check if it's a PDF
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            showNotification('يرجى اختيار ملف PDF صالح', 'error');
            return;
        }
        
        // Upload the file
        try {
            // Show progress bar
            if (pdfProgress) {
                pdfProgress.style.display = 'block';
                pdfProgress.querySelector('.progress-bar').style.width = '50%';
            }
            
            console.log('Uploading PDF file:', file.name);
            
            // Create form data and append file
            const formData = new FormData();
            formData.append('file', file);
            
            // Send the file to the server
            const response = await fetch('/api/upload/book-pdf', {
                method: 'POST',
                body: formData
            });
            
            // Update progress bar to 100%
            if (pdfProgress) {
                pdfProgress.querySelector('.progress-bar').style.width = '100%';
            }
            
            const result = await response.json();
            console.log('Server response:', result);
            
            if (response.ok) {
                // Show success notification
                showNotification('تم رفع ملف PDF بنجاح', 'success');
                
                // Update the download URL field with the new URL
                const downloadField = document.getElementById('download');
                
                // Make sure we have a result URL
                if (result.file_url) {
                    downloadField.value = result.file_url;
                    console.log('Updated download field with URL:', result.file_url);
                    
                    // Force update the field value directly via DOM
                    downloadField.setAttribute('value', result.file_url);
                    
                    // Skip browser validation on this field temporarily
                    downloadField.setAttribute('data-validated', 'true');
                } else {
                    console.error('Missing file_url in server response');
                    showNotification('تم رفع الملف ولكن لم يتم استلام الرابط بشكل صحيح', 'error');
                }
                
                // Hide progress bar after a delay
                setTimeout(() => {
                    if (pdfProgress) pdfProgress.style.display = 'none';
                }, 1000);
            } else {
                // Show error notification
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء رفع الملف'}`, 'error');
                
                // Hide progress bar
                if (pdfProgress) pdfProgress.style.display = 'none';
            }
        } catch (error) {
            console.error('Error uploading PDF:', error);
            showNotification('حدث خطأ في الاتصال بالخادم', 'error');
            
            // Hide progress bar
            if (pdfProgress) pdfProgress.style.display = 'none';
        }
    }
    
    /**
     * Confirm before deleting a book
     */
    function confirmDeleteBook(bookId) {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذا الكتاب؟')) {
            deleteBook(bookId);
        }
    }
    
    /**
     * Delete a book
     */
    async function deleteBook(bookId) {
        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showNotification('تم حذف الكتاب بنجاح', 'success');
                fetchBooks(); // Refresh the book list
            } else {
                const result = await response.json();
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء حذف الكتاب'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            showNotification('حدث خطأ في الاتصال بالخادم', 'error');
        }
    }
    
    /**
     * Show notification message
     */
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
});