/**
 * Gallery module for Sheikh Mustafa Al-Tahhan website
 * Handles image gallery with lightbox functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const galleryItems = document.querySelectorAll('.gallery-item img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    
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
    if (galleryItems && galleryItems.length > 0) {
        galleryItems.forEach(img => {
            img.addEventListener('click', openLightbox);
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
    
    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox && lightbox.style.display === 'block') {
            closeLightboxHandler();
        }
    });
});
