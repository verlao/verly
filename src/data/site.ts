// Dados que antes estavam repetidos em 17 arquivos HTML. Um lugar só.

export const SITE_URL = 'https://verlyvidracaria.com';

export const ANALYTICS = {
  ga4: 'G-GDQV6C1NWH',
  googleAds: 'AW-17336857529',
};

export const CONTACT = {
  mobile: '5521987926578',
  mobileDisplay: '(21) 98792-6578',
  landline: '+552134216066',
  landlineDisplay: '(21) 3421-6066',
  email: 'contato@verlyvidracaria.com',
  // Todo link de WhatsApp passa por wa.me. É ele que escolhe entre o app instalado,
  // o WhatsApp Web e a loja de aplicativos; apontar direto para web.whatsapp.com/send
  // manda quem não tem sessão ativa no navegador para uma tela de QR code, o que
  // custava o clique exatamente onde a intenção de compra era maior.
  // O sufixo do nome é a origem do clique, não a plataforma de destino.
  whatsappFooter:
    'https://wa.me/5521987926578?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento!',
  whatsappFloat:
    'https://wa.me/5521987926578?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20para%20vidra%C3%A7aria!',
  whatsappDirect:
    'https://wa.me/5521987926578?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20vidra%C3%A7aria!',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=R.+Gen.+Azeredo+218+Loja+C+Realengo+Rio+de+Janeiro+RJ+21765-000',
  address: {
    street: 'R. Gen. Azeredo, 218 - Loja C',
    line2: 'Realengo - Rio de Janeiro, RJ - 21765-000',
    locality: 'Realengo',
    region: 'RJ',
    postalCode: '21765-000',
    lat: -22.8814,
    lng: -43.4251,
  },
};

export const SERVICES = [
  'Box para Banheiro',
  'Sacadas Envidraçadas',
  'Guarda-corpos',
  'Portas e Janelas',
  'Espelhos',
  'Divisórias',
];

/** Opções do <select> do formulário — a ordem é a mesma do index atual. */
export const NEIGHBORHOOD_OPTIONS = [
  'Barra da Tijuca',
  'Recreio dos Bandeirantes',
  'Jacarepaguá',
  'Freguesia de Jacarepaguá',
  'Vargem Grande',
  'Vargem Pequena',
  'Campo Grande',
  'Realengo',
  'Pechincha',
  'Anil',
  'Gardênia Azul',
];

/** Subconjunto exibido no rodapé — agora com link para a página do bairro. */
export const FOOTER_NEIGHBORHOODS = [
  { slug: 'barra-da-tijuca', name: 'Barra da Tijuca' },
  { slug: 'recreio-dos-bandeirantes', name: 'Recreio dos Bandeirantes' },
  { slug: 'jacarepagua', name: 'Jacarepaguá' },
  { slug: 'campo-grande', name: 'Campo Grande' },
  { slug: 'vargem-grande', name: 'Vargem Grande' },
  { slug: 'realengo', name: 'Realengo' },
];
