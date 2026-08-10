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
  /** Mesmo horário que o rodapé e o LocalBusiness já publicam — 8h às 18h, Seg-Sáb. */
  hoursDisplay: 'Seg a Sáb, 8h às 18h',
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
    // Coordenadas do próprio perfil do Google da loja. As anteriores (-22.8814,
    // -43.4251) erravam por ~700 m e iam publicadas no `geo` do LocalBusiness: o site
    // afirmava, em dado estruturado, uma localização onde a loja não está.
    lat: -22.8855432,
    lng: -43.4305539,
  },
};

/**
 * Avaliações do Google Business Profile da loja. Snapshot de 10/08/2026:
 * 15 avaliações, todas 5 estrelas.
 *
 * Antes daqui saíam 4,8★ e 127 avaliações — números herdados do site antigo, sem
 * nenhuma fonte. Agora só entra aqui o que o perfil do Google mostra: nada de
 * estimativa, arredondamento ou "mais de".
 *
 * A CONTAGEM não vai para a tela, por decisão do dono: quinze é número pequeno
 * demais para vender, a nota é que vende. Ela sobrevive em `reviewCount` porque o
 * aggregateRating do schema.org exige o campo — quem abrir o código-fonte lê 15, e
 * isso é melhor que publicar um número que ninguém consegue conferir.
 */
export const GOOGLE_REVIEWS = {
  /** Formato do schema.org — ponto decimal. */
  ratingValue: '5.0',
  reviewCount: '15',
  /** Formato pt-BR, para a tela. */
  ratingDisplay: '5,0',
  /**
   * Perfil da loja no Google, por CID — a única forma de link que veio do próprio
   * Google (o link curto do perfil resolve para o feature ID 0x9bdf66871be8a1:
   * 0x42ffd6f49e486b21, e 0x42ffd6f49e486b21 = 4827813671680371489).
   *
   * É o que torna a nota conferível: sem ele, "5,0★" é mais uma afirmação sem fonte,
   * que é exatamente o problema que este arquivo existe para não repetir. NÃO trocar
   * por Place ID derivado nem por URL de busca do Maps — `CONTACT.mapsUrl` é busca por
   * endereço, cai no mapa e não no perfil, então não serve aqui.
   */
  profileUrl: 'https://maps.google.com/?cid=4827813671680371489',
  /** Data em que as avaliações foram lidas no perfil. É o que ancora os "há N semanas". */
  snapshotDate: '10/08/2026',
  /**
   * Os três depoimentos exibidos na home, escolhidos para cobrir promessas
   * DIFERENTES do site (rapidez, canal de WhatsApp e preço, box blindex) em vez de
   * repetir o mesmo elogio três vezes.
   *
   * `text` é copiado como o cliente escreveu, incluindo pontuação e concordância:
   * corrigir a fala de alguém é reescrevê-la, e aí ela deixa de ser dele. `age` é o
   * "há quanto tempo" que o Google exibia na data do snapshot — por isso a data do
   * snapshot fica visível na seção, senão o rótulo envelhece calado.
   */
  featured: [
    {
      author: 'Marcos Leite',
      age: 'há 1 semana',
      text: 'Excelente atendimento. Foram muito solícitos e educados. Resolveram meu problema no mesmo dia. Eu indico!',
    },
    {
      author: 'Daniel Santos',
      age: 'há 3 semanas',
      text: 'Atendimento excelente e rápido, ótimo suporte pelo whatsapp, instalação fácil e preço bom para os padrões do mercado. Recomendo demais',
    },
    {
      author: 'Luciene Lima',
      age: 'há 23 semanas',
      text: 'Gostei muito do serviço da loja. Blindex do box do banheiro muito bem instalado. Ótimo custo benefício. Indico!',
    },
  ],
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
