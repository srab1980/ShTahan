/**
 * Gallery Management module for Sheikh Mustafa Al-Tahhan website
 * Handles adding, editing, and deleting gallery images
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const galleryGrid = document.getElementById('gallery-grid');
    const gallerySection = document.getElementById('gallery');
    let galleryData = [];
    let currentEditingImageId = null;
    
    // Check if we're on the gallery management page (i.e. admin-specific)
    const isGalleryManagementPage = window.location.pathname.includes('/admin/gallery');
    
    // Create gallery management controls only if on the admin gallery management page
    if (isGalleryManagementPage && galleryGrid) {
        // Add gallery management UI
        createGalleryManagementUI();
        
        // Fetch gallery images with management controls
        fetchGalleryImagesWithControls();
    }
    
    // Create gallery management UI
    function createGalleryManagementUI() {
        // Create add image form
        const managementSection = document.createElement('div');
        managementSection.className = 'gallery-management';
        managementSection.innerHTML = `
            <h3>إدارة معرض الصور</h3>
            <form id="add-image-form" class="gallery-form">
                <div class="form-group">
                    <label for="image-caption">عنوان الصورة:</label>
                    <input type="text" id="image-caption" required>
                </div>
                
                <div class="form-group">
                    <label for="image-url">رابط الصورة:</label>
                    <input type="url" id="image-url" required>
                </div>
                
                <div class="form-group">
                    <label for="image-upload">أو رفع صورة جديدة:</label>
                    <input type="file" id="image-upload" accept="image/*">
                    <div class="upload-preview" id="image-preview" style="margin-top: 10px; display: none;"></div>
                    <div class="upload-progress" id="image-progress" style="display: none; margin-top: 5px;">
                        <div class="progress-bar" style="background-color: #d4af37; height: 5px; width: 0%;"></div>
                    </div>
                </div>
                
                <input type="hidden" id="image-id">
                <div class="form-actions">
                    <button type="button" id="cancel-edit-image" class="btn btn-secondary" style="display: none; margin-right: 10px;">إلغاء</button>
                    <button type="submit" class="btn btn-primary">إضافة الصورة</button>
                </div>
            </form>
        `;
        
        // Insert the management section after the section title
        const sectionTitle = gallerySection.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.parentNode.insertBefore(managementSection, sectionTitle.nextSibling);
        } else {
            gallerySection.prepend(managementSection);
        }
        
        // Get references to form elements
        const addImageForm = document.getElementById('add-image-form');
        const imageUpload = document.getElementById('image-upload');
        const imagePreview = document.getElementById('image-preview');
        const imageProgress = document.getElementById('image-progress');
        const cancelEditButton = document.getElementById('cancel-edit-image');
        
        // Add event listeners
        if (addImageForm) {
            addImageForm.addEventListener('submit', handleGallerySubmit);
        }
        
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', hideGalleryForm);
        }
        
        if (imageUpload) {
            imageUpload.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    uploadGalleryImage(e.target.files[0]);
                }
            });
        }
    }
    
    // Fetch gallery images from API
    async function fetchGalleryImagesWithControls() {
        try {
            // Show loading message
            if (galleryGrid) {
                galleryGrid.innerHTML = '<p class="loading-message" style="grid-column: span 3; text-align: center;">جاري تحميل الصور...</p>';
            }
            
            const response = await fetch('/api/gallery');
            const data = await response.json();
            galleryData = data.images;
            
            renderGalleryWithControls(galleryData);
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            if (galleryGrid) {
                galleryGrid.innerHTML = '<p class="error-message" style="grid-column: span 3; text-align: center; color: red;">حدث خطأ في تحميل الصور</p>';
            }
        }
    }
    
    // Render gallery images with management controls
    function renderGalleryWithControls(images) {
        if (!galleryGrid) return;
        
        galleryGrid.innerHTML = '';
        
        if (images.length === 0) {
            galleryGrid.innerHTML = '<p style="grid-column: span 3; text-align: center;">لا توجد صور في المعرض</p>';
            return;
        }
        
        images.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.id = image.id;
            
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.caption}">
                <div class="gallery-caption">${image.caption}</div>
                <div class="gallery-controls">
                    <button class="btn edit-image" data-id="${image.id}">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn delete-image" data-id="${image.id}">
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
    }
    
    // Show form to edit an image
    function showEditImageForm(image) {
        const imageCaption = document.getElementById('image-caption');
        const imageUrl = document.getElementById('image-url');
        const imageId = document.getElementById('image-id');
        const submitButton = document.querySelector('#add-image-form button[type="submit"]');
        const cancelButton = document.getElementById('cancel-edit-image');
        const formTitle = document.querySelector('.gallery-management h3');
        
        if (imageCaption && imageUrl && imageId && submitButton) {
            // Populate form fields
            imageCaption.value = image.caption;
            imageUrl.value = image.url;
            imageId.value = image.id;
            
            // Update button text
            submitButton.textContent = 'حفظ التعديلات';
            
            // Show cancel button
            if (cancelButton) {
                cancelButton.style.display = 'inline-block';
            }
            
            // Update form title
            if (formTitle) {
                formTitle.textContent = 'تعديل الصورة';
            }
            
            // Set current editing ID
            currentEditingImageId = image.id;
            
            // Show preview
            const imagePreview = document.getElementById('image-preview');
            if (imagePreview) {
                imagePreview.style.display = 'block';
                imagePreview.innerHTML = `<img src="${image.url}" alt="${image.caption}" style="max-width: 100%; max-height: 150px; border-radius: 5px;">`;
            }
            
            // Scroll to form
            document.getElementById('add-image-form').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Hide gallery form (cancel edit)
    function hideGalleryForm() {
        const imageCaption = document.getElementById('image-caption');
        const imageUrl = document.getElementById('image-url');
        const imageId = document.getElementById('image-id');
        const submitButton = document.querySelector('#add-image-form button[type="submit"]');
        const cancelButton = document.getElementById('cancel-edit-image');
        const formTitle = document.querySelector('.gallery-management h3');
        const imagePreview = document.getElementById('image-preview');
        
        if (imageCaption && imageUrl && imageId) {
            // Reset form fields
            document.getElementById('add-image-form').reset();
            imageId.value = '';
            
            // Update button text
            if (submitButton) {
                submitButton.textContent = 'إضافة الصورة';
            }
            
            // Hide cancel button
            if (cancelButton) {
                cancelButton.style.display = 'none';
            }
            
            // Update form title
            if (formTitle) {
                formTitle.textContent = 'إدارة معرض الصور';
            }
            
            // Hide preview
            if (imagePreview) {
                imagePreview.style.display = 'none';
                imagePreview.innerHTML = '';
            }
            
            // Reset current editing ID
            currentEditingImageId = null;
        }
    }
    
    // Handle gallery form submission
    async function handleGallerySubmit(e) {
        e.preventDefault();
        
        const imageCaption = document.getElementById('image-caption').value;
        const imageUrl = document.getElementById('image-url').value;
        const imageId = document.getElementById('image-id').value;
        
        const imageData = {
            caption: imageCaption,
            url: imageUrl
        };
        
        try {
            let url;
            let method;
            
            if (imageId) {
                // Editing existing image
                url = `/api/gallery/${imageId}`;
                method = 'PUT';
            } else {
                // Adding new image
                url = '/api/gallery';
                method = 'POST';
            }
            
            // Send data to server
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(imageData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Refresh images
                await fetchGalleryImagesWithControls();
                
                // Reset form
                hideGalleryForm();
                
                // Show success message
                showNotification(
                    imageId ? 'تم تحديث الصورة بنجاح' : 'تمت إضافة الصورة بنجاح',
                    'success'
                );
            } else {
                // Show error message
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء معالجة الطلب'}`, 'error');
            }
        } catch (error) {
            console.error('Error processing gallery image:', error);
            showNotification('حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى', 'error');
        }
    }
    
    // Confirm and delete an image
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
                // Remove image from array
                galleryData = galleryData.filter(image => image.id !== imageId);
                
                // Re-render gallery
                renderGalleryWithControls(galleryData);
                
                // Show success message
                showNotification('تم حذف الصورة بنجاح', 'success');
                
                // If editing this image, reset the form
                if (currentEditingImageId === imageId) {
                    hideGalleryForm();
                }
            } else {
                const result = await response.json();
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء حذف الصورة'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            showNotification('حدث خطأ أثناء حذف الصورة، يرجى المحاولة مرة أخرى', 'error');
        }
    }
    
    // Upload gallery image
    async function uploadGalleryImage(file) {
        if (!file) return null;
        
        const imagePreview = document.getElementById('image-preview');
        const imageProgress = document.getElementById('image-progress');
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            // Show progress bar
            if (imageProgress) {
                imageProgress.style.display = 'block';
                imageProgress.querySelector('.progress-bar').style.width = '50%';
            }
            
            // Send the file to the server
            const response = await fetch('/api/upload/gallery-image', {
                method: 'POST',
                body: formData
            });
            
            // Update progress bar to 100%
            if (imageProgress) {
                imageProgress.querySelector('.progress-bar').style.width = '100%';
            }
            
            const result = await response.json();
            
            if (response.ok) {
                // Show success notification
                showNotification('تم رفع الصورة بنجاح', 'success');
                
                // Show preview
                if (imagePreview) {
                    imagePreview.style.display = 'block';
                    imagePreview.innerHTML = `<img src="${result.file_url}" alt="Gallery Image Preview" style="max-width: 100%; max-height: 150px; border-radius: 5px;">`;
                }
                
                // Update the URL field
                document.getElementById('image-url').value = result.file_url;
                
                // Auto-populate caption if it's empty
                const captionField = document.getElementById('image-caption');
                if (captionField && !captionField.value.trim()) {
                    captionField.value = file.name.replace(/\.[^/.]+$/, ""); // Remove extension from filename
                }
                
                // Automatically submit the form if the image URL is set
                // This solves the problem of images being lost when navigating away
                const autoSaveImage = confirm('هل ترغب في حفظ الصورة في قاعدة البيانات الآن؟');
                if (autoSaveImage) {
                    document.getElementById('add-image-form').dispatchEvent(new Event('submit'));
                } else {
                    // Remind user to click save
                    showNotification('لا تنس النقر على زر "إضافة الصورة" لحفظها في قاعدة البيانات', 'info');
                }
                
                // Hide progress bar after a delay
                setTimeout(() => {
                    if (imageProgress) imageProgress.style.display = 'none';
                }, 1000);
                
                return result.file_url;
            } else {
                // Show error notification
                showNotification(`خطأ: ${result.error || 'حدث خطأ أثناء رفع الصورة'}`, 'error');
                
                // Hide progress bar
                if (imageProgress) imageProgress.style.display = 'none';
                
                return null;
            }
        } catch (error) {
            console.error('Error uploading gallery image:', error);
            showNotification('حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى', 'error');
            
            // Hide progress bar
            if (imageProgress) imageProgress.style.display = 'none';
            
            return null;
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
    
    // This initialization code is redundant and has been moved to line 22
    // Left this comment for clarity
});