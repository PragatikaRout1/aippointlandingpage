// Auto-scroll testimonials - seamless infinite scroll
document.addEventListener('DOMContentLoaded', function() {
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    if (!testimonialsGrid) return;

    // Clone all testimonials multiple times to ensure seamless loop
    const originalCards = Array.from(testimonialsGrid.querySelectorAll('.testimonial-card'));
    if (originalCards.length === 0) return;

    // Create enough clones to fill 3x the viewport width for seamless scrolling
    for (let i = 0; i < 3; i++) {
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            testimonialsGrid.appendChild(clone);
        });
    }
    
    // Auto-scroll functionality with seamless loop
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    let animationId;
    let isPaused = false;
    
    // Calculate the width of one set (original cards)
    const cardWidth = originalCards[0].offsetWidth + 24; // card width + gap
    const setWidth = originalCards.length * cardWidth;

    function autoScroll() {
        if (!testimonialsGrid.isConnected || isPaused) {
            return;
        }
        
        scrollPosition += scrollSpeed;
        
        // When we've scrolled one full set, reset seamlessly
        if (scrollPosition >= setWidth) {
            scrollPosition = scrollPosition - setWidth;
            // Reset position without animation to make it seamless
            testimonialsGrid.style.transition = 'none';
            testimonialsGrid.style.transform = `translateX(-${scrollPosition}px)`;
            // Force reflow
            void testimonialsGrid.offsetWidth;
        }
        
        // Apply smooth scrolling
        testimonialsGrid.style.transition = 'transform 0.1s linear';
        testimonialsGrid.style.transform = `translateX(-${scrollPosition}px)`;
        
        animationId = requestAnimationFrame(autoScroll);
    }

    // Start auto-scroll after a short delay
    let startTimeout = setTimeout(() => {
        autoScroll();
    }, 1000);

    // Pause on hover
    testimonialsGrid.addEventListener('mouseenter', () => {
        isPaused = true;
        cancelAnimationFrame(animationId);
        clearTimeout(startTimeout);
    });

    testimonialsGrid.addEventListener('mouseleave', () => {
        isPaused = false;
        // Restart auto-scroll after a delay
        startTimeout = setTimeout(() => {
            autoScroll();
        }, 500);
    });

    // Handle touch events for mobile
    let touchStartX = 0;
    let isDragging = false;

    testimonialsGrid.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        isDragging = true;
        isPaused = true;
        cancelAnimationFrame(animationId);
        clearTimeout(startTimeout);
    }, { passive: true });

    testimonialsGrid.addEventListener('touchend', () => {
        isDragging = false;
        // Restart auto-scroll after a delay
        setTimeout(() => {
            isPaused = false;
            autoScroll();
        }, 2000);
    }, { passive: true });
});

// Hover effects for testimonial cards
document.addEventListener('mouseover', function(e) {
    const card = e.target.closest('.testimonial-card');
    if (card) {
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        card.style.borderColor = 'var(--primary)';
    }
});

document.addEventListener('mouseout', function(e) {
    const card = e.target.closest('.testimonial-card');
    if (card) {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = '#e5e7eb';
    }
});
