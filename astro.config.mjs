// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://verlyvidracaria.com',
  // As páginas hoje são /realengo.html e ranqueiam nessas URLs. O default do Astro
  // ('directory') emitiria /realengo/ e derrubaria o que já está indexado.
  build: { format: 'file' },
  compressHTML: true,
});
