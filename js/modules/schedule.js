export function fitStartBannerDate() {
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

export async function loadStartDate() {
    try {
        let response = await fetch('/api/get-start-date?t=' + Date.now());

        if (!response.ok && response.status === 404) {
            response = await fetch('/api/get-start-date.php?t=' + Date.now());
        }

        if (!response.ok) {
            return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.warn('API вернул HTML вместо JSON:', text.substring(0, 200));
            return;
        }

        const data = await response.json();

        if (data.success && data.date) {
            const nodes = document.querySelectorAll('.start-banner__date, .start-date-inline');
            nodes.forEach(el => { el.textContent = data.date; });
            if (typeof fitStartBannerDate === 'function') {
                fitStartBannerDate();
            }
        }
    } catch (error) {
    }
}
