// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://verlyvidracaria.com',
  // 'file' emite dist/realengo.html, e o GitHub Pages serve esse arquivo em /realengo E
  // em /realengo.html. A URL pública e canônica é a SEM .html; a com .html continua
  // respondendo para quem já a tem salva e aponta o canonical para a limpa. O default do
  // Astro ('directory') emitiria dist/realengo/index.html, servido em /realengo/ — a
  // barra final daria 404 nos links já indexados.
  build: { format: 'file' },
  compressHTML: true,
});
