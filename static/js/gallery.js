/**
 * @file Manages the public-facing image gallery.
 * @description Fetches and displays gallery images, with a simple lightbox effect.
 */

/**
 * Renders gallery images into a grid container.
 * @param {Array<Object>} images - An array of image objects from the API.
 * @param {HTMLElement} container - The grid container element for the images.
 */
function renderGallery(images, container) {
    if (!container) return;
    container.innerHTML = '';
    if (!images || images.length === 0) {
        container.innerHTML = '<p>لا توجد صور في المعرض.</p>';
        return;
    }
    images.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${image.url}" alt="${image.caption}" loading="${index < 3 ? 'eager' : 'lazy'}" data-full-src="${image.url}">
            <div class="gallery-caption">${image.caption}</div>`;
        item.addEventListener('click', (e) => openLightbox(e.currentTarget.querySelector('img')));
        container.appendChild(item);
    });
}

/**
 * Opens a simple lightbox to display the full-size image.
 * @param {HTMLImageElement} imgElement - The image element that was clicked.
 */
function openLightbox(imgElement) {
    const src = imgElement.dataset.fullSrc;
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:1000;';
    lightbox.innerHTML = `<img src="${src}" style="max-width:90%;max-height:90%;"><span style="position:absolute;top:20px;right:30px;font-size:30px;color:white;cursor:pointer;">&times;</span>`;
    lightbox.addEventListener('click', () => lightbox.remove());
    document.body.appendChild(lightbox);
}

/**
 * Fetches gallery images from the API and initializes the gallery.
 */
async function initGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    try {
        const response = await fetch('/api/gallery');
        const data = await response.json();
        renderGallery(data.images, galleryGrid);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        galleryGrid.innerHTML = '<p>حدث خطأ في تحميل الصور.</p>';
    }
}

document.addEventListener('DOMContentLoaded', initGallery);
