// Gallery functionality
class Gallery {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.lightbox = null;
        this.lightboxImage = null;
        this.lightboxCounter = null;
        this.prevButton = null;
        this.nextButton = null;
        this.isAnimating = false;
        this.lastFocusedElement = null;
        
        // Swipe variables
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.swipeThreshold = 50;
        
        this.init();
    }
    
    init() {
        this.loadImages();
        this.createLightbox();
        this.bindEvents();
    }
    
    loadImages() {
        this.images = [
            { src: 'assets/gallery/photo1.webp', alt: 'Ученики и инструкторы автошколы Мустанг около учебного автомобиля после экзамена в ГИБДД Архангельск' },
            { src: 'assets/gallery/photo2.webp', alt: 'Фото учеников автошколы Мустанг с инструктором возле машины после успешной сдачи экзамена в Архангельске' },
            { src: 'assets/gallery/photo3.webp', alt: 'Выпускники и инструкторы автошколы Мустанг около учебного автомобиля после экзамена в ГИБДД Архангельск' },
            { src: 'assets/gallery/photo4.webp', alt: 'Ученики автошколы Мустанг с инструктором возле машины после экзамена в ГИБДД Архангельск' },
            { src: 'assets/gallery/photo5.webp', alt: 'Фото учеников и инструкторов автошколы Мустанг около учебного автомобиля после успешной сдачи экзамена Архангельск' },
            { src: 'assets/gallery/photo6.webp', alt: 'Выпускники автошколы Мустанг с инструктором возле машины после экзамена в ГИБДД Архангельск' },
            { src: 'assets/gallery/photo7.webp', alt: 'Ученики и инструкторы автошколы Мустанг около учебного автомобиля после экзамена в ГИБДД Архангельск' },
            { src: 'assets/gallery/photo8.webp', alt: 'Фото выпускников автошколы Мустанг с инструктором возле машины после успешной сдачи экзамена в Архангельске' },
        ];
    }
    
    createLightbox() {
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'lightbox';
        this.lightbox.setAttribute('role', 'dialog');
        this.lightbox.setAttribute('aria-modal', 'true');
        this.lightbox.setAttribute('aria-hidden', 'true');
        this.lightbox.setAttribute('aria-label', 'Просмотр фотографий выпускников');
        this.lightbox.innerHTML = `
            <div class="lightbox__content">
                <img class="lightbox__image" alt="" />
            </div>
            <div class="lightbox__controls">
                <button class="lightbox__nav lightbox__nav--prev" aria-label="Предыдущее фото">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="lightbox__counter"></div>
                <button class="lightbox__nav lightbox__nav--next" aria-label="Следующее фото">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <button class="lightbox__close" aria-label="Закрыть галерею">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(this.lightbox);
        this.lightboxImage = this.lightbox.querySelector('.lightbox__image');
        this.lightboxCounter = this.lightbox.querySelector('.lightbox__counter');
        this.prevButton = this.lightbox.querySelector('.lightbox__nav--prev');
        this.nextButton = this.lightbox.querySelector('.lightbox__nav--next');
    }
    
    bindEvents() {
        // Открытие галереи при клике на изображение
        document.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                this.lastFocusedElement = galleryItem;
                const index = Array.from(document.querySelectorAll('.gallery-item')).indexOf(galleryItem);
                this.openLightbox(index);
            }
        });
        
        // Закрытие галереи
        this.lightbox.querySelector('.lightbox__close').addEventListener('click', () => {
            this.closeLightbox();
        });
        
        // Навигация
        this.prevButton.addEventListener('click', () => {
            this.previousImage();
        });
        
        this.nextButton.addEventListener('click', () => {
            this.nextImage();
        });
        
        // Закрытие по клику на фон
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        // Навигация клавишами
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.previousImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
                case 'Tab': {
                    const focusable = [this.prevButton, this.nextButton, this.lightbox.querySelector('.lightbox__close')]
                        .filter(Boolean);
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                    break;
                }
            }
        });
        
        // Swipe events - только на изображении
        this.bindSwipeEvents();
        
    }
    
    bindSwipeEvents() {
        // Mouse events - ТОЛЬКО на изображении, не на всем lightbox
        this.lightboxImage.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));
        
        // Touch events - ТОЛЬКО на изображении
        this.lightboxImage.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
        document.addEventListener('touchmove', this.drag.bind(this), { passive: false });
        document.addEventListener('touchend', this.endDrag.bind(this), { passive: true });
    }
    
    startDrag(e) {
        if (this.isAnimating) return;
        
        this.isDragging = true;
        this.lightbox.classList.add('grabbing');
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        this.startX = clientX;
        this.currentX = clientX;
        
        // Prevent default to avoid image dragging
        e.preventDefault();
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        this.currentX = clientX;
        
        const deltaX = this.currentX - this.startX;
        const scale = 1 - Math.abs(deltaX) / 1000;
        const opacity = 1 - Math.abs(deltaX) / 500;
        
        this.lightboxImage.style.transform = `translateX(${deltaX}px) scale(${Math.max(scale, 0.8)})`;
        this.lightboxImage.style.opacity = Math.max(opacity, 0.5);
        
        // Prevent default для touch events
        if (e.type.includes('touch')) {
            e.preventDefault();
        }
    }
    
    endDrag(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.lightbox.classList.remove('grabbing');
        
        const deltaX = this.currentX - this.startX;
        
        // Reset image position with animation
        this.lightboxImage.style.transition = 'all 0.3s ease-out';
        this.lightboxImage.style.transform = 'translateX(0) scale(1)';
        this.lightboxImage.style.opacity = '1';
        
        // Check if swipe threshold is reached
        if (Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0) {
                // Swipe right - предыдущее фото
                this.previousImage();
            } else {
                // Swipe left - следующее фото
                this.nextImage();
            }
        }
        
        // Remove transition after reset
        setTimeout(() => {
            this.lightboxImage.style.transition = '';
        }, 300);
    }
    
    openLightbox(index) {
        if (this.isAnimating) return;
        
        this.currentIndex = index;
        this.lightbox.classList.add('active');
        this.lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        this.showImage();
        requestAnimationFrame(() => this.lightbox.querySelector('.lightbox__close')?.focus());
        
        setTimeout(() => {
            this.lightbox.style.opacity = '1';
        }, 10);
    }
    
    closeLightbox() {
        if (this.isAnimating) return;
        
        this.lightbox.style.opacity = '0';
        
        setTimeout(() => {
            this.lightbox.classList.remove('active');
            this.lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            // Сбрасываем трансформации при закрытии
            this.lightboxImage.style.transform = '';
            this.lightboxImage.style.opacity = '';
            this.lightboxImage.style.transition = '';
            if (this.lastFocusedElement) this.lastFocusedElement.focus();
        }, 300);
    }
    
    showImage() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const image = this.images[this.currentIndex];
        
        // Обновляем кнопки ДО начала анимации
        this.updateNavButtons();
        
        // Сбрасываем предыдущие трансформации
        this.lightboxImage.style.transform = 'scale(0.9)';
        this.lightboxImage.style.opacity = '0';
        this.lightboxImage.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => {
            this.lightboxImage.src = image.src;
            this.lightboxImage.alt = image.alt;
            this.updateCounter();
            
            // Используем onload для правильной загрузки
            const img = new Image();
            img.onload = () => {
                this.lightboxImage.src = image.src;
                setTimeout(() => {
                    this.lightboxImage.style.opacity = '1';
                    this.lightboxImage.style.transform = 'scale(1)';
                    
                    setTimeout(() => {
                        this.lightboxImage.style.transition = '';
                        this.isAnimating = false;
                        // Включаем кнопки после завершения анимации
                        this.updateNavButtons();
                    }, 300);
                }, 50);
            };
            img.src = image.src;
            
            // Fallback на случай если onload не сработает
            setTimeout(() => {
                if (this.isAnimating) {
                    this.isAnimating = false;
                    this.updateNavButtons();
                }
            }, 1000);
        }, 200);
    }
    
    nextImage() {
        if (this.isAnimating) return;
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.showImage();
    }
    
    previousImage() {
        if (this.isAnimating) return;
        this.currentIndex = this.currentIndex === 0 ? 
            this.images.length - 1 : this.currentIndex - 1;
        this.showImage();
    }
    
    updateCounter() {
        this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
    }
    
    updateNavButtons() {
        // УБИРАЕМ disabled атрибут полностью - он вызывает красный курсор
        // Вместо этого используем CSS классы для визуального состояния
        
        if (this.isAnimating) {
            this.prevButton.classList.add('loading');
            this.nextButton.classList.add('loading');
        } else {
            this.prevButton.classList.remove('loading');
            this.nextButton.classList.remove('loading');
        }
    }
    
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Gallery();
});
