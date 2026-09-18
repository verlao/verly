// Dados que antes estavam repetidos em 17 arquivos HTML. Um lugar só.

export const SITE_URL = 'https://verlyvidracaria.com';

/**
 * Base do verly-service. O formulário de orçamento tem a URL dele literal em
 * `public/js/app.js` (`LEAD_ENDPOINT`), que é script de /public e não pode importar
 * daqui — por isso a duplicação existe e fica anotada em vez de escondida. Quem
 * mudar o host precisa mudar nos dois lugares.
 */
export const API_BASE = 'https://api.verlyvidracaria.com/verly-service';

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
  /**
   * Same wa.me pattern, origin tag "contact section": the inline anchor at the top
   * of #contato needs its own message so a click from there is distinguishable from
   * the footer/float/hero ones in the funnel report.
   */
  whatsappContact:
    'https://wa.me/5521987926578?text=Ol%C3%A1%2C%20vim%20pela%20se%C3%A7%C3%A3o%20de%20contato%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento!',
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
 * 4,6 com 19 avaliações, lidas no perfil em 17/09/2026.
 *
 * Antes daqui saíam 4,8★ e 127 avaliações — números herdados do site antigo, sem
 * nenhuma fonte. Depois saíram 5,0★ e 15, que pareciam conferidos e NÃO eram: 15 é a
 * LINHA DE 5 ESTRELAS DO HISTOGRAMA, não o total, e 5,0 era a média só desse
 * subconjunto. O histograma real é 15×5★, 2×4★, 1×3★, 0×2★, 1×1★ = 19 avaliações,
 * média 4,6. O site afirmou 5,0 por cinco semanas com o link do perfil ao lado
 * desmentindo em um clique — o oposto do que este arquivo existe para fazer.
 *
 * LIÇÃO: ao reler o perfil, copiar a nota e o total do CABEÇALHO do perfil. A linha de
 * cinco estrelas do histograma é a armadilha, porque o número dela é grande e a nota
 * dela é redonda.
 *
 * A CONTAGEM não vai para a tela, por decisão do dono: dezenove é número pequeno
 * demais para vender, a nota é que vende. Ela não sobrevive em `reviewCount` porque o
 * `aggregateRating` saiu do schema — ver LocalBusinessSchema.astro.
 */
export const GOOGLE_REVIEWS = {
  /** Formato pt-BR, para a tela. É o único formato usado: o schema.org não recebe mais
      a nota, então não existe mais uma segunda grafia para divergir desta. */
  ratingDisplay: '4,6',
  /** Total de avaliações do perfil. Fora da tela por decisão do dono; fica aqui para
      quem reler o perfil poder comparar e ver se mudou. */
  ratingCount: 19,
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
  /**
   * Destino de QUEM VAI ESCREVER uma avaliação: é para cá que /avaliar.html manda.
   *
   * Separado de `profileUrl` de propósito, mesmo com o MESMO valor hoje. Aquele aparece
   * em seis lugares como PROVA (ir ver as avaliações que existem); este é CONVITE
   * (escrever uma). Prova e convite não são o mesmo ato, e o dia em que o destino do
   * convite melhorar, os seis usos de prova não podem ir junto por acidente.
   *
   * O melhor destino é o link de "escrever avaliação" que o painel do Google gera
   * (formato `g.page/r/…/review`), que abre o formulário direto em vez de largar o
   * cliente no perfil procurando o botão. Enquanto ele não estiver em mãos, o perfil
   * funciona e é conferível — e a troca depois é ESTA linha, só ela.
   */
  reviewUrl: 'https://maps.google.com/?cid=4827813671680371489',
  /** Data em que a nota e o total foram lidos no perfil. Os "há N semanas" NÃO dependem
      mais dela: cada depoimento carrega a própria data. Ela continua visível na seção
      porque a NOTA é que continua sendo um snapshot. */
  snapshotDate: '17/09/2026',
  /**
   * Os três depoimentos exibidos na home, escolhidos para cobrir promessas
   * DIFERENTES do site (rapidez, canal de WhatsApp e preço, box blindex) em vez de
   * repetir o mesmo elogio três vezes.
   *
   * `text` é copiado como o cliente escreveu, incluindo pontuação e concordância:
   * corrigir a fala de alguém é reescrevê-la, e aí ela deixa de ser dele.
   *
   * `publishedAt` substituiu o antigo `age`, que era o rótulo relativo LITERAL do
   * Google ("há 1 semana"). String literal de tempo envelhece calada: em 17/09/2026 o
   * site ainda dizia "há 1 semana" numa avaliação que o Google já exibia como "um mês
   * atrás". Agora a data é absoluta e quem formata é `idadeRelativa`, o mesmo cálculo
   * das avaliações vindas do link — uma regra de tempo no projeto, não duas.
   *
   * ⚠️ As datas são DERIVADAS do rótulo relativo do snapshot de 10/08/2026 (1, 3 e 23
   * semanas antes), então têm precisão de poucos dias, não de dia exato. Conferem com o
   * que o Google exibe hoje ("um mês", "um mês", "6 meses"). Quando a leitura do perfil
   * for automatizada, o `publishTime` real substitui estas três.
   */
  featured: [
    {
      author: 'Marcos Leite',
      publishedAt: '2026-08-03',
      text: 'Excelente atendimento. Foram muito solícitos e educados. Resolveram meu problema no mesmo dia. Eu indico!',
    },
    {
      author: 'Daniel Santos',
      publishedAt: '2026-07-20',
      text: 'Atendimento excelente e rápido, ótimo suporte pelo whatsapp, instalação fácil e preço bom para os padrões do mercado. Recomendo demais',
    },
    {
      author: 'Luciene Lima',
      publishedAt: '2026-03-02',
      text: 'Gostei muito do serviço da loja. Blindex do box do banheiro muito bem instalado. Ótimo custo benefício. Indico!',
    },
  ],
};

/**
 * Taxonomia canônica de serviços usada por cards, galeria, formulário e analytics.
 *
 * `slug` é identidade de relatório, não copy. Uma origem diferente (card/foto/página
 * local) continua apontando para o mesmo slug; a origem vai separada em `context`.
 * Manter os slugs aqui evita que cada emissor invente grafia, plural ou qualificador.
 */
export const SERVICE_TAXONOMY = {
  boxBanheiro: {
    slug: 'box-banheiro',
    whatsappMessage: '🚿 Olá! Gostaria de um orçamento para Box para Banheiro.',
  },
  sacadaEnvidracada: {
    slug: 'sacada',
    whatsappMessage: '🏢 Olá! Gostaria de um orçamento para Sacadas Envidraçadas.',
  },
  guardaCorpo: {
    slug: 'guarda-corpo',
    whatsappMessage: '🛡️ Olá! Gostaria de um orçamento para Guarda-corpos de Vidro.',
  },
  portasJanelas: {
    slug: 'portas-janelas',
    whatsappMessage: '🚪 Olá! Gostaria de um orçamento para Portas e Janelas.',
  },
  espelhoSobMedida: {
    slug: 'espelho',
    whatsappMessage: '🪞 Olá! Gostaria de um orçamento para Espelhos Sob Medida.',
  },
  divisoriaAmbiente: {
    slug: 'divisoria',
    whatsappMessage: '🚪 Olá! Gostaria de um orçamento para Divisórias de Ambiente.',
  },
  portaoAluminio: {
    slug: 'portao-aluminio',
    whatsappMessage: '🚪 Olá! Gostaria de um orçamento para Portões em alumínio.',
  },
  vidroTemperadoSobMedida: {
    slug: 'vidro-temperado',
    whatsappMessage: '✨ Olá! Gostaria de um orçamento para Vidros temperados sob medida.',
  },
  tampoMesa: {
    slug: 'tampo-mesa',
    whatsappMessage: '✨ Olá! Gostaria de um orçamento para Tampos de Mesa.',
  },
} as const;

export const SERVICE_SLUGS = Object.values(SERVICE_TAXONOMY).map(({ slug }) => slug);

/** Valores aceitos pelo guard do DOM final. */
export const WHATSAPP_CONTEXTS = [
  'floating-button',
  'footer-whatsapp',
  'sticky-cta',
  'hero-whatsapp',
  'contact-whatsapp',
  'service-card',
  'service-gallery',
  'cta-band',
  'thank-you-page',
  'form-fallback',
  'form-error',
] as const;

/** Rótulos do rodapé e da página de avaliação; copy preservada. */
export const SERVICES = [
  'Box para Banheiro',
  'Sacadas Envidraçadas',
  'Guarda-corpos',
  'Portas e Janelas',
  'Espelhos',
  'Divisórias',
];

const SERVICE_BY_LOCAL_LABEL = new Map([
  ['Instalação de cortinas de vidro', SERVICE_TAXONOMY.sacadaEnvidracada],
  ['Box blindex para banheiro', SERVICE_TAXONOMY.boxBanheiro],
  ['Portas de vidro temperado', SERVICE_TAXONOMY.portasJanelas],
  ['Guarda corpo em vidro', SERVICE_TAXONOMY.guardaCorpo],
  ['Portões em alumínio', SERVICE_TAXONOMY.portaoAluminio],
  ['Vidros temperados sob medida', SERVICE_TAXONOMY.vidroTemperadoSobMedida],
]);

export function serviceForLocalLabel(label: string) {
  return SERVICE_BY_LOCAL_LABEL.get(label);
}

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
