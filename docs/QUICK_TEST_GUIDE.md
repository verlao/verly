# 🧪 Guia Rápido de Testes - Verly Vidraçaria

## 🚀 Como Testar Localmente

### 1. Abrir o Site

```bash
# Opção 1: Abrir diretamente no navegador
open index.html

# Opção 2: Usar servidor local (recomendado)
python3 -m http.server 8000
# Acesse: http://localhost:8000

# Opção 3: Usar Live Server (VSCode)
# Clique direito em index.html > "Open with Live Server"
```

---

## ✅ Checklist de Testes Essenciais

### 🎯 TESTE 1: Validação do Formulário

**Campos Obrigatórios:**

1. ✅ **Nome**: Deixe vazio e tente enviar → Deve mostrar erro "Este campo é obrigatório"
2. ✅ **Nome curto**: Digite "Ab" → Deve mostrar erro "Nome deve ter pelo menos 3 caracteres"
3. ✅ **Telefone**: Deixe vazio → Deve mostrar erro "Este campo é obrigatório"
4. ✅ **Telefone inválido**: Digite "123" → Deve mostrar erro "Telefone inválido"
5. ✅ **Bairro**: Deixe em "Selecione seu bairro" → Deve mostrar erro "Selecione seu bairro"
6. ✅ **Serviços**: Não marque nenhum checkbox → Deve mostrar erro "Selecione pelo menos um serviço"

**Campos Opcionais:**

7. ✅ **E-mail**: Deixe vazio e envie → Deve aceitar (é opcional)
8. ✅ **E-mail inválido**: Digite "teste@" → Deve mostrar erro "E-mail inválido"
9. ✅ **Mensagem**: Deixe vazio → Deve aceitar (é opcional)

---

### 🎯 TESTE 2: Máscara de Telefone

Digite lentamente no campo de telefone:

```
2 → (2
21 → (21
219 → (21) 9
2199 → (21) 99
21999 → (21) 999
219999 → (21) 9999
2199999 → (21) 99999
21999999 → (21) 99999-9
219999999 → (21) 99999-99
2199999999 → (21) 99999-999
21999999999 → (21) 99999-9999
```

✅ **Resultado esperado**: Máscara aplicada automaticamente

---

### 🎯 TESTE 3: Validação em Tempo Real

1. Preencha o campo **Nome** com "João Silva"
2. Clique fora do campo (blur)
3. ✅ **Resultado**: Campo fica com borda verde ✓

4. Limpe o campo **Nome** e saia
5. ✅ **Resultado**: Campo fica com borda vermelha ✗

6. Digite telefone válido: `(21) 98765-4321`
7. ✅ **Resultado**: Campo fica com borda verde ✓

---

### 🎯 TESTE 4: Envio do Formulário

**Preencha o formulário:**

```
Nome: João Silva
Telefone: (21) 98765-4321
E-mail: joao@teste.com
Bairro: Barra da Tijuca
Serviços: [X] Box para Banheiro [X] Sacada Envidraçada
Mensagem: Preciso de orçamento urgente
```

**Clique em "Solicitar Orçamento Grátis"**

✅ **Resultado esperado:**
1. Botão fica desabilitado
2. Texto muda para "Enviando..."
3. Aparece spinner no botão
4. Após 1-2 segundos:
   - Mensagem de sucesso verde aparece
   - Formulário é resetado
   - WhatsApp abre em nova aba com mensagem pré-preenchida

**Mensagem WhatsApp esperada:**
```
*Solicitação de Orçamento - Verly Vidraçaria*

*Nome:* João Silva
*Telefone:* (21) 98765-4321
*Bairro:* Barra da Tijuca
*E-mail:* joao@teste.com
*Serviços de Interesse:* Box para Banheiro, Sacada Envidraçada
*Mensagem:* Preciso de orçamento urgente

Enviado através do site verlyvidracaria.com
```

---

### 🎯 TESTE 5: Responsividade Mobile

**Desktop (> 768px):**
- ✅ Menu horizontal visível
- ✅ Formulário em 2 colunas
- ✅ Hero com 4 trust badges em linha
- ✅ Serviços em grid 3 colunas
- ✅ WhatsApp button 60x60px

**Mobile (≤ 768px):**
- ✅ Menu hamburger visível
- ✅ Formulário em 1 coluna
- ✅ Hero com trust badges em 2x2
- ✅ Serviços em 1 coluna
- ✅ WhatsApp button 56x56px

**Como testar:**
1. Abra DevTools (F12)
2. Clique no ícone de responsivo (Ctrl+Shift+M)
3. Teste em iPhone SE, iPhone 12 Pro, iPad, Desktop

---

### 🎯 TESTE 6: Botão WhatsApp Flutuante

1. ✅ Verifique que botão verde está fixo no canto inferior direito
2. ✅ Passe o mouse: deve ter efeito hover (aumenta)
3. ✅ Clique: deve abrir WhatsApp em nova aba
4. ✅ Scroll página: botão deve permanecer fixo
5. ✅ Verifique animação de pulsação contínua

**Link esperado:**
```
https://wa.me/5521987926578?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20vidra%C3%A7aria!
```

---

### 🎯 TESTE 7: Navegação e Smooth Scroll

1. Clique no menu "Serviços" → ✅ Deve rolar suavemente até #servicos
2. Clique no menu "Diferenciais" → ✅ Deve rolar até #diferenciais
3. Clique no menu "Depoimentos" → ✅ Deve rolar até #depoimentos
4. Clique no menu "Contato" → ✅ Deve rolar até #contato
5. Clique no CTA hero "Solicitar Orçamento" → ✅ Deve rolar até formulário

---

### 🎯 TESTE 8: CTAs e Links

**Hero:**
- ✅ "Solicitar Orçamento Grátis" → Rola para #contato
- ✅ "WhatsApp Direto" → Abre WhatsApp

**Menu:**
- ✅ "Orçamento Grátis" → Rola para #contato

**Footer:**
- ✅ Links de serviços → Rolam para #servicos
- ✅ Links de bairros → Apenas text (não são links)

---

### 🎯 TESTE 9: Console do Navegador

Abra DevTools (F12) e vá na aba **Console**:

✅ **Deve aparecer:**
```
Verly Vidraçaria - App initialized
Event tracked: page_view {event_category: 'engagement', event_label: 'Home Page'}
```

✅ **NÃO deve ter:**
- ❌ Erros em vermelho
- ❌ Warnings de JavaScript
- ❌ 404 de recursos

---

### 🎯 TESTE 10: Performance (Chrome DevTools)

1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Recarregue a página (Ctrl+R)

✅ **Métricas esperadas:**
- **Requests**: ~10-15 (poucos é melhor)
- **Transfer Size**: ~500KB-800KB
- **Load Time**: < 3 segundos (3G)
- **DOM Content Loaded**: < 1 segundo

---

### 🎯 TESTE 11: SEO e Meta Tags

**View Page Source** (Ctrl+U):

✅ **Verifique se existe:**
```html
<title>Vidraçaria Zona Oeste RJ | Orçamento em 2h | Box, Sacadas e Mais | Verly</title>
<meta name="description" content="...">
<script type="application/ld+json"> <!-- LocalBusiness -->
<script type="application/ld+json"> <!-- Service -->
<script type="application/ld+json"> <!-- FAQPage -->
```

---

### 🎯 TESTE 12: Google Analytics (Opcional)

Se tiver acesso ao Google Analytics:

1. Abra GA em tempo real
2. Acesse o site
3. ✅ Verifique evento `page_view`
4. Clique em um CTA
5. ✅ Verifique evento `cta_click`
6. Envie formulário
7. ✅ Verifique evento `form_submission`

---

## 🐛 Resolução de Problemas

### Problema: Formulário não envia

**Possíveis causas:**
1. API offline → ✅ **Solução**: Deve redirecionar para WhatsApp mesmo assim
2. JavaScript não carregou → ✅ **Solução**: Verifique se `js/app.js` existe
3. Console tem erros → ✅ **Solução**: Abra console e leia erro

### Problema: Máscara de telefone não funciona

**Possíveis causas:**
1. JavaScript não carregou → ✅ **Solução**: Recarregue página
2. Campo tem ID errado → ✅ **Solução**: Verifique se campo tem `id="phone"`

### Problema: WhatsApp não abre

**Possíveis causas:**
1. Popup bloqueado → ✅ **Solução**: Permita popups no navegador
2. Link malformado → ✅ **Solução**: Verifique URL no console

### Problema: Validação não funciona

**Possíveis causas:**
1. Cache do navegador → ✅ **Solução**: Hard reload (Ctrl+Shift+R)
2. JavaScript desabilitado → ✅ **Solução**: Habilite JavaScript

---

## 📱 Teste em Dispositivos Reais

### iOS (iPhone/iPad):

1. ✅ Font-size 16px previne zoom ao focar input
2. ✅ Teclado numérico aparece no campo telefone
3. ✅ WhatsApp abre corretamente
4. ✅ Smooth scroll funciona

### Android:

1. ✅ Máscara de telefone funciona
2. ✅ WhatsApp abre corretamente
3. ✅ Touch targets são grandes o suficiente (48px+)
4. ✅ Layout responsivo funciona

---

## ✅ Teste Final: Jornada Completa do Usuário

**Simule um cliente real:**

1. **Acesse o site**
   - Leia o hero
   - Veja os trust badges

2. **Explore os serviços**
   - Role até seção de serviços
   - Clique em um card
   - Veja hover effect

3. **Leia diferenciais**
   - Role até "Por que escolher"
   - Leia os 6 diferenciais

4. **Veja depoimentos**
   - Role até depoimentos
   - Leia 3 avaliações

5. **Preencha formulário**
   - Role até formulário
   - Preencha todos os campos
   - Marque 2-3 serviços
   - Clique "Solicitar Orçamento"

6. **Verifique redirecionamento**
   - Veja mensagem de sucesso
   - Aguarde 2 segundos
   - WhatsApp abre com mensagem

7. **Teste WhatsApp flutuante**
   - Role para qualquer lugar
   - Clique no botão verde
   - Confirme que abre WhatsApp

✅ **Resultado**: Jornada completa sem erros!

---

## 📊 Métricas de Sucesso

**Antes da refatoração:**
- Taxa de conversão: ~2-3%
- Bounce rate: ~60%
- Mobile usability: Regular

**Após refatoração (expectativa):**
- Taxa de conversão: ~5-7% 🎯
- Bounce rate: ~40% 🎯
- Mobile usability: Excelente 🎯
- Form completion: +30% 🎯

---

## 🎉 Testes Passaram? Próximos Passos:

1. ✅ Deploy para produção (gh-pages)
2. ✅ Configure Google Search Console
3. ✅ Monitore Google Analytics
4. ✅ Teste campanhas Google Ads
5. ✅ Colete feedback de usuários reais
6. ✅ Otimize com base em dados

**Boa sorte com as conversões! 🚀**


