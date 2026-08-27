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

/**
 * Todo evento daqui passa pelo trackGA4Event do app.js: é ele que carimba
 * page_type/neighborhood_page e decide se o log sai. Um lugar só enriquece, então
 * nenhum evento escapa sem o contexto da página.
 *
 * app.js carrega DEPOIS deste arquivo (ver a ordem em Base.astro), mas tudo aqui só
 * dispara a partir do DOMContentLoaded, quando window.VerlyAnalytics já existe.
 *
 * Prefixo `cta` porque os três scripts de /public são clássicos e dividem o MESMO
 * escopo global — um `track`/`log` solto aqui esbarraria no vizinho sem avisar.
 */
function ctaTrack(eventName, eventParams) {
    if (window.VerlyAnalytics) {
        window.VerlyAnalytics.track(eventName, eventParams);
    } else {
        console.warn('⚠️ VerlyAnalytics indisponível — evento não enviado:', eventName);
    }
}

function ctaLog(...args) {
    if (window.VerlyAnalytics) window.VerlyAnalytics.log(...args);
}

const WhatsAppCTA = {
    phone: '5521987926578',

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
        boxBanheiro: '🚿 Olá! Gostaria de um orçamento para Box para Banheiro.',
        sacada: '🏢 Olá! Gostaria de um orçamento para Sacadas Envidraçadas.',
        guardaCorpo: '🛡️ Olá! Gostaria de um orçamento para Guarda-corpos de Vidro.',
        portas: '🚪 Olá! Gostaria de um orçamento para Portas e Janelas.',
        janelas: '🪟 Olá! Gostaria de um orçamento para Janelas de Alumínio.',
        espelhos: '🪞 Olá! Gostaria de um orçamento para Espelhos Sob Medida.',
        divisorias: '🚪 Olá! Gostaria de um orçamento para Divisórias de Ambiente.',
        cortinasVidro: '🏢 Olá! Gostaria de um orçamento para Instalação de cortinas de vidro.',
        boxBlindex: '🚿 Olá! Gostaria de um orçamento para Box blindex para banheiro.',
        portasVidroTemperado: '🚪 Olá! Gostaria de um orçamento para Portas de vidro temperado.',
        guardaCorpoVidro: '🛡️ Olá! Gostaria de um orçamento para Guarda corpo em vidro.',
        portoesAluminio: '🚪 Olá! Gostaria de um orçamento para Portões em alumínio.',
        vidrosTemperados: '✨ Olá! Gostaria de um orçamento para Vidros temperados sob medida.',
        contact: '📋 Olá! Vim pelo formulário de contato e gostaria de mais informações.',
        floating: '💬 Olá! Gostaria de solicitar um orçamento.',
        sticky: '💬 Olá! Fiquei com uma dúvida e gostaria de conversar.',
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
        ctaLog('✓ Flutuante recua quando há conteúdo embaixo dele');
    },

    /**
     * Inicializar otimizações de CTA
     */
    init() {
        ctaLog('🚀 WhatsApp CTA Optimization iniciado');

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

        ctaLog('✅ Otimizações aplicadas');
    },

    /**
     * Adicionar Sticky CTA após scroll
     * Aparece após usuário rolar 30% da página
     */
    addStickyCTA() {
        // Na página de avaliação, não. O cliente já é cliente e a única coisa que se
        // quer dele ali é terminar a avaliação; uma barra oferecendo orçamento no meio
        // do formulário compete com o próprio envio e custa a avaliação.
        if (document.body.dataset.pageType === 'avaliar') {
            ctaLog('↷ Sticky CTA fora da página de avaliação');
            return;
        }

        // Criar sticky bar
        const stickyBar = document.createElement('div');
        stickyBar.className = 'whatsapp-sticky-cta';
        stickyBar.innerHTML = `
            <div class="sticky-cta-content">
                <div class="sticky-cta-text">
                    <strong>Ficou com dúvida?</strong>
                    <span>Chame no WhatsApp e a gente responde</span>
                </div>
                <a href="${this.waLink(this.messages.sticky)}"
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
        
        ctaLog('✓ Sticky CTA adicionado');
    },

    /**
     * Adicionar CTAs inline nas seções de serviços
     * Incluindo Espelhos e Divisórias
     */
    addServiceCTAs() {
        const services = {
            'box-banheiro': { message: this.messages.boxBanheiro, context: 'service-box-banheiro' },
            'sacada-envidracada': { message: this.messages.sacada, context: 'service-sacada' },
            'guarda-corpos-vidro': { message: this.messages.guardaCorpo, context: 'service-guarda-corpo' },
            'portas-janelas': { message: this.messages.portas, context: 'service-portas' },
            'espelhos-sob-medida': { message: this.messages.espelhos, context: 'service-espelhos' },
            'divisorias-ambiente': { message: this.messages.divisorias, context: 'service-divisórias' },
            'cortinas-vidro': { message: this.messages.cortinasVidro, context: 'service-cortinas-vidro' },
            'box-blindex-banheiro': { message: this.messages.boxBlindex, context: 'service-box-blindex-banheiro' },
            'portas-vidro-temperado': { message: this.messages.portasVidroTemperado, context: 'service-portas-vidro-temperado' },
            'guarda-corpo-vidro': { message: this.messages.guardaCorpoVidro, context: 'service-guarda-corpo-vidro' },
            'portoes-aluminio': { message: this.messages.portoesAluminio, context: 'service-portoes-aluminio' },
            'vidros-temperados-sob-medida': { message: this.messages.vidrosTemperados, context: 'service-vidros-temperados-sob-medida' }
        };

        let addedCount = 0;

        document.querySelectorAll('#servicos .service-card').forEach(card => {
            // Verificar se já não tem botão
            if (card.querySelector('.service-whatsapp-cta')) {
                return;
            }

            const heading = card.querySelector('h3')?.textContent.trim() || '';
            const serviceKey = card.dataset.service || '';
            const service = services[serviceKey];
            // Um serviço novo nunca deve herdar a mensagem de outro: o título visível
            // é a fonte mais segura, e a mensagem genérica fica só para card sem título.
            const message = service?.message || (heading
                ? `✨ Olá! Gostaria de um orçamento para ${heading}.`
                : this.messages.services);

            // Adicionar botão no card
            const ctaButton = document.createElement('a');
            ctaButton.href = this.waLink(message);
            ctaButton.className = 'service-whatsapp-cta';
            ctaButton.innerHTML = `
                ${this.iconHTML()}
                <span>Pedir Orçamento</span>
            `;
            ctaButton.dataset.context = service?.context || `service-${serviceKey || 'unknown'}`;
            ctaButton.setAttribute('target', '_blank');
            ctaButton.setAttribute('rel', 'noopener noreferrer');

            card.appendChild(ctaButton);
            addedCount++;
        });

        ctaLog(`✓ ${addedCount} CTAs de serviços adicionados (incluindo Espelhos e Divisórias)`);
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
        
        ctaLog('✓ Botão flutuante melhorado');
    },

    /**
     * Track conversions para analytics
     *
     * O evento `page_view_with_device` que saía daqui no carregamento foi removido:
     * ele existia só para carregar device_type/browser/os, que são atributo do acesso
     * e não evento próprio — e o GA4 já publica os três como dimensões nativas
     * (Categoria do dispositivo, Navegador, Sistema operacional) em TODO hit. Como
     * evento separado ele só inflava a contagem e não cruzava com nada. Por isso os
     * três também saíram dos eventos abaixo: eram cópia do que o GA4 mede sozinho.
     */
    trackConversions() {
        /**
         * ÚNICO emissor de whatsapp_click do site. O app.js também ligava um ouvinte em
         * cada `a[href*="wa.me"]`, então um clique saía como DOIS whatsapp_click com
         * parâmetros disjuntos — um só com `click_source`, outro só com `context` — o que
         * dobra o volume e joga metade de qualquer tabela por origem em "(não definido)".
         *
         * Ficou o delegado, e não o por elemento, porque ele alcança os CTAs criados em
         * runtime (a sticky e os 6 dos cards de serviço) e lê o `data-context` que o
         * markup já traz. Os DOIS parâmetros continuam saindo: `context` é a origem
         * nomeada na página, `click_source` é a categoria que o ouvinte do app.js
         * calculava — nada se perde na consolidação.
         */
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href*="whatsapp"], a[href*="wa.me"]');

            if (target) {
                const context = target.dataset.context || 'unknown';
                const clickSource = target.classList.contains('whatsapp-float')
                    ? 'floating_button'
                    : target.closest('.hero')
                        ? 'hero_cta'
                        : 'inline_button';

                ctaTrack('whatsapp_click', {
                    context: context,
                    click_source: clickSource,
                    button_text: target.textContent.trim()
                });

                ctaLog(`📊 WhatsApp click tracked: ${context} (${clickSource})`);
            }
        });

        // Rastrear cliques em links com data-track (endereço, email)
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-track]');

            if (target) {
                const href = target.getAttribute('href') || '';
                // Um clique = um evento. WhatsApp já sai como whatsapp_click e telefone
                // como phone_click (app.js); sem este corte, um data-track nesses links
                // faz o mesmo clique contar duas vezes — era o caso do WhatsApp e do
                // telefone do rodapé.
                if (/wa\.me|whatsapp/.test(href) || href.startsWith('tel:')) return;

                const trackEvent = target.dataset.track;
                const linkType = href.split(':')[0] || 'unknown';
                const linkText = target.textContent.trim();

                // `link_id`, e não `event_name`: no painel do GA4 existe uma dimensão
                // nativa chamada "Nome do evento", e um parâmetro com esse nome fica
                // indistinguível dela na hora de escolher a dimensão do relatório.
                ctaTrack('contact_link_click', {
                    link_id: trackEvent,
                    link_type: linkType,
                    link_text: linkText
                });

                ctaLog(`📊 Contact link tracked: ${trackEvent} (${linkType})`);
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

