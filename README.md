# Verly Vidraçaria - Landing Page

> Landing page moderna e conversiva para vidraçaria na Zona Oeste do Rio de Janeiro

[![Performance](https://img.shields.io/badge/performance-optimized-brightgreen)]()
[![Mobile](https://img.shields.io/badge/mobile-first-blue)]()
[![SEO](https://img.shields.io/badge/seo-optimized-success)]()

## 🚀 Quick Start

```bash
# Clonar repositório
git clone https://github.com/verlao/verly.git
cd verly

# Rodar servidor local
python3 -m http.server 8080

# Acessar
open http://localhost:8080
```

## ✨ Features

- ✅ **Formulário completo** com validação em tempo real
- ✅ **Máscara de telefone** brasileiro automática
- ✅ **Múltipla escolha** de serviços
- ✅ **WhatsApp integration** com mensagem pré-preenchida
- ✅ **WhatsApp flutuante** sempre visível
- ✅ **JavaScript Vanilla** (sem jQuery, -90KB)
- ✅ **Mobile-first** e 100% responsivo
- ✅ **SEO otimizado** com structured data
- ✅ **Google Analytics** tracking completo
- ✅ **Design moderno** focado em conversão

## 📁 Estrutura

```
verly/
├── index.html                      # Landing page principal
├── js/
│   └── app.js                     # JavaScript vanilla moderno
├── css/
│   └── freelancer.css             # (legado, não usado)
├── img/                           # Imagens
├── IMPLEMENTATION_NOTES.md        # 📖 Documentação completa
├── QUICK_TEST_GUIDE.md           # 🧪 Guia de testes
└── REFACTORING_SUMMARY.md        # 📊 Resumo da refatoração
```

## 🎯 Formulário de Orçamento

O formulário possui validação robusta e integração completa:

### Campos:
- Nome Completo (obrigatório)
- Telefone/WhatsApp (obrigatório, máscara automática)
- E-mail (opcional)
- Bairro (obrigatório, 16 opções da Zona Oeste)
- Serviços de Interesse (obrigatório, múltipla escolha)
- Mensagem (opcional)

### Fluxo:
1. **Validação em tempo real** enquanto preenche
2. **Envio para API** backend
3. **Fallback WhatsApp** se API falhar
4. **Redirecionamento** para WhatsApp com mensagem
5. **Tracking** de conversão no Google Analytics

## 📱 Mobile-First

Design otimizado para mobile (90% dos acessos):
- Font-size 16px (previne zoom iOS)
- Touch targets 48px+
- Layout empilhado
- Menu hamburger
- WhatsApp button responsivo

## 🎨 Design System

### Cores:
- **Primário**: `#1e40af` (azul confiança)
- **Sucesso**: `#10b981` (verde conversão)
- **Cinza**: `#6b7280` (profissionalismo)
- **Branco**: `#ffffff` (limpeza)

### Tipografia:
- **Font**: Inter (Google Fonts)
- **Hero**: 3.5rem → 2.5rem (mobile)
- **Body**: 1rem

## 📊 Performance

| Métrica | Valor |
|---------|-------|
| **Page Size** | ~515KB |
| **JS Size** | ~15KB (sem jQuery) |
| **Requests** | ~10-15 |
| **Load Time (3G)** | ~2-3s |

## 🔍 SEO

- ✅ Meta tags otimizadas para Zona Oeste RJ
- ✅ Structured data (LocalBusiness, Service, FAQ)
- ✅ HTML semântico
- ✅ 11 bairros mencionados
- ✅ Keywords locais

## 📈 Analytics

Eventos rastreados:
- `page_view` - Visualização de página
- `form_submission` - Envio de formulário
- `whatsapp_click` - Clique no WhatsApp
- `cta_click` - Clique em CTAs
- `service_view` - Visualização de serviço
- `scroll_depth` - Profundidade de scroll (25%, 50%, 75%, 100%)

## 🧪 Testes

### Teste Rápido:

1. Abra `index.html` no navegador
2. Preencha o formulário:
   ```
   Nome: João Silva
   Telefone: (21) 98765-4321
   Bairro: Barra da Tijuca
   Serviços: [X] Box para Banheiro
   ```
3. Clique "Solicitar Orçamento Grátis"
4. ✅ Deve mostrar sucesso e abrir WhatsApp

### Teste Completo:

Siga o guia detalhado: [`QUICK_TEST_GUIDE.md`](QUICK_TEST_GUIDE.md)

## 📖 Documentação

- **[IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md)** - Documentação técnica completa (600+ linhas)
- **[QUICK_TEST_GUIDE.md](QUICK_TEST_GUIDE.md)** - Guia de testes e validação
- **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** - Resumo executivo da refatoração

## 🛠️ Stack

- **HTML5** - Semântico e acessível
- **CSS3** - Moderno com variáveis, flexbox, grid
- **JavaScript ES6+** - Vanilla, sem frameworks
- **Google Fonts** - Inter
- **FontAwesome** - Ícones

## 🎯 Foco em Conversão

### CTAs Estratégicos:
- "Solicitar Orçamento Grátis"
- "WhatsApp Direto"
- WhatsApp flutuante sempre visível

### Prova Social:
- 4.8★ (127 avaliações)
- 3 depoimentos de clientes
- Mais de 10 anos de experiência

### Senso de Urgência:
- "Orçamento em até 2 Horas"
- "Resposta em 2h"
- "Atendemos hoje mesmo"

## 📞 Contato

- **WhatsApp**: (21) 98792-6578
- **E-mail**: contato@verlyvidracaria.com
- **Site**: https://verlyvidracaria.com

## 📄 Licença

MIT

---

**Desenvolvido com foco em conversão e experiência do usuário** 💙

**Zona Oeste RJ**: Barra da Tijuca • Recreio • Jacarepaguá • Campo Grande • Realengo • Vargem Grande • Vargem Pequena • Pechincha • Anil • Gardênia Azul • Freguesia
