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
 * Contexto da página, lido UMA vez do <body data-page-type> que o Base.astro escreve
 * em tempo de build. Vai em todo evento: sem isso não há como responder "as páginas
 * de bairro convertem melhor que a home?", porque nenhum evento dizia onde aconteceu.
 *
 * Vem do servidor, e não de regex em window.location, porque o Astro já sabe o tipo
 * da página quando gera o HTML — as 11 páginas de bairro saem de um [slug].astro só,
 * e uma URL nova não pode virar dado errado.
 */
const PAGE_CONTEXT = (() => {
    const data = document.body ? document.body.dataset : {};
    if (!data.pageType) {
        console.warn('⚠️ <body data-page-type> ausente — eventos sairão como page_type=unknown');
    }
    const context = { page_type: data.pageType || 'unknown' };
    // Ausente (não vazio) fora das páginas de bairro: parâmetro vazio ainda ocupa
    // linha no relatório.
    if (data.neighborhoodPage) context.neighborhood_page = data.neighborhoodPage;
    return context;
})();

/**
 * Interruptor do log de evento. Ligado por `?analytics_debug=1` na URL (vale para o
 * acesso) ou por `localStorage.setItem('verly_debug', '1')` (fica no aparelho).
 * Desligado, o visitante não vê nada no console; console.warn/console.error de
 * condição anormal continuam saindo sempre.
 */
const ANALYTICS_DEBUG = (() => {
    try {
        if (new URLSearchParams(window.location.search).has('analytics_debug')) return true;
        return localStorage.getItem('verly_debug') === '1';
    } catch (error) {
        // localStorage lança em navegação restrita/iframe de terceiro.
        return false;
    }
})();

function debugLog(...args) {
    if (ANALYTICS_DEBUG) console.log(...args);
}

/**
 * Track events to Google Analytics 4
 * @param {string} eventName - GA4 event name (use snake_case)
 * @param {object} eventParams - Event parameters
 */
function trackGA4Event(eventName, eventParams = {}) {
    if (typeof gtag === 'undefined') {
        console.warn('⚠️ gtag not loaded yet');
        return;
    }
    // Sem `timestamp`: o GA4 datava o hit no servidor de qualquer jeito, então o
    // parâmetro não respondia nenhuma pergunta e gastava cota de dimensão
    // personalizada em TODO evento.
    // PAGE_CONTEXT por último: nenhum chamador sobrescreve o tipo da página.
    const enrichedParams = {
        ...eventParams,
        page_location: window.location.href,
        page_title: document.title,
        ...PAGE_CONTEXT
    };

    gtag('event', eventName, enrichedParams);
    debugLog('📊 GA4 Event:', eventName, enrichedParams);
}

// O page_view customizado que existia aqui foi removido: junto com o
// `send_page_view: true` do Base.astro ele contava TODO acesso duas vezes, e
// pageview é o denominador de toda taxa de conversão. Ficou o automático do GA4,
// que já traz page_location, page_title e page_referrer.
// Do que o customizado mandava a mais, nada se perde: user_agent, device_type e
// screen_resolution são dimensões que o GA4 coleta sozinho em todo hit, e page_path
// sai de page_location. Só viewport_size não tem equivalente nativo — e não vale uma
// dimensão personalizada, já que "Resolução da tela" e "Categoria do dispositivo"
// respondem a mesma pergunta.

/**
 * Exposto para os outros dois scripts de /public. Eles carregam ANTES deste, mas só
 * chamam depois do DOMContentLoaded, quando isto já existe. Um lugar só enriquece o
 * evento e um lugar só decide se o log sai.
 */
window.VerlyAnalytics = {
    track: trackGA4Event,
    log: debugLog,
    debug: ANALYTICS_DEBUG,
    pageContext: PAGE_CONTEXT
};

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
 *
 * Nome `scroll_depth`, e não `scroll`: a Medição avançada do GA4 emite um `scroll`
 * automático em 90%, com o MESMO parâmetro `percent_scrolled`. Com o mesmo nome de
 * evento, a série chegava misturada (25 / 50 / 75 / 90 / 100) e não havia como separar a
 * origem — nem filtrando, porque o nome do evento é a única coisa que distingue os
 * dois emissores. Com nome próprio, `scroll_depth` são as marcas do site e `scroll` é
 * a marca automática do GA4, e as duas continuam legíveis pela dimensão nativa
 * "Percentual de rolagem".
 *
 * `scroll_depth_threshold` saiu: era cópia exata de `percent_scrolled` e gastaria uma
 * segunda dimensão personalizada para responder a mesma pergunta.
 */
function trackScrollDepth(percentage) {
    trackGA4Event('scroll_depth', {
        percent_scrolled: percentage,
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
 * Track phone click
 */
function trackPhoneClick(phoneNumber, location) {
    trackGA4Event('phone_click', {
        phone_number: phoneNumber,
        click_location: location // 'header', 'contact_section', 'footer'
    });
}

/**
 * O clique neste link já tem um evento mais específico que navigation_click?
 *
 * navigation_click é para navegação. Contato tem evento próprio: whatsapp_click
 * (wa.me), phone_click (tel:) e contact_link_click (data-track, hoje e-mail e
 * endereço). Sem essa regra o mesmo clique aparecia em dois ou três eventos.
 */
function hasDedicatedEvent(link) {
    const href = link.getAttribute('href') || '';
    return /wa\.me|whatsapp/.test(href)
        || href.startsWith('tel:')
        || href.startsWith('mailto:')
        || link.hasAttribute('data-track');
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
 * Exibe a saída de contingência como um link real.
 *
 * `window.open()` disparado por timer não é uma ação da pessoa (e navegadores ainda
 * podem bloqueá-lo como popup). O link mantém nome/telefone/mensagem no handoff, mas
 * o analytics só acontece quando a pessoa de fato clica nele.
 */
function showWhatsAppHandoff(message, whatsappURL, context) {
    showAlert(message, 'error');

    const alertDiv = document.getElementById('formAlert');
    const alert = document.createElement('div');
    alert.className = 'form-alert error';

    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '!';

    const content = document.createElement('span');
    content.appendChild(document.createTextNode(`${message} `));

    const handoff = document.createElement('a');
    handoff.href = whatsappURL;
    handoff.target = '_blank';
    handoff.rel = 'noopener noreferrer';
    handoff.dataset.context = context;
    handoff.textContent = 'Continuar no WhatsApp';
    content.appendChild(handoff);

    alert.append(icon, content);
    alertDiv.replaceChildren(alert);
    alertDiv.style.display = 'block';
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
/*
 * `validateServices()` foi removida daqui.
 *
 * Ela existia para barrar o envio sem serviço marcado, e o bloco de serviços deixou de
 * ser obrigatório: eram oito decisões antes do botão, num campo cuja resposta o
 * atendimento obtém na primeira pergunta da conversa.
 *
 * Consequência no analytics, de propósito: `validation_error` com
 * `field_name = services` para de existir, e `generate_lead` passa a poder sair com
 * `services` vazio e `services_count: 0`. Isso não é perda de sinal — é o sinal novo:
 * a fração de leads que não quis detalhar o serviço é exatamente o que dizia se o
 * campo obrigatório valia a pena, e antes ela era inobservável porque ninguém
 * conseguia enviar sem responder.
 */

// ============================================================================
// SERVIÇOS — CHAVE CURTA E ESTÁVEL
// ============================================================================

/**
 * Slug por serviço.
 *
 * O rótulo do checkbox é bom para ler e ruim para medir: a lista dos 8 concatenada dá
 * 127 caracteres e o GA4 corta valor de parâmetro em 100 — a seleção grande, que é
 * justamente o lead mais valioso, chegava truncada e virava linha espúria no relatório.
 * Os 8 slugs concatenados dão 85 caracteres, então nenhuma seleção possível é cortada.
 *
 * O mapa é explícito (e não só derivado do rótulo) porque a chave precisa sobreviver a
 * mudança de copy: trocar "Box para Banheiro" por "Box de Banheiro" não pode virar um
 * serviço novo no relatório.
 *
 * NENHUM slug é pedaço de outro. Isso é requisito, não coincidência: a leitura por
 * serviço é um filtro "services contém <slug>", e um slug contido em outro faria uma
 * linha contar leads da outra. Serviço novo aqui precisa manter essa propriedade.
 *
 * Um evento por serviço foi tentado e descartado: medindo o envio real, um lead com os
 * 8 serviços emite 8 eventos a mais no mesmo instante, o gtag os agrupa num lote só, e
 * o lote perde eventos — 3 dos 8 se perderam no caminho de sucesso, que redireciona
 * para /obrigado.html 1,2 s depois. Contagem por serviço que perde evento é pior que
 * filtro "contém", porque o erro não aparece em lugar nenhum.
 */
const SERVICE_SLUGS = {
    'Box para Banheiro': 'box',
    'Sacada Envidraçada': 'sacada',
    'Guarda-corpo': 'guarda_corpo',
    'Portas de Vidro': 'portas_vidro',
    'Janelas de Alumínio': 'janelas_aluminio',
    'Espelhos': 'espelhos',
    'Divisórias': 'divisorias',
    'Tampos de Mesa': 'tampos_mesa'
};

function serviceSlug(value) {
    if (SERVICE_SLUGS[value]) return SERVICE_SLUGS[value];
    // Serviço novo no markup sem passar por aqui: melhor um slug derivado do que
    // perder a linha no relatório.
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// ============================================================================
// ENTREGA DO LEAD — KEEPALIVE, TENTATIVAS E FILA LOCAL
// ============================================================================

const LEAD_ENDPOINT = 'https://api.verlyvidracaria.com/verly-service/leads';

/**
 * O público preenche este formulário em obra, no celular, com sinal oscilando. A falha
 * típica não é "a API caiu", é o envio pegar um buraco de sinal de alguns segundos —
 * e desistir na primeira falha jogava fora um lead que a segunda tentativa entregaria.
 *
 * Duas tentativas em primeiro plano (a pessoa espera no máximo o backoff de 800 ms a
 * mais que hoje) e o resto no plano de fundo, pela fila: assim a interface não trava
 * enquanto a rede não volta.
 */
const LEAD_FOREGROUND_ATTEMPTS = 2;
const LEAD_BACKGROUND_ATTEMPTS = 3;
const LEAD_BACKOFF_MS = [800, 2500, 6000];
// 2 × 4 s + 800 ms de backoff: a pessoa recebe uma saída em no máximo 8,8 s.
const LEAD_ATTEMPT_TIMEOUT_MS = 4000;

const LEAD_QUEUE_KEY = 'verly_pending_leads';

/**
 * A fila guarda nome, telefone e e-mail no aparelho da pessoa, então ela expira: dado
 * pessoal que ninguém vai mais usar não pode ficar parado no localStorage.
 *
 * 24 horas cobre o caso real — enviar sem sinal na obra e recuperar o sinal no
 * caminho de volta, ou reabrir o site no dia seguinte — e não passa disso: a loja
 * promete retorno em 2 horas úteis, então um pedido de orçamento com mais de um dia
 * chega tarde de qualquer jeito, e reenviá-lo é mais constrangedor do que útil.
 * A expiração é aplicada em toda leitura da fila, não só na hora de reenviar.
 */
const LEAD_QUEUE_TTL_MS = 24 * 60 * 60 * 1000;

/** Teto de itens: a fila é rede de segurança, não histórico. */
const LEAD_QUEUE_MAX = 5;

/**
 * Identificador do envio. Vai no corpo como `submission_id` e é a chave de
 * idempotência: o cliente nunca enfileira nem reenvia o mesmo envio duas vezes, e o
 * servidor tem como descartar a repetição da janela em que a resposta se perdeu
 * depois de o lead já ter sido gravado.
 */
function newSubmissionId() {
    try {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }
    } catch (error) {
        // randomUUID exige contexto seguro; cai no gerador abaixo.
    }
    return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Vale a pena tentar de novo? Só o que é transitório. 4xx de validação é resposta
 * definitiva do servidor: repetir não muda nada e ainda arrisca duplicar.
 */
function isRetryableStatus(status) {
    return status === 408 || status === 425 || status === 429 || status >= 500;
}

/**
 * UMA tentativa de POST. Nunca lança.
 * @returns {'success'|'error'|'retryable_error'|'fetch_error'}
 */
async function postLead(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LEAD_ATTEMPT_TIMEOUT_MS);

    try {
        const response = await fetch(LEAD_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            // Sobrevive ao unload: quem envia e fecha a aba (ou é redirecionado para o
            // WhatsApp) não perde mais a requisição no meio do caminho.
            keepalive: true,
            signal: controller.signal
        });

        if (response.ok) {
            // Sem await e sem JSON.parse no caminho crítico: o corpo só serve para o
            // log de depuração, e um corpo malformado não pode transformar um lead
            // gravado em "erro de rede".
            response.text().then(text => debugLog('Lead saved successfully:', text)).catch(() => {});
            return 'success';
        }

        console.error('API error:', response.status);
        return isRetryableStatus(response.status) ? 'retryable_error' : 'error';
    } catch (error) {
        // fetch lança em offline, DNS, CORS, timeout e servidor inalcançável.
        console.error('Error submitting form:', error);
        return 'fetch_error';
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Tentativas com backoff. Nunca lança.
 *
 * @returns {{status: 'success'|'error'|'fetch_error', attempts: number, permanent: boolean}}
 *   `permanent` diz se insistir depois ainda faz sentido: `false` é o caso de
 *   enfileirar (rede caída ou 5xx), `true` é resposta definitiva do servidor.
 */
async function deliverLead(payload, maxAttempts) {
    let status = 'fetch_error';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const outcome = await postLead(payload);

        if (outcome === 'success') return { status: 'success', attempts: attempt, permanent: true };
        if (outcome === 'error') return { status: 'error', attempts: attempt, permanent: true };

        // `retryable_error` é o servidor respondendo mal (5xx/429): api_status = error.
        // `fetch_error` é a requisição nem chegar: api_status = fetch_error.
        status = outcome === 'retryable_error' ? 'error' : 'fetch_error';

        if (attempt < maxAttempts) {
            await delay(LEAD_BACKOFF_MS[attempt - 1] || LEAD_BACKOFF_MS[LEAD_BACKOFF_MS.length - 1]);
        }
    }

    return { status, attempts: maxAttempts, permanent: false };
}

function readLeadQueue() {
    try {
        const raw = localStorage.getItem(LEAD_QUEUE_KEY);
        const items = raw ? JSON.parse(raw) : [];
        return Array.isArray(items) ? items : [];
    } catch (error) {
        // localStorage indisponível (navegação restrita) ou conteúdo corrompido.
        return [];
    }
}

function writeLeadQueue(items) {
    try {
        if (items.length === 0) localStorage.removeItem(LEAD_QUEUE_KEY);
        else localStorage.setItem(LEAD_QUEUE_KEY, JSON.stringify(items));
        return true;
    } catch (error) {
        // Cota estourada ou armazenamento bloqueado. Quem chama precisa saber: sem a
        // fila, o formulário não pode ser limpo como se o lead estivesse guardado.
        console.warn('⚠️ Não foi possível gravar a fila de leads:', error);
        return false;
    }
}

function withoutSubmission(items, submissionId) {
    return items.filter(item => item.payload.submission_id !== submissionId);
}

/** Expiração aplicada em toda leitura: o dado pessoal não sobrevive ao TTL. */
function readLiveLeadQueue() {
    const now = Date.now();
    const stored = readLeadQueue();
    const items = stored.filter(item =>
        item && item.payload && item.payload.submission_id && now - (item.queued_at || 0) < LEAD_QUEUE_TTL_MS
    );
    if (items.length !== stored.length) writeLeadQueue(items);
    return items;
}

function enqueueLead(payload) {
    // Filtrar pelo submission_id antes de empilhar: reenviar a mesma página duas vezes
    // não pode virar dois leads na fila.
    const items = withoutSubmission(readLiveLeadQueue(), payload.submission_id);
    items.push({ payload, queued_at: Date.now() });
    const stored = writeLeadQueue(items.slice(-LEAD_QUEUE_MAX));
    debugLog(stored ? '📥 Lead enfileirado para reenvio:' : '⚠️ Fila indisponível:', payload.submission_id);
    return stored;
}

let leadQueueFlushing = false;

/**
 * Reenvia o que ficou na fila. Chamada quando a conexão volta e a cada carregamento.
 *
 * Sequencial e com trava: dois gatilhos ao mesmo tempo (`online` durante o flush do
 * carregamento) mandariam o mesmo lead duas vezes.
 */
async function flushLeadQueue(reason) {
    if (leadQueueFlushing) return;
    leadQueueFlushing = true;

    try {
        const items = readLiveLeadQueue();
        if (items.length === 0) return;
        debugLog(`📤 Reenviando ${items.length} lead(s) da fila (${reason})`);

        for (const item of items) {
            const result = await deliverLead(item.payload, LEAD_BACKGROUND_ATTEMPTS);

            // Sai da fila quando confirmado (2xx) e também quando o servidor recusa em
            // definitivo — insistir num 4xx só manteria dado pessoal armazenado à toa.
            if (result.permanent) {
                writeLeadQueue(withoutSubmission(readLeadQueue(), item.payload.submission_id));
            }

            if (result.status === 'success') {
                // Recuperação tem evento próprio: o submit original não foi aceito e
                // portanto não emitiu generate_lead. Assim o relatório distingue um
                // lead confirmado em primeiro plano de um que só chegou pela fila.
                trackGA4Event('lead_recovered', {
                    lead_source: 'contact_form',
                    recovery_reason: reason,
                    delivery_attempts: result.attempts,
                    queued_seconds: Math.round((Date.now() - (item.queued_at || Date.now())) / 1000)
                });
            } else if (!result.permanent) {
                // Ainda sem rede: para por aqui e tenta no próximo `online`/carregamento.
                break;
            }
        }
    } finally {
        leadQueueFlushing = false;
    }
}

function initLeadQueue() {
    window.addEventListener('online', () => flushLeadQueue('online'));
    // Sem await: a fila não pode atrasar o resto da inicialização.
    flushLeadQueue('page_load');
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
    const selectedServiceSlugs = selectedServices.map(serviceSlug);

    // O que o WhatsApp precisa, capturado ANTES do reset do formulário: `reset()` zera
    // os campos, e a mensagem de fallback era montada depois dele com
    // `phoneField.value` — o telefone chegava VAZIO na loja justo no caminho em que o
    // WhatsApp é a única entrega que sobrou.
    const phoneDisplay = phoneField.value;
    const messageText = messageField.value.trim();

    // Prepare form data
    const formData = {
        // Chave de idempotência do envio: sobrevive à fila e a todas as tentativas.
        submission_id: newSubmissionId(),
        name: nameField.value.trim(),
        phone: phoneField.value.replace(/\D/g, ''),
        email: emailField.value.trim() || undefined,
        neighborhood: neighborhoodField.value,
        city: 'Rio de Janeiro',
        description: messageText
            ? `Serviços: ${selectedServices.join(', ')}. Mensagem: ${messageText}`
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

    // Evento próprio para o denominador de entrega. Diferente do
    // form_interaction.submit_attempt (que acontece antes da validação), este só sai
    // quando existe um payload válido prestes a ser enviado. Nenhum dado pessoal vai
    // para o GA4: serviços são slugs e e-mail/mensagem viram apenas booleanos.
    const leadEventParams = {
        lead_source: 'contact_form',
        services: selectedServiceSlugs.join(','),
        services_count: selectedServices.length,
        neighborhood: formData.neighborhood,
        has_email: !!formData.email,
        has_message: !!messageText
    };
    trackGA4Event('lead_submit_attempt', leadEventParams);
    
    // Show loading state (use ButtonLoader if available)
    if (typeof ButtonLoader !== 'undefined') {
        ButtonLoader.start(submitBtn);
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        btnText.textContent = 'Enviando...';
    }
    
    try {
        // Send to API. deliverLead NUNCA lança: as três saídas possíveis
        // (success / error / fetch_error) são tratadas no mesmo lugar.
        const result = await deliverLead(formData, LEAD_FOREGROUND_ATTEMPTS);
        const apiSuccess = result.status === 'success';

        // Falha transitória: guarda para reenviar quando a conexão voltar. A interface
        // não espera por isso — segue direto para o fallback de WhatsApp.
        const queued = !apiSuccess && !result.permanent && enqueueLead(formData);

        // Track form submission with detailed data
        if (result.status === 'fetch_error') {
            trackFormInteraction('submit_error', 'all_fields', '', 'Network error');
        } else {
            trackFormInteraction('submit_success', 'all_fields', '', apiSuccess ? 'API success' : 'API failed');
        }

        // Conversão só existe quando a API confirmou que aceitou o lead. Falhas já
        // têm lead_submit_attempt como denominador; se a fila entregar depois, o
        // evento distinto lead_recovered registra esse desfecho.
        if (apiSuccess) {
            trackGA4Event('generate_lead', {
                ...leadEventParams,
                api_status: 'success',
                delivery_attempts: result.attempts
            });
        }

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

        // Limpar o formulário só quando o lead está entregue ou guardado para reenvio.
        // Se nada disso vale (recusa definitiva do servidor, ou localStorage bloqueado),
        // o que a pessoa digitou é a última cópia que existe — apagá-la obrigaria a
        // preencher tudo de novo para tentar outra vez.
        if (apiSuccess || queued) {
            document.getElementById('contactForm').reset();
            document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                el.classList.remove('is-valid', 'is-invalid');
            });
        }

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
            // Entrega não confirmada: o WhatsApp continua sendo a última rede de
            // segurança, com ou sem fila. Uma mensagem só para os dois modos de falha —
            // a versão curta do antigo `catch` deixava e-mail e observação de fora.
            // Bairro e serviços viraram opcionais, então as duas linhas passam a ser
            // condicionais como a do e-mail já era. Sem isso a mensagem chegaria com
            // "*Bairro:* " e "*Serviços de Interesse:* " vazios — rótulo sem resposta
            // parece campo perdido no caminho, e é o dono lendo isso no WhatsApp.
            const whatsappMessage = `*Solicitação de Orçamento - Verly Vidraçaria*\n\n` +
                `*Nome:* ${formData.name}\n` +
                `*Telefone:* ${phoneDisplay}\n` +
                (formData.neighborhood ? `*Bairro:* ${formData.neighborhood}\n` : '') +
                (formData.email ? `*E-mail:* ${formData.email}\n` : '') +
                (selectedServices.length ? `*Serviços de Interesse:* ${selectedServices.join(', ')}\n` : '') +
                (messageText ? `*Mensagem:* ${messageText}\n\n` : '\n') +
                `Enviado através do site verlyvidracaria.com`;

            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappURL = `https://wa.me/5521987926578?text=${encodedMessage}`;

            const handoffContext = result.status === 'fetch_error' ? 'form_error' : 'form_fallback';
            showWhatsAppHandoff(
                queued
                    ? 'Sem conexão para enviar agora. Seu pedido ficou salvo e será reenviado quando a internet voltar.'
                    : 'Problema no envio automático. Finalize o contato pelo WhatsApp.',
                whatsappURL,
                handoffContext
            );
        }
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
    // O page_view sai do gtag('config') no Base.astro, não daqui.

    // Track time on page milestones
    setTimeout(() => trackEngagementMilestone('time_30s', 30), 30000);
    setTimeout(() => trackEngagementMilestone('time_60s', 60), 60000);
    setTimeout(() => trackEngagementMilestone('time_120s', 120), 120000);

    // O clique em WhatsApp era rastreado DUAS vezes: este arquivo ligava um ouvinte em
    // cada `a[href*="wa.me"]` e o whatsapp-cta.js ligava um ouvinte delegado no
    // document, então cada clique mandava dois `whatsapp_click` com parâmetros
    // diferentes — e whatsapp_click é o proxy de conversão mais usado do site.
    // Ficou o delegado: ele lê o `data-context` que o markup já traz (floating-button,
    // sticky-cta, service-*, footer-whatsapp, thank-you-page), o que é mais preciso que
    // o hero/inline deduzido aqui, e alcança os CTAs criados em runtime.

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
        // O rodapé mistura navegação (serviços, bairros) com links de contato, e os de
        // contato já têm evento próprio. Sem este corte, um clique no WhatsApp do rodapé
        // saía como whatsapp_click + contact_link_click + navigation_click.
        if (hasDedicatedEvent(link)) return;
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
    
    // Track form field interactions. Uma única flag é compartilhada por todos os
    // campos e pelo grupo de serviços: start significa "este formulário começou",
    // não "este campo foi focado pela primeira vez".
    let formStarted = false;
    const trackFormStart = fieldName => {
        if (formStarted) return;
        formStarted = true;
        trackFormInteraction('start', fieldName);
    };

    const formFields = ['name', 'phone', 'email', 'neighborhood', 'message'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('focus', () => {
                trackFormStart(fieldId);
                trackFormInteraction('field_focus', fieldId);
            });
            
            // Track field blur
            field.addEventListener('blur', () => {
                trackFormInteraction('field_blur', fieldId, field.value);
            });
        }
    });
    
    // Os 8 checkboxes de serviço, tratados como UM campo chamado `services` — o mesmo
    // nome que a validação e o `service_selected` já usam.
    //
    // Sem isto, o funil de `form_interaction` por `field_name` era cego exatamente no
    // campo mais caro do formulário: é obrigatório, tem 8 opções, e o único sinal que
    // emitia era `service_selected`, que só existe DEPOIS de a pessoa marcar algo.
    // Quem abandonava olhando as 8 opções não deixava rastro nenhum.
    //
    // `relatedTarget` filtra o vaivém interno: passar de um checkbox para o vizinho é
    // continuar no mesmo campo, não sair e voltar — contar isso inflaria `field_focus`
    // em até 8x contra os outros campos e a comparação do funil perderia sentido.
    const staysInServicesGroup = related => !!related && related.name === 'services';
    document.querySelectorAll('input[name="services"]').forEach(checkbox => {
        checkbox.addEventListener('focus', (e) => {
            if (staysInServicesGroup(e.relatedTarget)) return;
            trackFormStart('services');
            trackFormInteraction('field_focus', 'services');
        });

        checkbox.addEventListener('blur', (e) => {
            if (staysInServicesGroup(e.relatedTarget)) return;
            trackFormInteraction('field_blur', 'services');
        });

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

            // Só reporta o que mais ninguém reportou: os itens de menu e os links do
            // rodapé já saem como navigation_click 'menu'/'footer', e uma âncora nos
            // dois lugares gerava DOIS navigation_click com navigation_type diferente
            // para um clique só.
            if (this.classList.contains('nav-link') || this.closest('.footer')) return;

            const linkText = this.textContent.trim();
            trackNavigationClick(linkText, href, 'internal_link');
        });
    });
}

// ============================================================================
// INITIALIZE APP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    debugLog('🚀 Verly Vidraçaria - App initialized with complete GA4 tracking');
    
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
        
        // Form submission
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialize all features
    initMobileMenu();
    initScrollEffects();
    initSmoothScroll();
    initSectionTracking();
    initCompleteAnalytics();
    // Depois do analytics: um lead recuperado emite `lead_recovered`, e o evento
    // precisa do trackGA4Event já valendo.
    initLeadQueue();

    debugLog('✅ GA4 tracking initialized with 15+ event types');
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
