export function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');

    if (!navToggle || !nav) return;

    navToggle.setAttribute('aria-controls', 'nav');
    navToggle.setAttribute('aria-expanded', 'false');

    const setOpen = (open) => {
        nav.classList.toggle('active', open);
        navToggle.classList.toggle('active', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        document.body.style.overflow = open ? 'hidden' : '';
    };

    navToggle.addEventListener('click', () => setOpen(!nav.classList.contains('active')));

    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });
}

export function initNavDropdown() {
    const more = document.querySelector('.nav__more');
    const trigger = more ? more.querySelector('.nav__more-trigger') : null;
    const menu = more ? more.querySelector('.nav__more-menu') : null;
    if (!more || !trigger || !menu) return;

    if (!menu.id) menu.id = 'nav-more-menu';
    trigger.setAttribute('aria-controls', menu.id);
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    let closeTimer;
    const open = () => {
        clearTimeout(closeTimer);
        more.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
    };
    const close = (delay = 120) => {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
            more.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        }, delay);
    };

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = more.classList.contains('is-open');
        if (isOpen) close(0); else open();
    });

    document.addEventListener('click', (e) => {
        if (!more.contains(e.target)) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    const mq = window.matchMedia('(min-width: 1201px)');
    const closeOnLeave = () => close();
    const bindHover = () => {
        if (mq.matches) {
            more.addEventListener('mouseenter', open);
            more.addEventListener('mouseleave', closeOnLeave);
        } else {
            more.removeEventListener('mouseenter', open);
            more.removeEventListener('mouseleave', closeOnLeave);
            close();
        }
    };
    bindHover();
    mq.addEventListener('change', bindHover);
}

export function initFAQ() {
    document.querySelectorAll('.faq-item__question').forEach((question, index) => {
        const item = question.parentNode;
        const answer = item.querySelector('.faq-item__answer');
        if (!answer) return;
        const answerId = answer.id || `faq-answer-${index + 1}`;
        answer.id = answerId;
        question.setAttribute('aria-controls', answerId);
        question.setAttribute('aria-expanded', 'false');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(faqItem => {
                if (faqItem !== item) {
                    const otherAnswer = faqItem.querySelector('.faq-item__answer');
                    faqItem.classList.remove('active');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = null;
                        const otherQuestion = faqItem.querySelector('.faq-item__question');
                        if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = (answer.scrollHeight + 16) + 'px';
                question.setAttribute('aria-expanded', 'true');
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = null;
                question.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

export function initSmoothScroll() {
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

export function initBackToTop() {
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
