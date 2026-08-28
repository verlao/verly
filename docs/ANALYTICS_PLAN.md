# Plano de Analytics — Verly Vidraçaria

Propriedade GA4: `G-GDQV6C1NWH`. Google Ads: `AW-17336857529` (anúncios suspensos).
Sem GTM: `gtag` direto, configurado em `src/layouts/Base.astro:105-117`.

Este documento é para executar com o painel do GA4 aberto. Ele descreve o **estado final**
da instrumentação (page_view único, `page_type`/`neighborhood_page` em todo evento,
sem `timestamp`), não o estado atual em produção.

`GA4_TRACKING_GUIDE.md` é o contrato operacional resumido; este plano detalha registro e
leitura. **Parâmetro não registrado é invisível em relatório**.

**Execute nesta ordem:** registrar as 14 dimensões (§2, ~15 min) → retenção 14 meses (§2)
→ marcar `generate_lead` como evento-chave (§3) → esperar dados → montar funil (§4) e as
4 explorações (§5) → religar o Ads por importação (§7). Antes de concluir qualquer coisa,
ler §6.

---

## 1. Inventário de eventos

**Todos** os eventos passam por `trackGA4Event` (`public/js/app.js`), inclusive os de
`whatsapp-cta.js` — que hoje chamam `ctaTrack` → `window.VerlyAnalytics.track`, o mesmo
enriquecedor. Um lugar só carimba `page_type`/`neighborhood_page`, um lugar só decide se o
log aparece, e não há evento que escape da segmentação.

| Evento | Arquivo:linha | Quando dispara | Parâmetros próprios (exemplo) | Cardinalidade |
|---|---|---|---|---|
| `page_view` | `Base.astro` | 1x por carregamento (`send_page_view: true`) | automáticos: `page_location`, `page_title`, `page_referrer` | baixa — 17 URLs: home, 11 bairros, avaliação, blog, obrigado, 404 e 500 |
| `session_start`, `first_visit`, `user_engagement` | GA4 automático | início de sessão / 1ª visita | — | — |
| `scroll_depth` | `app.js` | cruza 25 / 50 / 75 / 100% | `percent_scrolled: 50`, `page_height: 9840`, `viewport_height: 844` | `percent_scrolled` baixa (4); `page_height`/`viewport_height` altas (numéricas). **Nome próprio para não colidir com o `scroll` automático do GA4, que dispara a 90%** |
| `section_view` | `app.js` | 50% da seção visível, 1x por seção por pageview | `section_name: "Nossos Serviços"`, `section_id: "servicos"`, `scroll_position: 2140`, `time_on_page: 18` | `section_id` baixa (`servicos`, `trabalhos`, `diferenciais`, `depoimentos`, `contato`, `faq`); `section_name` instável (vem do `<h2>`); `scroll_position`/`time_on_page` altas |
| `cta_click` | `app.js:63` ← `:710` | clique em `.btn-primary` / `.btn-success` / `.btn-secondary` | `button_text: "Solicitar Orçamento Grátis"`, `button_location: "hero"` (`hero`\|`menu`\|`contact_form`\|`other`), `target_section: "#contato"`, `click_position_y: 0` | `button_text`/`button_location` baixas; `click_position_y` alta |
| `service_interaction` | `app.js` | clique em qualquer ponto de `.service-card` | `service_name: "Box para Banheiro"`, `service_position: 1`, `interaction_type: "click"` | inclui os 6 cards da home, os 6 serviços e os 5 motivos de cada bairro; não usar como ranking até restringir o seletor em tarefa própria |
| `navigation_click` | `app.js:147` ← `:623`, `:732`, `:741`, `:825` | `.nav-link`, links do rodapé, âncoras `#`, toggle do menu mobile | `link_text: "Serviços"`, `link_target: "#servicos"`, `navigation_type: "menu"` (`menu`\|`footer`\|`internal_link`\|`mobile_menu_toggle`) | média (~30 combinações de texto/alvo) |
| `phone_click` | `app.js:136` ← `:750` | clique em `a[href^="tel:"]` | `phone_number: "+552134216066"` (número **da loja**), `click_location: "footer"` | baixa |
| `whatsapp_impression` | `whatsapp-cta.js` (`IntersectionObserver`) | CTA fica realmente visível — **1x por combinação `context` + `service` por pageview** | `context: "service-card"`, `service: "guarda-corpo"`, `click_source`, `button_text` | `context` identifica origem; `service` identifica o serviço canônico |
| `whatsapp_click` | `whatsapp-cta.js` (listener delegado no `document`) | clique real em qualquer link de WhatsApp — **um** por clique | os mesmos parâmetros da impressão | `context` não incorpora mais serviço; handoffs são `form-fallback`/`form-error` |
| `contact_link_click` | `whatsapp-cta.js` | clique em `[data-track]` — **2** links do rodapé, e-mail e endereço (`Footer.astro:78,84`); WhatsApp e telefone saem como os próprios eventos | `link_id: "footer_email_click"`, `link_type: "mailto"`, `link_text` | baixa (2) |
| `form_interaction` | `app.js:84` | 10 gatilhos, ver tabela abaixo | `form_name: "contact_form"`, `form_action: "field_focus"`, `field_name: "phone"`, `field_value_length: 15` (só quando há valor), `error_message: "Telefone inválido…"` (só em erro) | `form_action` baixa (10); `field_name` baixa (7: `name`, `phone`, `email`, `neighborhood`, `message`, `services`, `all_fields`) |
| `engagement_milestone` | `app.js:158` ← `:696` | 30s / 60s / 120s após `DOMContentLoaded` | `milestone_name: "time_60s"`, `milestone_value: 60` | baixa (3) |
| `lead_submit_attempt` | `app.js` | payload válido está prestes a ser enviado à API | `lead_source: "contact_form"`, `services: "box,espelhos"`, `services_count: 2`, `neighborhood: "Realengo"`, `has_email`, `has_message` | denominador de entrega; nenhum parâmetro contém PII |
| `generate_lead` | `app.js` | API confirmou aceitação (`2xx`) no envio em primeiro plano | os parâmetros de `lead_submit_attempt` + `api_status: "success"`, `delivery_attempts` | conversão confirmada; nunca sai para erro HTTP ou de rede |
| `lead_recovered` | `app.js` | fila local foi aceita pela API em `online` ou novo page load | `lead_source`, `recovery_reason`, `delivery_attempts`, `queued_seconds` | desfecho distinto porque não foi confirmado no submit original |
| `conversion` (Ads) | `app.js:520` | **nunca hoje**: `ADS_CONVERSION_LABEL` é `''` (`app.js:17`) | `send_to`, `value: 1.0`, `currency: "BRL"` | — |
| `review_started` | `avaliar.astro` | primeira estrela escolhida, 1x por acesso | `rating: 5` | baixa (5) |
| `review_submitted` | `avaliar.astro` | 202 do `POST /reviews` | `rating: 5`, `photo_count: 3`, `photo_failures: 0`, `has_comment: true` | `rating` baixa; as contagens são numéricas |
| `review_failed` | `avaliar.astro` | erro da API ou de rede no envio | `error_message: "Link expirado"` | baixa |
| `review_link_invalid` | `avaliar.astro` | `?t=` ausente ou fora do formato | — | — |
| `review_validation_error` | `avaliar.astro` | tentativa de envio sem nota | `error_message` | baixa |

Os quatro últimos só acontecem em `page_type = avaliar`, e essa página é `noindex`:
tráfego dela vem de link em conversa, nunca de busca. **A leitura que eles habilitam é
uma só, e é operacional, não de marketing:** quantos links enviados viram avaliação
(`review_started` ÷ `review_submitted` ÷ links criados no Telegram). Enquanto o volume
for de dezenas, leia contagem bruta — taxa em amostra desse tamanho não afirma nada
(§6d).

Valores de `form_action`, com a linha que os emite:

| `form_action` | Linha | Observação |
|---|---|---|
| `start` | `app.js` | primeiro focus em qualquer campo, incluindo o grupo `services`; **1x por formulário por pageview** |
| `field_focus` | `app.js:789` | **todo** focus, não só o primeiro — contagem infla por pessoa |
| `field_blur` | `app.js:794` | passa o valor; sai só `field_value_length` |
| `field_complete` | `app.js:359` | campo válido e preenchido |
| `validation_error` | `app.js` | campo obrigatório ou formato inválido; serviços são opcionais e não emitem este erro |
| `service_selected` | `app.js` | dispara a cada marcação; `field_name` é sempre `services` |
| `submit_attempt` | `app.js:410` | antes de validar |
| `validation_failed` | `app.js:445` | submit barrado na validação |
| `submit_success` | `app.js` | tentativa HTTP concluída; use `generate_lead` para aceite real |
| `submit_error` | `app.js` | falha de rede |

Campos que emitem `field_focus`: `name`, `phone`, `email`, `neighborhood`, `message` e
**`services`** — o bloco dos 8 checkboxes conta como UM campo, e o vaivém entre checkboxes
vizinhos não gera focus novo (senão `services` inflaria até 8x contra os outros campos e a
comparação do funil perderia sentido).

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
| `context` | Evento | origem estável do CTA de WhatsApp | §5.4 |
| `service` | Evento | slug canônico do serviço, independente da origem card/galeria/bairro | §5.2 e §5.4 |
| `click_source` | Evento | categoria de origem de `whatsapp_click` e `whatsapp_impression` | §5.4 |
| `form_action` | Evento | etapa do formulário — sem ela o funil do form não existe | §4, §5.3 |
| `field_name` | Evento | campo da etapa | §5.3 |
| `error_message` | Evento | qual validação barrou | §5.3 |
| `section_id` | Evento | seção vista, valor **estável** | §4 (etapa 2) |
| `button_location` | Evento | onde estava o botão do `cta_click` | §4, §5.4 |
| `button_text` | Evento | desambigua dois CTAs no mesmo `button_location` | §5.4 |
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
`<h2>`: muda quando a copy muda e quebra o histórico — use `section_id`); `api_status`
(constante em `generate_lead`); `service_name` (o seletor atual também inclui motivos dos
bairros; aguarde a tarefa que restringirá `service_interaction`).

Enquanto estiver no Administrador, faça também: **Exibição de dados → Retenção de dados →
14 meses**. O padrão é 2 meses, e explorações não alcançam além da retenção.

---

## 3. Eventos-chave

**Administrador → Exibição de dados → Eventos** → chave "Marcar como evento principal".

| Evento | Marcar? | Por que |
|---|---|---|
| `generate_lead` | Sim — principal | é o único evento que corresponde a um pedido aceito pela API |
| `whatsapp_click` | Sim — secundário | é handoff real, mas ainda intenção: o WhatsApp não devolve confirmação de conversa ao site |
| `phone_click`, `contact_link_click` | Não | volume baixo e mesma intenção do WhatsApp; viram ruído na contagem |

Consequência de marcar os dois: uma sessão que clica no WhatsApp **e** envia o formulário
conta **duas** "conversões". A métrica "Sessões com evento principal" não soma o dobro
(conta a sessão uma vez), mas "Contagem de eventos principais" soma. Como conviver:

- Use sempre a métrica **por evento nomeado** ("Taxa de eventos principais por sessão" com
  o evento escolhido no seletor), nunca o total agregado.
- Só `generate_lead` vai para o Google Ads (§7). Se `whatsapp_click` for importado, o
  Smart Bidding otimiza para cliques que podem nunca virar conversa.
- O fallback do formulário só emite `whatsapp_click` quando a pessoa clica no link
  "Continuar no WhatsApp". Renderizar o link, ou uma falha da API por si só, não é conversão.

---

## 4. O funil

**Explorar → Exploração de funil.** Marque **"Tornar funil aberto"**.

| # | Etapa | Evento | Filtro exato |
|---|---|---|---|
| 1 | Chegou | `session_start` | nenhum |
| 2 | Viu os serviços | `section_view` | `section_id` exatamente `servicos` |
| 3 | Demonstrou intenção | `cta_click` **ou** `whatsapp_click` (condição OR na mesma etapa) | `cta_click`: `button_location` **diferente de** `contact_form` (o botão de envio é a etapa 5, não intenção) |
| 4 | Começou o formulário | `form_interaction` | `form_action` exatamente `start` |
| 5 | Pediu orçamento | `generate_lead` | nenhum |
| 6 | Confirmou | `page_view` | "Caminho da página e classe da tela" exatamente `/obrigado.html` |

Detalhamento sugerido: `page_type`. Segmento sugerido: sessões com `page_type = bairro`.

Três avisos sobre este funil, todos verificados no código:

- **Por isso o funil é aberto.** A etapa 3 pode acontecer **antes** da 2: o CTA de
  WhatsApp do hero (`src/pages/index.astro:47`) está acima da seção de serviços. Num funil
  fechado e ordenado, quem clica no hero é descartado, e o hero é o CTA mais exposto do site.
- **Etapa 5 → 6 ainda pode perder gente.** `generate_lead` já significa API aceita, mas o
  redirecionamento espera 1200 ms; quem fecha a aba antes não gera o pageview de
  `/obrigado.html`.
- **Etapa 4 cobre os checkboxes.** O primeiro foco em `services` também inicia o formulário.

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
- **Cardinalidade — leia antes de montar:** `services` é lista deduplicada de **slugs
  canônicos** (`box-banheiro`, `sacada`, `guarda-corpo`, `portas-janelas`, `espelho`,
  `divisoria`, `tampo-mesa`). Mesmo com todas as opções, o valor fica abaixo do limite
  de 100 caracteres do GA4.
  Continua sendo combinação, então detalhar por `services` dá uma tabela de combinações e
  não um ranking de serviços — mas já não estoura os 100 caracteres do GA4, que era o que
  cortava justamente a seleção maior, o lead mais valioso.
- **Como montar:** uma consulta **por serviço**. Métrica: Contagem de eventos;
  filtros: Nome do evento exatamente `generate_lead` **e** `services` **contém** o *slug*
  (não o nome exibido). Os slugs foram escolhidos para que nenhum seja pedaço de outro, o
  que é o que torna o "contém" confiável. A soma das 8 passa do total de leads — esperado,
  cada linha é "% dos leads que citaram X", não uma partição.
  Atalho para ranking grosseiro sem 8 consultas: `services_count` responde "quantos
  serviços por lead", que é outra pergunta, mas de graça.
- **Sinal de interesse limpo:** filtre `whatsapp_click` por `service` exatamente igual ao
  slug. O mesmo `guarda-corpo` sai do card da home, do card de bairro e da galeria; use
  `context` (`service-card` ou `service-gallery`) apenas para quebrar por origem.
- **Como ler:** compare o ranking com a ordem dos cards. Serviço no topo da demanda e no fim
  da página é troca de ordem, custo zero. Achado da própria estrutura: o formulário oferece
  **8** serviços e a página tem **6** cards — `Janelas de Alumínio` e `Tampos de Mesa` não
  têm card. Se aparecerem bem no ranking, falta card.
- **Decide:** ordem e conteúdo dos cards; qual serviço merece página própria.
- **Tentado e descartado:** um evento por serviço, que trocaria as 8 consultas por um
  detalhamento. Medindo o envio real, um lead com os 8 serviços emite 8 eventos no mesmo
  instante, o gtag os junta num lote e **o lote perde eventos** — 3 dos 8 se perderam no
  caminho de sucesso, que redireciona 1,2 s depois. Oito consultas chatas valem mais que uma
  contagem que perde evento sem avisar.

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

- **O bloco opcional de serviços é mensurável direto.** Ele emite `field_focus` com
  `field_name = services`, então cabe uma etapa própria no funil, entre a 4 e a 5:
  `form_action` = `field_focus` e `field_name` = `services`. A queda dessa etapa para
  `service_selected` é literalmente "olhou as 8 opções e não marcou nenhuma" — antes esse
  abandono não deixava rastro; não trate a queda como erro de validação.
- **Confirmação independente:** tabela de formato livre com filtro `form_action` =
  `validation_error`, linhas `field_name` e `error_message`. `services` não deve aparecer:
  o bloco é opcional.
- **Armadilha de contagem:** `field_focus` dispara em **todo** focus (`app.js:789`). Em
  funil (por usuário) não distorce; em Contagem de eventos, distorce — nunca compare
  `field_focus` com `field_complete` por contagem.
- **Como ler:** a maior queda percentual é o alvo, e só ela. Abaixo de ~30 inícios de
  formulário no período, leia só a **ordem** das etapas. Queda no `message` (opcional,
  último) não é problema.
- **Decide:** simplificar, reordenar ou retirar opções quando o volume sustentar a leitura.

### 5.4 Qual CTA converte

- **Pergunta:** quais origens de CTA da home merecem existir?
- **Tipo:** duas tabelas de formato livre, ambas com linhas `context` e colunas
  `page_type`. Na primeira, filtre Nome do evento = `whatsapp_impression`; na segunda,
  Nome do evento = `whatsapp_click`. Divida cliques por impressões fora do GA4.
- **Por que a impressão é o denominador:** sticky só fica visível após 30% de rolagem,
  flutuante recua quando seria redundante/obstruiria conteúdo e CTAs de serviço só entram
  no viewport com scroll. Contagem bruta de clique mistura atratividade com exposição.
- **Cardinalidade:** cada combinação `context` + `service` emite no máximo uma impressão
  por pageview, mesmo se o CTA sair e voltar ao viewport.
- **Valores de `context`:** `floating-button`, `sticky-cta`, `footer-whatsapp`,
  `thank-you-page`, `hero-whatsapp`, `cta-band`, `avaliar-link-invalido`,
  `service-card`, `service-gallery` e os handoffs `form-fallback`/`form-error`.
  Para comparar serviços, use a dimensão `service`, nunca extraia sufixo de `context`.
- **Como ler:** zero clique com impressões confirmadas é candidato a remoção. Diferença
  entre CTAs vivos ainda precisa de ~30 cliques por CTA para valer discussão.
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

**(b) Há uma quebra semântica no deploy deste plano.** Nenhum nome de evento foi
renomeado, mas comparar séries atravessando o deploy mistura definições diferentes:

- `generate_lead` mantinha esse nome desde aproximadamente 2026-08-10, porém incluía
  erro HTTP e erro de rede. Depois do deploy, só inclui aceite `2xx`. O emissor de
  `generate_lead` nos caminhos de falha foi **retirado**.
- `whatsapp_click` também mantém o nome. O emissor sintético do fallback — executado antes
  de um `window.open` por timer — foi **retirado**; depois do deploy o evento exige clique
  real em link. `form_fallback`/`form_error` continuam como valores de `context`, agora
  apenas quando houve handoff.
- `form_interaction` + `form_action=start` mantém nome e parâmetros, mas passa de até um
  evento por campo para exatamente um por formulário/pageview.
- `lead_submit_attempt` e `whatsapp_impression` são novos. `lead_recovered` mantém o
  significado existente.
- No deploy da taxonomia, `context` deixa de fundir origem e serviço. `service-*` e
  `gallery-*` convergem em `service-card`/`service-gallery`; o novo parâmetro `service`
  carrega o slug canônico. `form_fallback`/`form_error` viram
  `form-fallback`/`form-error`. Use esse deploy como novo corte para relatórios por CTA.

Registro de dimensão personalizada **não é retroativo** (§2), e correção de código também
não reescreve evento histórico. Para qualquer taxa afetada, use o deploy como corte e não
some os dois períodos como se fossem uma série homogênea.

**(c) O `page_view` duplicado.** Valeu para todo o período anterior
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

**(d) Volume.** Não medi o tráfego atual do site — os números abaixo são estatística, não
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

**(e) Ruído a limpar — resolvido em código, uma coisa sobra para o painel.**

| ruído | estado |
|---|---|
| `page_view_with_device` duplicando em todo carregamento | ✅ removido |
| `contact_link_click` com parâmetro `event_name`, que colide com a dimensão nativa "Nome do evento" | ✅ virou `link_id` |
| WhatsApp do rodapé com `data-context` **e** `data-track`: um clique = 3 eventos | ✅ um clique = um evento, escolhido por especificidade |
| `page_view` duplicado (`Base.astro` + `app.js`) | ✅ sobrou o automático |
| `timestamp` em todo evento, gastando cota de dimensão | ✅ removido |
| `services` cortando em 100 caracteres na seleção grande | ✅ virou lista de slugs + `services_count` |
| `form_interaction.start` saindo uma vez por campo | ✅ uma vez por formulário/pageview |
| `generate_lead` contando falha de API/rede | ✅ só aceite `2xx`; tentativa virou `lead_submit_attempt` |
| fallback emitindo `whatsapp_click` antes de `window.open` | ✅ clique real no link de handoff |

⚠️ **O que sobra é seu, e é no painel:** o evento `scroll` **automático** da Medição
avançada dispara a 90%. O do site agora se chama `scroll_depth` (25/50/75/100), então os
dois não se misturam mais — mas o automático continua existindo e vai aparecer na lista de
eventos. Não confunda um com o outro ao montar relatório; se preferir só um, desligue em
**Administrador → Fluxos de dados → Medição avançada**.

Uma tentação medida e **descartada**: emitir um evento por serviço marcado, em vez do
filtro "`services` contém o slug". Medindo o envio real, um lead com os 8 serviços emite 8
eventos no mesmo instante, o gtag os agrupa num lote e **o lote perde eventos** — 3 dos 8
se perderam no caminho de sucesso, que redireciona 1,2 s depois. Contagem que perde evento
em silêncio é pior que filtro "contém". Ver `app.js` (`SERVICE_SLUGS`).

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
