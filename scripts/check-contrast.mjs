// Verifica contraste WCAG dos pares texto/fundo que a página realmente usa.
//
// Existe porque a v1 servia o CTA principal com 2.54:1 — o botão mais importante
// do site era o de rótulo menos legível, e nada no processo pegava isso.
// Lê os tokens direto do CSS, então não há uma segunda fonte de verdade para
// desatualizar.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Os tokens e o guard de literais cobrem todo stylesheet sob src/styles/. A lista vem
// do diretório para que um arquivo CSS novo entre na verificação sem alterar o script.
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const STYLES_DIR = join(ROOT, 'src/styles');
const findStylesheets = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return findStylesheets(fullPath);
    if (!entry.isFile() || !entry.name.endsWith('.css')) return [];
    return [{
      path: relative(ROOT, fullPath),
      content: readFileSync(fullPath, 'utf8'),
    }];
  });
const STYLESHEETS = findStylesheets(STYLES_DIR)
  .sort((a, b) => a.path.localeCompare(b.path));
const CSS = STYLESHEETS
  .map(({ content }) => content)
  .join('\n');

const tokens = Object.fromEntries(
  [...CSS.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]])
);

const srgb = (c) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [rótulo, token do texto, token do fundo, é texto grande?]
const PAIRS = [
  ['CTA primário (botão do orçamento)', 'cta-text', 'cta', false],
  ['CTA primário — hover', 'cta-text', 'cta-dark', false],
  ['Botão WhatsApp', 'whatsapp-text', 'whatsapp', false],
  ['Botão WhatsApp — hover', 'whatsapp-text', 'whatsapp-dark', false],
  ['Botão primário', 'white', 'primary', false],
  ['Botão primário — hover', 'white', 'primary-dark', false],
  ['Hero: texto sobre o início do gradiente', 'white', 'primary', true],
  ['Hero: subtítulo sobre o fim do gradiente', 'white', 'secondary', false],
  ['Corpo de texto', 'gray', 'white', false],
  ['Títulos', 'dark', 'white', false],
  ['Estrelas de avaliação', 'star', 'white', false],
  ['Marca — nome no cabeçalho', 'primary', 'white', false],
  ['Marca — descritor "Vidraçaria"', 'secondary', 'white', false],
  // Componentes de whatsapp-cta.css. Repetem pares já cobertos acima de propósito: o
  // que interessa aqui é o relatório NOMEAR o componente, porque foram estes dois que
  // erraram na prática.
  ['Barra sticky — botão', 'whatsapp-text', 'whatsapp', false],
  ['Barra sticky — texto de apoio', 'gray', 'white', false],
  ['Card de serviço — botão em repouso', 'dark', 'white', false],
  ['Card de serviço — botão em hover', 'whatsapp-text', 'whatsapp', false],
];

const MIN = { normal: 4.5, large: 3.0 };
let failed = 0;

console.log('Contraste WCAG AA dos pares em uso:\n');
for (const [label, fg, bg, isLarge] of PAIRS) {
  if (!tokens[fg] || !tokens[bg]) {
    console.error(`✗ ${label}: token ausente (--${fg} / --${bg})`);
    failed++;
    continue;
  }
  const r = ratio(tokens[fg], tokens[bg]);
  const need = isLarge ? MIN.large : MIN.normal;
  const ok = r >= need;
  if (!ok) failed++;
  console.log(
    `${ok ? '✓' : '✗'} ${label.padEnd(42)} ${tokens[fg]} sobre ${tokens[bg]}  ${r.toFixed(2)}:1  (mínimo ${need})`
  );
}

// A salienciância do CTA não é só legibilidade: se ele se separa do fundo apenas
// por matiz, some em escala de cinza e para quem tem daltonismo. A v1 dava 1.45:1.
const pop = ratio(tokens['cta'], tokens['primary']);
const POP_MIN = 2.5;
console.log(
  `\n${pop >= POP_MIN ? '✓' : '✗'} Separação de luminância CTA vs hero: ${pop.toFixed(2)}:1 (mínimo ${POP_MIN})`
);
if (pop < POP_MIN) failed++;

// A tabela acima só enxerga o que passa pelos tokens. O defeito real foi outro: dois
// componentes escreveram o verde da marca em hex, então nenhum par aqui os descrevia e o
// CI passava verde com um rótulo de 1,98:1 no ar. Este guard fecha essa porta.
const WHATSAPP_LITERALS = /#25d366|#128c7e/gi;
const violations = STYLESHEETS.flatMap(({ path, content }) => {
  const declarations = content
    // Sem os comentários: eles CITAM os hex antigos para registrar por que saíram, e um
    // guard que proíbe explicar o defeito empurra a explicação para fora do arquivo.
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // A declaração do próprio token é a fonte de verdade, não um uso que a contorna.
    .replace(/--whatsapp:\s*[^;]+;/gi, '');
  const literals = [...declarations.matchAll(WHATSAPP_LITERALS)].map((m) => m[0]);
  return literals.length ? [{ path, literals: [...new Set(literals)] }] : [];
});
// rgba() de sombra é aceitável — cor de sombra não é par texto/fundo. Hex é que não.
if (violations.length) {
  const details = violations
    .map(({ path, literals }) => `  ${path}: ${literals.join(', ')}`)
    .join('\n');
  console.error(
    `\n✗ Stylesheet escreve o verde da marca em hex:\n${details}` +
      `\n  Use var(--whatsapp) / var(--whatsapp-dark) com var(--whatsapp-text), senão o par` +
      `\n  texto/fundo fica fora desta verificação — foi assim que 1,98:1 chegou à produção.`
  );
  failed++;
} else {
  console.log('\n✓ Nenhum verde de marca em hex nos stylesheets');
}

if (failed) {
  console.error(`\n${failed} verificação(ões) de contraste falharam.`);
  process.exit(1);
}
console.log('\nTodos os pares passam.');
