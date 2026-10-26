export function initDocumentModal() {
    const modal = document.getElementById('documentModal');
    if (!modal) return;
    const modalImage = modal.querySelector('.document-modal__image');
    const modalClose = modal.querySelector('.document-modal__close');
    const modalBackdrop = modal.querySelector('.document-modal__backdrop');
    const zoomButtons = document.querySelectorAll('.document-card__zoom');
    let lastFocusedElement = null;

    if (!modal || !modalImage) return;

    function openModal(imageSrc, imageAlt) {
        lastFocusedElement = document.activeElement;
        modalImage.src = imageSrc;
        modalImage.alt = imageAlt;
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            modal.classList.add('active');
            if (modalClose) modalClose.focus();
        }, 10);
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            document.body.style.overflow = '';
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }, 300);
    }

    zoomButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = button.closest('.document-card');
            const img = card.querySelector('.document-card__image');
            if (img) {
                openModal(img.src, img.alt);
            }
        });
    });

    document.querySelectorAll('.document-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.document-card__zoom')) return;

            if (card.querySelector('.document-card__link')) return;

            const img = card.querySelector('.document-card__image');
            if (img) {
                openModal(img.src, img.alt);
            }
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
        if (e.key === 'Tab' && modal.classList.contains('active') && modalClose) {
            if (e.shiftKey && document.activeElement === modalClose) {
                e.preventDefault();
                modalClose.focus();
            }
        }
    });
}
