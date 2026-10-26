export function trackGoal(goal) {
    if (typeof window.ym === 'function') {
        window.ym(105185354, 'reachGoal', goal);
    }
}

export function initConversionTracking() {
    document.addEventListener('click', (event) => {
        const target = event.target.closest('a, button');
        if (!target) return;
        if (target.matches('[data-modal-open]')) trackGoal('lead_form_open');
        else if (target.matches('a[href^="tel:"]')) trackGoal('phone_click');
        else if (target.matches('a[href*="vk.com"]')) trackGoal('vk_click');
    });
}
