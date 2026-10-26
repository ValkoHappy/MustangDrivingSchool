export function initReviewsSlider() {
    const track = document.getElementById('reviewsTrack');
    const prevBtn = document.getElementById('reviewsPrev');
    const nextBtn = document.getElementById('reviewsNext');
    const dotsContainer = document.getElementById('reviewsDots');

    if (!track || !prevBtn || !nextBtn || !dotsContainer) {
        return;
    }

    const cards = track.querySelectorAll('.review-card');
    const totalCards = cards.length;
    let currentIndex = 0;

    function getVisibleCount() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        return 3;
    }

    function getCardWidth() {
        const firstCard = cards[0];
        if (!firstCard) return 0;
        const trackRect = track.getBoundingClientRect();
        const sliderRect = track.parentElement.getBoundingClientRect();
        const visibleCount = getVisibleCount();
        const gap = parseFloat(window.getComputedStyle(track).gap) || 0;

        const cardWidth = (sliderRect.width - (gap * (visibleCount - 1))) / visibleCount;
        return cardWidth + gap;
    }

    function createDots() {
        dotsContainer.innerHTML = '';
        const visibleCount = getVisibleCount();
        const totalDots = Math.max(1, totalCards - visibleCount + 1);

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'reviews__dot';
            if (i === 0) dot.classList.add('reviews__dot--active');
            dot.setAttribute('aria-label', `Перейти к группе отзывов ${i + 1}`);
            dot.addEventListener('click', () => goToIndex(i));
            dotsContainer.appendChild(dot);
        }
    }

    function goToIndex(index) {
        const visibleCount = getVisibleCount();
        const maxIndex = Math.max(0, totalCards - visibleCount);

        if (index < 0 || index > maxIndex) return;

        currentIndex = index;

        const firstCard = cards[0];
        if (!firstCard) return;

        const cardWidth = firstCard.offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 0;

        let actualGap = gap;
        if (cards.length > 1 && gap === 0) {
            const secondCard = cards[1];
            const firstRect = firstCard.getBoundingClientRect();
            const secondRect = secondCard.getBoundingClientRect();
            actualGap = secondRect.left - firstRect.right;
        }

        const translateX = -currentIndex * (cardWidth + actualGap);

        track.style.transform = `translateX(${translateX}px)`;

        const dots = dotsContainer.querySelectorAll('.reviews__dot');
        dots.forEach((dot, i) => {
            if (i === currentIndex) {
                dot.classList.add('reviews__dot--active');
            } else {
                dot.classList.remove('reviews__dot--active');
            }
        });

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }

    function nextSlide() {
        const visibleCount = getVisibleCount();
        const maxIndex = Math.max(0, totalCards - visibleCount);
        if (currentIndex < maxIndex) {
            goToIndex(currentIndex + 1);
        }
    }

    function prevSlide() {
        if (currentIndex > 0) {
            goToIndex(currentIndex - 1);
        }
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createDots();
            goToIndex(Math.min(currentIndex, Math.max(0, totalCards - getVisibleCount())));
        }, 250);
    });

    setTimeout(() => {
        createDots();
        goToIndex(0);

        setTimeout(() => {
            if (currentIndex > 0) {
                goToIndex(currentIndex);
            }
        }, 100);
    }, 50);
}

export function initGallerySlider() {
    const track = document.getElementById('galleryTrack');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    const dotsContainer = document.getElementById('galleryDots');

    if (!track || !prevBtn || !nextBtn || !dotsContainer) {
        return;
    }

    const items = track.querySelectorAll('.gallery-item');
    const totalItems = items.length;
    let currentIndex = 0;

    function getVisibleCount() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        if (width <= 1200) return 3;
        return 4;
    }

    function getItemWidth() {
        const firstItem = items[0];
        if (!firstItem) return 0;
        const trackRect = track.getBoundingClientRect();
        const sliderRect = track.parentElement.getBoundingClientRect();
        const visibleCount = getVisibleCount();
        const gap = parseFloat(window.getComputedStyle(track).gap) || 0;

        const itemWidth = (sliderRect.width - (gap * (visibleCount - 1))) / visibleCount;
        return itemWidth + gap;
    }

    function createDots() {
        dotsContainer.innerHTML = '';
        const visibleCount = getVisibleCount();
        const totalDots = Math.max(1, totalItems - visibleCount + 1);

        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'gallery__dot';
            if (i === 0) dot.classList.add('gallery__dot--active');
            dot.setAttribute('aria-label', `Перейти к группе фото ${i + 1}`);
            dot.addEventListener('click', () => goToIndex(i));
            dotsContainer.appendChild(dot);
        }
    }

    function goToIndex(index) {
        const visibleCount = getVisibleCount();
        const maxIndex = Math.max(0, totalItems - visibleCount);

        if (index < 0 || index > maxIndex) return;

        currentIndex = index;

        const firstItem = items[0];
        if (!firstItem) return;

        const firstRect = firstItem.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        const sliderRect = track.parentElement.getBoundingClientRect();

        const itemWidth = firstItem.offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 0;

        let actualGap = gap;
        if (items.length > 1 && gap === 0) {
            const secondItem = items[1];
            const secondRect = secondItem.getBoundingClientRect();
            actualGap = secondRect.left - firstRect.right;
        }

        const trackPaddingLeft = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
        const translateX = -currentIndex * (itemWidth + actualGap);

        track.style.transform = `translateX(${translateX}px)`;

        const dots = dotsContainer.querySelectorAll('.gallery__dot');
        dots.forEach((dot, i) => {
            if (i === currentIndex) {
                dot.classList.add('gallery__dot--active');
            } else {
                dot.classList.remove('gallery__dot--active');
            }
        });

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }

    function nextSlide() {
        const visibleCount = getVisibleCount();
        const maxIndex = Math.max(0, totalItems - visibleCount);
        if (currentIndex < maxIndex) {
            goToIndex(currentIndex + 1);
        }
    }

    function prevSlide() {
        if (currentIndex > 0) {
            goToIndex(currentIndex - 1);
        }
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createDots();
            goToIndex(Math.min(currentIndex, Math.max(0, totalItems - getVisibleCount())));
        }, 250);
    });

    setTimeout(() => {
        createDots();
        goToIndex(0);

        setTimeout(() => {
            if (currentIndex > 0) {
                goToIndex(currentIndex);
            }
        }, 100);
    }, 50);
}
