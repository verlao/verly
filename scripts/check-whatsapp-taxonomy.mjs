import { accessSync, constants, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, extname, join, relative, resolve, sep } from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

const executable = (path) => {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const chromeCandidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

for (const directory of (process.env.PATH || '').split(sep)) {
  chromeCandidates.push(join(directory, 'google-chrome'));
  chromeCandidates.push(join(directory, 'google-chrome-stable'));
  chromeCandidates.push(join(directory, 'chromium'));
}

const chrome = chromeCandidates.find((candidate) => existsSync(candidate) && executable(candidate));
if (!chrome) {
  console.error('✗ Chrome/Chromium não encontrado; defina CHROME_PATH para validar o DOM final.');
  process.exit(1);
}

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

const dumpDom = (page) => new Promise((resolveDump, rejectDump) => {
  const profile = mkdtempSync(join(tmpdir(), 'verly-analytics-'));
  execFile(chrome, [
    '--headless',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--disable-background-networking',
    '--dump-dom',
    '--virtual-time-budget=1000',
    `--user-data-dir=${profile}`,
    `http://127.0.0.1:${port}/${relative(DIST, page)}`,
  ], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 30_000 }, (error, stdout) => {
    rmSync(profile, { recursive: true, force: true });
    if (error) rejectDump(error);
    else resolveDump(stdout);
  });
});

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];
const pages = walkHtml(DIST).sort();
const failures = [];
let checkedLinks = 0;

try {
  // Quatro navegadores reduzem o tempo sem pressionar demais o runner do CI.
  for (let offset = 0; offset < pages.length; offset += 4) {
    const batch = pages.slice(offset, offset + 4);
    const doms = await Promise.all(batch.map(dumpDom));

    batch.forEach((page, index) => {
      const html = doms[index];
      const pageName = relative(DIST, page);
      const body = html.match(/<body\b[^>]*>/i)?.[0] || '';
      const contexts = new Set((attr(body, 'data-whatsapp-contexts') || '').split(',').filter(Boolean));
      const services = new Set((attr(body, 'data-service-slugs') || '').split(',').filter(Boolean));

      if (!contexts.size || !services.size) {
        failures.push(`${pageName}: registro de contextos/serviços ausente no <body>`);
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
    });
  }
} catch (error) {
  failures.push(`Chrome não conseguiu renderizar o dist: ${error.message}`);
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}

if (failures.length) {
  console.error('✗ Taxonomia de WhatsApp inválida no DOM final:');
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(`✓ Taxonomia de WhatsApp: ${checkedLinks} links em ${pages.length} páginas renderizadas`);
