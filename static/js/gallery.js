/**
 * Gallery module for Sheikh Mustafa Al-Tahhan website
 * Handles gallery image display for public-facing pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const galleryGrid = document.getElementById('gallery-grid');
    const gallerySection = document.getElementById('gallery');
    
    // Store gallery images
    let galleryImages = [];
    
    // Fetch gallery images from API
    async function fetchGalleryImages() {
        try {
            const response = await fetch('/api/gallery');
            const data = await response.json();
            galleryImages = data.images;
            renderGallerySlider(galleryImages);
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            if (galleryGrid) {
                galleryGrid.innerHTML = '<p style="grid-column: span 3; text-align: center; color: red;">حدث خطأ في تحميل الصور</p>';
            }
        }
    }
    
    // Render gallery images in a grid
    function renderGallerySlider(images) {
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
            
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.caption}" loading="${index < 3 ? 'eager' : 'lazy'}">
                <div class="gallery-caption">${image.caption}</div>
            `;
            
            galleryGrid.appendChild(galleryItem);
            
            // Add event listener for image click (lightbox functionality could be added here)
            const img = galleryItem.querySelector('img');
            if (img) {
                img.addEventListener('click', openLightbox);
            }
        });
    }
    
    // Show lightbox with the clicked image - for future implementation
    function openLightbox(e) {
        // Future lightbox implementation can go here
        console.log('Image clicked:', e.target.src);
        
        // For now, just open the image in a new tab
        window.open(e.target.src, '_blank');
    }
    
    // Initialize the gallery
    fetchGalleryImages();
});
