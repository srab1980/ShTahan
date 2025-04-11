/**
 * Gallery module for Sheikh Mustafa Al-Tahhan website
 * Provides an elegant gallery with lightbox functionality for image viewing
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const galleryGrid = document.getElementById('gallery-grid');
    const gallerySection = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxCounter = document.querySelector('.lightbox-counter');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    // Store gallery images and current image index
    let galleryImages = [];
    let currentImageIndex = 0;
    
    // Fetch gallery images from API
    async function fetchGalleryImages() {
        try {
            const response = await fetch('/api/gallery');
            const data = await response.json();
            galleryImages = data.images;
            renderGalleryGrid(galleryImages);
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            if (galleryGrid) {
                galleryGrid.innerHTML = '<p style="grid-column: span 3; text-align: center; color: red;">حدث خطأ في تحميل الصور</p>';
            }
        }
    }
    
    // Render gallery images in a grid
    function renderGalleryGrid(images) {
        if (!galleryGrid) return;
        
        if (images.length === 0) {
            if (galleryGrid) {
                galleryGrid.innerHTML = '<p style="grid-column: span 3; text-align: center;">لا توجد صور في المعرض</p>';
            }
            return;
        }
        
        // Clear existing content
        galleryGrid.innerHTML = '';
        
        // Create gallery items
        images.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.id = image.id;
            galleryItem.dataset.index = index;
            
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.caption}" loading="${index < 3 ? 'eager' : 'lazy'}">
                <div class="gallery-caption">${image.caption}</div>
            `;
            
            galleryGrid.appendChild(galleryItem);
            
            // Add event listener for image click to open lightbox
            galleryItem.addEventListener('click', function() {
                openLightbox(index);
            });
        });
    }
    
    // Show lightbox with the image at the given index
    function openLightbox(index) {
        if (!lightbox || galleryImages.length === 0) return;
        
        currentImageIndex = index;
        updateLightboxContent();
        
        // Show lightbox with animation
        lightbox.classList.add('active');
        
        // Prevent body scrolling when lightbox is open
        document.body.style.overflow = 'hidden';
        
        // Listen for keyboard events when lightbox is open
        document.addEventListener('keydown', handleLightboxKeydown);
    }
    
    // Close the lightbox
    function closeLightbox() {
        if (!lightbox) return;
        
        // Hide lightbox with animation
        lightbox.classList.remove('active');
        
        // Allow body scrolling again
        document.body.style.overflow = '';
        
        // Remove keyboard event listener
        document.removeEventListener('keydown', handleLightboxKeydown);
    }
    
    // Update lightbox content for the current image
    function updateLightboxContent() {
        if (currentImageIndex < 0 || currentImageIndex >= galleryImages.length) return;
        
        const image = galleryImages[currentImageIndex];
        
        // Update image source and caption
        lightboxImg.src = image.url;
        lightboxImg.alt = image.caption;
        lightboxCaption.textContent = image.caption;
        
        // Update counter
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
    }
    
    // Navigate to the previous image
    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxContent();
    }
    
    // Navigate to the next image
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxContent();
    }
    
    // Handle keyboard navigation in lightbox
    function handleLightboxKeydown(e) {
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showNextImage(); // In RTL layout, left arrow shows next image
                break;
            case 'ArrowRight':
                showPreviousImage(); // In RTL layout, right arrow shows previous image
                break;
        }
    }
    
    // Set up event listeners for lightbox controls
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPreviousImage);
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNextImage);
    }
    
    // Close lightbox when clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            // Close only if clicking outside the image and controls
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Initialize the gallery
    fetchGalleryImages();
});
