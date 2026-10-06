import { execFileSync } from 'node:child_process';
import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site';
import neighborhoods from '../data/neighborhoods.json';

// Antes era public/sitemap.xml escrito à mão, com lastmod fixo de 2025-10-08 e as URLs
// com .html. Agora sai do mesmo JSON que gera as páginas de bairro: bairro novo entra
// no sitemap sem ninguém lembrar de editar um segundo arquivo.
//
// Fora de propósito: /obrigado (página de agradecimento, não é destino de busca),
// /avaliar (noindex) e 404/500.

// lastmod = data do último commit que mexeu nos arquivos que definem a página. Se o git
// não tem histórico (checkout raso), devolve null e o <lastmod> é omitido: uma data
// errada é pior que nenhuma, porque o Google deixa de confiar no campo.
function lastModified(...paths: string[]): string | null {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

// Todos os bairros compartilham o JSON e o template, então compartilham o lastmod:
// qualquer edição num bairro marca os 11. É uma aproximação, e a segura.
const bairroLastmod = lastModified('src/data/neighborhoods.json', 'src/pages/[slug].astro');

const entries: { path: string; lastmod: string | null }[] = [
  { path: '/', lastmod: lastModified('src/pages/index.astro') },
  { path: '/blog', lastmod: lastModified('src/pages/blog.astro') },
  ...neighborhoods.map((n) => ({ path: `/${n.slug}`, lastmod: bairroLastmod })),
];

export const GET: APIRoute = () => {
  const urls = entries
    .map(({ path, lastmod }) =>
      [
        '  <url>',
        `    <loc>${SITE_URL}${path}</loc>`,
        ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
        '  </url>',
      ].join('\n'),
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
