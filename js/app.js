// Brand palette and UI behavior
function applyBrandPalette() {
    const root = document.documentElement;
    const palette = {
        primary: '#00BCD4',
        primaryLight: '#00D9EA',
        primaryDark: '#0097A7',
        headerBg: 'rgba(0, 44, 51, 0.92)',
        headerBgScrolled: 'rgba(0, 44, 51, 0.98)'
    };

    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--primary-light', palette.primaryLight);
    root.style.setProperty('--primary-dark', palette.primaryDark);
    root.style.setProperty('--primary-hover', palette.primaryLight);
    root.style.setProperty('--header-bg', palette.headerBg);
    root.style.setProperty('--header-bg-scrolled', palette.headerBgScrolled);
}

// Initialize AOS with reduced motion support
function initAnimations() {
    if (typeof AOS !== 'undefined') {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        AOS.init({
            once: true,
            offset: 120,
            duration: reduce ? 400 : 900,
            easing: 'ease-out-cubic',
            disable: false, // always enable; we manage reduction via shorter duration
            startEvent: 'DOMContentLoaded'
        });
        // Safety: if for какой-то причине класс aos-animate не присвоился
        // принудительно делаем элементы видимыми через небольшой таймаут
        setTimeout(() => {
            document.querySelectorAll('[data-aos]').forEach(el => {
                if (!el.classList.contains('aos-animate')) {
                    el.classList.add('aos-animate');
                }
            });
        }, 800);
    } else {
        console.warn('AOS not loaded — applying visibility fallback');
        // Fallback: показать элементы без AOS
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.classList.add('aos-animate');
        });
    }
}

// Mobile Navigation
function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// FAQ Accordion
function initFAQ() {
    document.querySelectorAll('.faq-item__question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentNode;
            const answer = item.querySelector('.faq-item__answer');
            const isActive = item.classList.contains('active');

            // Закрываем все остальные элементы
            document.querySelectorAll('.faq-item').forEach(faqItem => {
                if (faqItem !== item) {
                    const otherAnswer = faqItem.querySelector('.faq-item__answer');
                    faqItem.classList.remove('active');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = null;
                    }
                }
            });

            // Переключаем текущий элемент
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            }
        });
    });
}

// Modal Form
function initModal() {
    const modal = document.getElementById('enrollModal');
    const openButtons = document.querySelectorAll('.btn--primary, .start-banner .btn');
    const closeButton = modal ? modal.querySelector('.modal__close') : null;
    const overlay = modal ? modal.querySelector('.modal__overlay') : null;

    if (!modal) return;

    // Open modal
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Form Submission
function initForms() {
    const enrollForm = document.getElementById('enrollForm');
    if (enrollForm) {
        enrollForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = this.querySelector('#modal-name').value.trim();
            const phone = this.querySelector('#modal-phone').value.trim();

            if (!name || !phone) {
                alert('Пожалуйста, заполните обязательные поля');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            setTimeout(() => {
                alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                // Close modal
                const modal = document.getElementById('enrollModal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }, 1500);
        });
    }
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize Yandex Map
function initYandexMap() {
    if (typeof ymaps === 'undefined') {
        console.warn('Yandex Maps API not loaded');
        return;
    }

    ymaps.ready(function () {
        const coordinates = [64.544693, 40.516373];

        const map = new ymaps.Map('yandex-map', {
            center: coordinates,
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl']
        });

        // Добавляем метку
        const placemark = new ymaps.Placemark(coordinates, {
            balloonContent: '<strong>Автошкола «Мустанг»</strong><br>г. Архангельск, пр. Троицкий, д. 67, оф. 413<br>ТЦ «Пирамида», 4 этаж<br><a href="tel:+79539396666">8-953-939-66-66</a>',
            hintContent: 'Автошкола «Мустанг» — ТЦ «Пирамида»'
        }, {
            preset: 'islands#blueDotIcon',
            iconColor: '#02BBD0'
        });

        map.geoObjects.add(placemark);
    });
}

// Back to Top Button
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    applyBrandPalette();
    initAnimations();
    initMobileNav();
    initFAQ();
    initModal();
    initForms();
    initSmoothScroll();
    initStats();
    initYandexMap();
    initBackToTop();

    // Clear any inline header styles
    const header = document.getElementById('header');
    if (header) {
        header.style.background = '';
        header.style.backdropFilter = '';
    }
});

// Check for reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--t-fast', '0.01s');
    document.documentElement.style.setProperty('--t-med', '0.01s');
    document.documentElement.style.setProperty('--t-slow', '0.01s');
}

// === Stats counters ===
function countUp(el, to, { duration = 1200, suffix = '', onProgress } = {}) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.textContent = `${to}${suffix}`; if (onProgress) onProgress(1); return Promise.resolve(); }

    return new Promise(resolve => {
        const start = performance.now();
        const from = 0;
        const raf = (t) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const current = Math.round(from + (to - from) * eased);
            el.textContent = `${current}${suffix}`;
            if (onProgress) onProgress(eased);
            if (p < 1) requestAnimationFrame(raf);
            else { el.textContent = `${to}${suffix}`; resolve(); }
        };
        requestAnimationFrame(raf);
    });
}

function initStats() {
    const section = document.getElementById('stats');
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.stat'));
    const progress = section.querySelector('.stats__progress');
    const fill = section.querySelector('.stats__progress-fill');
    const marker = section.querySelector('.stats__progress-marker');
    let played = false;

    const updateProgress = (pct) => {
        if (fill) fill.style.width = `${pct}%`;
        if (progress) progress.setAttribute('aria-valuenow', String(pct));
        if (marker) marker.style.left = `${pct}%`;
    };

    const play = async () => {
        if (played) return; played = true;
        const stepPct = [33, 66, 100];

        // Smooth overall progress 0->100 independent of per-card updates
        const durations = cards.map((_, i) => 1100 + i * 150);
        const totalDuration = durations.reduce((a, b) => a + b, 0);
        let stopProgress = false;
        const startTime = performance.now();
        const tick = (t) => {
            if (stopProgress) return;
            const p = Math.min(1, (t - startTime) / totalDuration);
            // linear progress for steady motion
            updateProgress(Math.round(p * 100));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const valueEl = card.querySelector('.stat__value');
            const to = parseInt(card.dataset.target, 10) || 0;
            const suffix = card.dataset.suffix || '';
            await countUp(valueEl, to, { duration: durations[i], suffix });
        }
        // ensure we end at 100%
        stopProgress = true;
        updateProgress(100);
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
        cards.forEach((c) => {
            const v = c.querySelector('.stat__value');
            v.textContent = `${c.dataset.target}${c.dataset.suffix || ''}`;
        });
        updateProgress(100);
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { play(); io.disconnect(); }
        });
    }, { threshold: 0.3 });

    io.observe(section);
}
