import { fitStartBannerDate, loadStartDate } from './modules/schedule.js?v=20261027';
import { applyBrandPalette, initAnimations, initStats } from './modules/appearance.js?v=20261027';
import { initMobileNav, initNavDropdown, initFAQ, initSmoothScroll, initBackToTop } from './modules/navigation.js?v=20261027';
import { initModal, initForms } from './modules/enrollment.js?v=20261027';
import { initConversionTracking } from './modules/analytics.js?v=20261027';
import { initReviewsSlider, initGallerySlider } from './modules/sliders.js?v=20261027';
import { initDocumentModal } from './modules/documents.js?v=20261027';

document.addEventListener('DOMContentLoaded', () => {
    fitStartBannerDate();
});

window.addEventListener('resize', (() => {
    let t;
    return () => { clearTimeout(t); t = setTimeout(fitStartBannerDate, 200); };
})());

document.addEventListener('DOMContentLoaded', function() {
    applyBrandPalette();

    initMobileNav();
    initNavDropdown();
    initFAQ();
    initModal();
    initForms();
    initSmoothScroll();
    initBackToTop();
    initConversionTracking();
    initReviewsSlider();
    initGallerySlider();
    initDocumentModal();
    loadStartDate();

    initAnimations();

    const header = document.getElementById('header');
    if (header) {
        header.style.background = '';
        header.style.backdropFilter = '';
    }

    initStats();
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--t-fast', '0.01s');
    document.documentElement.style.setProperty('--t-med', '0.01s');
    document.documentElement.style.setProperty('--t-slow', '0.01s');
}
