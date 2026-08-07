/**
 * WhatsApp CTA Optimization
 * Baseado em pesquisas de UI/UX para maximizar conversões
 * 
 * Referências:
 * - Botões flutuantes aumentam conversão em 20-30%
 * - Sticky CTAs após scroll aumentam em 15%
 * - Múltiplos pontos de conversão aumentam taxa geral
 * - Mensagens contextualizadas aumentam engajamento em 40%
 */

const WhatsAppCTA = {
    phone: '5521987926578',
    
    /**
     * Detectar informações do dispositivo e navegador
     */
    getDeviceInfo() {
        const ua = navigator.userAgent;
        
        // Detectar tipo de dispositivo
        const isIOS = /iPhone|iPad|iPod/i.test(ua);
        const isAndroid = /Android/i.test(ua);
        const isMobile = isIOS || isAndroid || /Mobile/i.test(ua);
        
        let deviceType = 'Desktop';
        if (isIOS) deviceType = 'iOS';
        else if (isAndroid) deviceType = 'Android';
        else if (isMobile) deviceType = 'Mobile';
        
        // Detectar navegador
        let browser = 'Unknown';
        if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
        
        // Detectar sistema operacional
        let os = 'Unknown';
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (isIOS) os = 'iOS';
        else if (isAndroid) os = 'Android';
        
        return {
            deviceType,
            browser,
            os,
            isMobile,
            isIOS,
            isAndroid,
            userAgent: ua
        };
    },
    
    /**
     * Forçar abertura no WhatsApp Web ou App
     * Desktop: WhatsApp Web
     * Mobile: WhatsApp App (API)
     */
    getWhatsAppWebURL(message = '') {
        const encodedMessage = encodeURIComponent(message);
        const deviceInfo = this.getDeviceInfo();
        
        if (deviceInfo.isMobile) {
            // Mobile: usar API para abrir diretamente no app
            return `https://api.whatsapp.com/send?phone=${this.phone}&text=${encodedMessage}`;
        } else {
            // Desktop: forçar WhatsApp Web
            return `https://web.whatsapp.com/send?phone=${this.phone}&text=${encodedMessage}`;
        }
    },

    /**
     * Mensagens contextualizadas por seção
     */
    messages: {
        hero: '🏠 Olá! Gostaria de solicitar um orçamento para vidraçaria.',
        services: '✨ Olá! Vi os serviços no site e gostaria de saber mais sobre:',
        boxBanheiro: '🚿 Olá! Gostaria de um orçamento para Box de Banheiro.',
        sacada: '🏢 Olá! Gostaria de um orçamento para Sacada Envidraçada.',
        guardaCorpo: '🛡️ Olá! Gostaria de um orçamento para Guarda-corpo.',
        portas: '🚪 Olá! Gostaria de um orçamento para Portas de Vidro.',
        janelas: '🪟 Olá! Gostaria de um orçamento para Janelas de Alumínio.',
        espelhos: '🪞 Olá! Gostaria de um orçamento para Espelhos Sob Medida.',
        divisorias: '🚪 Olá! Gostaria de um orçamento para Divisórias de Ambiente.',
        contact: '📋 Olá! Vim pelo formulário de contato e gostaria de mais informações.',
        floating: '💬 Olá! Gostaria de solicitar um orçamento.',
        urgente: '🚨 Olá! Preciso de um orçamento urgente para vidraçaria!'
    },

    /**
     * Inicializar otimizações de CTA
     */
    init() {
        console.log('🚀 WhatsApp CTA Optimization iniciado');
        
        // 1. Atualizar todos os links existentes para WhatsApp Web
        this.updateExistingLinks();
        
        // 2. Adicionar Sticky CTA após scroll
        this.addStickyCTA();
        
        // 3. Adicionar CTAs inline nas seções de serviços
        this.addServiceCTAs();
        
        // 4. Melhorar botão flutuante
        this.enhanceFloatingButton();
        
        // 5. Track conversions
        this.trackConversions();
        
        console.log('✅ Otimizações aplicadas');
    },

    /**
     * Atualizar links existentes para WhatsApp Web
     */
    updateExistingLinks() {
        // Selecionar TODOS os links de WhatsApp, incluindo os que já têm web.whatsapp.com
        const whatsappLinks = document.querySelectorAll(
            'a[href*="wa.me"], a[href*="whatsapp"], .whatsapp-float'
        );
        
        whatsappLinks.forEach(link => {
            // Extrair mensagem existente se houver
            const currentHref = link.getAttribute('href');
            
            // Se não tiver href, pular
            if (!currentHref) return;
            
            const textMatch = currentHref.match(/text=([^&]*)/);
            const existingMessage = textMatch ? decodeURIComponent(textMatch[1]) : this.messages.floating;
            
            // Atualizar para WhatsApp Web
            const newUrl = this.getWhatsAppWebURL(existingMessage);
            link.setAttribute('href', newUrl);
            
            // Manter target para abrir em nova aba
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            
            // Log específico para botão flutuante
            if (link.classList.contains('whatsapp-float')) {
                console.log('✓ Botão flutuante atualizado:', newUrl);
            }
        });
        
        console.log(`✓ ${whatsappLinks.length} links atualizados para WhatsApp Web`);
    },

    /**
     * Adicionar Sticky CTA após scroll
     * Aparece após usuário rolar 30% da página
     */
    addStickyCTA() {
        // Criar sticky bar
        const stickyBar = document.createElement('div');
        stickyBar.className = 'whatsapp-sticky-cta';
        stickyBar.innerHTML = `
            <div class="sticky-cta-content">
                <div class="sticky-cta-text">
                    <strong>🎉 Orçamento Grátis em 2 Horas!</strong>
                    <span>Fale com nossos especialistas agora</span>
                </div>
                <a href="${this.getWhatsAppWebURL(this.messages.urgente)}" 
                   class="sticky-cta-button"
                   data-context="sticky-cta">
                    <i class="fab fa-whatsapp"></i>
                    <span>Chamar no WhatsApp</span>
                </a>
            </div>
        `;
        
        document.body.appendChild(stickyBar);
        
        // Mostrar/esconder baseado em scroll
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            const currentScroll = window.scrollY;
            
            // Mostrar após 30% de scroll e quando scrollando para baixo
            if (scrollPercent > 30 && currentScroll > lastScroll) {
                stickyBar.classList.add('active');
            } else if (currentScroll < lastScroll && scrollPercent < 20) {
                // Esconder quando volta ao topo
                stickyBar.classList.remove('active');
            }
            
            lastScroll = currentScroll;
        });
        
        console.log('✓ Sticky CTA adicionado');
    },

    /**
     * Adicionar CTAs inline nas seções de serviços
     * Incluindo Espelhos e Divisórias
     */
    addServiceCTAs() {
        const services = [
            { selector: '.service-card:nth-child(1)', message: this.messages.boxBanheiro, name: 'Box Banheiro' },
            { selector: '.service-card:nth-child(2)', message: this.messages.sacada, name: 'Sacada' },
            { selector: '.service-card:nth-child(3)', message: this.messages.guardaCorpo, name: 'Guarda-corpo' },
            { selector: '.service-card:nth-child(4)', message: this.messages.portas, name: 'Portas' },
            { selector: '.service-card:nth-child(5)', message: this.messages.espelhos, name: 'Espelhos' },
            { selector: '.service-card:nth-child(6)', message: this.messages.divisorias, name: 'Divisórias' }
        ];
        
        let addedCount = 0;
        
        services.forEach(service => {
            const card = document.querySelector(service.selector);
            if (card) {
                // Verificar se já não tem botão
                if (card.querySelector('.service-whatsapp-cta')) {
                    return;
                }
                
                // Adicionar botão no card
                const ctaButton = document.createElement('a');
                ctaButton.href = this.getWhatsAppWebURL(service.message);
                ctaButton.className = 'service-whatsapp-cta';
                ctaButton.innerHTML = `
                    <i class="fab fa-whatsapp"></i>
                    <span>Pedir Orçamento</span>
                `;
                ctaButton.dataset.context = `service-${service.name.toLowerCase().replace(/\s+/g, '-')}`;
                ctaButton.setAttribute('target', '_blank');
                ctaButton.setAttribute('rel', 'noopener noreferrer');
                
                card.appendChild(ctaButton);
                addedCount++;
            }
        });
        
        console.log(`✓ ${addedCount} CTAs de serviços adicionados (incluindo Espelhos e Divisórias)`);
    },

    /**
     * Melhorar botão flutuante com animações
     */
    enhanceFloatingButton() {
        const floatingBtn = document.querySelector('.whatsapp-float');
        if (!floatingBtn) return;
        
        // Atualizar URL
        floatingBtn.href = this.getWhatsAppWebURL(this.messages.floating);
        
        // Adicionar tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'whatsapp-float-tooltip';
        tooltip.textContent = 'Fale conosco!';
        floatingBtn.appendChild(tooltip);
        
        // Animar periodicamente para chamar atenção
        setInterval(() => {
            floatingBtn.classList.add('shake');
            setTimeout(() => floatingBtn.classList.remove('shake'), 1000);
        }, 15000); // A cada 15 segundos
        
        // Mostrar tooltip ao passar mouse
        floatingBtn.addEventListener('mouseenter', () => {
            tooltip.classList.add('visible');
        });
        
        floatingBtn.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });
        
        console.log('✓ Botão flutuante melhorado');
    },

    /**
     * Track conversions para analytics com informações de dispositivo
     */
    trackConversions() {
        const deviceInfo = this.getDeviceInfo();
        
        // Enviar informações de dispositivo para GA4 no carregamento da página
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view_with_device', {
                device_type: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                is_mobile: deviceInfo.isMobile,
                page_location: window.location.href
            });
            
            console.log('📊 Device info enviado para GA4:', deviceInfo);
        }
        
        // Rastrear cliques em WhatsApp
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href*="whatsapp"], a[href*="wa.me"]');
            
            if (target) {
                const context = target.dataset.context || 'unknown';
                const buttonText = target.textContent.trim();
                
                // Google Analytics 4
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'whatsapp_click', {
                        context: context,
                        button_text: buttonText,
                        device_type: deviceInfo.deviceType,
                        browser: deviceInfo.browser,
                        os: deviceInfo.os,
                        page_location: window.location.href,
                        timestamp: new Date().toISOString()
                    });
                }
                
                console.log(`📊 WhatsApp click tracked: ${context} (${deviceInfo.deviceType})`);
            }
        });
        
        // Rastrear cliques em links com data-track (telefone, endereço, email)
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-track]');
            
            if (target) {
                const trackEvent = target.dataset.track;
                const linkType = target.getAttribute('href')?.split(':')[0] || 'unknown';
                const linkText = target.textContent.trim();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'contact_link_click', {
                        event_name: trackEvent,
                        link_type: linkType,
                        link_text: linkText,
                        device_type: deviceInfo.deviceType,
                        browser: deviceInfo.browser,
                        os: deviceInfo.os,
                        page_location: window.location.href,
                        timestamp: new Date().toISOString()
                    });
                }
                
                console.log(`📊 Contact link tracked: ${trackEvent} (${linkType}) - ${deviceInfo.deviceType}`);
            }
        });
    }
};

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WhatsAppCTA.init());
} else {
    WhatsAppCTA.init();
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.WhatsAppCTA = WhatsAppCTA;
}

