import { GOOGLE_REVIEWS } from './site';

/**
 * A prova social do Google como a página consome: uma lista só, não importa se veio do
 * perfil lido no build (`scripts/fetch-google-reviews.mjs`) ou do snapshot escrito à mão
 * em `GOOGLE_REVIEWS`.
 *
 * POR QUE EXISTE O FALLBACK: o raspador depende de classe ofuscada do Google e de IP não
 * bloqueado. Nenhum dos dois é promessa. Se ele falhar, o site precisa sair com prova
 * social — só não pode sair AFIRMANDO frescor que não tem. Por isso `origem` e `lidoEm`
 * vêm no objeto e vão para a tela: leitura que parou de funcionar aparece como data
 * velha na página, que é a única forma de falha silenciosa que alguém nota sem abrir log.
 */
export interface DepoimentoGoogle {
  /** `data-review-id` quando veio do perfil; o nome do autor no snapshot. Só serve de key. */
  id: string;
  autor: string;
  nota: number;
  texto: string;
  /** Pronto para exibir. Do perfil vem o rótulo do próprio Google ("um mês atrás"); do
      snapshot vem calculado por `idadeRelativa` sobre a data absoluta. */
  quando: string;
  avatar: string | null;
  perfilAutor: string | null;
  fotos: string[];
}

export interface ProvaSocialGoogle {
  /** Nota em pt-BR, como aparece no perfil. */
  notaExibida: string;
  /** Total de avaliações do perfil. Fora da tela, por decisão do dono. */
  total: number | null;
  origem: 'perfil' | 'snapshot';
  /** ISO quando veio do perfil; `snapshotDate` (dd/mm/aaaa) quando veio do snapshot. */
  lidoEm: string;
  depoimentos: DepoimentoGoogle[];
}

/** Dias antes de o dado lido do perfil ser considerado parado. Não invalida nada: só grita. */
const DIAS_ATE_RECLAMAR = 3;

export function provaSocialGoogle(idadeRelativa: (iso: string, agora: Date) => string, agora: Date): ProvaSocialGoogle {
  const doPerfil = lerArquivoGerado();

  if (doPerfil) {
    const dias = Math.floor((agora.getTime() - new Date(doPerfil.lidoEm).getTime()) / 86_400_000);
    if (dias > DIAS_ATE_RECLAMAR) {
      console.warn(
        `[google-reviews] o último arquivo lido do perfil tem ${dias} dias. O build diário ` +
          'não está rodando o raspador, ou ele está falhando calado — ver o log do workflow.'
      );
    }
    return {
      notaExibida: doPerfil.notaExibida,
      total: doPerfil.total,
      origem: 'perfil',
      lidoEm: doPerfil.lidoEm,
      depoimentos: doPerfil.avaliacoes
        // Nota é campo obrigatório na tela (o cartão desenha estrela por ela) e texto é o
        // que faz a avaliação ser um depoimento. Sem um dos dois, o cartão não se sustenta.
        .filter((a) => a.nota && a.texto)
        .map((a) => ({
          id: a.id,
          autor: a.autor,
          nota: a.nota as number,
          texto: a.texto,
          quando: a.rotuloRelativo ?? '',
          avatar: a.avatar,
          perfilAutor: a.perfilAutor,
          fotos: a.fotos,
        })),
    };
  }

  return {
    notaExibida: GOOGLE_REVIEWS.ratingDisplay,
    total: GOOGLE_REVIEWS.ratingCount,
    origem: 'snapshot',
    lidoEm: GOOGLE_REVIEWS.snapshotDate,
    depoimentos: GOOGLE_REVIEWS.featured.map((r) => ({
      id: r.author,
      autor: r.author,
      // O snapshot só guarda avaliações 5★ — foram escolhidas à mão para a home.
      nota: 5,
      texto: r.text,
      quando: idadeRelativa(r.publishedAt, agora),
      avatar: null,
      perfilAutor: null,
      fotos: [],
    })),
  };
}

interface ArquivoGerado {
  lidoEm: string;
  notaExibida: string;
  total: number;
  avaliacoes: Array<{
    id: string;
    autor: string;
    avatar: string | null;
    perfilAutor: string | null;
    nota: number | null;
    rotuloRelativo: string | null;
    texto: string;
    fotos: string[];
  }>;
}

function lerArquivoGerado(): ArquivoGerado | null {
  // `import.meta.glob` e NÃO `readFileSync(new URL(..., import.meta.url))`: este módulo é
  // empacotado pelo Vite antes de rodar, e ali o `import.meta.url` aponta para o chunk,
  // não para `src/data/`. A primeira versão fazia exatamente isso, o `catch` engolia o
  // erro e o build saía com o snapshot manual — com o raspador tendo funcionado. Levou
  // uma inspeção do HTML gerado para notar. É o defeito que este arquivo existe para
  // evitar, cometido dentro dele.
  //
  // O glob também resolve o caso do arquivo ausente sem try/catch: o Vite devolve objeto
  // vazio, que é o normal em `npm run dev`.
  const encontrados = import.meta.glob<{ default: ArquivoGerado }>('./google-reviews.generated.json', {
    eager: true,
  });
  const dados = Object.values(encontrados)[0]?.default;
  return dados?.avaliacoes?.length ? dados : null;
}
