# Plano de Analytics — Verly Vidraçaria

Propriedade GA4: `G-GDQV6C1NWH`. Google Ads: `AW-17336857529` (anúncios suspensos).
Sem GTM: `gtag` direto, configurado em `src/layouts/Base.astro:105-117`.

Este documento é para executar com o painel do GA4 aberto. Ele descreve o **estado final**
da instrumentação (page_view único, `page_type`/`neighborhood_page` em todo evento,
sem `timestamp`), não o estado atual em produção.

Complementa `GA4_TRACKING_GUIDE.md`, que lista os eventos mas não trata de registro de
dimensão nem de leitura — e é justamente o registro que hoje bloqueia todo insight:
**parâmetro não registrado é invisível em relatório**.

**Execute nesta ordem:** registrar as 15 dimensões (§2, ~15 min) → retenção 14 meses (§2)
→ marcar `generate_lead` como evento-chave (§3) → esperar dados → montar funil (§4) e as
4 explorações (§5) → religar o Ads por importação (§7). Antes de concluir qualquer coisa,
ler §6.

---

## 1. Inventário de eventos

Todos os eventos passam por `trackGA4Event` (`public/js/app.js:28`), **exceto** os três
emitidos direto por `gtag` em `whatsapp-cta.js` — marcados com ⚠, porque não recebem
`page_type`/`neighborhood_page` de graça.

| Evento | Arquivo:linha | Quando dispara | Parâmetros próprios (exemplo) | Cardinalidade |
|---|---|---|---|---|
| `page_view` | `Base.astro:113` | 1x por carregamento (`send_page_view: true`) | automáticos: `page_location`, `page_title`, `page_referrer` | baixa — 14 URLs (`/`, 11 `/<bairro>.html`, `/blog.html`, `/obrigado.html`) mais `/404.html` e `/500.html` |
| `session_start`, `first_visit`, `user_engagement` | GA4 automático | início de sessão / 1ª visita | — | — |
| `scroll` | `app.js:91` ← `:764` | cruza 25 / 50 / 75 / 100% | `percent_scrolled: 50`, `scroll_depth_threshold: 50`, `page_height: 9840`, `viewport_height: 844` | `percent_scrolled` baixa (4); `page_height`/`viewport_height` altas (numéricas) |
| `section_view` | `app.js:103` ← `:672` | 50% da seção visível, 1x por seção por pageview | `section_name: "Nossos Serviços"`, `section_id: "servicos"`, `scroll_position: 2140`, `time_on_page: 18` | `section_id` baixa (`servicos`, `diferenciais`, `depoimentos`, `contato`, `faq`); `section_name` instável (vem do `<h2>`); `scroll_position`/`time_on_page` altas |
| `cta_click` | `app.js:63` ← `:710` | clique em `.btn-primary` / `.btn-success` / `.btn-secondary` | `button_text: "Solicitar Orçamento Grátis"`, `button_location: "hero"` (`hero`\|`menu`\|`contact_form`\|`other`), `target_section: "#contato"`, `click_position_y: 0` | `button_text`/`button_location` baixas; `click_position_y` alta |
| `service_interaction` | `app.js:115` ← `:724` | clique em qualquer ponto de `.service-card` | `service_name: "Box para Banheiro"`, `service_position: 1`, `interaction_type: "click"` | baixa (6 cards) |
| `navigation_click` | `app.js:147` ← `:623`, `:732`, `:741`, `:825` | `.nav-link`, links do rodapé, âncoras `#`, toggle do menu mobile | `link_text: "Serviços"`, `link_target: "#servicos"`, `navigation_type: "menu"` (`menu`\|`footer`\|`internal_link`\|`mobile_menu_toggle`) | média (~30 combinações de texto/alvo) |
| `phone_click` | `app.js:136` ← `:750` | clique em `a[href^="tel:"]` | `phone_number: "+552134216066"` (número **da loja**), `click_location: "footer"` | baixa |
| `whatsapp_click` (A) | `app.js:126` ← `:701` | clique em `a[href*="wa.me"]` ou `.whatsapp-float` | `click_source: "floating_button"` (`floating_button`\|`hero_cta`\|`inline_button`), `has_pre_filled_message: true`, `message_length: 62` | baixa — **não tem `context`** |
| `whatsapp_click` (B) ⚠ | `whatsapp-cta.js:395` ← `:386` | **o mesmo clique** (listener delegado no `document`) | `context: "service-sacada"`, `button_text: "Pedir Orçamento"`, `device_type`, `browser`, `os` | `context` baixa (11 valores; ver §5.4) |
| `contact_link_click` ⚠ | `whatsapp-cta.js:420` | clique em `[data-track]` — 4 links do rodapé (`Footer.astro:62,67,72,78`) | `event_name: "footer_phone_click"`, `link_type: "tel"`, `link_text`, `device_type`, `browser`, `os` | baixa (4) |
| `page_view_with_device` ⚠ | `whatsapp-cta.js:374` | todo carregamento | `device_type: "Android"`, `browser: "Chrome"`, `os: "Android"`, `is_mobile: true` | baixa — **redundante**, ver §6 |
| `form_interaction` | `app.js:84` | 10 gatilhos, ver tabela abaixo | `form_name: "contact_form"`, `form_action: "field_focus"`, `field_name: "phone"`, `field_value_length: 15` (só quando há valor), `error_message: "Telefone inválido…"` (só em erro) | `form_action` baixa (10); `field_name` baixa (7: `name`, `phone`, `email`, `neighborhood`, `message`, `services`, `all_fields`) |
| `engagement_milestone` | `app.js:158` ← `:696` | 30s / 60s / 120s após `DOMContentLoaded` | `milestone_name: "time_60s"`, `milestone_value: 60` | baixa (3) |
| `generate_lead` | `app.js:508` | submit válido **e** resposta da API — inclusive quando a API falha | `lead_source: "contact_form"`, `services: "Box para Banheiro, Espelhos"`, `neighborhood: "Realengo"`, `api_status: "success"` (`success`\|`error`), `has_email: false`, `has_message: true` | `services` **alta** (até 255 combinações, até 127 caracteres); `neighborhood` baixa (11) |
| `conversion` (Ads) | `app.js:520` | **nunca hoje**: `ADS_CONVERSION_LABEL` é `''` (`app.js:17`) | `send_to`, `value: 1.0`, `currency: "BRL"` | — |
| `review_started` | `avaliar.astro` | primeira estrela escolhida, 1x por acesso | `rating: 5` | baixa (5) |
| `review_submitted` | `avaliar.astro` | 202 do `POST /reviews` | `rating: 5`, `photo_count: 3`, `photo_failures: 0`, `has_comment: true` | `rating` baixa; as contagens são numéricas |
| `review_failed` | `avaliar.astro` | erro da API ou de rede no envio | `error_message: "Link expirado"` | baixa |
| `review_link_invalid` | `avaliar.astro` | `?t=` ausente ou fora do formato | — | — |

Os quatro últimos só acontecem em `page_type = avaliar`, e essa página é `noindex`:
tráfego dela vem de link em conversa, nunca de busca. **A leitura que eles habilitam é
uma só, e é operacional, não de marketing:** quantos links enviados viram avaliação
(`review_started` ÷ `review_submitted` ÷ links criados no Telegram). Enquanto o volume
for de dezenas, leia contagem bruta — taxa em amostra desse tamanho não afirma nada
(§6c).

Valores de `form_action`, com a linha que os emite:

| `form_action` | Linha | Observação |
|---|---|---|
| `start` | `app.js:786` | primeiro focus em qualquer um dos 5 campos |
| `field_focus` | `app.js:789` | **todo** focus, não só o primeiro — contagem infla por pessoa |
| `field_blur` | `app.js:794` | passa o valor; sai só `field_value_length` |
| `field_complete` | `app.js:359` | campo válido e preenchido |
| `validation_error` | `app.js:349`, `:387` | `:387` é o bloco de serviços (`error_message: "Nenhum serviço selecionado"`) |
| `service_selected` | `app.js:804` | **único sinal dos 8 checkboxes**; `field_name` é sempre `services` |
| `submit_attempt` | `app.js:410` | antes de validar |
| `validation_failed` | `app.js:445` | submit barrado na validação |
| `submit_success` | `app.js:505` | dispara também quando a API falhou (`error_message: "API failed"`) |
| `submit_error` | `app.js:577` | exceção de rede |

Campos que emitem `field_focus`: `name`, `phone`, `email`, `neighborhood`, `message`
(`app.js:778`). **Os checkboxes de serviços não estão nessa lista** — consequência em §5.3.

Sem PII: `trackFormInteraction` recebe o valor do campo e emite apenas
`field_value_length` (`app.js:81`).

---

## 2. Dimensões personalizadas a registrar

Caminho exato: **Administrador** (engrenagem, canto inferior esquerdo) → **Exibição de
dados** → **Definições personalizadas** → aba **Dimensões personalizadas** → **Criar
dimensões personalizadas** → preencher *Nome da dimensão* (livre), *Escopo* = **Evento**,
*Parâmetro do evento* = o nome exato abaixo.
(Em inglês: Admin → Data display → Custom definitions → Custom dimensions.)

Registro **não é retroativo**: só aparece dado coletado a partir da criação. Registre
tudo hoje, mesmo o que só for usar depois. Limite da propriedade: 50 dimensões de escopo
de evento; a lista usa 15.

| Parâmetro | Escopo | Por que é necessária | Onde aparece depois |
|---|---|---|---|
| `page_type` | Evento | separa home / bairro / blog / obrigado / erro; é o denominador de quase toda leitura | filtro e detalhamento em todas as 4 explorações |
| `neighborhood_page` | Evento | bairro da **página** (origem do tráfego) | §5.1 (numerador e denominador) |
| `neighborhood` | Evento | bairro **declarado no formulário** — pode divergir da página | §5.1 (tabela C) |
| `services` | Evento | único registro do que o lead pediu | §5.2 (via filtro "contém") |
| `context` | Evento | identidade do CTA de WhatsApp | §5.4 |
| `click_source` | Evento | origem do `whatsapp_click` do `app.js` (o que **não** tem `context`) | §5.4; descartável quando o duplo disparo for eliminado |
| `form_action` | Evento | etapa do formulário — sem ela o funil do form não existe | §4, §5.3 |
| `field_name` | Evento | campo da etapa | §5.3 |
| `error_message` | Evento | qual validação barrou | §5.3 |
| `section_id` | Evento | seção vista, valor **estável** | §4 (etapa 2) |
| `button_location` | Evento | onde estava o botão do `cta_click` | §4, §5.4 |
| `button_text` | Evento | desambigua dois CTAs no mesmo `button_location` | §5.4 |
| `service_name` | Evento | card de serviço clicado | §5.2 (sinal de interesse) |
| `api_status` | Evento | separa lead salvo de lead com falha de API | §4 (etapa 6), §6 |
| `rating` | Evento | nota da avaliação (1-5); é o que separa elogio de reclamação | §1, eventos `review_*` |

**Zero dimensões de escopo de usuário.** Nada na instrumentação descreve atributo
persistente da pessoa. `neighborhood` é candidato, mas só existe no momento da conversão —
escopo de usuário não acrescentaria nada e gastaria uma das 25 vagas.

**Não registrar:** `page_location`, `page_title`, `page_referrer` (já são dimensões
automáticas); `device_type`, `browser`, `os`, `is_mobile`, `user_agent` (o GA4 já traz
Categoria do dispositivo / Navegador / SO); `timestamp` (será removido);
`scroll_position`, `time_on_page`, `click_position_y`, `page_height`, `viewport_height`,
`message_length`, `field_value_length`, `service_position`, `milestone_value` (numéricos —
se algum dia precisar, é **métrica** personalizada, não dimensão); `section_name` (texto do
`<h2>`: muda quando a copy muda e quebra o histórico — use `section_id`).

Enquanto estiver no Administrador, faça também: **Exibição de dados → Retenção de dados →
14 meses**. O padrão é 2 meses, e explorações não alcançam além da retenção.

---

## 3. Eventos-chave

**Administrador → Exibição de dados → Eventos** → chave "Marcar como evento principal".

| Evento | Marcar? | Por que |
|---|---|---|
| `generate_lead` | Sim — principal | é o único evento que corresponde a um pedido de orçamento identificado |
| `whatsapp_click` | Sim — secundário, **depois** de corrigir o disparo duplo | é intenção, não lead: o WhatsApp não devolve nada ao site |
| `phone_click`, `contact_link_click` | Não | volume baixo e mesma intenção do WhatsApp; viram ruído na contagem |

Consequência de marcar os dois: uma sessão que clica no WhatsApp **e** envia o formulário
conta **duas** "conversões". A métrica "Sessões com evento principal" não soma o dobro
(conta a sessão uma vez), mas "Contagem de eventos principais" soma. Como conviver:

- Use sempre a métrica **por evento nomeado** ("Taxa de eventos principais por sessão" com
  o evento escolhido no seletor), nunca o total agregado.
- Só `generate_lead` vai para o Google Ads (§7). Se `whatsapp_click` for importado, o
  Smart Bidding otimiza para cliques que podem nunca virar conversa.
- Discordância: **não marque `whatsapp_click` antes do fix do disparo duplo**. Dois ouvintes
  independentes (`app.js:701` e `whatsapp-cta.js:386`) disparam no mesmo clique, então a
  contagem de eventos principais sairia com o **dobro** dos cliques reais. Se marcar antes,
  leia só a métrica de **sessões** com o evento, que não duplica.

---

## 4. O funil

**Explorar → Exploração de funil.** Marque **"Tornar funil aberto"**.

| # | Etapa | Evento | Filtro exato |
|---|---|---|---|
| 1 | Chegou | `session_start` | nenhum |
| 2 | Viu os serviços | `section_view` | `section_id` exatamente `servicos` |
| 3 | Demonstrou intenção | `cta_click` **ou** `whatsapp_click` (condição OR na mesma etapa) | `cta_click`: `button_location` **diferente de** `contact_form` (o botão de envio é a etapa 5, não intenção); `whatsapp_click`: `context` **diferente de** `(não definido)`, senão o clique conta duas vezes |
| 4 | Começou o formulário | `form_interaction` | `form_action` exatamente `field_focus` |
| 5 | Pediu orçamento | `generate_lead` | nenhum |
| 6 | Confirmou | `page_view` | "Caminho da página e classe da tela" exatamente `/obrigado.html` |

Detalhamento sugerido: `page_type`. Segmento sugerido: sessões com `page_type = bairro`.

Três avisos sobre este funil, todos verificados no código:

- **Por isso o funil é aberto.** A etapa 3 pode acontecer **antes** da 2: o CTA de
  WhatsApp do hero (`src/pages/index.astro:47`) está acima da seção de serviços. Num funil
  fechado e ordenado, quem clica no hero é descartado, e o hero é o CTA mais exposto do site.
- **Etapa 5 → 6 perde gente por projeto.** `generate_lead` dispara mesmo quando a API
  falha (`app.js:508` com `api_status: "error"`), e nesse caminho o visitante vai para o
  WhatsApp, não para `/obrigado.html` (`app.js:549-571`). Para isolar, filtre a etapa 5 com
  `api_status = success`. Ainda assim há perda: o redirecionamento espera 1200 ms
  (`app.js:545`) e quem fecha a aba antes não gera o pageview.
- **Etapa 4 não cobre os checkboxes.** Ver §5.3.

---

## 5. As quatro explorações

O Explorar não calcula campo derivado. Onde a leitura é uma razão entre dois eventos, o
caminho executável é duas tabelas e a divisão numa planilha — ou a métrica "Taxa de eventos
principais por sessão", que só existe depois de §3.

### 5.1 Qual bairro converte

- **Pergunta:** onde vale anunciar, e qual página de bairro está recebendo visita e não
  entregando lead?
- **Tipo:** Exploração de formato livre (tabela).
- **Tabela A (denominador):** linhas `neighborhood_page`; métrica **Sessões**; filtro
  `page_type` exatamente `bairro`.
- **Tabela B (numerador):** linhas `neighborhood_page`; métrica **Contagem de eventos**;
  filtro Nome do evento exatamente `generate_lead`.
- **Atalho:** com `generate_lead` como evento-chave, uma única tabela com linhas
  `neighborhood_page` e métricas **Sessões** + **Taxa de eventos principais por sessão**
  resolve as duas.
- **Tabela C (contraste):** linhas `neighborhood` (declarado) x colunas `neighborhood_page`.
- **Segmentos:** nenhum. Segmentar por dispositivo aqui parte a amostra em dois.
- **Período:** 90 dias, sempre. Não leia por semana.
- **Como ler:** o resultado útil é a **ordem**, não o número. Aja quando o topo tiver ~10
  leads acumulados **e** for ≥2x o último. Bairro com tráfego e zero lead em 90 dias é o
  alvo de reescrita — conclusão mais segura que qualquer comparação de taxa, porque
  ausência de evento precisa de menos volume. A tabela C mostra demanda fora do conjunto de
  páginas: quem está em `/realengo.html` e declara bairro sem página é pauta de página nova.
- **Decide:** distribuição de orçamento do Ads por bairro; qual página de bairro reescrever.

### 5.2 Qual serviço puxa lead

- **Pergunta:** os 6 cards têm peso igual na página; têm peso igual na demanda?
- **Tipo:** formato livre.
- **Cardinalidade — leia antes de montar:** `services` é lista concatenada
  (`app.js:451` + `:509`). São até 255 combinações, e a string completa dos 8 serviços tem
  **127 caracteres**, acima do limite de 100 caracteres por valor de parâmetro do GA4 —
  seleções de 7 ou 8 serviços chegam **cortadas** e viram linhas espúrias. Detalhar por
  `services` produz uma tabela de combinações, não um ranking de serviços.
- **Como montar mesmo assim:** uma consulta **por serviço**, 8 no total. Métrica: Contagem
  de eventos; filtros: Nome do evento exatamente `generate_lead` **e** `services` **contém**
  o nome do serviço. A soma das 8 passa do total de leads — é esperado, cada linha é
  "% dos leads que citaram X", não uma partição.
- **Sinal de interesse (limpo, já disponível):** `service_interaction.service_name`
  (cliques nos 6 cards) e `whatsapp_click` com `context` começando em `service-` — por
  serviço, sem concatenação. Use-os para *interesse* e `generate_lead` para *demanda
  realizada*; divergência entre os dois é problema de card, não de demanda.
- **Como ler:** compare o ranking com a ordem dos cards. Serviço no topo da demanda e no fim
  da página é troca de ordem, custo zero. Achado da própria estrutura: o formulário oferece
  **8** serviços e a página tem **6** cards — `Janelas de Alumínio` e `Tampos de Mesa` não
  têm card. Se aparecerem bem no ranking, falta card.
- **Decide:** ordem e conteúdo dos cards; qual serviço merece página própria.
- **Follow-up de código (fora deste PR):** emitir um `service_selected` por checkbox com
  `service_name` singular. Hoje `app.js:804` manda a lista concatenada e só o
  `field_value_length` sobrevive — não dá para saber *qual* serviço marcou quem desistiu.
  Trocaria 8 consultas por um detalhamento.

### 5.3 Onde o formulário perde gente

- **Pergunta:** qual campo custa mais caro?
- **Tipo:** Exploração de funil, aberto, detalhamento `page_type`.

| # | Etapa | Filtro |
|---|---|---|
| 1 | `form_interaction` | `form_action` = `start` |
| 2 | `form_interaction` | `form_action` = `field_focus` e `field_name` = `name` |
| 3 | `form_interaction` | `form_action` = `field_focus` e `field_name` = `phone` |
| 4 | `form_interaction` | `form_action` = `field_focus` e `field_name` = `neighborhood` |
| 5 | `form_interaction` | `form_action` = `service_selected` |
| 6 | `form_interaction` | `form_action` = `submit_attempt` |
| 7 | `generate_lead` | — |

- **Correção à hipótese:** os 8 checkboxes **não emitem `field_focus`** — não estão na lista
  de `app.js:778`. Um funil de `field_focus` por `field_name` é cego para eles. O único sinal
  do bloco é `service_selected` (`app.js:804`), que só dispara quando **já** marcaram algo.
  O custo dos checkboxes se mede de duas formas indiretas: (a) queda da etapa 4 para a 5 —
  chegou no bairro e nunca marcou serviço; (b) tabela de formato livre com filtro
  `form_action` = `validation_error`, linhas `field_name` e `error_message`. Se
  `services` / `"Nenhum serviço selecionado"` (`app.js:387`) for a maior linha, a hipótese
  está confirmada.
- **Armadilha de contagem:** `field_focus` dispara em **todo** focus (`app.js:789`). Em
  funil (por usuário) não distorce; em Contagem de eventos, distorce — nunca compare
  `field_focus` com `field_complete` por contagem.
- **Como ler:** a maior queda percentual é o alvo, e só ela. Abaixo de ~30 inícios de
  formulário no período, leia só a **ordem** das etapas. Queda no `message` (opcional,
  último) não é problema.
- **Decide:** trocar os checkboxes obrigatórios por um `<select>` de serviço principal, ou
  tornar o bloco opcional. É a mudança de formulário com maior retorno esperado — e a única
  que este funil consegue julgar.

### 5.4 Qual CTA converte

- **Pergunta:** quais dos ~11 links de WhatsApp da home merecem existir?
- **Tipo:** formato livre. Linhas: `context`; colunas: `page_type`; métrica: Contagem de
  eventos. Filtro: Nome do evento exatamente `whatsapp_click`.
- **Filtro obrigatório:** `context` **diferente** de `(não definido)`. Motivo: o mesmo
  clique dispara `whatsapp_click` duas vezes, por dois ouvintes independentes
  (`app.js:701-707` e `whatsapp-cta.js:386-408`), e só o segundo carrega `context`.
  Filtrando, cada clique conta uma vez e o número volta a ser clique.
- **Valores de `context` que existem:** `floating-button` (`Base.astro:153`),
  `sticky-cta` (`whatsapp-cta.js:253`), `footer-whatsapp` (`Footer.astro:62`),
  `thank-you-page` (`obrigado.astro:32`), `service-*` (6 valores, `whatsapp-cta.js:318`),
  e `unknown`.
- **Limite de leitura:** `unknown` é a soma de **três** CTAs sem `data-context` — hero da
  home (`index.astro:47`), faixa do meio (`index.astro:166`) e hero das páginas de bairro
  (`[slug].astro:69`). Quebrar por `page_type` separa o de bairro dos dois da home, mas não
  separa hero de faixa. O CTA mais exposto do site é o que hoje não se consegue ler.
  Follow-up de código: `data-context` nesses três links.
- **Exposição, não popularidade:** o flutuante fica oculto em três situações
  (`whatsapp-cta.js:116`) e a sticky só aparece após 30% de rolagem
  (`whatsapp-cta.js:269`). Volume baixo nesses dois pode significar "não estava na tela" —
  compare cada CTA com a própria série no tempo, não com os outros.
- **Como ler:** zero clique em 4 semanas com tráfego confirmado = remover. Diferença entre
  CTAs vivos precisa de ~30 cliques por CTA para valer discussão.
- **Decide:** quais CTAs cortar. Onze links de WhatsApp numa página é muito, e todos
  competem pelo mesmo clique.

---

## 6. Limites e armadilhas

**(a) Hoje é marco zero.** Os parâmetros sempre estiveram no payload, mas o GA4 descarta em
relatório o que não está registrado, e o registro não é retroativo. Não existe recorte
histórico por `context`, `neighborhood`, `services` ou `form_action` — nem em exploração,
nem em relatório padrão. Uma exceção: o **export para BigQuery** guarda todo parâmetro,
registrado ou não. Não verifiquei se existe export nesta propriedade (não tenho acesso ao
painel). Se existir, o histórico bruto é recuperável por SQL; se não, vincule agora
(**Administrador → Vinculações de produtos → BigQuery**) — é o único jeito de nunca mais
perder parâmetro por falta de registro.

**(b) O `page_view` duplicado.** Valeu para todo o período anterior
(`Base.astro:113` + `app.js:693`). O efeito é mais específico do que "tudo pela metade":

| Métrica histórica | Distorcida? |
|---|---|
| Usuários, Sessões, `session_start` | Não — evento separado |
| Visualizações | Sim, ~2x |
| Qualquer taxa com **visualizações** no denominador | Sim, ~metade do valor real |
| Taxa de conversão por **sessão** ou por **usuário** | Não |
| **Sessões com engajamento / Taxa de engajamento** | Sim, inflada — o GA4 considera engajada a sessão com ≥2 visualizações, e toda sessão tinha 2. O histórico dessa métrica beira 100% e não serve para nada |
| Tendência (subiu/caiu) de qualquer uma delas | Não — o fator é constante no período |

Ou seja: comparar meses entre si continua válido; comparar valor absoluto de antes com
depois do fix, não.

**(c) Volume.** Não medi o tráfego atual do site — os números abaixo são estatística, não
dado da Verly. Vidraçaria de bairro tem tráfego baixo, e isso limita o que cada exploração
pode afirmar:

| Situação | Intervalo de confiança 95% da taxa | Leitura |
|---|---|---|
| 2 leads em 40 sessões | 1,4% – 16,5% | não diz nada |
| 5 leads em 100 sessões | 2,2% – 11,2% | ordem de grandeza, nada mais |
| 10 leads em 200 sessões | 2,7% – 9,0% | dá para comparar com um extremo oposto |
| 30 leads em 600 sessões | 3,5% – 7,0% | dá para acompanhar variação |

Regra prática por exploração: **§5.1** precisa de ~10 leads por bairro acumulados
(provavelmente 90 dias, não uma semana); **§5.2**, ~10 leads citando o serviço;
**§5.3**, ~30 inícios de formulário para ler percentuais e ~100 para comparar dois campos;
**§5.4**, ~30 cliques por CTA — mas "zero clique" precisa de muito menos.

O que **não** fazer com amostra pequena: relatório semanal de taxa por bairro; remover card
de serviço com base numa semana; teste A/B de copy — detectar 5% contra 10% com 80% de poder
exige ~432 sessões **por variante**, o que provavelmente nunca acontece por bairro. Trate os
rankings como prior para decidir, não como prova, e prefira sempre a decisão que se apoia em
ausência de evento (ninguém clica, ninguém marca) à que depende de diferença de taxa.

Duas armadilhas de painel: com **Sinais do Google** ativos, o GA4 suprime linhas de poucos
usuários e a tabela de bairros pode esconder exatamente o bairro que você quer ver — em
propriedade de baixo volume, não ative. E `section_view` é 1x por seção por pageview: taxa
de "quem viu serviços" é por pageview, não por pessoa.

**(d) Ruído a limpar (follow-up de código, não deste PR).** `page_view_with_device`
(`whatsapp-cta.js:374`) duplica em todo carregamento dados que o GA4 já coleta — remover.
O evento `scroll` custom (`app.js:91`) colide com o `scroll` automático da Medição
avançada, que dispara a 90%: o mesmo nome de evento passa a ter `percent_scrolled` de
25/50/75/**90**/100 misturados — ou renomeie para `scroll_depth`, ou desligue o `scroll` em
**Administrador → Fluxos de dados → Medição avançada**. E `contact_link_click` tem um
parâmetro chamado `event_name` (`whatsapp-cta.js:421`), que no painel colide de nome com a
dimensão "Nome do evento" — renomear para `link_id`. Por fim, o link de WhatsApp do rodapé
tem `data-context` **e** `data-track` (`Footer.astro:62`): um clique gera três eventos
(`whatsapp_click` x2 + `contact_link_click`).

---

## 7. Ads, quando religar

Hoje **nenhuma** conversão chega ao Ads: `ADS_CONVERSION_LABEL` é `''` (`app.js:17`) e o
bloco de `app.js:518-528` cai no `else` que só loga. O `gtag('config', ads)` de
`Base.astro:116` continua carregando a tag. Não é sinal errado, é sinal nenhum.

Ao religar, não preencha o label. Faça a importação:

1. GA4: **Administrador → Vinculações de produtos → Vínculos com o Google Ads → Vincular**.
2. Ads: **Objetivos → Conversões → Resumo → Nova ação de conversão → Importar → Google
   Analytics 4 → Web** → selecione `generate_lead`.
3. Ads, na ação importada: **Contagem = "Uma"** (não "Todas"). `generate_lead` pode
   disparar duas vezes se a pessoa enviar o formulário duas vezes.
4. Só então remova de `app.js` as constantes `ADS_CONVERSION_ID`/`ADS_CONVERSION_LABEL`
   (`:16-17`) e o bloco `:518-528`.

Por que assim: o label hardcoded exige deploy por ação de conversão e falha em silêncio
quando está vazio — foi exatamente o que aconteceu. Importando, Ads e GA4 leem o **mesmo**
evento e não podem divergir: uma instrumentação, não duas.

Importe **só** `generate_lead`. Não importe `whatsapp_click`: o lance automático
otimizaria para um clique que o site não consegue confirmar como conversa.

Sobre valor de conversão: `app.js:522` manda `value: 1.0` fixo. Ao importar, deixe sem
valor até existir ticket médio medido. Valor inventado é pior que valor ausente — o lance
automático acredita nele.
