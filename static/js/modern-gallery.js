/**
 * Modern Gallery module for Sheikh Mustafa Al-Tahhan website
 * Provides an elegant and modern gallery slider with lightbox functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Modern gallery script loaded');
    
    // References to DOM elements
    const galleryContainer = document.querySelector('.modern-gallery-container');
    const gallerySlides = document.querySelector('.modern-gallery-slides');
    const galleryPagination = document.querySelector('.modern-gallery-pagination');
    const galleryPrev = document.querySelector('.modern-gallery-prev');
    const galleryNext = document.querySelector('.modern-gallery-next');
    const galleryTitle = document.querySelector('.modern-gallery-title');
    const galleryDescription = document.querySelector('.modern-gallery-description');
    const modernLightbox = document.getElementById('modern-lightbox');
    const lightboxImg = document.getElementById('modern-lightbox-img');
    const lightboxCaption = document.getElementById('modern-lightbox-caption');
    const closeLightbox = document.querySelector('.modern-lightbox-close');
    
    console.log('Gallery elements:', 
        { container: galleryContainer, 
          slides: gallerySlides, 
          pagination: galleryPagination,
          prev: galleryPrev,
          next: galleryNext
        });
    
    // Current slide index
    let currentSlide = 0;
    let galleryImages = [];
    
    // Fetch gallery images from API
    async function fetchGalleryImages() {
        try {
            const response = await fetch('/api/gallery');
            const data = await response.json();
            
            if (data.images && data.images.length > 0) {
                galleryImages = data.images;
                renderGallery(galleryImages);
            } else {
                showError('لا توجد صور متاحة في المعرض');
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            showError('حدث خطأ في تحميل الصور');
        }
    }
    
    // Show error message in the gallery container
    function showError(message) {
        if (galleryContainer) {
            galleryContainer.innerHTML = `<p class="error-message">${message}</p>`;
        }
    }
    
    // Render gallery elements
    function renderGallery(images) {
        if (!gallerySlides || !galleryPagination) return;
        
        // Clear existing content
        gallerySlides.innerHTML = '';
        galleryPagination.innerHTML = '';
        
        // Create slides
        images.forEach((image, index) => {
            // Create slide
            const slide = document.createElement('div');
            slide.className = `modern-gallery-slide ${index === 0 ? 'active' : ''}`;
            slide.dataset.index = index;
            
            slide.innerHTML = `
                <img src="${image.url}" alt="${image.caption}" loading="${index < 3 ? 'eager' : 'lazy'}">
            `;
            
            gallerySlides.appendChild(slide);
            
            // Create pagination dot
            const dot = document.createElement('div');
            dot.className = `modern-pagination-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            
            dot.addEventListener('click', () => {
                navigateToSlide(index);
            });
            
            galleryPagination.appendChild(dot);
        });
        
        // Set initial slide info
        updateSlideInfo(0);
        
        // Add event listeners
        setupEventListeners();
    }
    
    // Update the title and description for the current slide
    function updateSlideInfo(index) {
        if (galleryTitle && galleryDescription && galleryImages[index]) {
            const image = galleryImages[index];
            galleryTitle.textContent = `صورة ${index + 1} من ${galleryImages.length}`;
            galleryDescription.textContent = image.caption;
        }
    }
    
    // Navigate to a specific slide
    function navigateToSlide(index) {
        if (index < 0) {
            index = galleryImages.length - 1;
        } else if (index >= galleryImages.length) {
            index = 0;
        }
        
        // Update active slide
        const slides = document.querySelectorAll('.modern-gallery-slide');
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        const activeSlide = document.querySelector(`.modern-gallery-slide[data-index="${index}"]`);
        if (activeSlide) {
            activeSlide.classList.add('active');
        }
        
        // Update active pagination dot
        const dots = document.querySelectorAll('.modern-pagination-dot');
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        const activeDot = document.querySelector(`.modern-pagination-dot[data-index="${index}"]`);
        if (activeDot) {
            activeDot.classList.add('active');
        }
        
        // Update info
        updateSlideInfo(index);
        
        // Update current slide index
        currentSlide = index;
    }
    
    // Setup event listeners for gallery navigation
    function setupEventListeners() {
        // Previous slide button
        if (galleryPrev) {
            galleryPrev.addEventListener('click', () => {
                navigateToSlide(currentSlide + 1); // RTL direction
            });
        }
        
        // Next slide button
        if (galleryNext) {
            galleryNext.addEventListener('click', () => {
                navigateToSlide(currentSlide - 1); // RTL direction
            });
        }
        
        // Open lightbox when clicking on a slide
        const slides = document.querySelectorAll('.modern-gallery-slide');
        slides.forEach(slide => {
            slide.addEventListener('click', (e) => {
                if (e.target.tagName === 'IMG') {
                    openLightbox(e);
                }
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (modernLightbox && modernLightbox.style.display === 'block') {
                // ESC to close lightbox
                if (e.key === 'Escape') {
                    closeLightboxHandler();
                }
            } else if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                // Arrow keys for slider navigation (reversed for RTL)
                if (e.key === 'ArrowLeft') {
                    navigateToSlide(currentSlide + 1);
                } else if (e.key === 'ArrowRight') {
                    navigateToSlide(currentSlide - 1);
                }
            }
        });
        
        // Close lightbox button
        if (closeLightbox) {
            closeLightbox.addEventListener('click', closeLightboxHandler);
        }
        
        // Close lightbox when clicking outside the image
        if (modernLightbox) {
            modernLightbox.addEventListener('click', (e) => {
                if (e.target === modernLightbox) {
                    closeLightboxHandler();
                }
            });
        }
    }
    
    // Open lightbox
    function openLightbox(e) {
        if (modernLightbox && lightboxImg) {
            const imgSrc = e.target.src;
            const imgAlt = e.target.alt;
            
            lightboxImg.src = imgSrc;
            
            if (lightboxCaption && imgAlt) {
                lightboxCaption.textContent = imgAlt;
            }
            
            modernLightbox.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }
    
    // Close lightbox
    function closeLightboxHandler() {
        if (modernLightbox) {
            modernLightbox.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        }
    }
    
    // Auto-rotate gallery every 5 seconds
    let autoRotateInterval;
    
    function startAutoRotate() {
        autoRotateInterval = setInterval(() => {
            navigateToSlide(currentSlide + 1);
        }, 5000);
    }
    
    function stopAutoRotate() {
        clearInterval(autoRotateInterval);
    }
    
    // Pause auto-rotate when hovering over the gallery
    if (galleryContainer) {
        galleryContainer.addEventListener('mouseenter', stopAutoRotate);
        galleryContainer.addEventListener('mouseleave', startAutoRotate);
    }
    
    // Initialize gallery
    fetchGalleryImages();
    startAutoRotate();
});