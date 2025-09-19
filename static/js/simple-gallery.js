/**
 * @file Manages a simple, hardcoded image gallery.
 * @description This module controls a simple gallery with previous/next buttons and thumbnail navigation.
 */

const galleryImages = [
    { url: '/static/img/gallery/gallery1.jpg', caption: 'الشيخ مصطفى الطحان مع وقف دار السلام' },
    { url: '/static/img/gallery/gallery2.jpg', caption: 'الشيخ مصطفى الطحان في مكتبه' },
    { url: '/static/img/gallery/gallery3.jpg', caption: 'الشيخ مصطفى الطحان في لقاء مع وسائل الإعلام' },
    { url: '/static/img/gallery/gallery4.jpg', caption: 'الشيخ مصطفى الطحان في اجتماع مع الأصدقاء' },
    { url: '/static/img/gallery/gallery5.jpg', caption: 'الشيخ مصطفى الطحان مع الزعيم التركي نجم الدين أربكان' },
    { url: '/static/img/gallery/gallery6.jpg', caption: 'الشيخ مصطفى الطحان خلال اجتماع مع مجموعة من العلماء' }
];

let currentIndex = 0;

/**
 * Sets the active image in the gallery.
 * @param {number} index - The index of the image to display.
 */
function setActiveImage(index) {
    const currentImage = document.getElementById('current-gallery-image');
    const caption = document.getElementById('gallery-caption');
    const thumbs = document.querySelectorAll('.simple-gallery-thumb');

    if (!currentImage || !caption || !galleryImages[index]) return;

    currentIndex = index;
    currentImage.src = galleryImages[index].url;
    caption.textContent = galleryImages[index].caption;

    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

/**
 * Navigates to the next image in the gallery (RTL direction).
 */
function showNextImage() {
    const newIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(newIndex);
}

/**
 * Navigates to the previous image in the gallery (RTL direction).
 */
function showPrevImage() {
    const newIndex = (currentIndex + 1) % galleryImages.length;
    setActiveImage(newIndex);
}

/**
 * Initializes the simple gallery functionality.
 */
function initSimpleGallery() {
    document.getElementById('gallery-prev')?.addEventListener('click', showPrevImage);
    document.getElementById('gallery-next')?.addEventListener('click', showNextImage);
    document.querySelectorAll('.simple-gallery-thumb').forEach((thumb, index) => {
        thumb.addEventListener('click', () => setActiveImage(index));
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
        }
    });

    setInterval(showNextImage, 5000); // Auto-rotate
    setActiveImage(0); // Set initial image
}

document.addEventListener('DOMContentLoaded', initSimpleGallery);