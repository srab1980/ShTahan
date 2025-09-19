/**
 * @file Manages the book administration interface.
 * @description Handles listing, adding, editing, and deleting books.
 */

let allBooks = []; // Cache for all books

/**
 * Renders a list of books into the admin table.
 * @param {Array<Object>} books - The array of book objects to render.
 */
function renderBooks(books) {
    const tableBody = document.getElementById('booksTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (!books || books.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">لا توجد كتب متاحة.</td></tr>';
        return;
    }
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${book.cover}" alt="${book.title}" class="book-cover-thumbnail"></td>
            <td>${book.title}</td>
            <td>${book.language}</td>
            <td>${book.category}</td>
            <td>${book.description.substring(0, 100)}...</td>
            <td class="book-actions">
                <button class="edit-btn" data-id="${book.id}"><i class="fas fa-edit"></i> تعديل</button>
                <button class="delete-btn" data-id="${book.id}"><i class="fas fa-trash"></i> حذف</button>
            </td>`;
        tableBody.appendChild(row);
    });
    addTableButtonListeners();
}

/**
 * Fetches all books from the API and renders them.
 */
async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        const data = await response.json();
        allBooks = data.books || [];
        renderBooks(allBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

/**
 * Adds event listeners to the edit and delete buttons in the table.
 */
function addTableButtonListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => openEditBookModal(e.currentTarget.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => confirmDeleteBook(e.currentTarget.dataset.id));
    });
}

/**
 * Opens the modal to add a new book.
 */
function openAddBookModal() {
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    document.getElementById('modalTitle').textContent = 'إضافة كتاب جديد';
    document.getElementById('coverPreview').innerHTML = '';
    document.getElementById('bookModal').style.display = 'block';
}

/**
 * Fetches data for a specific book and opens the modal for editing.
 * @param {number} bookId - The ID of the book to edit.
 */
async function openEditBookModal(bookId) {
    const book = allBooks.find(b => b.id == bookId);
    if (book) {
        document.getElementById('bookId').value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('language').value = book.language;
        document.getElementById('category').value = book.category;
        document.getElementById('cover').value = book.cover;
        document.getElementById('download').value = book.download;
        document.getElementById('description').value = book.description;
        document.getElementById('coverPreview').innerHTML = `<img src="${book.cover}" alt="Preview">`;
        document.getElementById('modalTitle').textContent = 'تعديل الكتاب';
        document.getElementById('bookModal').style.display = 'block';
    }
}

/**
 * Closes the book editing/adding modal.
 */
function closeBookModal() {
    document.getElementById('bookModal').style.display = 'none';
}

/**
 * Handles the submission of the book form for both creating and updating books.
 * @param {Event} e - The form submission event.
 */
async function handleBookFormSubmit(e) {
    e.preventDefault();
    const bookId = document.getElementById('bookId').value;
    const bookData = {
        title: document.getElementById('title').value,
        language: document.getElementById('language').value,
        category: document.getElementById('category').value,
        cover: document.getElementById('cover').value,
        download: document.getElementById('download').value || '#',
        description: document.getElementById('description').value,
    };

    const url = bookId ? `/api/books/${bookId}` : '/api/books';
    const method = bookId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });
        if (response.ok) {
            closeBookModal();
            fetchBooks();
        } else {
            console.error('Failed to save book');
        }
    } catch (error) {
        console.error('Error saving book:', error);
    }
}

/**
 * Handles file uploads for book covers and PDFs.
 * @param {Event} e - The file input change event.
 * @param {string} type - The type of file being uploaded ('cover' or 'pdf').
 */
async function handleFileUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = type === 'cover' ? '/api/upload/book-cover' : '/api/upload/book-pdf';
    const inputId = type === 'cover' ? 'cover' : 'download';
    const previewId = type === 'cover' ? 'coverPreview' : null;

    try {
        const response = await fetch(endpoint, { method: 'POST', body: formData });
        const result = await response.json();
        if (response.ok) {
            document.getElementById(inputId).value = result.file_url;
            if (previewId) {
                document.getElementById(previewId).innerHTML = `<img src="${result.file_url}" alt="Preview">`;
            }
        }
    } catch (error) {
        console.error(`Error uploading ${type}:`, error);
    }
}

/**
 * Asks for confirmation before deleting a book.
 * @param {number} bookId - The ID of the book to delete.
 */
function confirmDeleteBook(bookId) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الكتاب؟')) {
        deleteBook(bookId);
    }
}

/**
 * Deletes a book from the server.
 * @param {number} bookId - The ID of the book to delete.
 */
async function deleteBook(bookId) {
    try {
        const response = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
        if (response.ok) {
            fetchBooks();
        }
    } catch (error) {
        console.error('Error deleting book:', error);
    }
}

/**
 * Initializes all event listeners for the book management page.
 */
function initBookManagement() {
    document.getElementById('addBookBtn').addEventListener('click', openAddBookModal);
    document.getElementById('closeModal').addEventListener('click', closeBookModal);
    document.getElementById('cancelBtn').addEventListener('click', closeBookModal);
    document.getElementById('bookForm').addEventListener('submit', handleBookFormSubmit);
    document.getElementById('coverUpload').addEventListener('change', (e) => handleFileUpload(e, 'cover'));
    document.getElementById('pdfUpload').addEventListener('change', (e) => handleFileUpload(e, 'pdf'));
    fetchBooks();
}

document.addEventListener('DOMContentLoaded', initBookManagement);