/**
 * Gallery Management module for Sheikh Mustafa Al-Tahhan website
 * Handles adding, editing, and deleting gallery images
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const galleryContainer = document.querySelector('.gallery-container');
    const galleryGrid = document.querySelector('.gallery-grid');
    const gallerySection = document.getElementById('gallery');
    
    // Add a container for the "Add New Image" button if gallery section exists
    if (gallerySection) {
        const sectionTitle = gallerySection.querySelector('.section-title');
        if (sectionTitle) {
            const addButtonContainer = document.createElement('div');
            addButtonContainer.className = 'text-center';
            addButtonContainer.style.marginTop = '30px';
            addButtonContainer.innerHTML = `
                <button id="show-add-image-form" class="btn btn-primary">
                    <i class="fas fa-plus" style="margin-left: 8px;"></i> إضافة صورة جديدة
                </button>
            `;
            sectionTitle.appendChild(addButtonContainer);
            
            // Create the form but don't append it yet
            const formContainer = document.createElement('div');
            formContainer.id = 'gallery-form-container';
            formContainer.className = 'gallery-form-container';
            formContainer.style.display = 'none';
            formContainer.style.maxWidth = '600px';
            formContainer.style.margin = '30px auto';
            formContainer.style.backgroundColor = 'white';
            formContainer.style.padding = '30px';
            formContainer.style.borderRadius = '10px';
            formContainer.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            
            formContainer.innerHTML = `
                <div class="form-header">
                    <h3 id="form-title">إضافة صورة جديدة</h3>
                    <span class="close-form">&times;</span>
                </div>
                <form id="gallery-form">
                    <input type="hidden" id="image-id" value="">
                    <div class="form-group">
                        <label for="image-url">رابط الصورة:</label>
                        <input type="url" id="image-url" required>
                    </div>
                    <div class="form-group">
                        <label for="image-caption">وصف الصورة:</label>
                        <input type="text" id="image-caption" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">حفظ</button>
                        <button type="button" class="btn btn-secondary cancel-form">إلغاء</button>
                    </div>
                </form>
            `;
            
            gallerySection.appendChild(formContainer);
            
            // Event listener for add image button
            document.getElementById('show-add-image-form').addEventListener('click', showAddImageForm);
            
            // Event listener for close form button
            const closeFormBtn = formContainer.querySelector('.close-form');
            closeFormBtn.addEventListener('click', hideGalleryForm);
            
            // Event listener for cancel button
            const cancelBtn = formContainer.querySelector('.cancel-form');
            cancelBtn.addEventListener('click', hideGalleryForm);
            
            // Event listener for form submission
            const galleryForm = document.getElementById('gallery-form');
            galleryForm.addEventListener('submit', handleGallerySubmit);
        }
    }
    
    // Fetch gallery images from API and add management controls
    async function fetchGalleryImagesWithControls() {
        try {
            const response = await fetch('/api/gallery');
            const data = await response.json();
            
            if (galleryGrid) {
                renderGalleryWithControls(data.images);
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            if (galleryGrid) {
                galleryGrid.innerHTML = '<p class="error-message">حدث خطأ في تحميل الصور</p>';
            }
        }
    }
    
    // Render gallery images with edit and delete controls
    function renderGalleryWithControls(images) {
        if (!galleryGrid) return;
        
        if (images.length === 0) {
            galleryGrid.innerHTML = '<p class="no-images">لا توجد صور متاحة</p>';
            return;
        }
        
        galleryGrid.innerHTML = '';
        
        images.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.id = image.id;
            
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.caption}">
                <div class="gallery-caption">${image.caption}</div>
                <div class="gallery-controls">
                    <button class="edit-image" data-id="${image.id}">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="delete-image" data-id="${image.id}">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            `;
            
            galleryGrid.appendChild(galleryItem);
            
            // Add event listeners
            const editBtn = galleryItem.querySelector('.edit-image');
            editBtn.addEventListener('click', () => {
                showEditImageForm(image);
            });
            
            const deleteBtn = galleryItem.querySelector('.delete-image');
            deleteBtn.addEventListener('click', () => {
                confirmDeleteImage(image.id);
            });
        });
        
        // Add gallery item hover styles
        const style = document.createElement('style');
        style.textContent = `
            .gallery-item {
                position: relative;
                overflow: hidden;
            }
            
            .gallery-controls {
                position: absolute;
                bottom: -100%;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                padding: 10px;
                transition: bottom 0.3s ease;
            }
            
            .gallery-item:hover .gallery-controls {
                bottom: 0;
            }
            
            .gallery-controls button {
                background: transparent;
                border: none;
                color: white;
                margin: 0 5px;
                cursor: pointer;
                padding: 5px 10px;
                border-radius: 3px;
                transition: background 0.3s ease;
            }
            
            .gallery-controls button:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .edit-image {
                color: #fff;
            }
            
            .delete-image {
                color: #ff6b6b;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Show the add image form
    function showAddImageForm() {
        const formContainer = document.getElementById('gallery-form-container');
        const formTitle = document.getElementById('form-title');
        const imageIdField = document.getElementById('image-id');
        const urlField = document.getElementById('image-url');
        const captionField = document.getElementById('image-caption');
        
        // Reset form fields
        formTitle.textContent = 'إضافة صورة جديدة';
        imageIdField.value = '';
        urlField.value = '';
        captionField.value = '';
        
        // Show the form
        formContainer.style.display = 'block';
    }
    
    // Show the edit image form with data
    function showEditImageForm(image) {
        const formContainer = document.getElementById('gallery-form-container');
        const formTitle = document.getElementById('form-title');
        const imageIdField = document.getElementById('image-id');
        const urlField = document.getElementById('image-url');
        const captionField = document.getElementById('image-caption');
        
        // Set form fields
        formTitle.textContent = 'تعديل الصورة';
        imageIdField.value = image.id;
        urlField.value = image.url;
        captionField.value = image.caption;
        
        // Show the form
        formContainer.style.display = 'block';
    }
    
    // Hide the gallery form
    function hideGalleryForm() {
        const formContainer = document.getElementById('gallery-form-container');
        if (formContainer) {
            formContainer.style.display = 'none';
        }
    }
    
    // Handle gallery form submission
    async function handleGallerySubmit(e) {
        e.preventDefault();
        
        const imageId = document.getElementById('image-id').value;
        const url = document.getElementById('image-url').value;
        const caption = document.getElementById('image-caption').value;
        
        const imageData = {
            url,
            caption
        };
        
        try {
            let response;
            let method;
            let apiUrl;
            
            if (imageId) {
                // Update existing image
                method = 'PUT';
                apiUrl = `/api/gallery/${imageId}`;
            } else {
                // Create new image
                method = 'POST';
                apiUrl = '/api/gallery';
            }
            
            response = await fetch(apiUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(imageData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                hideGalleryForm();
                fetchGalleryImagesWithControls(); // Refresh the gallery
                
                // Show success message
                showNotification(
                    imageId ? 'تم تحديث الصورة بنجاح' : 'تم إضافة الصورة بنجاح', 
                    'success'
                );
            } else {
                showNotification(`خطأ: ${result.error || 'حدث خطأ ما'}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting image:', error);
            showNotification('حدث خطأ أثناء معالجة الطلب', 'error');
        }
    }
    
    // Confirm image deletion
    function confirmDeleteImage(imageId) {
        if (confirm('هل أنت متأكد من رغبتك في حذف هذه الصورة؟')) {
            deleteImage(imageId);
        }
    }
    
    // Delete an image
    async function deleteImage(imageId) {
        try {
            const response = await fetch(`/api/gallery/${imageId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove image from DOM
                const galleryItem = document.querySelector(`.gallery-item[data-id="${imageId}"]`);
                if (galleryItem) {
                    galleryItem.remove();
                }
                
                // Refresh gallery
                fetchGalleryImagesWithControls();
                
                // Show success message
                showNotification('تم حذف الصورة بنجاح', 'success');
            } else {
                const result = await response.json();
                showNotification(`خطأ: ${result.error || 'حدث خطأ ما'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            showNotification('حدث خطأ أثناء حذف الصورة', 'error');
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
    
    // Initialize the module (check if we're on the gallery page)
    if (galleryGrid) {
        fetchGalleryImagesWithControls();
    }
});