/**
 * @file Manages the admin gallery interface.
 * @description Handles adding, editing, and deleting gallery images.
 */

let galleryData = [];

/**
 * Fetches gallery images from the API and renders them with management controls.
 */
async function fetchGalleryImagesWithControls() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '<p class="loading-message">جاري تحميل الصور...</p>';
    try {
        const response = await fetch('/api/gallery');
        const data = await response.json();
        galleryData = data.images || [];
        renderGalleryWithControls(galleryData);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        galleryGrid.innerHTML = '<p class="error-message">حدث خطأ في تحميل الصور.</p>';
    }
}

/**
 * Renders gallery images with edit and delete buttons.
 * @param {Array<Object>} images - An array of image objects.
 */
function renderGalleryWithControls(images) {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';
    if (!images || images.length === 0) {
        galleryGrid.innerHTML = '<p>لا توجد صور في المعرض.</p>';
        return;
    }
    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.id = image.id;
        item.innerHTML = `
            <img src="${image.url}" alt="${image.caption}">
            <div class="gallery-caption">${image.caption}</div>
            <div class="gallery-controls">
                <button class="btn edit-image" data-id="${image.id}"><i class="fas fa-edit"></i> تعديل</button>
                <button class="btn delete-image" data-id="${image.id}"><i class="fas fa-trash"></i> حذف</button>
            </div>`;
        galleryGrid.appendChild(item);
    });
    addGalleryButtonListeners();
}

/**
 * Adds event listeners for the edit and delete buttons on gallery items.
 */
function addGalleryButtonListeners() {
    document.querySelectorAll('.edit-image').forEach(btn => btn.addEventListener('click', (e) => showEditImageForm(e.currentTarget.dataset.id)));
    document.querySelectorAll('.delete-image').forEach(btn => btn.addEventListener('click', (e) => confirmDeleteImage(e.currentTarget.dataset.id)));
}

/**
 * Populates and shows the form for editing an image.
 * @param {number} imageId - The ID of the image to edit.
 */
function showEditImageForm(imageId) {
    const image = galleryData.find(img => img.id == imageId);
    if (image) {
        document.getElementById('image-id').value = image.id;
        document.getElementById('image-caption').value = image.caption;
        document.getElementById('image-url').value = image.url;
        document.querySelector('#add-image-form button[type="submit"]').textContent = 'حفظ التعديلات';
        document.getElementById('cancel-edit-image').style.display = 'inline-block';
        document.getElementById('image-preview').innerHTML = `<img src="${image.url}" alt="Preview">`;
        document.getElementById('image-preview').style.display = 'block';
    }
}

/**
 * Resets and hides the gallery management form.
 */
function hideGalleryForm() {
    document.getElementById('add-image-form').reset();
    document.getElementById('image-id').value = '';
    document.querySelector('#add-image-form button[type="submit"]').textContent = 'إضافة الصورة';
    document.getElementById('cancel-edit-image').style.display = 'none';
    document.getElementById('image-preview').style.display = 'none';
}

/**
 * Handles the submission of the gallery form for both adding and editing images.
 * @param {Event} e - The form submission event.
 */
async function handleGallerySubmit(e) {
    e.preventDefault();
    const imageId = document.getElementById('image-id').value;
    const imageData = {
        caption: document.getElementById('image-caption').value,
        url: document.getElementById('image-url').value
    };
    const url = imageId ? `/api/gallery/${imageId}` : '/api/gallery';
    const method = imageId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imageData)
        });
        if (response.ok) {
            fetchGalleryImagesWithControls();
            hideGalleryForm();
        } else {
            console.error('Failed to save gallery image');
        }
    } catch (error) {
        console.error('Error saving gallery image:', error);
    }
}

/**
 * Asks for confirmation before deleting an image.
 * @param {number} imageId - The ID of the image to delete.
 */
function confirmDeleteImage(imageId) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الصورة؟')) {
        deleteImage(imageId);
    }
}

/**
 * Deletes an image from the server.
 * @param {number} imageId - The ID of the image to delete.
 */
async function deleteImage(imageId) {
    try {
        const response = await fetch(`/api/gallery/${imageId}`, { method: 'DELETE' });
        if (response.ok) {
            fetchGalleryImagesWithControls();
        }
    } catch (error) {
        console.error('Error deleting image:', error);
    }
}

/**
 * Initializes the gallery management page.
 */
function initGalleryManagement() {
    const isGalleryManagementPage = window.location.pathname.includes('/admin/gallery');
    if (isGalleryManagementPage) {
        document.getElementById('add-image-form').addEventListener('submit', handleGallerySubmit);
        document.getElementById('cancel-edit-image').addEventListener('click', hideGalleryForm);
        document.getElementById('image-upload').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await fetch('/api/upload/gallery-image', { method: 'POST', body: formData });
                const result = await response.json();
                if (response.ok) {
                    document.getElementById('image-url').value = result.file_url;
                    document.getElementById('image-preview').innerHTML = `<img src="${result.file_url}" alt="Preview">`;
                    document.getElementById('image-preview').style.display = 'block';
                }
            } catch (error) {
                console.error('Error uploading gallery image:', error);
            }
        });
        fetchGalleryImagesWithControls();
    }
}

document.addEventListener('DOMContentLoaded', initGalleryManagement);