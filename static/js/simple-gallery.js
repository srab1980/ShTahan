/**
 * Simple Gallery module for Sheikh Mustafa Al-Tahhan website
 * Provides a basic gallery slider with thumbnails
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple gallery script loaded');
    
    // Gallery image data from API
    const galleryImages = [];
    
    // DOM Elements
    const currentImage = document.getElementById('current-gallery-image');
    const caption = document.getElementById('gallery-caption');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const thumbsContainer = document.getElementById('gallery-thumbs');
    
    // Current image index
    let currentIndex = 0;
    
    // Fetch gallery images from API
    async function fetchGalleryImages() {
        try {
            console.log('Fetching gallery images...');
            const response = await fetch('/api/gallery');
            const data = await response.json();
            
            if (data.images && data.images.length > 0) {
                // Store images
                data.images.forEach(img => galleryImages.push(img));
                console.log(`Loaded ${galleryImages.length} images`);
                
                // Initialize gallery
                initGallery();
            } else {
                console.error('No images found in API response');
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
        }
    }
    
    // Initialize gallery
    function initGallery() {
        if (galleryImages.length === 0) return;
        
        // Set initial image
        setActiveImage(0);
        
        // Create thumbnails
        createThumbnails();
        
        // Add event listeners
        if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
        if (nextBtn) nextBtn.addEventListener('click', showNextImage);
    }
    
    // Create thumbnails
    function createThumbnails() {
        if (!thumbsContainer) return;
        
        thumbsContainer.innerHTML = '';
        
        galleryImages.forEach((image, index) => {
            const thumb = document.createElement('div');
            thumb.className = `simple-gallery-thumb ${index === 0 ? 'active' : ''}`;
            thumb.dataset.index = index;
            thumb.innerHTML = `<img src="${image.url}" alt="صورة مصغرة">`;
            
            thumb.addEventListener('click', () => {
                setActiveImage(index);
            });
            
            thumbsContainer.appendChild(thumb);
        });
    }
    
    // Set the active image
    function setActiveImage(index) {
        if (!currentImage || !caption) return;
        
        const image = galleryImages[index];
        if (!image) return;
        
        // Update image source and caption
        currentImage.src = image.url;
        currentImage.alt = image.caption;
        caption.textContent = image.caption;
        
        // Update thumbnails
        const thumbs = document.querySelectorAll('.simple-gallery-thumb');
        thumbs.forEach(thumb => {
            if (parseInt(thumb.dataset.index) === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
        
        // Update current index
        currentIndex = index;
    }
    
    // Show previous image
    function showPrevImage() {
        let newIndex = currentIndex + 1; // RTL direction
        if (newIndex >= galleryImages.length) {
            newIndex = 0;
        }
        setActiveImage(newIndex);
    }
    
    // Show next image
    function showNextImage() {
        let newIndex = currentIndex - 1; // RTL direction
        if (newIndex < 0) {
            newIndex = galleryImages.length - 1;
        }
        setActiveImage(newIndex);
    }
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft') {
                showPrevImage(); // RTL direction
            } else if (e.key === 'ArrowRight') {
                showNextImage(); // RTL direction
            }
        }
    });
    
    // Start the gallery
    fetchGalleryImages();
});