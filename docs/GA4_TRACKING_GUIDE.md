# Guia operacional de tracking GA4

Este documento descreve o contrato atual da instrumentação da Verly. Para registrar
dimensões, montar explorações e respeitar os cortes históricos, use também
`ANALYTICS_PLAN.md`.

- Medição GA4: `G-GDQV6C1NWH`
- Implementação: `gtag` direto, sem GTM
- Emissor comum: `trackGA4Event` em `public/js/app.js`
- Contexto de página: `page_type` em todo evento e `neighborhood_page` nos bairros
- PII: nome, telefone, e-mail, mensagem e hashes desses valores nunca vão ao GA4

## Eventos

| Evento | Quando sai | Parâmetros próprios principais |
|---|---|---|
| `page_view` | carregamento, pelo `gtag('config')` | automáticos + `page_type`, `neighborhood_page` quando aplicável |
| `scroll_depth` | 25%, 50%, 75% e 100% | `percent_scrolled`, alturas |
| `section_view` | 50% de qualquer `section[id]` visível | `section_id`, `section_name`, posição, tempo |
| `cta_click` | `.btn-primary`, `.btn-success`, `.btn-secondary` | `button_text`, `button_location`, alvo |
| `service_interaction` | clique em `.service-card` | nome exibido, posição, tipo |
| `navigation_click` | menu, rodapé e navegação interna | texto, alvo, tipo |
| `phone_click` | link `tel:` | número da loja, localização |
| `contact_link_click` | e-mail ou endereço com `data-track` | `link_id`, tipo, texto |
| `whatsapp_impression` | CTA de WhatsApp realmente visível | `context`, `service` opcional, `click_source`, texto |
| `whatsapp_click` | clique real em link de WhatsApp | mesmos parâmetros da impressão |
| `form_interaction` | foco, blur, validação e submit | `form_action`, `field_name`, comprimentos/erro quando existem |
| `lead_submit_attempt` | payload válido antes da entrega | serviços canônicos, contagem e booleanos; sem PII |
| `generate_lead` | API aceitou o lead (`2xx`) | mesmos dados da tentativa + resultado técnico |
| `lead_recovered` | fila local foi aceita depois | motivo, tentativas e idade da fila |
| `engagement_milestone` | 30, 60 e 120 segundos | marco e valor |
| `review_*` | fluxo da página de avaliação | nota/contagens/erro conforme o desfecho |

`service_interaction` ainda seleciona também os cards de motivos dos bairros. Não use
`service_name` para ranking até o seletor ser restringido em uma tarefa própria. Para
interesse por serviço, use `whatsapp_click.service`.

## WhatsApp: origem e serviço são dimensões separadas

`context` responde **de onde veio o CTA**. `service` responde **qual serviço foi pedido**.
Um valor nunca incorpora o outro.

Exemplos:

```javascript
{
  context: 'service-card',
  service: 'guarda-corpo',
  click_source: 'inline_button'
}
```

```javascript
{
  context: 'service-gallery',
  service: 'guarda-corpo',
  click_source: 'inline_button'
}
```

As duas linhas somam em `service = guarda-corpo`; `context` permite comparar card e foto.
CTAs genéricos não enviam `service`.

Valores aceitos de `context`:

- `floating-button`
- `footer-whatsapp`
- `sticky-cta`
- `hero-whatsapp`
- `service-card`
- `service-gallery`
- `cta-band`
- `thank-you-page`
- `avaliar-link-invalido`
- `form-fallback`
- `form-error`

Slugs canônicos de serviço:

- `box-banheiro`
- `sacada`
- `guarda-corpo`
- `portas-janelas`
- `espelho`
- `divisoria`
- `portao-aluminio`
- `vidro-temperado`
- `tampo-mesa`

A fonte única desses slugs é `SERVICE_TAXONOMY` em `src/data/site.ts`. Card da home,
card de bairro, galeria e formulário recebem a identidade a partir dela. Alterar copy não
altera o slug.

`whatsapp_impression` deduplica por combinação `context + service` por pageview. Isso
evita que seis cards com `context = service-card` colapsem em uma única impressão.

## Formulário

Os campos obrigatórios são nome e telefone. E-mail, bairro, serviços e mensagem são
opcionais.

`services` em eventos de lead é uma lista deduplicada dos mesmos slugs canônicos usados
por WhatsApp. Portas de vidro e janelas de alumínio pertencem à família
`portas-janelas`; marcar as duas opções não repete o slug. O texto enviado à API e ao
WhatsApp continua usando os rótulos visíveis.

`generate_lead` só significa aceite `2xx`. Falha HTTP ou de rede pode exibir um link de
handoff; `whatsapp_click` só sai se a pessoa clicar nesse link. Os contextos desses
handoffs são `form-fallback` e `form-error`.

## Depuração

Para liberar logs locais:

```text
?analytics_debug=1
```

ou:

```javascript
localStorage.setItem('verly_debug', '1')
```

Isso apenas libera `console.log`; não ativa o DebugView. Para DebugView, conecte o domínio
em `tagassistant.google.com`, abra **Administrador → Exibição de dados → DebugView** e
confira o evento e seus parâmetros.

No navegador, a prova bruta fica em **DevTools → Network**, filtro `collect`, requisição
`g/collect`. Confira o nome do evento e os parâmetros, sem esperar que o console mostre
eventos quando o modo local está desligado.

## Guard de build

`npm run build` gera o site e depois abre todas as páginas HTML do `dist` em Chrome
headless. A checagem usa o DOM final, portanto inclui sticky e botões de serviço criados
em runtime.

O build falha quando:

- um link de WhatsApp não tem `data-context`;
- `context` ou `service` contém acento, `_`, maiúscula ou separador inválido;
- o valor não pertence ao registro gerado por `src/data/site.ts`;
- `service-card` ou `service-gallery` não traz `data-service`.

O guard descobre todas as páginas `*.html` recursivamente; não mantém uma lista de nomes.
Em máquina sem Chrome no caminho padrão, defina `CHROME_PATH`.

## Corte histórico

Não misture períodos anteriores e posteriores ao deploy desta taxonomia em uma mesma
série por `context`:

- contextos `service-*` convergiram para `service-card`;
- contextos `gallery-*` convergiram para `service-gallery`;
- o serviço passou ao parâmetro `service`;
- `form_fallback` e `form_error` viraram `form-fallback` e `form-error`.

O registro de dimensão personalizada não é retroativo. Registre `context` e `service`
antes de iniciar o novo baseline.
