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
            <button class="toast-close" aria-label="Fechar notificação">
                <i class="fas fa-times"></i>
            </button>
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
     */
    getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
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
        
        // Create icons
        const successIcon = document.createElement('i');
        successIcon.className = 'fas fa-check-circle form-validation-icon success-icon';
        
        const errorIcon = document.createElement('i');
        errorIcon.className = 'fas fa-times-circle form-validation-icon error-icon';
        
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
// SEARCHABLE SELECT (BAIRRO)
// ============================================================================

const SearchableSelect = {
    instances: [],
    
    /**
     * Initialize searchable select for neighborhood field
     */
    init() {
        const neighborhoodSelect = document.getElementById('neighborhood');
        if (neighborhoodSelect) {
            this.create(neighborhoodSelect);
        }
    },
    
    /**
     * Create searchable select from native select
     */
    create(selectElement) {
        // Get options
        const options = Array.from(selectElement.options).filter(opt => opt.value);
        
        // Create container
        const container = document.createElement('div');
        container.className = 'searchable-select';
        
        // Create input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control searchable-select-input';
        input.placeholder = 'Selecione seu bairro';
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-expanded', 'false');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('autocomplete', 'off');
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'searchable-select-dropdown';
        dropdown.setAttribute('role', 'listbox');
        
        // Create search box inside dropdown
        const searchBox = document.createElement('div');
        searchBox.className = 'searchable-select-search';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar bairro...';
        searchInput.setAttribute('aria-label', 'Buscar bairro');
        searchBox.appendChild(searchInput);
        dropdown.appendChild(searchBox);
        
        // Create options list
        const optionsList = document.createElement('ul');
        optionsList.className = 'searchable-select-options';
        
        options.forEach((option, index) => {
            const li = document.createElement('li');
            li.className = 'searchable-select-option';
            li.textContent = option.text;
            li.dataset.value = option.value;
            li.setAttribute('role', 'option');
            li.setAttribute('tabindex', '0');
            
            // Click handler
            li.addEventListener('click', () => {
                this.selectOption(selectElement, input, dropdown, li);
            });
            
            // Keyboard handler
            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectOption(selectElement, input, dropdown, li);
                }
            });
            
            optionsList.appendChild(li);
        });
        
        dropdown.appendChild(optionsList);
        
        // Build structure
        container.appendChild(input);
        container.appendChild(dropdown);
        
        // Replace original select
        selectElement.style.display = 'none';
        selectElement.parentNode.insertBefore(container, selectElement);
        
        // Event handlers
        input.addEventListener('click', () => {
            this.toggleDropdown(dropdown, input);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.toggleDropdown(dropdown, input);
                if (dropdown.classList.contains('active')) {
                    searchInput.focus();
                }
            }
        });
        
        // Search functionality
        searchInput.addEventListener('input', (e) => {
            this.filterOptions(e.target.value, optionsList);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.classList.remove('active');
                input.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Store instance
        this.instances.push({
            select: selectElement,
            input: input,
            dropdown: dropdown
        });
    },
    
    /**
     * Toggle dropdown visibility
     */
    toggleDropdown(dropdown, input) {
        const isActive = dropdown.classList.toggle('active');
        input.setAttribute('aria-expanded', isActive.toString());
    },
    
    /**
     * Select an option
     */
    selectOption(selectElement, input, dropdown, optionElement) {
        // Update native select
        selectElement.value = optionElement.dataset.value;
        
        // Update input
        input.value = optionElement.textContent;
        
        // Update selected state
        dropdown.querySelectorAll('.searchable-select-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        optionElement.classList.add('selected');
        
        // Close dropdown
        dropdown.classList.remove('active');
        input.setAttribute('aria-expanded', 'false');
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
        
        // Validate field if validation exists
        if (typeof validateField === 'function') {
            validateField(selectElement);
        }
    },
    
    /**
     * Filter options based on search
     */
    filterOptions(searchTerm, optionsList) {
        const options = optionsList.querySelectorAll('.searchable-select-option');
        const normalizedSearch = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        let visibleCount = 0;
        
        options.forEach(option => {
            const text = option.textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const matches = text.includes(normalizedSearch);
            
            if (matches) {
                option.classList.remove('hidden');
                visibleCount++;
            } else {
                option.classList.add('hidden');
            }
        });
        
        // Show/hide no results message
        let noResults = optionsList.parentElement.querySelector('.searchable-select-no-results');
        
        if (visibleCount === 0) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'searchable-select-no-results';
                noResults.textContent = 'Nenhum bairro encontrado';
                optionsList.parentElement.appendChild(noResults);
            }
            noResults.style.display = 'block';
        } else if (noResults) {
            noResults.style.display = 'none';
        }
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
        this.enhanceFormLabels();
        this.enhanceCheckboxes();
        this.addKeyboardNavigation();
        this.announceFormErrors();
    },
    
    /**
     * Enhance form labels with proper ARIA
     */
    enhanceFormLabels() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        
        requiredFields.forEach(field => {
            field.setAttribute('aria-required', 'true');
            
            // Add aria-invalid when field has error
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        if (field.classList.contains('is-invalid')) {
                            field.setAttribute('aria-invalid', 'true');
                            
                            // Link to error message
                            const errorId = field.id + 'Error';
                            const errorElement = document.getElementById(errorId);
                            if (errorElement) {
                                field.setAttribute('aria-describedby', errorId);
                            }
                        } else {
                            field.setAttribute('aria-invalid', 'false');
                            field.removeAttribute('aria-describedby');
                        }
                    }
                });
            });
            
            observer.observe(field, { attributes: true });
        });
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
    
    /**
     * Add keyboard navigation enhancements
     */
    addKeyboardNavigation() {
        // Escape key closes dropdowns
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeDropdowns = document.querySelectorAll('.searchable-select-dropdown.active');
                activeDropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const input = dropdown.previousElementSibling;
                    if (input) {
                        input.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });
    },
    
    /**
     * Announce form errors to screen readers
     */
    announceFormErrors() {
        // Create live region for announcements
        if (!document.getElementById('aria-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
    },
    
    /**
     * Announce message to screen readers
     */
    announce(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
};

// ============================================================================
// INITIALIZE ALL IMPROVEMENTS
// ============================================================================

function initUIImprovements() {
    console.log('🎨 Initializing UI/UX improvements...');
    
    // Initialize components
    ToastManager.init();
    ValidationIcons.init();
    Tooltips.init();
    SearchableSelect.init();
    AccessibilityEnhancer.init();
    
    console.log('✅ UI/UX improvements loaded');
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

