import { API_BASE } from './site';

/** O que `GET /published-reviews` devolve (PublicReviewDTO do verly-service). */
export interface PublishedReview {
  id: number;
  customerName: string | null;
  rating: number;
  comment: string | null;
  serviceType: string | null;
  publishedAt: string | null;
  photoUrls: string[];
}

/**
 * Avaliações que o próprio cliente enviou pelo link e o dono aprovou no Telegram.
 * Lidas em TEMPO DE BUILD, não no navegador, por três motivos:
 *
 * 1. Prova social precisa estar no HTML. Buscar no cliente deixaria o depoimento fora
 *    do que o Google indexa e fora do que aparece antes do JS rodar — e a primeira tela
 *    é onde a prova trabalha.
 * 2. Nada de spinner nem salto de layout numa seção acima da dobra em celular.
 * 3. A LP é estática no GitHub Pages e a API vive no Orange Pi. Uma leitura por deploy
 *    é uma dependência; uma por visitante seria colocar o Pi no caminho crítico de todo
 *    acesso ao site.
 *
 * O CONTRÁRIO DISSO É O RISCO, e está tratado abaixo: se a leitura pudesse quebrar o
 * build, o deploy da landing page passaria a depender do Pi estar no ar. Toda falha aqui
 * devolve lista vazia e o site sai sem a seção — nunca sem o site.
 */
export async function fetchPublishedReviews(): Promise<PublishedReview[]> {
  // O caminho é o nome pós-verly-service#56. Em prod, enquanto #56 não mergear, ele
  // responde 403 e esta função devolve [] — a seção simplesmente não aparece. Preferi
  // isso a tentar o nome antigo em seguida: fallback silencioso entre duas versões de
  // API esconde qual das duas está no ar justamente quando isso importa saber.
  const url = `${API_BASE}/published-reviews`;

  try {
    const resposta = await fetch(url, {
      headers: { accept: 'application/json' },
      // O build não pode ficar pendurado esperando o Pi.
      signal: AbortSignal.timeout(8000),
    });

    if (!resposta.ok) {
      console.warn(
        `[reviews] ${url} respondeu ${resposta.status} — o site sai sem a seção de avaliações da Verly.`
      );
      return [];
    }

    const dados: PublishedReview[] = await resposta.json();
    const comTexto = dados.filter((r) => (r.comment ?? '').trim().length > 0);

    // Foto que não carrega é pior que foto nenhuma: renderiza um retângulo quebrado no
    // lugar exato onde a página está tentando provar competência. O serviço já dá HEAD
    // em cada objeto ao receber a avaliação, mas ele confere o BUCKET — o que decide se
    // o visitante vê a imagem é o host público, que hoje ainda não resolve. Então o
    // build confere o host público.
    const verificadas = await Promise.all(
      comTexto.map(async (review) => ({
        ...review,
        photoUrls: await filtrarFotosAlcancaveis(review.photoUrls ?? []),
      }))
    );

    const fotos = verificadas.reduce((total, r) => total + r.photoUrls.length, 0);
    console.log(`[reviews] ${verificadas.length} avaliação(ões) aprovada(s), ${fotos} foto(s) alcançável(is).`);
    return verificadas;
  } catch (erro) {
    console.warn(
      `[reviews] não deu para ler ${url} (${erro instanceof Error ? erro.message : erro}) — o site sai sem a seção.`
    );
    return [];
  }
}

async function filtrarFotosAlcancaveis(urls: string[]): Promise<string[]> {
  const resultados = await Promise.all(
    urls.map(async (url) => {
      try {
        const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        if (r.ok) return url;
        console.warn(`[reviews] foto ignorada (${r.status}): ${url}`);
        return null;
      } catch {
        console.warn(`[reviews] foto ignorada (host não respondeu): ${url}`);
        return null;
      }
    })
  );
  return resultados.filter((url): url is string => url !== null);
}

/** "há 3 semanas", no mesmo formato dos rótulos que vieram do Google. */
export function idadeRelativa(publishedAt: string | null, agora: Date): string {
  if (!publishedAt) return '';
  const data = new Date(publishedAt);
  if (Number.isNaN(data.getTime())) return '';

  const dias = Math.floor((agora.getTime() - data.getTime()) / 86_400_000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'há 1 dia';
  if (dias < 7) return `há ${dias} dias`;

  const semanas = Math.floor(dias / 7);
  if (semanas === 1) return 'há 1 semana';
  if (semanas < 9) return `há ${semanas} semanas`;

  const meses = Math.floor(dias / 30);
  return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;
}
