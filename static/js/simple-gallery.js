/**
 * Simple Gallery module for Sheikh Mustafa Al-Tahhan website
 * Uses static images defined in the HTML
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple gallery script loaded');
    
    // DOM Elements
    const currentImage = document.getElementById('current-gallery-image');
    const caption = document.getElementById('gallery-caption');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const thumbs = document.querySelectorAll('.simple-gallery-thumb');
    
    // Gallery image data (hardcoded)
    const galleryImages = [
        { url: '/static/img/gallery/gallery1.jpg', caption: 'الشيخ مصطفى الطحان مع وقف دار السلام' },
        { url: '/static/img/gallery/gallery2.jpg', caption: 'الشيخ مصطفى الطحان في مكتبه' },
        { url: '/static/img/gallery/gallery3.jpg', caption: 'الشيخ مصطفى الطحان في لقاء مع وسائل الإعلام' },
        { url: '/static/img/gallery/gallery4.jpg', caption: 'الشيخ مصطفى الطحان في اجتماع مع الأصدقاء' },
        { url: '/static/img/gallery/gallery5.jpg', caption: 'الشيخ مصطفى الطحان مع الزعيم التركي نجم الدين أربكان' },
        { url: '/static/img/gallery/gallery6.jpg', caption: 'الشيخ مصطفى الطحان خلال اجتماع مع مجموعة من العلماء' }
    ];
    
    // Current image index
    let currentIndex = 0;
    
    // Set active image
    function setActiveImage(index) {
        if (!currentImage || !caption) return;
        
        currentIndex = index;
        
        // Update image and caption
        currentImage.src = galleryImages[index].url;
        caption.textContent = galleryImages[index].caption;
        
        // Update thumbnails
        thumbs.forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
    
    // Navigate to next image
    function showNextImage() {
        const newIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length; // RTL direction
        setActiveImage(newIndex);
    }
    
    // Navigate to previous image
    function showPrevImage() {
        const newIndex = (currentIndex + 1) % galleryImages.length; // RTL direction
        setActiveImage(newIndex);
    }
    
    // Set up event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            console.log('Previous button clicked');
            showPrevImage();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            console.log('Next button clicked');
            showNextImage();
        });
    }
    
    // Set up thumbnail clicks
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            console.log('Thumbnail clicked:', index);
            setActiveImage(index);
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft') {
                showPrevImage(); // RTL direction
            } else if (e.key === 'ArrowRight') {
                showNextImage(); // RTL direction
            }
        }
    });
    
    // Auto rotate every 5 seconds
    setInterval(() => {
        showNextImage();
    }, 5000);
    
    console.log('Gallery initialized');
});