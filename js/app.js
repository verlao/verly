/**
 * Verly Vidraçaria - Main Application JavaScript
 * Pure Vanilla JS - No jQuery dependencies
 * Focus: Form validation, conversion tracking, and UX optimization
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Track events to Google Analytics
 */
function trackEvent(eventName, eventParams) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
    }
    console.log('Event tracked:', eventName, eventParams);
}

/**
 * Show alert message
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('formAlert');
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    alertDiv.innerHTML = `
        <div class="form-alert ${type}">
            <i class="fas ${iconClass}"></i>
            <span>${message}</span>
        </div>
    `;
    
    alertDiv.style.display = 'block';
    
    // Auto hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            alertDiv.style.display = 'none';
            alertDiv.innerHTML = '';
        }, 5000);
    }
}

/**
 * Clear alert message
 */
function clearAlert() {
    const alertDiv = document.getElementById('formAlert');
    alertDiv.style.display = 'none';
    alertDiv.innerHTML = '';
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Phone number mask (Brazilian format)
 */
function applyPhoneMask(value) {
    // Remove all non-digits
    value = value.replace(/\D/g, '');
    
    // Apply mask: (21) 9XXXX-XXXX
    if (value.length <= 10) {
        // Landline: (21) 1234-5678
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else {
        // Mobile: (21) 91234-5678
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    }
    
    return value;
}

/**
 * Validate phone number (Brazilian format)
 */
function validatePhone(phone) {
    // Remove mask to get only digits
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Must have 10 (landline) or 11 (mobile) digits
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
        return false;
    }
    
    // DDD must be between 11 and 99
    const ddd = parseInt(digitsOnly.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
        return false;
    }
    
    return true;
}

/**
 * Validate email format
 */
function validateEmail(email) {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate field and show/hide error message
 */
function validateField(field) {
    const fieldId = field.id;
    const errorElement = document.getElementById(fieldId + 'Error');
    const value = field.value.trim();
    
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    }
    // Validate specific field types
    else if (fieldId === 'name' && value && value.length < 3) {
        isValid = false;
        errorMessage = 'Nome deve ter pelo menos 3 caracteres';
    }
    else if (fieldId === 'phone' && value) {
        if (!validatePhone(value)) {
            isValid = false;
            errorMessage = 'Telefone inválido. Use o formato: (21) 9XXXX-XXXX';
        }
    }
    else if (fieldId === 'email' && value) {
        if (!validateEmail(value)) {
            isValid = false;
            errorMessage = 'E-mail inválido';
        }
    }
    else if (fieldId === 'neighborhood' && field.value === '') {
        isValid = false;
        errorMessage = 'Selecione seu bairro';
    }
    
    // Update UI based on validation
    if (!isValid) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    } else if (value || field.value) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        if (errorElement) {
            errorElement.textContent = '';
        }
    } else {
        field.classList.remove('is-invalid', 'is-valid');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    return isValid;
}

/**
 * Validate services checkboxes
 */
function validateServices() {
    const checkboxes = document.querySelectorAll('input[name="services"]:checked');
    const errorElement = document.getElementById('servicesError');
    
    if (checkboxes.length === 0) {
        if (errorElement) {
            errorElement.textContent = 'Selecione pelo menos um serviço';
        }
        return false;
    }
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    return true;
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    clearAlert();
    
    // Get form fields
    const nameField = document.getElementById('name');
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const neighborhoodField = document.getElementById('neighborhood');
    const messageField = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    
    // Validate all fields
    let isValid = true;
    
    if (!validateField(nameField)) isValid = false;
    if (!validateField(phoneField)) isValid = false;
    if (!validateField(emailField)) isValid = false;
    if (!validateField(neighborhoodField)) isValid = false;
    if (!validateServices()) isValid = false;
    
    if (!isValid) {
        showAlert('Por favor, corrija os campos destacados em vermelho.', 'error');
        
        // Focus on first invalid field
        const firstInvalid = document.querySelector('.is-invalid');
        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return;
    }
    
    // Get selected services
    const selectedServices = Array.from(document.querySelectorAll('input[name="services"]:checked'))
        .map(cb => cb.value);
    
    // Prepare form data
    const formData = {
        name: nameField.value.trim(),
        phone: phoneField.value.replace(/\D/g, ''), // Send only digits
        email: emailField.value.trim() || undefined,
        neighborhood: neighborhoodField.value,
        city: 'Rio de Janeiro',
        description: messageField.value.trim() 
            ? `Serviços: ${selectedServices.join(', ')}. Mensagem: ${messageField.value.trim()}`
            : `Serviços: ${selectedServices.join(', ')}`,
        screen_height: window.screen.height,
        screen_width: window.screen.width,
        user_agent: navigator.userAgent,
        referrer: document.referrer || '',
        submission_date: new Date().toISOString(),
        device_type: getDeviceType(),
        utm_source: getUrlParam('utm_source') || '',
        utm_medium: getUrlParam('utm_medium') || '',
        utm_campaign: getUrlParam('utm_campaign') || ''
    };
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    btnText.textContent = 'Enviando...';
    
    try {
        // Send to API
        const response = await fetch('https://api.verlyvidracaria.com/verly-service/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        let apiSuccess = false;
        
        if (response.ok) {
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            console.log('Lead saved successfully:', data);
            apiSuccess = true;
        } else {
            console.error('API error:', response.status);
        }
        
        // Prepare WhatsApp message
        const whatsappMessage = `*Solicitação de Orçamento - Verly Vidraçaria*\n\n` +
            `*Nome:* ${formData.name}\n` +
            `*Telefone:* ${phoneField.value}\n` +
            `*Bairro:* ${formData.neighborhood}\n` +
            (formData.email ? `*E-mail:* ${formData.email}\n` : '') +
            `*Serviços de Interesse:* ${selectedServices.join(', ')}\n` +
            (messageField.value.trim() ? `*Mensagem:* ${messageField.value.trim()}\n\n` : '\n') +
            `Enviado através do site verlyvidracaria.com`;
        
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappURL = `https://wa.me/5521987926578?text=${encodedMessage}`;
        
        // Show success message
        if (apiSuccess) {
            showAlert('✅ <strong>Orçamento solicitado com sucesso!</strong><br>Você será redirecionado para o WhatsApp para finalizar o contato. Responderemos em até 2 horas úteis!', 'success');
        } else {
            showAlert('✅ <strong>Dados recebidos!</strong><br>Você será redirecionado para o WhatsApp para finalizar o contato.', 'success');
        }
        
        // Track conversion
        trackEvent('form_submission', {
            event_category: 'lead',
            event_label: 'Contact Form',
            services: selectedServices.join(', '),
            neighborhood: formData.neighborhood
        });
        
        // Track Google Ads conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'send_to': 'AW-17336857529/CONVERSION_ID',
                'value': 1.0,
                'currency': 'BRL'
            });
        }
        
        // Reset form
        document.getElementById('contactForm').reset();
        document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
            el.classList.remove('is-valid', 'is-invalid');
        });
        
        // Redirect to WhatsApp after 2 seconds
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        // Even on error, try to redirect to WhatsApp
        const whatsappMessage = `*Solicitação de Orçamento - Verly Vidraçaria*\n\n` +
            `*Nome:* ${formData.name}\n` +
            `*Telefone:* ${phoneField.value}\n` +
            `*Bairro:* ${formData.neighborhood}\n` +
            `*Serviços:* ${selectedServices.join(', ')}\n\n` +
            `Enviado através do site verlyvidracaria.com`;
        
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappURL = `https://wa.me/5521987926578?text=${encodedMessage}`;
        
        showAlert('⚠️ Houve um problema ao enviar. Você será redirecionado para o WhatsApp para continuar.', 'error');
        
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
        }, 2000);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        btnText.innerHTML = '<i class="fas fa-paper-plane"></i> Solicitar Orçamento Grátis';
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get device type
 */
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
}

/**
 * Get URL parameter
 */
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Smooth scroll to element
 */
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        const offsetTop = element.offsetTop - 80; // Account for fixed header
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// ============================================================================
// MOBILE MENU
// ============================================================================

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            
            // Position menu below header on mobile
            if (window.innerWidth <= 768) {
                navMenu.style.position = 'absolute';
                navMenu.style.top = '100%';
                navMenu.style.left = '0';
                navMenu.style.right = '0';
                navMenu.style.backgroundColor = 'white';
                navMenu.style.flexDirection = 'column';
                navMenu.style.padding = '1rem';
                navMenu.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navMenu.style.display = 'none';
                }
            });
        });
    }
}

// ============================================================================
// SCROLL EFFECTS
// ============================================================================

function initScrollEffects() {
    // Add shadow to header on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }
    });
}

// ============================================================================
// ANALYTICS TRACKING
// ============================================================================

function initAnalyticsTracking() {
    // Track WhatsApp clicks
    document.querySelectorAll('a[href*="wa.me"], .whatsapp-float').forEach(element => {
        element.addEventListener('click', () => {
            trackEvent('whatsapp_click', {
                event_category: 'engagement',
                event_label: 'WhatsApp Contact',
                location: element.classList.contains('whatsapp-float') ? 'floating_button' : 'inline_button'
            });
        });
    });
    
    // Track CTA clicks
    document.querySelectorAll('.btn-primary, .btn-success, .btn-secondary').forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            trackEvent('cta_click', {
                event_category: 'engagement',
                event_label: buttonText
            });
        });
    });
    
    // Track service card clicks
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            const serviceName = card.querySelector('h3').textContent;
            trackEvent('service_view', {
                event_category: 'engagement',
                event_label: serviceName
            });
        });
    });
    
    // Track scroll depth
    let scrollPercentages = [25, 50, 75, 100];
    let scrollTracked = {};
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        scrollPercentages.forEach(percentage => {
            if (scrollPercent >= percentage && !scrollTracked[percentage]) {
                scrollTracked[percentage] = true;
                trackEvent('scroll_depth', {
                    event_category: 'engagement',
                    event_label: percentage + '%',
                    value: percentage
                });
            }
        });
    });
}

// ============================================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignore empty anchors
            if (href === '#' || !href) return;
            
            e.preventDefault();
            smoothScrollTo(href);
        });
    });
}

// ============================================================================
// INITIALIZE APP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Verly Vidraçaria - App initialized');
    
    // Form validation and submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Phone mask
        const phoneField = document.getElementById('phone');
        phoneField.addEventListener('input', (e) => {
            e.target.value = applyPhoneMask(e.target.value);
        });
        
        // Real-time validation on blur
        const fieldsToValidate = ['name', 'phone', 'email', 'neighborhood'];
        fieldsToValidate.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => {
                    validateField(field);
                });
                
                // Also validate on input for better UX
                field.addEventListener('input', () => {
                    if (field.classList.contains('is-invalid')) {
                        validateField(field);
                    }
                });
            }
        });
        
        // Validate services on change
        document.querySelectorAll('input[name="services"]').forEach(checkbox => {
            checkbox.addEventListener('change', validateServices);
        });
        
        // Form submission
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialize other features
    initMobileMenu();
    initScrollEffects();
    initSmoothScroll();
    initAnalyticsTracking();
    
    // Track page view
    trackEvent('page_view', {
        event_category: 'engagement',
        event_label: 'Home Page'
    });
});

// ============================================================================
// EXPORT FOR TESTING (if needed)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validatePhone,
        validateEmail,
        applyPhoneMask,
        validateField
    };
}


