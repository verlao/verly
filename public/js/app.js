/**
 * Verly Vidraçaria - Main Application JavaScript
 * Pure Vanilla JS with Complete GA4 Tracking
 * Focus: Form validation, conversion tracking, and user behavior analytics
 */

// ============================================================================
// GOOGLE ADS — CONVERSION LABEL
// ============================================================================
// Preencher com o label da ação de conversão no Google Ads
// (Ferramentas → Conversões → a ação → "Instalar a tag manualmente":
//  send_to: 'AW-17336857529/XXXXXXXXXXXXXXXXX' — copiar só a parte depois da barra).
// Enquanto estiver vazio, NENHUMA conversão é enviada: o valor antigo era o
// literal 'CONVERSION_ID', que o Ads descarta silenciosamente — a campanha ficava
// sem sinal de conversão e ninguém percebia.
const ADS_CONVERSION_ID = 'AW-17336857529';
const ADS_CONVERSION_LABEL = '';

// ============================================================================
// GOOGLE ANALYTICS 4 (GA4) TRACKING UTILITIES
// ============================================================================

/**
 * Track events to Google Analytics 4
 * @param {string} eventName - GA4 event name (use snake_case)
 * @param {object} eventParams - Event parameters
 */
function trackGA4Event(eventName, eventParams = {}) {
    if (typeof gtag !== 'undefined') {
        // Add common parameters to all events
        const enrichedParams = {
            ...eventParams,
            timestamp: new Date().toISOString(),
            page_location: window.location.href,
            page_title: document.title
        };
        
        gtag('event', eventName, enrichedParams);
        console.log('📊 GA4 Event:', eventName, enrichedParams);
    } else {
        console.warn('⚠️ gtag not loaded yet');
    }
}

/**
 * Track page view (custom implementation)
 */
function trackPageView() {
    trackGA4Event('page_view', {
        page_path: window.location.pathname,
        page_referrer: document.referrer || 'direct',
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        device_type: getDeviceType()
    });
}

/**
 * Track CTA button clicks
 */
function trackCTAClick(buttonText, buttonLocation, targetSection = '') {
    trackGA4Event('cta_click', {
        button_text: buttonText,
        button_location: buttonLocation, // 'hero', 'menu', 'floating', 'section'
        target_section: targetSection,
        click_position_y: window.pageYOffset
    });
}

/**
 * Track form interactions
 */
function trackFormInteraction(action, fieldName, value = '', errorMessage = '') {
    const params = {
        form_name: 'contact_form',
        form_action: action, // 'start', 'field_focus', 'field_blur', 'field_complete', 'validation_error', 'submit_attempt', 'submit_success', 'submit_error'
        field_name: fieldName
    };
    
    if (value) params.field_value_length = value.length;
    if (errorMessage) params.error_message = errorMessage;
    
    trackGA4Event('form_interaction', params);
}

/**
 * Track scroll depth
 */
function trackScrollDepth(percentage) {
    trackGA4Event('scroll', {
        percent_scrolled: percentage,
        scroll_depth_threshold: percentage,
        page_height: document.documentElement.scrollHeight,
        viewport_height: window.innerHeight
    });
}

/**
 * Track section view (when section enters viewport)
 */
function trackSectionView(sectionName, sectionId) {
    trackGA4Event('section_view', {
        section_name: sectionName,
        section_id: sectionId,
        scroll_position: window.pageYOffset,
        time_on_page: getTimeOnPage()
    });
}

/**
 * Track service card click
 */
function trackServiceClick(serviceName, servicePosition) {
    trackGA4Event('service_interaction', {
        service_name: serviceName,
        service_position: servicePosition,
        interaction_type: 'click'
    });
}

/**
 * Track WhatsApp interaction
 */
function trackWhatsAppClick(source, message = '') {
    trackGA4Event('whatsapp_click', {
        click_source: source, // 'floating_button', 'hero_cta', 'form_success', 'form_fallback'
        has_pre_filled_message: !!message,
        message_length: message ? message.length : 0
    });
}

/**
 * Track phone click
 */
function trackPhoneClick(phoneNumber, location) {
    trackGA4Event('phone_click', {
        phone_number: phoneNumber,
        click_location: location // 'header', 'contact_section', 'footer'
    });
}

/**
 * Track navigation click
 */
function trackNavigationClick(linkText, linkTarget, navigationType) {
    trackGA4Event('navigation_click', {
        link_text: linkText,
        link_target: linkTarget,
        navigation_type: navigationType // 'menu', 'footer', 'internal_link'
    });
}

/**
 * Track user engagement milestones
 */
function trackEngagementMilestone(milestoneName, milestoneValue) {
    trackGA4Event('engagement_milestone', {
        milestone_name: milestoneName,
        milestone_value: milestoneValue
    });
}

// ============================================================================
// UTILITY FUNCTIONS
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
 * Get time on page in seconds
 */
let pageLoadTime = new Date();
function getTimeOnPage() {
    return Math.floor((new Date() - pageLoadTime) / 1000);
}

/**
 * Show alert message
 */
function showAlert(message, type = 'success') {
    // Use ToastManager if available, fallback to inline alert
    if (typeof ToastManager !== 'undefined') {
        const cleanMessage = message.replace(/<[^>]*>/g, ''); // Remove HTML tags
        
        if (type === 'success') {
            ToastManager.success(cleanMessage);
        } else if (type === 'error') {
            ToastManager.error(cleanMessage);
        } else {
            ToastManager.info(cleanMessage);
        }
    } else {
        // Fallback to original behavior
        const alertDiv = document.getElementById('formAlert');
        // Caractere no lugar do `<i class="fas fa-…">` que não desenha mais nada sem o
        // Font Awesome. A cor de .form-alert.success/.error já diz o estado.
        const icon = type === 'success' ? '✓' : '!';

        alertDiv.innerHTML = `
            <div class="form-alert ${type}">
                <span aria-hidden="true">${icon}</span>
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
}

/**
 * Clear alert message
 */
function clearAlert() {
    const alertDiv = document.getElementById('formAlert');
    alertDiv.style.display = 'none';
    alertDiv.innerHTML = '';
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
// FORM VALIDATION
// ============================================================================

/**
 * Phone number mask (Brazilian format)
 */
function applyPhoneMask(value) {
    value = value.replace(/\D/g, '');
    
    if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    }
    
    return value;
}

/**
 * Validate phone number (Brazilian format)
 */
function validatePhone(phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
        return false;
    }
    
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
    if (!email) return true;
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
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    }
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
        
        // Track validation error
        trackFormInteraction('validation_error', fieldId, value, errorMessage);
    } else if (value || field.value) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        // Track field complete
        if (value) {
            trackFormInteraction('field_complete', fieldId, value);
        }
        
        // Announce to screen readers
        if (typeof AccessibilityEnhancer !== 'undefined' && !isValid) {
            AccessibilityEnhancer.announce(`Erro no campo ${fieldId}: ${errorMessage}`);
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
        trackFormInteraction('validation_error', 'services', '', 'Nenhum serviço selecionado');
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
    
    // Track submit attempt
    trackFormInteraction('submit_attempt', 'all_fields');
    
    // Get form fields
    const nameField = document.getElementById('name');
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const neighborhoodField = document.getElementById('neighborhood');
    const messageField = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    // Guardar o rótulo que o servidor renderizou (com o SVG do ícone) em vez de
    // reescrevê-lo à mão depois do envio: a versão escrita à mão trazia um
    // `<i class="fas fa-paper-plane">`, que desde a saída do Font Awesome não desenha
    // nada — o botão voltava do "Enviando..." sem ícone.
    const btnTextInitialHTML = btnText.innerHTML;

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
        
        trackFormInteraction('validation_failed', 'all_fields');
        return;
    }
    
    // Get selected services
    const selectedServices = Array.from(document.querySelectorAll('input[name="services"]:checked'))
        .map(cb => cb.value);
    
    // Prepare form data
    const formData = {
        name: nameField.value.trim(),
        phone: phoneField.value.replace(/\D/g, ''),
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
    
    // Show loading state (use ButtonLoader if available)
    if (typeof ButtonLoader !== 'undefined') {
        ButtonLoader.start(submitBtn);
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        btnText.textContent = 'Enviando...';
    }
    
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
        
        // Track form submission with detailed data
        trackFormInteraction('submit_success', 'all_fields', '', apiSuccess ? 'API success' : 'API failed');
        
        // Track as conversion with services and neighborhood
        trackGA4Event('generate_lead', {
            lead_source: 'contact_form',
            services: selectedServices.join(', '),
            neighborhood: formData.neighborhood,
            api_status: apiSuccess ? 'success' : 'error',
            has_email: !!formData.email,
            has_message: !!messageField.value.trim()
        });
        
        // Track Google Ads conversion
        if (typeof gtag !== 'undefined' && apiSuccess) {
            if (ADS_CONVERSION_LABEL) {
                gtag('event', 'conversion', {
                    'send_to': `${ADS_CONVERSION_ID}/${ADS_CONVERSION_LABEL}`,
                    'value': 1.0,
                    'currency': 'BRL'
                });
            } else {
                console.warn('⚠️ ADS_CONVERSION_LABEL vazio — conversão do Google Ads NÃO enviada (o lead foi registrado normalmente).');
            }
        }
        
        // Reset form
        document.getElementById('contactForm').reset();
        document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
            el.classList.remove('is-valid', 'is-invalid');
        });
        
        if (apiSuccess) {
            // API Success: confirma e manda para /obrigado.html.
            // A página de agradecimento é o destino de conversão — sem uma URL própria
            // não existe onde o Google Ads/GA4 marcarem "lead concluído", que era o
            // caso antes: o alerta inline deixava o visitante na mesma URL.
            showAlert('✅ <strong>Orçamento solicitado com sucesso!</strong><br>Entraremos em contato em até 2 horas úteis. Obrigado!', 'success');

            // Pequena espera antes de navegar: dá tempo de a pessoa ler a confirmação
            // e de os beacons de analytics saírem antes da troca de página.
            setTimeout(() => {
                window.location.href = '/obrigado.html';
            }, 1200);

        } else {
            // API Failed: Fallback to WhatsApp
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
            
            showAlert('⚠️ <strong>Problema no envio automático.</strong><br>Você será redirecionado para o WhatsApp para finalizar o contato.', 'error');
            
            // Track WhatsApp fallback
            trackWhatsAppClick('form_fallback', whatsappMessage);
            
            // Redirect to WhatsApp after 2 seconds
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        trackFormInteraction('submit_error', 'all_fields', '', error.message);
        
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
        
        trackWhatsAppClick('form_error', whatsappMessage);
        
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
        }, 2000);
    } finally {
        // Reset button state (use ButtonLoader if available)
        if (typeof ButtonLoader !== 'undefined') {
            // stop() já devolve o innerHTML inteiro do botão que start() guardou.
            ButtonLoader.stop(submitBtn);
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
            btnText.innerHTML = btnTextInitialHTML;
        }
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
            
            // Track menu open
            trackNavigationClick('mobile_menu', '#menu', 'mobile_menu_toggle');
            
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
// SCROLL EFFECTS & SECTION TRACKING
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
// INTERSECTION OBSERVER FOR SECTION VIEWS
// ============================================================================

function initSectionTracking() {
    const sections = document.querySelectorAll('section[id]');
    const sectionViewTracked = {};
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !sectionViewTracked[entry.target.id]) {
                const sectionName = entry.target.querySelector('h2')?.textContent || entry.target.id;
                trackSectionView(sectionName, entry.target.id);
                sectionViewTracked[entry.target.id] = true;
            }
        });
    }, {
        threshold: 0.5 // Track when 50% of section is visible
    });
    
    sections.forEach(section => sectionObserver.observe(section));
}

// ============================================================================
// COMPLETE ANALYTICS TRACKING
// ============================================================================

function initCompleteAnalytics() {
    // Track page load
    trackPageView();
    
    // Track time on page milestones
    setTimeout(() => trackEngagementMilestone('time_30s', 30), 30000);
    setTimeout(() => trackEngagementMilestone('time_60s', 60), 60000);
    setTimeout(() => trackEngagementMilestone('time_120s', 120), 120000);
    
    // Track WhatsApp clicks
    document.querySelectorAll('a[href*="wa.me"], .whatsapp-float').forEach(element => {
        element.addEventListener('click', () => {
            const source = element.classList.contains('whatsapp-float') ? 'floating_button' : 
                          element.closest('.hero') ? 'hero_cta' : 'inline_button';
            trackWhatsAppClick(source);
        });
    });
    
    // Track ALL CTA clicks with detailed info
    document.querySelectorAll('.btn-primary, .btn-success, .btn-secondary').forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = button.textContent.trim();
            const location = button.closest('.hero') ? 'hero' :
                           button.closest('.navbar') ? 'menu' :
                           button.closest('.contact-section') ? 'contact_form' :
                           'other';
            const targetHref = button.getAttribute('href');
            
            trackCTAClick(buttonText, location, targetHref);
        });
    });
    
    // Track service card clicks
    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            const serviceName = card.querySelector('h3')?.textContent || `Service ${index + 1}`;
            trackServiceClick(serviceName, index + 1);
        });
    });
    
    // Track navigation clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const linkText = link.textContent.trim();
            const linkTarget = link.getAttribute('href');
            trackNavigationClick(linkText, linkTarget, 'menu');
        });
    });
    
    // Track footer links
    document.querySelectorAll('.footer a').forEach(link => {
        link.addEventListener('click', () => {
            const linkText = link.textContent.trim();
            const linkTarget = link.getAttribute('href');
            trackNavigationClick(linkText, linkTarget, 'footer');
        });
    });
    
    // Track phone clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            const phoneNumber = link.getAttribute('href').replace('tel:', '');
            const location = link.closest('.header') ? 'header' :
                           link.closest('.contact-section') ? 'contact_section' :
                           link.closest('.footer') ? 'footer' : 'other';
            trackPhoneClick(phoneNumber, location);
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
                trackScrollDepth(percentage);
            }
        });
    });
    
    // Track form field interactions
    const formFields = ['name', 'phone', 'email', 'neighborhood', 'message'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Track first focus (form start)
            let firstFocus = true;
            field.addEventListener('focus', () => {
                if (firstFocus) {
                    trackFormInteraction('start', fieldId);
                    firstFocus = false;
                }
                trackFormInteraction('field_focus', fieldId);
            });
            
            // Track field blur
            field.addEventListener('blur', () => {
                trackFormInteraction('field_blur', fieldId, field.value);
            });
        }
    });
    
    // Track service checkboxes
    document.querySelectorAll('input[name="services"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const checkedServices = Array.from(document.querySelectorAll('input[name="services"]:checked'))
                .map(cb => cb.value);
            trackFormInteraction('service_selected', 'services', checkedServices.join(', '));
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
            
            if (href === '#' || !href) return;
            
            e.preventDefault();
            smoothScrollTo(href);
            
            // Track internal navigation
            const linkText = this.textContent.trim();
            trackNavigationClick(linkText, href, 'internal_link');
        });
    });
}

// ============================================================================
// INITIALIZE APP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Verly Vidraçaria - App initialized with complete GA4 tracking');
    
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
    
    // Initialize all features
    initMobileMenu();
    initScrollEffects();
    initSmoothScroll();
    initSectionTracking();
    initCompleteAnalytics();
    
    console.log('✅ GA4 tracking initialized with 15+ event types');
});

// ============================================================================
// EXPORT FOR TESTING (if needed)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validatePhone,
        validateEmail,
        applyPhoneMask,
        validateField,
        trackGA4Event
    };
}
