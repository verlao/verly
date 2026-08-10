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
     * Link do WhatsApp com a mensagem já preenchida.
     *
     * Sempre wa.me: é ele que decide entre app instalado, WhatsApp Web e loja de
     * aplicativos, e acerta em casos que sniffing de user agent não cobre (WhatsApp
     * Desktop, tablet, navegador em modo desktop no celular). A versão anterior
     * mandava todo desktop para web.whatsapp.com/send, o que joga quem não tem sessão
     * ativa no navegador numa tela de QR code — no meio do clique de conversão.
     */
    waLink(message = '') {
        return `https://wa.me/${this.phone}?text=${encodeURIComponent(message)}`;
    },

    /**
     * Markup do ícone do WhatsApp, clonado do que a página já renderizou.
     *
     * O Font Awesome saiu na migração de assets, então `<i class="fab fa-whatsapp">`
     * não desenha mais nada — era um botão de WhatsApp sem WhatsApp. O SVG do botão
     * flutuante vem de src/data/icons.json via Icon.astro; clonar de lá mantém uma
     * fonte de verdade só para o desenho e não repete o path dentro de /public.
     */
    iconHTML() {
        const rendered = document.querySelector('.whatsapp-float svg.icon');
        return rendered ? rendered.outerHTML : '';
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
     * Estado de visibilidade do flutuante. Ele desaparece em duas situações, e as
     * duas podem valer ao mesmo tempo — daí flags separadas em vez de um booleano:
     * a sticky oferece exatamente a mesma ação (redundante), e o formulário na tela
     * significa que o botão está por cima dos checkboxes (estorvo).
     */
    floatState: { stickyVisible: false, formVisible: false, contentUnder: false },

    /**
     * Aplica o estado ao botão. Chamado pelos dois observadores.
     */
    syncFloat() {
        const btn = document.querySelector('.whatsapp-float');
        if (!btn) return;
        const hide = this.floatState.stickyVisible || this.floatState.formVisible || this.floatState.contentUnder;
        btn.classList.toggle('is-hidden', hide);
        // Fora da ordem de tabulação enquanto invisível: pointer-events resolve o
        // mouse, não o teclado.
        btn.setAttribute('aria-hidden', String(hide));
        if (hide) btn.setAttribute('tabindex', '-1');
        else btn.removeAttribute('tabindex');
    },

    /**
     * Esconde o flutuante enquanto a seção do formulário estiver na tela: ali ele fica
     * sobre os checkboxes e é redundante com o próprio formulário.
     */
    watchFormVisibility() {
        const form = document.querySelector('#contato');
        if (!form || !('IntersectionObserver' in window)) return;
        new IntersectionObserver((entries) => {
            this.floatState.formVisible = entries[0].isIntersecting;
            this.syncFloat();
        }, { threshold: 0 }).observe(form);
    },

    /**
     * Rede de segurança geométrica: esconde o flutuante quando existe DE FATO texto
     * ou alvo de toque embaixo dele.
     *
     * Tentei antes por lista de seletor (.section-subtitle e afins) e passou do ponto:
     * como esses blocos começam logo abaixo do hero, o botão ficava visível em 7% da
     * rolagem na home e em NENHUMA parte das páginas de bairro. Aqui o critério é o
     * pixel, não a estrutura, então não há caso especial por página nem excesso.
     *
     * Custo controlado: 5 pontos de amostragem, e a medida do texto usa Range em vez
     * da caixa do elemento — a caixa de um parágrafo centralizado ocupa a largura
     * inteira mesmo onde não há glifo nenhum, e era isso que dava falso positivo.
     */
    watchContentUnderFloat() {
        const btn = document.querySelector('.whatsapp-float');
        if (!btn) return;

        const overlaps = (r, f) =>
            Math.max(0, Math.min(r.right, f.right) - Math.max(r.left, f.left)) *
            Math.max(0, Math.min(r.bottom, f.bottom) - Math.max(r.top, f.top)) > 4;

        const test = () => {
            const f = btn.getBoundingClientRect();

            // Sem isso o próprio botão é o resultado de todo elementsFromPoint.
            const prev = btn.style.pointerEvents;
            btn.style.pointerEvents = 'none';
            const candidates = new Set();
            const pts = [
                [f.left + 4, f.top + 4], [f.right - 4, f.top + 4],
                [f.left + 4, f.bottom - 4], [f.right - 4, f.bottom - 4],
                [(f.left + f.right) / 2, (f.top + f.bottom) / 2],
            ];
            for (const [x, y] of pts) {
                for (const el of document.elementsFromPoint(x, y)) candidates.add(el);
            }
            btn.style.pointerEvents = prev;

            let collides = false;
            for (const el of candidates) {
                if (el === btn || btn.contains(el) || el === document.body || el === document.documentElement) continue;
                if (el.matches('input, select, textarea, button, a')) { collides = true; break; }
                for (const n of el.childNodes) {
                    if (n.nodeType !== Node.TEXT_NODE || !n.nodeValue.trim()) continue;
                    const range = document.createRange();
                    range.selectNodeContents(n);
                    for (const r of range.getClientRects()) {
                        if (overlaps(r, f)) { collides = true; break; }
                    }
                    if (collides) break;
                }
                if (collides) break;
            }

            this.floatState.contentUnder = collides;
            this.syncFloat();
        };

        let scheduled = false;
        const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(() => { scheduled = false; test(); });
        };
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        test();
        console.log('✓ Flutuante recua quando há conteúdo embaixo dele');
    },

    /**
     * Inicializar otimizações de CTA
     */
    init() {
        console.log('🚀 WhatsApp CTA Optimization iniciado');

        // Os links que o Astro renderiza já saem prontos (src/data/site.ts). O que
        // existia aqui era um passe reescrevendo TODOS eles para web.whatsapp.com;
        // agora só os CTAs criados em runtime precisam de href.

        // 1. Adicionar Sticky CTA após scroll
        this.addStickyCTA();

        // 2. Adicionar CTAs inline nas seções de serviços
        this.addServiceCTAs();

        // 3. Melhorar botão flutuante
        this.enhanceFloatingButton();
        this.watchFormVisibility();
        this.watchContentUnderFloat();

        // 4. Track conversions
        this.trackConversions();

        console.log('✅ Otimizações aplicadas');
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
                <a href="${this.waLink(this.messages.urgente)}"
                   class="sticky-cta-button"
                   target="_blank"
                   rel="noopener noreferrer"
                   data-context="sticky-cta">
                    ${this.iconHTML()}
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

            // A sticky e o flutuante são o mesmo CTA: quando ela aparece, ele sai.
            this.floatState.stickyVisible = stickyBar.classList.contains('active');
            this.syncFloat();

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
                ctaButton.href = this.waLink(service.message);
                ctaButton.className = 'service-whatsapp-cta';
                ctaButton.innerHTML = `
                    ${this.iconHTML()}
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

        // O href vem do servidor (CONTACT.whatsappFloat) e já é um wa.me com a
        // mensagem certa — não há o que reescrever aqui.

        // Adicionar tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'whatsapp-float-tooltip';
        tooltip.textContent = 'Fale conosco!';
        floatingBtn.appendChild(tooltip);
        
        // Animar periodicamente para chamar atenção — mas não enquanto ele está
        // escondido: sacudir um elemento invisível só gasta frame.
        setInterval(() => {
            if (floatingBtn.classList.contains('is-hidden')) return;
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

