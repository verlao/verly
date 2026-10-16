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
ou tampo. Seu CTA usa `service-gallery` sem `data-service`, pois não há slug
canônico para esse produto. Janelas usam `portas-janelas`. O contexto já era
registrado em `site.ts`; nenhum novo slug ou emissor de analytics foi criado.
