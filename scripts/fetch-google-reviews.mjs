/**
 * Lê a nota, o total e as avaliações com texto do perfil da loja no Google e grava
 * `src/data/google-reviews.generated.json`. Roda ANTES do build; o Astro só lê o arquivo.
 *
 * POR QUE NAVEGADOR E NÃO A PLACES API
 * A API oficial resolveria nota, total e até cinco textos — mas o objeto `Review` dela
 * NÃO TEM FOTO (os campos são name, relativePublishTimeDescription, text, originalText,
 * rating, authorAttribution, publishTime, flagContentUri, googleMapsUri, visitDate), e
 * `places.photos` é foto do LUGAR, não da avaliação. Como foto é requisito, a API não
 * atende. O navegador vê o que o cliente vê, foto incluída.
 *
 * ⚠️ O QUE ISSO CUSTA, ESCRITO AQUI PARA NÃO SER DESCOBERTO DEPOIS
 * 1. Raspagem contraria os termos do Google. É decisão tomada com o custo à vista, não
 *    um detalhe esquecido. A alternativa sem essa dívida é a Business Profile API, que
 *    exige OAuth do dono do perfil e aprovação do Google.
 * 2. Os seletores (`.d4r55`, `.wiI7pd`) são classes ofuscadas e mudam sem aviso. Por
 *    isso este script NUNCA derruba o build: ele falha, avisa alto e o site sai com o
 *    snapshot manual de `GOOGLE_REVIEWS`. E é por isso que a origem do dado vai para o
 *    JSON e aparece na página — falha silenciosa aqui viraria uma data velha visível,
 *    não uma ausência invisível.
 * 3. IP de datacenter (o runner do GitHub) tem muito mais chance de cair em consentimento
 *    ou CAPTCHA que IP residencial. Se isso virar rotina, o lugar deste script é o Orange
 *    Pi, e o build passa a ler o resultado de lá.
 *
 * O DOM DUPLICA CADA CARTÃO: dez nós para cinco avaliações. Sem dedupe por
 * `data-review-id` o site publicaria tudo em dobro.
 */
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

/** Mesmo CID de `GOOGLE_REVIEWS.profileUrl`, que é a única forma de link que veio do Google. */
const PERFIL = 'https://maps.google.com/?cid=4827813671680371489&hl=pt-BR';
const SAIDA = new URL('../src/data/google-reviews.generated.json', import.meta.url);
/** Para o conteúdo, uma vez que o painel do lugar apareceu: aí a espera é legítima. */
const TIMEOUT_MS = 45_000;
/**
 * Para a PRIMEIRA espera (a aba de avaliações existir). Curto de propósito: quando o CID
 * não abre o painel do lugar, ele não abre — esperar 45s não muda o resultado, só encarece
 * a tentativa. Medido no runner do GitHub: duas tentativas de três falham exatamente aqui.
 */
const TIMEOUT_PAINEL_MS = 15_000;

const cartoes = () =>
  // eslint-disable-next-line no-undef
  [...document.querySelectorAll('div[data-review-id]')].reduce((acc, c) => {
    const id = c.getAttribute('data-review-id');
    const autor = c.querySelector('.d4r55')?.textContent?.trim();
    // Cartão sem autor é esqueleto de carregamento; sem id não há como deduplicar.
    if (!id || !autor || acc.vistos.includes(id)) return acc;
    acc.vistos.push(id);

    const estrelas = c.querySelector('[role="img"][aria-label*="estrela"]')?.getAttribute('aria-label') ?? '';
    // SÓ `.wiI7pd`, em consulta própria. `querySelector('.wiI7pd, .MyEned')` devolve o
    // primeiro na ORDEM DO DOCUMENTO, não na ordem da lista — e `.MyEned` é o contêiner,
    // que vem antes e carrega metadado do Google junto ("Avaliação de preço") mais o
    // rótulo do botão. Foi assim que "excelente.Avaliação de preço" chegou a aparecer
    // dentro de um depoimento na página.
    const texto = (c.querySelector('.wiI7pd')?.textContent ?? c.querySelector('.MyEned')?.textContent ?? '').trim();
    // As fotos do autor são background-image de botões, não <img>.
    const fotos = [...c.querySelectorAll('button')]
      .map((b) => getComputedStyle(b).backgroundImage.match(/url\("?(https:\/\/lh3\.googleusercontent\.com[^")]+)"?\)/)?.[1])
      .filter(Boolean);

    acc.avaliacoes.push({
      id,
      autor,
      avatar: c.querySelector('img.NBa7we')?.src ?? null,
      perfilAutor: c.querySelector('button[data-href*="/maps/contrib/"]')?.getAttribute('data-href') ?? null,
      nota: Number.parseInt(estrelas, 10) || null,
      rotuloRelativo: [...c.querySelectorAll('span')].map((s) => s.textContent.trim()).find((t) => /atrás$/.test(t)) ?? null,
      texto,
      fotos: [...new Set(fotos)],
    });
    return acc;
  }, { vistos: [], avaliacoes: [] }).avaliacoes;

const cabecalho = () => {
  // eslint-disable-next-line no-undef
  const rotulos = [...document.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label'));

  // O HISTOGRAMA é a fonte do total, somando as cinco linhas. Ler uma linha só foi o
  // defeito que pôs "5,0 de 15" no ar por cinco semanas: 15 era a linha de cinco
  // estrelas, e a nota redonda dela passou por média do perfil. Somar as cinco é a
  // versão do mesmo dado que não tem como ser confundida com uma parte dele.
  const linhas = rotulos
    .map((r) => r.match(/^([1-5]) estrelas?, ([\d.]+) avaliaç/))
    .filter(Boolean)
    .map((m) => ({ estrelas: Number(m[1]), quantas: Number(m[2].replace(/\./g, '')) }));
  if (linhas.length !== 5) return null;

  const total = linhas.reduce((soma, l) => soma + l.quantas, 0);
  if (total === 0) return null;
  const media = linhas.reduce((soma, l) => soma + l.estrelas * l.quantas, 0) / total;

  // A nota que o Google EXIBE, para não publicar um arredondamento nosso no lugar do
  // dele. Ela é conferida contra a média do histograma logo abaixo.
  const exibida = rotulos.find((r) => /^\d,\d estrelas?$/.test(r))?.match(/^(\d,\d)/)?.[1] ?? null;

  return { notaExibida: exibida, total, mediaCalculada: Number(media.toFixed(2)) };
};

/**
 * Tentativas da leitura inteira. O CID às vezes não abre o painel do lugar; repetir
 * resolve, então não é degradação progressiva, é sorte de layout.
 *
 * OITO, e o número vem de medição, não de gosto: no meu IP residencial falha ~1 tentativa
 * em 5, mas no runner do GitHub falharam 2 de 3 (a leitura passou na terceira). Com três
 * tentativas a 2/3 de falha, o build cairia no snapshot manual em torno de um dia em três
 * — publicaria dado velho com CI verde, que é o pior dos dois mundos. Com oito tentativas
 * de 15s, a chance cai para ~4% e o pior caso custa ~2 min num build que roda uma vez por
 * dia. Se o padrão do log virar "8/8 falharam", o problema deixou de ser sorte: é o IP, e
 * o lugar deste script passa a ser o Orange Pi.
 */
const TENTATIVAS = 8;

async function lerPerfil(navegador) {
  const pagina = await navegador.newPage({ locale: 'pt-BR' });
  try {
    await pagina.goto(PERFIL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });

    // A ABA DE AVALIAÇÕES VEM PRIMEIRO, antes de qualquer leitura. O painel de visão
    // geral às vezes traz o resumo e às vezes não, dependendo do que o Maps decide
    // carregar: esperar o histograma ali falhava em uma rodada de três. Dentro da aba ele
    // é parte obrigatória do conteúdo.
    const aba = pagina.locator('button', { hasText: /^Avaliaç/ }).first();
    await aba.waitFor({ state: 'visible', timeout: TIMEOUT_PAINEL_MS });
    await aba.click({ timeout: TIMEOUT_MS });

    // `attached` e não `visible`: o nó existe antes de terminar de animar, e visibilidade
    // aqui era mais uma fonte de intermitência sem nada em troca.
    await pagina.waitForSelector('[aria-label*="estrelas,"]', { state: 'attached', timeout: TIMEOUT_MS });
    await pagina.waitForSelector('div[data-review-id] .d4r55', { timeout: TIMEOUT_MS });

    const cabeca = await pagina.evaluate(cabecalho);
    if (!cabeca) throw new Error('não achei as cinco linhas do histograma no perfil');
    if (!cabeca.notaExibida) throw new Error('achei o histograma mas não a nota exibida');

    // Duas leituras independentes do mesmo número. Divergir de mais de 0,1 significa que
    // uma das duas está lendo outra coisa — publicar qualquer uma às cegas é como o 5,0
    // entrou no ar.
    const divergencia = Math.abs(Number(cabeca.notaExibida.replace(',', '.')) - cabeca.mediaCalculada);
    if (divergencia > 0.1) {
      throw new Error(
        `nota exibida (${cabeca.notaExibida}) e média do histograma (${cabeca.mediaCalculada}) divergem`
      );
    }

    // Expandir TODO texto truncado antes de ler. A política do Google é explícita em não
    // modificar o texto da avaliação, e publicar o trecho cortado no "… Mais" é publicar
    // outra coisa. Cada clique é independente: um que falhe não derruba a leitura.
    const expansores = pagina.locator('button[aria-label="Ver mais"]');
    for (let i = 0, n = await expansores.count(); i < n; i += 1) {
      await expansores.nth(i).click({ timeout: 4000 }).catch(() => {});
    }

    // Rolar carrega mais cartões; parar quando a contagem estabiliza evita esperar um
    // número que talvez não exista (avaliação sem texto não vira cartão de depoimento).
    let anterior = -1;
    for (let i = 0; i < 12 && anterior !== (await pagina.locator('div[data-review-id] .d4r55').count()); i += 1) {
      anterior = await pagina.locator('div[data-review-id] .d4r55').count();
      await pagina.mouse.wheel(0, 4000);
      await pagina.waitForTimeout(900);
    }

    const avaliacoes = (await pagina.evaluate(cartoes)).filter((a) => a.texto.length > 0);
    if (avaliacoes.length === 0) throw new Error('zero avaliação com texto — seletor provavelmente mudou');

    const dados = {
      lidoEm: new Date().toISOString(),
      notaExibida: cabeca.notaExibida,
      total: cabeca.total,
      /** Média derivada da soma do histograma. Fica gravada para o próximo a duvidar da nota. */
      mediaCalculada: cabeca.mediaCalculada,
      avaliacoes,
    };
    return dados;
  } finally {
    await pagina.close();
  }
}

async function main() {
  const navegador = await chromium.launch();
  try {
    let ultimoErro;
    for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa += 1) {
      try {
        const dados = await lerPerfil(navegador);
        writeFileSync(SAIDA, `${JSON.stringify(dados, null, 2)}\n`);
        const comFoto = dados.avaliacoes.filter((a) => a.fotos.length > 0).length;
        console.log(
          `[google-reviews] ${dados.notaExibida} de ${dados.total} avaliações; ` +
            `${dados.avaliacoes.length} com texto, ${comFoto} com foto` +
            `${tentativa > 1 ? ` (na tentativa ${tentativa})` : ''}.`
        );
        return;
      } catch (erro) {
        ultimoErro = erro;
        console.warn(`[google-reviews] tentativa ${tentativa}/${TENTATIVAS} falhou: ${erro.message.split('\n')[0]}`);
      }
    }
    throw ultimoErro;
  } finally {
    await navegador.close();
  }
}

main().catch((erro) => {
  // Sai 0 DE PROPÓSITO: o site não pode deixar de ser publicado porque o Google mudou
  // uma classe de CSS. Sem o arquivo, `google-reviews.ts` cai no snapshot manual.
  console.warn(`[google-reviews] FALHOU (${erro.message}) — o build vai usar o snapshot manual de GOOGLE_REVIEWS.`);
  process.exit(0);
});
