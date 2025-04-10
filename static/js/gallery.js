/**
 * Gallery module for Sheikh Mustafa Al-Tahhan website
 * Handles image gallery slider with lightbox functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const galleryContainer = document.querySelector('.gallery-container');
    const gallerySlides = document.querySelector('.gallery-slides');
    const galleryNav = document.querySelector('.gallery-nav');
    const galleryPrev = document.querySelector('.gallery-prev');
    const galleryNext = document.querySelector('.gallery-next');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    
    // Current slide index
    let currentSlide = 0;
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
            if (galleryContainer) {
                galleryContainer.innerHTML = '<p class="error-message">حدث خطأ في تحميل الصور</p>';
            }
        }
    }
    
    // Render gallery slider
    function renderGallerySlider(images) {
        if (!gallerySlides || !galleryNav) return;
        
        if (images.length === 0) {
            galleryContainer.innerHTML = '<p class="no-images">لا توجد صور متاحة</p>';
            return;
        }
        
        // Clear existing content
        gallerySlides.innerHTML = '';
        galleryNav.innerHTML = '';
        
        // Create slides
        images.forEach((image, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = 'gallery-item';
            slide.dataset.index = index;
            
            slide.innerHTML = `
                <img src="${image.url}" alt="${image.caption}" loading="${index < 3 ? 'eager' : 'lazy'}">
                <div class="gallery-caption">${image.caption}</div>
            `;
            
            gallerySlides.appendChild(slide);
            
            // Create thumbnail
            const thumb = document.createElement('div');
            thumb.className = `gallery-thumb ${index === 0 ? 'active' : ''}`;
            thumb.dataset.index = index;
            
            thumb.innerHTML = `<img src="${image.url}" alt="thumbnail">`;
            
            thumb.addEventListener('click', () => {
                goToSlide(index);
            });
            
            galleryNav.appendChild(thumb);
        });
        
        // Set initial slide
        updateSlider();
        
        // Add event listeners
        addGalleryEventListeners();
    }
    
    // Go to specific slide
    function goToSlide(index) {
        if (index < 0) {
            currentSlide = galleryImages.length - 1;
        } else if (index >= galleryImages.length) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        
        updateSlider();
    }
    
    // Update slider position and active thumbnail
    function updateSlider() {
        if (!gallerySlides) return;
        
        // Update slides position - for RTL we need to move in the opposite direction
        gallerySlides.style.transform = `translateX(${(currentSlide * 100)}%)`;
        
        // Update active thumbnail
        const thumbs = document.querySelectorAll('.gallery-thumb');
        thumbs.forEach((thumb, index) => {
            if (index === currentSlide) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    // Show lightbox with the clicked image
    function openLightbox(e) {
        if (lightbox && lightboxImg && e.target.tagName === 'IMG') {
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
    
    // Add event listeners to gallery elements
    function addGalleryEventListeners() {
        // Navigate to previous slide (reversed for RTL)
        if (galleryPrev) {
            galleryPrev.addEventListener('click', () => {
                goToSlide(currentSlide + 1);
            });
        }
        
        // Navigate to next slide (reversed for RTL)
        if (galleryNext) {
            galleryNext.addEventListener('click', () => {
                goToSlide(currentSlide - 1);
            });
        }
        
        // Open lightbox when clicking on slide image
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (galleryItems && galleryItems.length > 0) {
            galleryItems.forEach(item => {
                item.addEventListener('click', openLightbox);
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (lightbox && lightbox.style.display === 'block') {
                // ESC to close lightbox
                if (e.key === 'Escape') {
                    closeLightboxHandler();
                }
            } else {
                // Arrow keys for slider navigation (reversed for RTL)
                if (e.key === 'ArrowLeft') {
                    goToSlide(currentSlide + 1);
                } else if (e.key === 'ArrowRight') {
                    goToSlide(currentSlide - 1);
                }
            }
        });
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
    
    // Initialize the gallery
    fetchGalleryImages();
});
