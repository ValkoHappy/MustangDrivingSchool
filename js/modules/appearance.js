export function applyBrandPalette() {
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

export function initAnimations() {
    const elements = document.querySelectorAll('[data-aos]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showImmediately = reduceMotion;

    const reveal = (element, noAnimation = false) => {
        element.classList.add('aos-animate');
        element.setAttribute('data-aos-animated', 'true');
        if (noAnimation) element.classList.add('no-animation');
    };

    if (showImmediately || !('IntersectionObserver' in window)) {
        elements.forEach(element => reveal(element, true));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    elements.forEach(element => observer.observe(element));
}

export function countUp(el, to, { duration = 1200, suffix = '', onProgress } = {}) {
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

export function initStats() {
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

        const durations = cards.map((_, i) => 1100 + i * 150);
        const totalDuration = durations.reduce((a, b) => a + b, 0);
        let stopProgress = false;
        const startTime = performance.now();
        const tick = (t) => {
            if (stopProgress) return;
            const p = Math.min(1, (t - startTime) / totalDuration);
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
