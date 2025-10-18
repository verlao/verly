# Verly Vidraçaria - Landing Page

> Landing page moderna e conversiva para vidraçaria na Zona Oeste do Rio de Janeiro

[![Performance](https://img.shields.io/badge/performance-optimized-brightgreen)]()
[![Mobile](https://img.shields.io/badge/mobile-first-blue)]()
[![SEO](https://img.shields.io/badge/seo-optimized-success)]()

---

## 📚 **DOCUMENTAÇÃO**

> **Toda a documentação técnica está organizada na pasta [`docs/`](docs/)**

### 📖 **Documentos Disponíveis:**

| Documento | Descrição |
|-----------|-----------|
| **[UI/UX Improvements](docs/UI_UX_IMPROVEMENTS.md)** | Melhorias de interface e experiência do usuário |
| **[WhatsApp CTA Optimization](docs/WHATSAPP_CTA_OPTIMIZATION.md)** | Otimizações nos CTAs do WhatsApp |
| **[WhatsApp Fix Summary](docs/WHATSAPP_FIX_SUMMARY.md)** | Correções do botão flutuante WhatsApp |
| **[Footer Enhancements](docs/FOOTER_ENHANCEMENTS_DOCUMENTATION.md)** | Melhorias no footer e tracking avançado GA4 |
| **[GA4 Tracking Guide](docs/GA4_TRACKING_GUIDE.md)** | Guia completo de tracking no Google Analytics 4 |
| **[Implementation Notes](docs/IMPLEMENTATION_NOTES.md)** | Notas técnicas de implementação |
| **[Quick Test Guide](docs/QUICK_TEST_GUIDE.md)** | Guia rápido de testes |
| **[Refactoring Summary](docs/REFACTORING_SUMMARY.md)** | Resumo da refatoração do projeto |

---

## 🚀 Quick Start

```bash
# Clonar repositório
git clone https://github.com/verlao/verly.git
cd verly

# Instalar dependências (apenas para testes automatizados)
npm install

# Rodar servidor local
npx http-server . -p 3000

# Acessar
open http://localhost:3000
```

### 🌐 **Acesso via Rede Local (Mobile):**

Para testar no celular, use o IP da sua máquina:
```bash
# Descobrir IP local
ifconfig | grep "inet " | grep -v 127.0.0.1

# Acessar do celular (exemplo):
http://192.168.0.4:3000
```

---

## ✨ Features

### 🎯 **Conversão:**
- ✅ **Formulário otimizado** com validação em tempo real
- ✅ **Múltiplos CTAs** estrategicamente posicionados
- ✅ **WhatsApp integration** com mensagens contextualizadas
- ✅ **Botão WhatsApp flutuante** sempre visível
- ✅ **Sticky CTA** que aparece ao rolar a página
- ✅ **Botões em todos os cards** de serviço

### 🎨 **UX/UI:**
- ✅ **Máscara de telefone** brasileiro automática
- ✅ **Validação inline** com feedback visual
- ✅ **Tooltips informativos** nos campos
- ✅ **Loading states** nos botões
- ✅ **Toast notifications** para alertas
- ✅ **Searchable dropdown** para seleção de bairro

### 📱 **Mobile:**
- ✅ **Mobile-first design** 100% responsivo
- ✅ **Formulário priorizado** no mobile (aparece primeiro)
- ✅ **Touch targets otimizados** (48px+)
- ✅ **Font-size 16px+** (previne zoom no iOS)
- ✅ **WhatsApp direto no app** (mobile) ou Web (desktop)

### 📊 **Analytics & Tracking:**
- ✅ **Google Analytics 4** implementado
- ✅ **Device detection** (iOS/Android/Desktop)
- ✅ **Browser detection** (Chrome/Safari/Firefox/Edge)
- ✅ **Click tracking** em todos os links de contato
- ✅ **Scroll depth tracking** (25%, 50%, 75%, 100%)
- ✅ **Form events tracking** (submit, errors, success)

### 🔍 **SEO:**
- ✅ **Meta tags otimizadas** para Zona Oeste RJ
- ✅ **Structured data** (LocalBusiness, Service)
- ✅ **HTML semântico** e acessível
- ✅ **11 bairros** estrategicamente mencionados
- ✅ **Keywords locais** integradas

---

## 📁 Estrutura do Projeto

```
verly-lp/
├── 📄 index.html                          # Landing page principal
├── 📄 obrigado.html                       # Página de agradecimento
├── 📄 test-automation.html                # Página para testes
│
├── 📂 css/
│   ├── freelancer.css                     # Estilos base
│   ├── ui-improvements.css                # Melhorias de UI/UX
│   └── whatsapp-cta.css                   # Estilos dos CTAs WhatsApp
│
├── 📂 js/
│   ├── app.js                             # JavaScript principal
│   ├── ui-improvements.js                 # Funcionalidades de UI/UX
│   └── whatsapp-cta.js                    # Otimizações WhatsApp
│
├── 📂 img/                                # Imagens e portfolio
├── 📂 scss/                               # Source SASS (compilado)
├── 📂 vendor/                             # Bibliotecas (Bootstrap, jQuery, etc.)
│
├── 📂 docs/                               # 📚 TODA A DOCUMENTAÇÃO
│   ├── UI_UX_IMPROVEMENTS.md
│   ├── WHATSAPP_CTA_OPTIMIZATION.md
│   ├── WHATSAPP_FIX_SUMMARY.md
│   ├── FOOTER_ENHANCEMENTS_DOCUMENTATION.md
│   ├── GA4_TRACKING_GUIDE.md
│   ├── IMPLEMENTATION_NOTES.md
│   ├── QUICK_TEST_GUIDE.md
│   └── REFACTORING_SUMMARY.md
│
├── 📄 automated-test.js                   # Testes automatizados Puppeteer
├── 📄 whatsapp-cta-test.js               # Testes específicos WhatsApp
├── 📄 lighthouse-audit.js                 # Auditoria de performance
├── 📄 package.json                        # Dependências Node.js
└── 📄 README.md                           # Este arquivo
```

---

## 🎯 Formulário de Orçamento

### Campos:
- **Nome Completo** (obrigatório)
- **Telefone/WhatsApp** (obrigatório, máscara automática)
- **E-mail** (opcional, com tooltip explicativo)
- **Bairro** (obrigatório, searchable dropdown com 16 opções)
- **Serviços de Interesse** (obrigatório, múltipla escolha)
- **Mensagem** (opcional)

### Fluxo de Conversão:
1. **Validação em tempo real** enquanto o usuário preenche
2. **Feedback visual** (ícones de sucesso/erro)
3. **Envio para API** backend
4. **Fallback WhatsApp** se API falhar
5. **Redirecionamento** para WhatsApp com mensagem contextualizada
6. **Tracking** de conversão completo no GA4

---

## 📱 Mobile-First & Responsivo

### Desktop (> 768px):
- Layout duas colunas (formulário + informações)
- WhatsApp abre no **WhatsApp Web**
- Formulário lado a lado com info de contato

### Mobile (≤ 768px):
- **Formulário aparece primeiro** (prioridade)
- Informações de contato depois
- WhatsApp abre no **app direto**
- Font-size 16px+ (previne zoom iOS)
- Touch targets 48px+ (Apple guidelines)

---

## 📞 Links de Contato Inteligentes

### WhatsApp:
- **Desktop:** `https://web.whatsapp.com/send?phone=...`
- **Mobile:** `https://api.whatsapp.com/send?phone=...`
- **Detecção automática** via User Agent

### Telefone:
- **Link:** `tel:+552134216066`
- Abre discador no mobile ou app de chamada no desktop

### Endereço:
- **Link:** Google Maps Search API
- Abre navegação (Maps, Waze, etc.)

### Tracking:
- Todos os links têm `data-track` para GA4
- Device info enviado automaticamente

---

## 📊 Google Analytics 4

### Eventos Rastreados:

| Evento | Descrição | Dados Capturados |
|--------|-----------|------------------|
| `page_view_with_device` | Carregamento da página | device_type, browser, os |
| `whatsapp_click` | Clique em WhatsApp | context, device, browser |
| `contact_link_click` | Clique em telefone/email/endereço | link_type, device, browser |
| `form_submission` | Envio de formulário | services, neighborhood |
| `scroll` | Profundidade de scroll | percent (25/50/75/100) |
| `section_view` | Visualização de seção | section_name, section_id |

### Como Ver os Dados:
```
GA4 → Relatórios → Eventos
- Filtrar por: device_type, browser, os
- Dimensões customizadas disponíveis
```

**Ver guia completo:** [`docs/GA4_TRACKING_GUIDE.md`](docs/GA4_TRACKING_GUIDE.md)

---

## 🎨 Design System

### Cores:
- **Primário**: `#1e40af` (azul confiança)
- **Sucesso**: `#10b981` (verde conversão)
- **WhatsApp**: `#25D366` (verde WhatsApp oficial)
- **Cinza**: `#6b7280` (profissionalismo)

### Tipografia:
- **Font**: Inter (Google Fonts)
- **Hero**: 3.5rem → 2.5rem (mobile)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)

---

## 🧪 Testes

### Teste Rápido:
```bash
# Servidor local
npx http-server . -p 3000

# Abrir no navegador
open http://localhost:3000
```

### Testes Automatizados:
```bash
# Instalar dependências
npm install

# Rodar testes
node automated-test.js
node whatsapp-cta-test.js
```

### Teste no Mobile:
1. Descubra o IP local: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Acesse do celular: `http://SEU_IP:3000`
3. Teste WhatsApp, telefone, endereço

**Guia detalhado:** [`docs/QUICK_TEST_GUIDE.md`](docs/QUICK_TEST_GUIDE.md)

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | HTML5, CSS3, JavaScript ES6+ (Vanilla) |
| **Frameworks CSS** | Bootstrap 4.6.2 |
| **Preprocessador** | SASS/SCSS |
| **Ícones** | FontAwesome 5 |
| **Fonts** | Inter (Google Fonts) |
| **Analytics** | Google Analytics 4 (GA4) |
| **Build** | Gulp.js |
| **Testes** | Puppeteer, Lighthouse |

---

## 🎯 Otimizações de Conversão

### CTAs Estratégicos:
1. **Hero Section:** "Solicitar Orçamento Grátis" + "WhatsApp Direto"
2. **Sticky CTA:** Aparece após 30% de scroll (sempre visível)
3. **Service Cards:** Botão "Pedir Orçamento" em cada card (6 total)
4. **Footer:** Links diretos para WhatsApp, telefone, email, endereço
5. **Floating Button:** WhatsApp fixo no canto (desktop/mobile)

### Prova Social:
- 4.8★ (127 avaliações)
- 3 depoimentos de clientes reais
- Mais de 10 anos de experiência
- 127+ projetos realizados

### Senso de Urgência:
- "Orçamento em até 2 Horas"
- "Responderemos em até 2h úteis"
- "Atendimento no mesmo dia quando possível"

---

## 📈 Performance

| Métrica | Valor |
|---------|-------|
| **Page Size** | ~540KB |
| **JS Size** | ~45KB (com UI improvements) |
| **CSS Size** | ~85KB |
| **Requests** | ~15-20 |
| **Load Time (3G)** | ~2.5-3s |

### Otimizações:
- ✅ Imagens otimizadas (WebP quando possível)
- ✅ CSS/JS minificados
- ✅ Lazy loading de imagens
- ✅ Cache headers configurados
- ✅ CDN para libraries (Bootstrap, jQuery)

---

## 📞 Contato

| Tipo | Info |
|------|------|
| **WhatsApp** | (21) 98792-6578 |
| **Telefone** | (21) 3421-6066 |
| **E-mail** | contato@verlyvidracaria.com |
| **Endereço** | Rua General Azeredo, 218 - Realengo - RJ |
| **Site** | https://verlyvidracaria.com |

---

## 📄 Licença

MIT

---

## 🚀 Deploy

O site está hospedado no **GitHub Pages**:
- URL: https://verlyvidracaria.com
- Branch: `gh-pages`
- Deploy automático via push

---

## 🎓 Aprendizados

Este projeto implementa:
- ✅ **UI/UX moderno** com foco em conversão
- ✅ **Tracking avançado** GA4 com device detection
- ✅ **WhatsApp optimization** para máxima conversão
- ✅ **Mobile-first** com layout adaptativo
- ✅ **SEO local** otimizado para Zona Oeste RJ
- ✅ **Performance** otimizada
- ✅ **Acessibilidade** (ARIA labels, semantic HTML)

---

**Desenvolvido com foco em conversão e experiência do usuário** 💙

**Zona Oeste RJ**: Barra da Tijuca • Recreio • Jacarepaguá • Campo Grande • Realengo • Vargem Grande • Vargem Pequena • Pechincha • Anil • Gardênia Azul • Freguesia

---

> 💡 **Dica:** Para entender todas as funcionalidades e melhorias implementadas, comece lendo [`docs/UI_UX_IMPROVEMENTS.md`](docs/UI_UX_IMPROVEMENTS.md) e [`docs/FOOTER_ENHANCEMENTS_DOCUMENTATION.md`](docs/FOOTER_ENHANCEMENTS_DOCUMENTATION.md)
<!-- Test deploy Sat Oct 18 21:35:43 UTC 2025 -->
