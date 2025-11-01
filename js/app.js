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

// Определение слабого устройства
function isLowEndDevice() {
    // Проверяем наличие информации о производительности
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        // 2G или slow-2g
        if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
            return true;
        }
    }
    
    // Проверяем количество ядер (если доступно)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
        return true;
    }
    
    // Проверяем доступную память (если доступно)
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) {
        return true;
    }
    
    return false;
}

// Initialize AOS with reduced motion support
function initAnimations() {
    // Отключаем анимации на мобильных/планшетах для лучшей производительности
    const isMobile = window.innerWidth <= 1024;
    const isLowEnd = isLowEndDevice();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Полностью отключаем AOS на мобильных или слабых устройствах
    if (isMobile || isLowEnd || reduce) {
        // Отключаем AOS и сразу показываем все элементы
        if (typeof AOS !== 'undefined') {
            AOS.init({ disable: 'mobile' }); // Отключаем на мобильных
        }
        
        // Сразу показываем все элементы
        const els = document.querySelectorAll('[data-aos]');
        els.forEach(el => {
            el.classList.add('aos-animate');
            // Добавляем класс для отключения анимаций в CSS
            el.classList.add('no-animation');
        });
        
        // Отключаем анимации картинки машины
        const carImage = document.querySelector('.hero__image');
        if (carImage) {
            carImage.classList.add('no-animation');
        }
        
        return; // Выходим, не продолжая инициализацию
    }
    
    // Для десктопов загружаем AOS как обычно
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true, // анимация один раз для предсказуемости
            mirror: false, // не повторять при скролле вверх
            anchorPlacement: 'top-bottom',
            offset: 140,
            duration: reduce ? 500 : 1200,
            easing: 'ease-out-cubic',
            disable: false,
            delay: 50,
            startEvent: 'DOMContentLoaded'
        });
        // Гарантируем корректную инициализацию для элементов уже в вьюпорте
        setTimeout(() => {
            if (AOS && AOS.refreshHard) AOS.refreshHard();
            // Если мы вверху страницы, гарантированно показать хиро-элементы
            if (window.scrollY <= 10) {
                const heroEls = document.querySelectorAll('.hero [data-aos]');
                heroEls.forEach((el, idx) => setTimeout(() => el.classList.add('aos-animate'), 60 * idx));
            }
        }, 350);
    } else {
        // Fallback: показать элементы без AOS
        const els = document.querySelectorAll('[data-aos]');
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('aos-animate');
                        io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
            els.forEach(el => io.observe(el));
        } else {
            els.forEach(el => el.classList.add('aos-animate'));
        }
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
                // add a little extra space at the bottom so content isn't too close
                answer.style.maxHeight = (answer.scrollHeight + 16) + 'px';
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            }
        });
    });
}

// Ensure reveal animations trigger only when elements enter viewport
function enforceOnScrollAnimations() {
    const elements = Array.from(document.querySelectorAll('[data-aos]'));
    if (!elements.length) return;

    const inView = (el) => {
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 0.85 && r.bottom > 0;
    };

    // Применяем анимацию к элементам, которые уже в зоне видимости
    elements.forEach(el => { if (inView(el)) { el.classList.add('aos-animate'); } });

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting && !e.target.classList.contains('aos-animate')) {
                    e.target.classList.add('aos-animate');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
        elements.forEach(el => {
            // Наблюдаем только за элементами, которые еще не анимированы
            if (!el.classList.contains('aos-animate')) {
                io.observe(el);
            }
        });
    }
}

// Modal Form
function initModal() {
    const modal = document.getElementById('enrollModal');
    const openButtons = document.querySelectorAll('[data-modal-open]');
    const closeButton = modal ? modal.querySelector('.modal__close') : null;
    const overlay = modal ? modal.querySelector('.modal__overlay') : null;

    if (!modal) return;

    // Open modal
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            resetModalView(); // Сбрасываем вид модального окна при открытии
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Небольшая задержка перед сбросом, чтобы анимация закрытия прошла
        setTimeout(() => {
            resetModalView();
        }, 300);
    };

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // Кнопки в сообщениях об успехе/ошибке
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const closeErrorBtn = document.getElementById('closeErrorBtn');

    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', closeModal);
    }

    if (closeErrorBtn) {
        closeErrorBtn.addEventListener('click', () => {
            resetModalView(); // Возвращаем форму при нажатии "Попробовать снова"
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Phone Mask
function initPhoneMask() {
    const phoneInput = document.getElementById('modal-phone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 0) {
            if (value[0] === '8') {
                value = '7' + value.substring(1);
            } else if (value[0] !== '7') {
                value = '7' + value;
            }
        }

        let formattedValue = '+7';
        if (value.length > 1) {
            formattedValue += ' (' + value.substring(1, 4);
        }
        if (value.length >= 5) {
            formattedValue += ') ' + value.substring(4, 7);
        }
        if (value.length >= 8) {
            formattedValue += '-' + value.substring(7, 9);
        }
        if (value.length >= 10) {
            formattedValue += '-' + value.substring(9, 11);
        }

        e.target.value = formattedValue;
    });

    phoneInput.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && e.target.value === '+7') {
            e.preventDefault();
        }
    });

    // Устанавливаем +7 при фокусе, если поле пустое
    phoneInput.addEventListener('focus', function(e) {
        if (!e.target.value) {
            e.target.value = '+7';
        }
    });
}

// Form Validation
function validateForm(formData) {
    const errors = {};
    const name = formData.get('name').trim();
    const phone = formData.get('phone').trim();

    // Валидация имени
    if (!name) {
        errors.name = 'Введите ваше имя';
    } else if (name.length < 2) {
        errors.name = 'Имя должно содержать минимум 2 символа';
    }

    // Валидация телефона
    if (!phone) {
        errors.phone = 'Введите номер телефона';
    } else {
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length !== 11) {
            errors.phone = 'Введите корректный номер телефона';
        }
    }

    return errors;
}

function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId.replace('modal-', '') + '-error');

    if (input) input.classList.add('error');
    if (errorSpan) errorSpan.textContent = message;
}

function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId.replace('modal-', '') + '-error');

    if (input) input.classList.remove('error');
    if (errorSpan) errorSpan.textContent = '';
}

function clearAllErrors() {
    clearError('modal-name');
    clearError('modal-phone');
}

// Show/Hide Modal Messages
function showSuccessMessage() {
    const form = document.getElementById('enrollForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const divider = document.querySelector('.modal__divider');
    const alternative = document.querySelector('.modal__alternative');
    const title = document.querySelector('.modal__title');
    const subtitle = document.querySelector('.modal__subtitle');

    // Скрываем форму и другие элементы
    if (form) form.style.display = 'none';
    if (divider) divider.style.display = 'none';
    if (alternative) alternative.style.display = 'none';
    if (title) title.style.display = 'none';
    if (subtitle) subtitle.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';

    // Показываем сообщение об успехе
    if (successMessage) successMessage.style.display = 'block';
}

function showErrorMessage(message) {
    const form = document.getElementById('enrollForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const divider = document.querySelector('.modal__divider');
    const alternative = document.querySelector('.modal__alternative');
    const title = document.querySelector('.modal__title');
    const subtitle = document.querySelector('.modal__subtitle');

    // Скрываем форму и другие элементы
    if (form) form.style.display = 'none';
    if (divider) divider.style.display = 'none';
    if (alternative) alternative.style.display = 'none';
    if (title) title.style.display = 'none';
    if (subtitle) subtitle.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';

    // Показываем сообщение об ошибке
    if (errorMessage) errorMessage.style.display = 'block';
    if (errorText) errorText.textContent = message;
}

function resetModalView() {
    const form = document.getElementById('enrollForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const divider = document.querySelector('.modal__divider');
    const alternative = document.querySelector('.modal__alternative');
    const title = document.querySelector('.modal__title');
    const subtitle = document.querySelector('.modal__subtitle');

    // Показываем форму и все элементы
    if (form) form.style.display = 'block';
    if (divider) divider.style.display = 'block';
    if (alternative) alternative.style.display = 'block';
    if (title) title.style.display = 'block';
    if (subtitle) subtitle.style.display = 'block';

    // Скрываем сообщения
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

// Form Submission
function initForms() {
    const enrollForm = document.getElementById('enrollForm');
    if (!enrollForm) return;

    // Инициализация маски телефона
    initPhoneMask();

    // Очистка ошибок при вводе
    const nameInput = document.getElementById('modal-name');
    const phoneInput = document.getElementById('modal-phone');

    if (nameInput) {
        nameInput.addEventListener('input', () => clearError('modal-name'));
    }
    if (phoneInput) {
        phoneInput.addEventListener('input', () => clearError('modal-phone'));
    }

    enrollForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearAllErrors();

        const formData = new FormData(this);

        // Honeypot check - защита от ботов
        if (formData.get('website')) {
            console.warn('Bot detected via honeypot');
            showErrorMessage('Ошибка отправки. Пожалуйста, попробуйте позже.');
            return;
        }

        const errors = validateForm(formData);

        // Показываем ошибки валидации
        if (Object.keys(errors).length > 0) {
            if (errors.name) showError('modal-name', errors.name);
            if (errors.phone) showError('modal-phone', errors.phone);
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn__text');
        const btnSpinner = submitBtn.querySelector('.btn__spinner');

        // Показываем спиннер
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;

        // Отправка данных через Netlify Function (безопасно!)
        try {
            console.log('Отправка заявки через Netlify Function...');

            // Отправляем через Netlify Serverless Function
            // Токен скрыт на сервере Netlify!
            const response = await fetch('/.netlify/functions/send-telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData)
            });

            const result = await response.json();
            console.log('Результат отправки:', result);

            // Скрываем спиннер
            btnText.style.display = 'inline-block';
            btnSpinner.style.display = 'none';
            submitBtn.disabled = false;

            if (result.success) {
                // Показываем сообщение об успехе
                showSuccessMessage();
                this.reset();
                clearAllErrors();
            } else {
                // Показываем сообщение об ошибке
                showErrorMessage(result.message || 'Произошла ошибка. Пожалуйста, попробуйте позже или позвоните нам напрямую.');
            }
        } catch (error) {
            console.error('Ошибка отправки формы:', error);

            // Скрываем спиннер
            btnText.style.display = 'inline-block';
            btnSpinner.style.display = 'none';
            submitBtn.disabled = false;

            // Показываем сообщение об ошибке
            showErrorMessage('Произошла ошибка при отправке заявки. Пожалуйста, позвоните нам напрямую по телефону 8-953-939-66-66');
        }
    });
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
        // Если карта не загружена, пробуем загрузить
        if (typeof loadYandexMap === 'function') {
            loadYandexMap();
        }
        return;
    }

    // Проверяем наличие контейнера
    const mapContainer = document.getElementById('yandex-map');
    if (!mapContainer) {
        return;
    }

    ymaps.ready(function () {
        try {
            const coordinates = [64.544693, 40.516373];
            const isMobile = window.innerWidth <= 768;

            const map = new ymaps.Map('yandex-map', {
                center: coordinates,
                zoom: isMobile ? 15 : 16, // Меньший zoom для мобильных
                controls: isMobile ? ['zoomControl'] : ['zoomControl', 'fullscreenControl'] // Меньше контролов на мобильных
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
        } catch (error) {
            console.error('Ошибка инициализации Яндекс карты:', error);
        }
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

// Keep the start date on one line and shrink if needed
function fitStartBannerDate() {
    const el = document.querySelector('.start-banner__date');
    if (!el) return;
    const computed = window.getComputedStyle(el);
    const maxSize = parseFloat(computed.fontSize) || 24;
    const minSize = 12;
    el.style.whiteSpace = 'nowrap';
    el.style.fontSize = maxSize + 'px';
    let current = maxSize;
    let guard = 0;
    while (el.scrollWidth > el.clientWidth && current > minSize && guard < 40) {
        current -= 1;
        el.style.fontSize = current + 'px';
        guard++;
    }
}

// Run fit on load and on resize
document.addEventListener('DOMContentLoaded', () => {
    fitStartBannerDate();
});

window.addEventListener('resize', (() => {
    let t;
    return () => { clearTimeout(t); t = setTimeout(fitStartBannerDate, 200); };
})());

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    applyBrandPalette();
    
    // Откладываем тяжелые функции для мобильных
    const isMobile = window.innerWidth <= 768;
    
    // Критические функции - загружаем сразу
    initMobileNav();
    initFAQ();
    initModal();
    initForms();
    initSmoothScroll();
    initBackToTop();
    initReviewsSlider(); // Инициализируем слайдер отзывов
    loadStartDate(); // Загружаем актуальную дату старта

    // Средней важности - загружаем с небольшой задержкой на мобильных
    // НО на мобильных initAnimations уже не нужна, т.к. элементы показываются сразу
    if (!isMobile) {
        setTimeout(() => {
            initAnimations();
            if (typeof AOS === "undefined") { 
                setTimeout(enforceOnScrollAnimations, 300); 
            }
        }, 0);
    } else {
        // На мобильных сразу показываем все элементы
        const aosElements = document.querySelectorAll('[data-aos]');
        aosElements.forEach(el => {
            el.classList.add('aos-animate');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
    
    // Clear any inline header styles
    const header = document.getElementById('header');
    if (header) {
        header.style.background = '';
        header.style.backdropFilter = '';
    }
    
    // Тяжелые функции - загружаем когда нужно
    // Яндекс карта загружается через функцию в HTML
    // Статистика загружается при прокрутке (IntersectionObserver в initStats)
    if (!isMobile) {
        // На десктопе можно загрузить карту сразу если нужно
        setTimeout(() => {
            if (typeof ymaps !== 'undefined') {
                initYandexMap();
            }
        }, 2000);
    }
    
    // Инициализация статистики будет происходить при скролле
    initStats();
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

    // На мобильных отключаем анимацию счетчиков для производительности
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const cards = Array.from(section.querySelectorAll('.stat'));
        cards.forEach((c) => {
            const v = c.querySelector('.stat__value');
            if (v) {
                v.textContent = `${c.dataset.target}${c.dataset.suffix || ''}`;
            }
        });
        const progress = section.querySelector('.stats__progress');
        const fill = section.querySelector('.stats__progress-fill');
        if (progress) progress.setAttribute('aria-valuenow', '100');
        if (fill) fill.style.width = '100%';
        return;
    }

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

// Load Start Date from Netlify Function
async function loadStartDate() {
    try {
        const response = await fetch('/.netlify/functions/get-start-date?t=' + Date.now());
        const data = await response.json();

        if (data.success && data.date) {
            const nodes = document.querySelectorAll('.start-banner__date, .start-date-inline');
            nodes.forEach(el => { el.textContent = data.date; });
            if (typeof fitStartBannerDate === 'function') {
                fitStartBannerDate();
            }
    }
    } catch (error) {
        console.error('Ошибка загрузки даты старта:', error);
        // Оставляем дату по умолчанию из HTML
    }
}

// Initialize Reviews Slider
function initReviewsSlider() {
    const track = document.getElementById('reviewsTrack');
    const prevBtn = document.getElementById('reviewsPrev');
    const nextBtn = document.getElementById('reviewsNext');
    const dotsContainer = document.getElementById('reviewsDots');
    
    if (!track || !prevBtn || !nextBtn || !dotsContainer) {
        return; // Элементы не найдены
    }
    
    const cards = track.querySelectorAll('.review-card');
    const totalCards = cards.length;
    let currentIndex = 0;
    
    // Определяем количество видимых карточек
    function getVisibleCount() {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        return 3;
    }
    
    // Получаем ширину одной карточки (включая gap)
    function getCardWidth() {
        const firstCard = cards[0];
        if (!firstCard) return 0;
        const trackRect = track.getBoundingClientRect();
        const sliderRect = track.parentElement.getBoundingClientRect();
        const visibleCount = getVisibleCount();
        const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
        
        // Точная ширина: ширина видимой области делим на количество карточек
        const cardWidth = (sliderRect.width - (gap * (visibleCount - 1))) / visibleCount;
        return cardWidth + gap;
    }
    
    // Создаем точки навигации
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
    
    // Переход к индексу
    function goToIndex(index) {
        const visibleCount = getVisibleCount();
        const maxIndex = Math.max(0, totalCards - visibleCount);
        
        if (index < 0 || index > maxIndex) return;
        
        currentIndex = index;
        
        // Более точный расчет с учетом реальной позиции карточки
        const firstCard = cards[0];
        if (!firstCard) return;
        
        // Используем offsetWidth для более точного расчета
        const cardWidth = firstCard.offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
        
        // Если gap не определен, пробуем вычислить из разницы позиций карточек
        let actualGap = gap;
        if (cards.length > 1 && gap === 0) {
            const secondCard = cards[1];
            const firstRect = firstCard.getBoundingClientRect();
            const secondRect = secondCard.getBoundingClientRect();
            actualGap = secondRect.left - firstRect.right;
        }
        
        // Смещение = индекс * (ширина карточки + gap)
        const translateX = -currentIndex * (cardWidth + actualGap);
        
        track.style.transform = `translateX(${translateX}px)`;
        
        // Обновляем точки
        const dots = dotsContainer.querySelectorAll('.reviews__dot');
        dots.forEach((dot, i) => {
            if (i === currentIndex) {
                dot.classList.add('reviews__dot--active');
            } else {
                dot.classList.remove('reviews__dot--active');
            }
        });
        
        // Обновляем кнопки
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }
    
    // Переход на один шаг вперед/назад
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
    
    // Обработчики кнопок
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Обновление при изменении размера окна
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createDots();
            goToIndex(Math.min(currentIndex, Math.max(0, totalCards - getVisibleCount())));
        }, 250);
    });
    
    // Инициализация с небольшой задержкой для правильного расчета размеров
    setTimeout(() => {
        createDots();
        goToIndex(0);
        
        // Принудительное обновление позиции после загрузки
        setTimeout(() => {
            if (currentIndex > 0) {
                goToIndex(currentIndex);
            }
        }, 100);
    }, 50);
}
