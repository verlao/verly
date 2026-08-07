// Verifica contraste WCAG dos pares texto/fundo que a página realmente usa.
//
// Existe porque a v1 servia o CTA principal com 2.54:1 — o botão mais importante
// do site era o de rótulo menos legível, e nada no processo pegava isso.
// Lê os tokens direto do CSS, então não há uma segunda fonte de verdade para
// desatualizar.
import { readFileSync } from 'node:fs';

const CSS = readFileSync(new URL('../src/styles/index-inline.css', import.meta.url), 'utf8');

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

if (failed) {
  console.error(`\n${failed} verificação(ões) de contraste falharam.`);
  process.exit(1);
}
console.log('\nTodos os pares passam.');
