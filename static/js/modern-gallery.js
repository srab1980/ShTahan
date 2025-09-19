/**
 * @file Manages the modern, auto-rotating gallery with a lightbox.
 * @description This module handles fetching, displaying, and interacting with the modern gallery.
 */

let currentSlide = 0;
let galleryImages = [];
let autoRotateInterval;

/**
 * Updates the gallery's title and description based on the current slide.
 * @param {number} index - The index of the current slide.
 */
function updateSlideInfo(index) {
    const galleryTitle = document.querySelector('.modern-gallery-title');
    const galleryDescription = document.querySelector('.modern-gallery-description');
    if (galleryTitle && galleryDescription && galleryImages[index]) {
        galleryTitle.textContent = `صورة ${index + 1} من ${galleryImages.length}`;
        galleryDescription.textContent = galleryImages[index].caption;
    }
}

/**
 * Navigates the gallery to a specific slide index.
 * @param {number} index - The index of the slide to navigate to.
 */
function navigateToSlide(index) {
    if (galleryImages.length === 0) return;
    const newIndex = (index + galleryImages.length) % galleryImages.length;
    currentSlide = newIndex;

    document.querySelectorAll('.modern-gallery-slide, .modern-pagination-dot').forEach(el => el.classList.remove('active'));
    document.querySelector(`.modern-gallery-slide[data-index="${newIndex}"]`)?.classList.add('active');
    document.querySelector(`.modern-pagination-dot[data-index="${newIndex}"]`)?.classList.add('active');
    updateSlideInfo(newIndex);
}

/**
 * Renders the gallery slides and pagination dots.
 * @param {Array<Object>} images - The array of image objects.
 */
function renderGallery(images) {
    const gallerySlides = document.querySelector('.modern-gallery-slides');
    const galleryPagination = document.querySelector('.modern-gallery-pagination');
    if (!gallerySlides || !galleryPagination) return;
    gallerySlides.innerHTML = '';
    galleryPagination.innerHTML = '';

    images.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = `modern-gallery-slide ${index === 0 ? 'active' : ''}`;
        slide.dataset.index = index;
        slide.innerHTML = `<img src="${image.url}" alt="${image.caption}" loading="${index < 3 ? 'eager' : 'lazy'}">`;
        gallerySlides.appendChild(slide);

        const dot = document.createElement('div');
        dot.className = `modern-pagination-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.index = index;
        dot.addEventListener('click', () => navigateToSlide(index));
        galleryPagination.appendChild(dot);
    });
    updateSlideInfo(0);
    setupEventListeners();
}

/**
 * Opens the lightbox with the specified image.
 * @param {Event} e - The click event from the slide.
 */
function openLightbox(e) {
    const modernLightbox = document.getElementById('modern-lightbox');
    const lightboxImg = document.getElementById('modern-lightbox-img');
    const lightboxCaption = document.getElementById('modern-lightbox-caption');
    if (modernLightbox && lightboxImg && e.target.tagName === 'IMG') {
        lightboxImg.src = e.target.src;
        if (lightboxCaption) lightboxCaption.textContent = e.target.alt;
        modernLightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Closes the lightbox.
 */
function closeLightboxHandler() {
    const modernLightbox = document.getElementById('modern-lightbox');
    if (modernLightbox) {
        modernLightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Sets up all necessary event listeners for the gallery.
 */
function setupEventListeners() {
    document.querySelector('.modern-gallery-prev')?.addEventListener('click', () => navigateToSlide(currentSlide + 1)); // RTL
    document.querySelector('.modern-gallery-next')?.addEventListener('click', () => navigateToSlide(currentSlide - 1)); // RTL
    document.querySelectorAll('.modern-gallery-slide').forEach(slide => slide.addEventListener('click', openLightbox));
    document.querySelector('.modern-lightbox-close')?.addEventListener('click', closeLightboxHandler);
    document.getElementById('modern-lightbox')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeLightboxHandler(); });
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('modern-lightbox')?.style.display === 'block' && e.key === 'Escape') closeLightboxHandler();
    });
}

/**
 * Initializes the gallery, fetches images, and starts auto-rotation.
 */
async function initModernGallery() {
    const galleryContainer = document.querySelector('.modern-gallery-container');
    if (!galleryContainer) return;
    try {
        const response = await fetch('/api/gallery');
        const data = await response.json();
        if (data.images && data.images.length > 0) {
            galleryImages = data.images;
            renderGallery(galleryImages);
            startAutoRotate();
            galleryContainer.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
            galleryContainer.addEventListener('mouseleave', startAutoRotate);
        } else {
            galleryContainer.innerHTML = '<p class="error-message">لا توجد صور متاحة.</p>';
        }
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        galleryContainer.innerHTML = '<p class="error-message">حدث خطأ في تحميل الصور.</p>';
    }
}

/**
 * Starts the auto-rotation of the gallery slides.
 */
function startAutoRotate() {
    autoRotateInterval = setInterval(() => navigateToSlide(currentSlide + 1), 5000);
}

document.addEventListener('DOMContentLoaded', initModernGallery);