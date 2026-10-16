# Portfólio público — contrato v1

`portfolio.json` segue `portfolio-ui-contrato.md` do discovery. Extensão: `obra`
é uma string estável que agrupa os ângulos da mesma instalação e forma a âncora
`#obra-<obra>`. 65906/65909 pertencem à obra 65906; 65907/65908 à 65907;
49873 e 52362 são obras independentes. Não representam seis serviços diferentes.

As seis fotos v2 foram aprovadas em 15/10/2026. Legendas e textos alternativos
vêm de `fotos/v2/metadados-raw.txt`, dentro dos limites de 80/125 caracteres.
Bairro e data do serviço são desconhecidos (`null`). Não há originais publicados:
`original_url` é opcional e foi omitido, evitando links sem arquivo ou exposição
acidental. As 18 variantes WebP em `public/obras/` somam 1.164.672 bytes (<1,5 MB).

`produto=outro` identifica os fechamentos de armário/pia; não implica porta, box
ou tampo. Janelas usam `portas-janelas`; `outro` usa `armario-vidro` (slug criado
na LP-6) e `sacada` usa `sacada`. O mapa produto → rótulo, filtro e slug fica em
`PortfolioGallery.astro`: produto novo no JSON precisa de uma linha lá.

## Lote de 16/10/2026 (sacadas)
Fotos que o dono mandou no grupo em 16/10, editadas com `foto-v2` no `codex-foto`
do Pi, uma a uma, sem aprovação no grupo (`aprovada_em: null`): quem aprova é o
merge deste PR. Agrupamento por obra, feito olhando teto, perfil e vista:
67052/67053/67058 = obra 67052; 67061/67062 = obra 67061; 67064, 67068, 67070 e
67071 são obras independentes. Ficaram de fora 67054 e 67059 (instalador e escada
na cena), 67055 (mesmo ângulo da 67052) e 67111 (porta de vidro: fidelidade 0,78,
abaixo do corte de 0,85; a edição inventou puxadores e reconstruiu o muro).
`produto` veio do Codex como `outro` e foi trocado à mão por `sacada`. As sacadas
vêm primeiro no JSON (a galeria segue essa ordem): é a obra de maior valor. Fotos em pé: a maior variante
tem a largura nativa da edição (sem ampliar), então a chave de `variantes` é a
largura real e não necessariamente `1600`.
