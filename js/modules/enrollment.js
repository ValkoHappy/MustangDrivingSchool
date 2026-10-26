import { trackGoal } from './analytics.js?v=20261027';

export function initModal() {
    const modal = document.getElementById('enrollModal');
    const openButtons = document.querySelectorAll('[data-modal-open]');
    const closeButton = modal ? modal.querySelector('.modal__close') : null;
    const overlay = modal ? modal.querySelector('.modal__overlay') : null;
    const modalContent = modal ? modal.querySelector('.modal__content') : null;
    const firstInput = modal ? modal.querySelector('input[name="name"]') : null;
    let lastFocusedElement = null;

    if (!modal) return;

    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            lastFocusedElement = document.activeElement;
            resetModalView();
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                if (firstInput) firstInput.focus();
                else if (closeButton) closeButton.focus();
            });
            setTimeout(() => {
                if (!modal.classList.contains('active')) return;
                if (firstInput) firstInput.focus();
                else if (closeButton) closeButton.focus();
            }, 220);
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            resetModalView();
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }, 300);
    };

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const closeErrorBtn = document.getElementById('closeErrorBtn');

    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', closeModal);
    }

    if (closeErrorBtn) {
        closeErrorBtn.addEventListener('click', () => {
            resetModalView();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }

        if (e.key === 'Tab' && modal.classList.contains('active') && modalContent) {
            const focusable = Array.from(modalContent.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])'))
                .filter(element => !element.disabled && element.offsetParent !== null);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}

export function initPhoneMask() {
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

    phoneInput.addEventListener('focus', function(e) {
        if (!e.target.value) {
            e.target.value = '+7';
        }
    });
}

export function validateForm(formData) {
    const errors = {};
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();

    if (!name) {
        errors.name = 'Введите ваше имя';
    } else if (name.length < 2) {
        errors.name = 'Имя должно содержать минимум 2 символа';
    } else if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,99}$/u.test(name)) {
        errors.name = 'Укажите имя без специальных символов';
    }

    if (!phone) {
        errors.phone = 'Введите номер телефона';
    } else {
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length !== 11) {
            errors.phone = 'Введите корректный номер телефона';
        }
    }

    if (formData.get('consent') !== 'on') {
        errors.consent = 'Необходимо дать согласие';
    }

    return errors;
}

export function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId.replace('modal-', '') + '-error');

    if (input) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
    }
    if (errorSpan) errorSpan.textContent = message;
}

export function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId.replace('modal-', '') + '-error');

    if (input) {
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
    }
    if (errorSpan) errorSpan.textContent = '';
}

export function clearAllErrors() {
    clearError('modal-name');
    clearError('modal-phone');
    const consentError = document.getElementById('consent-error');
    if (consentError) consentError.textContent = '';
}

export function showSuccessMessage() {
    const form = document.getElementById('enrollForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const divider = document.querySelector('.modal__divider');
    const alternative = document.querySelector('.modal__alternative');
    const title = document.querySelector('.modal__title');
    const subtitle = document.querySelector('.modal__subtitle');

    if (form) form.style.display = 'none';
    if (divider) divider.style.display = 'none';
    if (alternative) alternative.style.display = 'none';
    if (title) title.style.display = 'none';
    if (subtitle) subtitle.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';

    if (successMessage) {
        successMessage.style.display = 'block';
        successMessage.setAttribute('tabindex', '-1');
        successMessage.focus();
    }
}

export function showErrorMessage(message) {
    const form = document.getElementById('enrollForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const divider = document.querySelector('.modal__divider');
    const alternative = document.querySelector('.modal__alternative');
    const title = document.querySelector('.modal__title');
    const subtitle = document.querySelector('.modal__subtitle');

    if (form) form.style.display = 'none';
    if (divider) divider.style.display = 'none';
    if (alternative) alternative.style.display = 'none';
    if (title) title.style.display = 'none';
    if (subtitle) subtitle.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';

    if (errorMessage) {
        errorMessage.style.display = 'block';
        errorMessage.setAttribute('tabindex', '-1');
        errorMessage.focus();
    }
    if (errorText) errorText.textContent = message;
}

export function resetModalView() {
    const form = document.getElementById('enrollForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const divider = document.querySelector('.modal__divider');
    const alternative = document.querySelector('.modal__alternative');
    const title = document.querySelector('.modal__title');
    const subtitle = document.querySelector('.modal__subtitle');

    if (form) form.style.display = 'block';
    if (divider) divider.style.display = 'block';
    if (alternative) alternative.style.display = 'block';
    if (title) title.style.display = 'block';
    if (subtitle) subtitle.style.display = 'block';

    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

export function initForms() {
    const enrollForm = document.getElementById('enrollForm');
    if (!enrollForm) return;

    initPhoneMask();

    const nameInput = document.getElementById('modal-name');
    const phoneInput = document.getElementById('modal-phone');
    const consentInput = document.getElementById('modal-consent');

    if (nameInput) {
        nameInput.addEventListener('input', () => clearError('modal-name'));
    }
    if (phoneInput) {
        phoneInput.addEventListener('input', () => clearError('modal-phone'));
    }
    if (consentInput) {
        consentInput.addEventListener('change', () => {
            const consentError = document.getElementById('consent-error');
            if (consentError) consentError.textContent = '';
        });
    }

    enrollForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearAllErrors();

        const formData = new FormData(this);

        if (formData.get('website')) {
            console.warn('Bot detected via honeypot');
            showErrorMessage('Ошибка отправки. Пожалуйста, попробуйте позже.');
            return;
        }

        const errors = validateForm(formData);

        if (Object.keys(errors).length > 0) {
            if (errors.name) showError('modal-name', errors.name);
            if (errors.phone) showError('modal-phone', errors.phone);
            if (errors.consent) {
                const consentError = document.getElementById('consent-error');
                if (consentError) consentError.textContent = errors.consent;
            }
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn__text');
        const btnSpinner = submitBtn.querySelector('.btn__spinner');

        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;

        const controller = new AbortController();
        const requestTimeout = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch('/api/send-lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData),
                signal: controller.signal
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('API вернул HTML вместо JSON:', text.substring(0, 200));
                throw new Error('Сервер вернул неверный формат ответа. Попробуйте позже.');
            }

            const result = await response.json();

            if (response.ok && result.success) {
                showSuccessMessage();
                this.reset();
                clearAllErrors();
                trackGoal('lead_submit_success');
            } else {
                showErrorMessage(result.message || 'Произошла ошибка. Пожалуйста, попробуйте позже или позвоните нам напрямую.');
            }
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            const message = error && error.name === 'AbortError'
                ? 'Сервер отвечает слишком долго. Попробуйте ещё раз или позвоните нам по телефону 8-953-939-66-66.'
                : 'Произошла ошибка при отправке заявки. Пожалуйста, позвоните нам напрямую по телефону 8-953-939-66-66.';
            showErrorMessage(message);
        } finally {
            clearTimeout(requestTimeout);
            btnText.style.display = 'inline-block';
            btnSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}
