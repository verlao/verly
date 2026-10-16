import { SERVICE_TAXONOMY } from './site';

interface Servico {
  id: string;
  title: string;
  description: string;
  icon: string;
  confirmado: boolean;
  precoReferencia: number | null;
  service?: { slug: string; whatsappMessage: string };
  obra?: string;
}

// Mix da home. Os slugs vêm da taxonomia de site.ts. `confirmado` = o dono já disse
// que faz; só box, janelas/portas, espelhos, guarda-corpo e armário/tampo, até ele
// responder B5. Os demais ficam em "Outros serviços".
// Preço só poderá aparecer depois de informado pelo dono, nunca como placeholder.
export const SERVICOS_HOME: Servico[] = [
  { id: 'box-banheiro', title: 'Box para Banheiro', description: 'Para seu banheiro.', icon: 'box-canto', service: SERVICE_TAXONOMY.boxBanheiro, confirmado: true, precoReferencia: null },
  { id: 'portas-janelas', title: 'Portas e Janelas', description: 'Sob medida.', icon: 'porta-janela-vidro', service: SERVICE_TAXONOMY.portasJanelas, obra: '65906', confirmado: true, precoReferencia: null },
  { id: 'armario-tampo', title: 'Armário/tampo de vidro', description: 'Armário, pia e tampo.', icon: 'divisoria', service: SERVICE_TAXONOMY.armarioVidro, obra: '49873', confirmado: true, precoReferencia: null },
  { id: 'espelho', title: 'Espelhos Sob Medida', description: 'Para seu espaço.', icon: 'espelho', service: SERVICE_TAXONOMY.espelhoSobMedida, confirmado: true, precoReferencia: null },
  { id: 'guarda-corpo', title: 'Guarda-corpos de Vidro', description: 'Para seu projeto.', icon: 'guarda-corpo', service: SERVICE_TAXONOMY.guardaCorpo, confirmado: true, precoReferencia: null },
  { id: 'vidro-temperado', title: 'Vidros temperados', description: 'Sob medida.', icon: 'gem', service: SERVICE_TAXONOMY.vidroTemperadoSobMedida, confirmado: false, precoReferencia: null },
  { id: 'sacada', title: 'Sacadas Envidraçadas', description: 'Para sua varanda.', icon: 'sacada-envidracada', service: SERVICE_TAXONOMY.sacadaEnvidracada, confirmado: false, precoReferencia: null },
  { id: 'divisoria', title: 'Divisórias de Ambiente', description: 'Divida ambientes.', icon: 'divisoria', service: SERVICE_TAXONOMY.divisoriaAmbiente, confirmado: false, precoReferencia: null },
  { id: 'portao-aluminio', title: 'Portões em alumínio', description: 'Para seu imóvel.', icon: 'porta-janela-vidro', service: SERVICE_TAXONOMY.portaoAluminio, confirmado: false, precoReferencia: null },
];
