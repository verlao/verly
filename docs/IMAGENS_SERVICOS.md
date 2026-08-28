# Procedência das imagens

As seis imagens desta pasta vieram de `vidrobras.lovable.app` e foram reaproveitadas
aqui com autorização do dono do projeto, que confirmou ter direito sobre elas em
2026-08-27. Se essa premissa mudar, **remova os arquivos e a seção**: sem direito de
uso não há caso de uso, e a seção degrada sozinha (o componente só renderiza painel
com imagem existente).

## O que elas são, e o que elas não são

São imagens **ilustrativas** do tipo de serviço, não registros de obras da Verly.
A página diz isso em texto visível, e nada aqui é marcado com `schema.org` de projeto
ou associado a cliente, bairro ou data. A distinção não é jurídica, é de honestidade
com quem lê: a seção mostra o que o serviço É, e passa a mostrar o que a Verly FEZ
quando houver foto de obra autorizada para substituir cada uma.

Ordem de substituição por valor (a primeira é a que mais decide compra):
box para banheiro, sacada envidraçada, guarda-corpo, espelho, portas e janelas.

## Processamento

Original JPEG (1024x768, exceto a aresta em 1000x1400) convertido para WebP:

    cwebp -q 82 -resize 800 0 <origem>.jpg -o <destino>.webp   # painéis de serviço
    cwebp -q 84 -resize 0 900 <origem>.jpg -o aresta-vidro.webp

1,5 MB de JPEG viraram 128 KB de WebP. `divisorias-ambiente` não tem imagem porque
nenhuma das originais mostra uma divisória — e mostrar outro serviço no lugar
reintroduziria, na foto, o mesmo defeito que o PR #78 acabou de corrigir na mensagem.
