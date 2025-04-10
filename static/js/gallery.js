/**
 * Gallery module for Sheikh Mustafa Al-Tahhan website
 * Handles image gallery with lightbox functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const galleryContainer = document.querySelector('.gallery-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    
    // Fetch gallery images from API
    async function fetchGalleryImages() {
        try {
            const response = await fetch('/api/gallery');
            const data = await response.json();
            renderGalleryImages(data.images);
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            if (galleryContainer) {
                galleryContainer.innerHTML = '<p class="error-message">حدث خطأ في تحميل الصور</p>';
            }
        }
    }
    
    // Render gallery images
    function renderGalleryImages(images) {
        if (!galleryContainer) return;
        
        if (images.length === 0) {
            galleryContainer.innerHTML = '<p class="no-images">لا توجد صور متاحة</p>';
            return;
        }
        
        galleryContainer.innerHTML = '';
        
        images.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.caption}" loading="lazy">
            `;
            
            galleryContainer.appendChild(galleryItem);
        });
        
        // Add event listeners to newly created gallery images
        addGalleryEventListeners();
    }
    
    // Show lightbox with the clicked image
    function openLightbox(e) {
        if (lightbox && lightboxImg) {
            const imgSrc = e.target.src;
            const imgAlt = e.target.alt;
            
            lightboxImg.src = imgSrc;
            
            if (lightboxCaption && imgAlt) {
                lightboxCaption.textContent = imgAlt;
            }
            
            lightbox.style.display = 'block';
            
            // Prevent scrolling when lightbox is open
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close the lightbox
    function closeLightboxHandler() {
        if (lightbox) {
            lightbox.style.display = 'none';
            
            // Re-enable scrolling
            document.body.style.overflow = 'auto';
        }
    }
    
    // Add event listeners to gallery images
    function addGalleryEventListeners() {
        const galleryItems = document.querySelectorAll('.gallery-item img');
        if (galleryItems && galleryItems.length > 0) {
            galleryItems.forEach(img => {
                img.addEventListener('click', openLightbox);
            });
        }
    }
    
    // Add event listener to close button
    if (closeLightbox) {
        closeLightbox.addEventListener('click', closeLightboxHandler);
    }
    
    // Close lightbox when clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightboxHandler();
            }
        });
    }
    
    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox && lightbox.style.display === 'block') {
            closeLightboxHandler();
        }
    });
    
    // Initialize the gallery
    fetchGalleryImages();
});
