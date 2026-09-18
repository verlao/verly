import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(ROOT, 'dist');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SERVICE_CONTEXTS = new Set(['service-card', 'service-gallery']);

const walkHtml = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walkHtml(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  });

const contentType = (path) => ({
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}[extname(path)] || 'application/octet-stream');

const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const requested = resolve(DIST, `.${pathname}`);
  if (requested !== DIST && !requested.startsWith(`${DIST}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const body = readFileSync(requested);
    response.writeHead(200, { 'content-type': contentType(requested) }).end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolveListening) => server.listen(0, '127.0.0.1', resolveListening));
const { port } = server.address();

/**
 * Navegador ÚNICO; o paralelismo sai de contextos, não de processos. Um contexto por
 * página mantém o isolamento que o `--user-data-dir` novo a cada dump dava (é o que
 * garante, por exemplo, que o guard de sessão de `whatsapp_impression` não vaze entre
 * páginas), sem pagar quatro Chromes.
 *
 * Falha aqui é FALHA, nunca "nada a verificar": sem navegador o gate não tem como
 * afirmar coisa alguma sobre o DOM final.
 */
let browser;
try {
  browser = await chromium.launch();
} catch (error) {
  await new Promise((resolveClose) => server.close(resolveClose));
  console.error('✗ Chromium do playwright não abriu; rode `npx playwright install chromium`.');
  console.error(`  ${error.message}`);
  process.exit(1);
}

/**
 * POR QUE NAVEGADOR DE VERDADE E NÃO `chrome --dump-dom --virtual-time-budget`
 *
 * O que este gate valida é o DOM DEPOIS da injeção de whatsapp-cta.js, e a versão
 * anterior media isso com um ORÇAMENTO DE RELÓGIO: `--virtual-time-budget=1000`
 * manda o Chrome serializar quando o tempo virtual acaba, que é um instante SEM
 * relação nenhuma com o fim da injeção. Resultado medido no MESMO commit: 154 links
 * numa execução, 151 na seguinte. Os três que somem são justamente a sticky das
 * páginas cujo ÚNICO link injetado é ela (404, 500, blog, obrigado) — nas páginas com
 * cartão de serviço a amostra prematura levaria sete de uma vez.
 *
 * `waitUntil: 'load'` é sinal, não tempo. `init()` é chamado no DOMContentLoaded e é
 * SÍNCRONO de ponta a ponta (sticky, cartões de serviço, flutuante), então quando
 * `load` dispara TODA a injeção já aconteceu — por especificação, não por sorte.
 *
 * Os pedidos para fora de 127.0.0.1 são abortados. A folha de estilo da fonte é
 * `render-blocking` no <head>, e enquanto ela está pendente o Chrome NÃO EXECUTA os
 * scripts seguintes: com ela no caminho, o momento da amostra passava a depender da
 * rede do Google. Abortar não afrouxa nada — o que se valida é markup nosso, local.
 */
const TIMEOUT_MS = 30_000;

const dumpDom = async (page) => {
  const context = await browser.newContext();
  context.setDefaultTimeout(TIMEOUT_MS);
  await context.route('**/*', (route) => {
    const url = route.request().url();
    return url.startsWith(`http://127.0.0.1:${port}/`) ? route.continue() : route.abort();
  });

  const tab = await context.newPage();
  try {
    await tab.goto(`http://127.0.0.1:${port}/${relative(DIST, page)}`, {
      waitUntil: 'load',
      timeout: TIMEOUT_MS,
    });
    return await tab.content();
  } finally {
    await context.close();
  }
};

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];

/**
 * Página que ENCAMINHA não tem taxonomia para conferir — e, pior, não tem DOM final:
 * `/avaliar.html` traz `<meta http-equiv="refresh" content="0; …">` para o perfil do
 * Google, então o navegador sai dela antes de qualquer amostra e o que sobra é um
 * documento sem `<body data-…>`. Antes desta exceção o gate acusava "registro ausente"
 * numa página que está CORRETA.
 *
 * A checagem é no ARQUIVO, não no DOM renderizado, justamente porque o DOM já é o da
 * outra URL. E é anunciada na saída: exceção que não aparece é exceção que cresce.
 */
const forwards = (page) => /<meta[^>]+http-equiv="refresh"/i.test(readFileSync(page, 'utf8'));

const allPages = walkHtml(DIST).sort();
const forwarded = allPages.filter(forwards);
const pages = allPages.filter((page) => !forwarded.includes(page));

/**
 * O DOM que falhou é o único artefato que responde POR QUE falhou, e a versão anterior
 * o descartava — é por isso que a falha que motivou esta mudança ficou sem explicação.
 * Só em falha, para não encher o disco do runner em build verde.
 */
const saveDom = (pageName, html) => {
  const saved = join(mkdtempSync(join(tmpdir(), 'verly-analytics-')), pageName.split(sep).join('_'));
  writeFileSync(saved, html);
  return `${pageName}: DOM final salvo em ${saved}`;
};

const failures = [];
let checkedLinks = 0;

try {
  // Quatro abas reduzem o tempo sem pressionar demais o runner do CI.
  for (let offset = 0; offset < pages.length; offset += 4) {
    const batch = pages.slice(offset, offset + 4);
    const doms = await Promise.all(batch.map(dumpDom));

    batch.forEach((page, index) => {
      const html = doms[index];
      const pageName = relative(DIST, page);
      const failuresBefore = failures.length;
      const body = html.match(/<body\b[^>]*>/i)?.[0] || '';
      const contexts = new Set((attr(body, 'data-whatsapp-contexts') || '').split(',').filter(Boolean));
      const services = new Set((attr(body, 'data-service-slugs') || '').split(',').filter(Boolean));

      if (!contexts.size || !services.size) {
        failures.push(`${pageName}: registro de contextos/serviços ausente no <body>`);
        failures.push(saveDom(pageName, html));
        return;
      }

      const links = [...html.matchAll(/<a\b[^>]*>/gi)]
        .map(([tag]) => tag)
        .filter((tag) => /(?:wa\.me|whatsapp)/i.test(attr(tag, 'href') || ''));
      checkedLinks += links.length;

      links.forEach((tag, linkIndex) => {
        const location = `${pageName} link WhatsApp #${linkIndex + 1}`;
        const context = attr(tag, 'data-context');
        const service = attr(tag, 'data-service');

        if (!context) {
          failures.push(`${location}: data-context ausente`);
        } else if (!SLUG.test(context)) {
          failures.push(`${location}: context "${context}" fora da convenção [a-z0-9-]`);
        } else if (!contexts.has(context)) {
          failures.push(`${location}: context desconhecido "${context}"`);
        }

        if (service !== undefined) {
          if (!SLUG.test(service)) {
            failures.push(`${location}: service "${service}" fora da convenção [a-z0-9-]`);
          } else if (!services.has(service)) {
            failures.push(`${location}: service desconhecido "${service}"`);
          }
        }

        if (SERVICE_CONTEXTS.has(context) && !service) {
          failures.push(`${location}: context "${context}" exige data-service`);
        }
      });

      if (failures.length > failuresBefore) failures.push(saveDom(pageName, html));
    });
  }
} catch (error) {
  failures.push(`Chrome não conseguiu renderizar o dist: ${error.message}`);
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}

if (failures.length) {
  console.error('✗ Taxonomia de WhatsApp inválida no DOM final:');
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(`✓ Taxonomia de WhatsApp: ${checkedLinks} links em ${pages.length} páginas renderizadas`);
if (forwarded.length) {
  console.log(
    `  (${forwarded.length} encaminhada${forwarded.length > 1 ? 's' : ''}, sem DOM próprio para conferir: ${forwarded
      .map((page) => relative(DIST, page))
      .join(', ')})`
  );
}
