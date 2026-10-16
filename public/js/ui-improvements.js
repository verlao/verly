/**
 * UI/UX Improvements - Verly Vidraçaria
 * Componentes e utilidades para melhor experiência do usuário
 */

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

const ToastManager = {
    container: null,
    
    /**
     * Initialize toast container
     */
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - success|error|warning|info
     * @param {number} duration - Duration in ms (0 = no auto-hide)
     */
    show(message, type = 'info', duration = 5000) {
        this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${this.getTitle(type)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Fechar notificação">&times;</button>
        `;
        
        // Add close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hide(toast));
        
        // Add to container
        this.container.appendChild(toast);
        
        // Auto hide
        if (duration > 0) {
            setTimeout(() => this.hide(toast), duration);
        }
        
        return toast;
    },
    
    /**
     * Hide toast
     */
    hide(toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },
    
    /**
     * Get icon for toast type
     *
     * Caractere, não ícone: aqui havia `<i class="fas fa-…">`, que virou retângulo
     * vazio quando o Font Awesome saiu do site. O estado do toast já é dito três
     * vezes — cor da borda, título ("Erro", "Atenção") e a própria mensagem —, então
     * o desenho é redundância decorativa e não vale um path novo em icons.json. O
     * glifo herda a cor de .toast.<tipo> .toast-icon como o <i> herdava.
     */
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '!',
            info: 'i'
        };
        return icons[type] || icons.info;
    },
    
    /**
     * Get title for toast type
     */
    getTitle(type) {
        const titles = {
            success: 'Sucesso!',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação'
        };
        return titles[type] || titles.info;
    },
    
    /**
     * Shorthand methods
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    },
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// ============================================================================
// VALIDATION ICONS
// ============================================================================

const ValidationIcons = {
    /**
     * Add validation icons to form fields
     */
    init() {
        const fields = document.querySelectorAll('#contactForm input:not([type="checkbox"]), #contactForm select');
        
        fields.forEach(field => {
            if (!field.classList.contains('has-icon')) {
                this.addIconsToField(field);
            }
        });
    },
    
    /**
     * Add success/error icons to a field
     */
    addIconsToField(field) {
        // Skip if already has icons
        if (field.parentElement.querySelector('.form-validation-icon')) {
            return;
        }
        
        // Wrap field if not already wrapped
        if (!field.parentElement.classList.contains('form-control-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-control-wrapper';
            field.parentNode.insertBefore(wrapper, field);
            wrapper.appendChild(field);
        }
        
        field.classList.add('has-icon');
        
        // Marca de validação em caractere. Eram dois <i class="fas fa-…"> por campo —
        // 8 numa página com o formulário — e nenhum desenhava nada sem o Font Awesome:
        // o campo ficava verde/vermelho e o selo ao lado, vazio. A cor continua vindo
        // de .is-valid/.is-invalid, então o significado não depende do glifo.
        const successIcon = document.createElement('span');
        successIcon.className = 'form-validation-icon success-icon';
        successIcon.setAttribute('aria-hidden', 'true');
        successIcon.textContent = '✓';

        const errorIcon = document.createElement('span');
        errorIcon.className = 'form-validation-icon error-icon';
        errorIcon.setAttribute('aria-hidden', 'true');
        errorIcon.textContent = '✕';

        // Add after field
        field.parentElement.appendChild(successIcon);
        field.parentElement.appendChild(errorIcon);
    }
};

// ============================================================================
// TOOLTIPS
// ============================================================================

const Tooltips = {
    /**
     * Add tooltips to form labels
     */
    init() {
        const tooltipData = {
            'email': {
                text: '📧 Enviaremos o orçamento detalhado por email. Recomendamos preencher para melhor acompanhamento.',
                position: 'top'
            },
            'neighborhood': {
                text: '📍 Selecionamos seu bairro para calcular o prazo e custo de deslocamento da equipe.',
                position: 'top'
            },
            'message': {
                text: '💬 Quanto mais detalhes você fornecer (medidas, tipo de vidro, cor, etc.), mais preciso será o orçamento.',
                position: 'top'
            }
        };
        
        Object.keys(tooltipData).forEach(fieldId => {
            const label = document.querySelector(`label[for="${fieldId}"]`);
            if (label && !label.querySelector('.tooltip-trigger')) {
                this.addTooltip(label, tooltipData[fieldId].text);
            }
        });
    },
    
    /**
     * Add tooltip to element
     */
    addTooltip(element, text) {
        const trigger = document.createElement('span');
        trigger.className = 'tooltip-trigger';
        trigger.innerHTML = 'i';
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('role', 'tooltip');
        trigger.setAttribute('aria-label', text);
        
        const content = document.createElement('div');
        content.className = 'tooltip-content';
        content.textContent = text;
        
        trigger.appendChild(content);
        element.appendChild(trigger);
    }
};

// ============================================================================
// ENHANCED BUTTON LOADING STATE
// ============================================================================

const ButtonLoader = {
    /**
     * Show loading state on button
     */
    start(button) {
        button.disabled = true;
        button.classList.add('btn-loading');
        button.dataset.originalText = button.innerHTML;
    },
    
    /**
     * Hide loading state
     */
    stop(button) {
        button.disabled = false;
        button.classList.remove('btn-loading');
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }
};

// ============================================================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================================================

const AccessibilityEnhancer = {
    /**
     * Initialize accessibility improvements
     */
    init() {
        this.enhanceCheckboxes();
    },
    
    /**
     * Enhance checkboxes with better accessibility
     */
    enhanceCheckboxes() {
        const checkboxGroup = document.querySelector('.checkbox-group');
        if (checkboxGroup) {
            checkboxGroup.setAttribute('role', 'group');
            checkboxGroup.setAttribute('aria-labelledby', 'services-label');
            
            // Add ID to services label
            const servicesLabel = checkboxGroup.parentElement.querySelector('.form-label');
            if (servicesLabel && !servicesLabel.id) {
                servicesLabel.id = 'services-label';
            }
        }
    },
    
    /** Atualiza a região estável; cada validação anuncia uma única mensagem. */
    announce(message) {
        const liveRegion = document.getElementById('form-status');
        if (!liveRegion) return;
        clearTimeout(this.announcementTimer);
        liveRegion.textContent = '';
        this.announcementTimer = setTimeout(() => {
            liveRegion.textContent = message;
        }, 100);
    }
};

// ============================================================================
// INITIALIZE ALL IMPROVEMENTS
// ============================================================================

/**
 * Log de passo do carregamento fica atrás do mesmo interruptor dos eventos
 * (app.js: `?analytics_debug=1` ou localStorage `verly_debug`), em vez de aparecer no
 * console de todo visitante.
 */
function uiDebugLog(...args) {
    if (window.VerlyAnalytics) window.VerlyAnalytics.log(...args);
}

function initUIImprovements() {
    uiDebugLog('🎨 Initializing UI/UX improvements...');
    
    // Initialize components
    ToastManager.init();
    ValidationIcons.init();
    Tooltips.init();
    AccessibilityEnhancer.init();
    
    uiDebugLog('✅ UI/UX improvements loaded');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUIImprovements);
} else {
    initUIImprovements();
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.ToastManager = ToastManager;
    window.ButtonLoader = ButtonLoader;
    window.AccessibilityEnhancer = AccessibilityEnhancer;
}

