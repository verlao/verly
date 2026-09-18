/**
 * Abre a foto de uma avaliação em tamanho grande, sobre fundo escuro.
 *
 * POR QUE EXISTE: a miniatura é `object-fit: cover` com `aspect-ratio: 4/3`, então ela
 * RECORTA a foto. Numa vidraçaria a foto é a prova do serviço — o vidro instalado, o
 * acabamento, o esquadro — e o visitante clicava esperando ver e nada acontecia. Miniatura
 * recortada sem como ampliar é prova social pela metade.
 *
 * Sem dependência e sem framework, como o resto do `public/js/` deste projeto. Carregado
 * SÓ pela home: as 11 páginas de bairro não renderizam foto de avaliação, e um script
 * global para uma feature de uma página é peso em 16 páginas que não usam.
 */
(function () {
  'use strict';

  var overlay = document.getElementById('photo-lightbox');
  var triggers = document.querySelectorAll('[data-photo-zoom]');
  if (!overlay || triggers.length === 0) return;

  var image = overlay.querySelector('.photo-lightbox-img');
  var closeButton = overlay.querySelector('.photo-lightbox-close');
  // Guarda quem abriu, para devolver o foco no fechamento. Sem isto, fechar joga o foco
  // para o topo do documento e quem navega por teclado perde o lugar na grade.
  var lastTrigger = null;

  /**
   * De onde veio a foto. As do Google chegam por `lh3.googleusercontent.com` e as do
   * Garage são arquivo nosso — e a distinção é o que responde se a prova que converte é
   * a foto que o CLIENTE postou no perfil ou a que a loja publicou. Sem isto o evento
   * diria apenas "abriu uma foto".
   */
  function photoSource(url) {
    return url.indexOf('googleusercontent.com') !== -1 ? 'google' : 'garage';
  }

  /**
   * Mesma ponte que o whatsapp-cta.js usa (`window.VerlyAnalytics`): este arquivo não
   * vê as funções do app.js, e duplicar o enriquecimento de página seria a segunda
   * fonte de verdade do `page_type`.
   */
  function track(url, trigger) {
    if (!window.VerlyAnalytics) return;
    window.VerlyAnalytics.track('review_photo_open', {
      photo_source: photoSource(url),
      photo_position: Array.prototype.indexOf.call(triggers, trigger) + 1
    });
  }

  function open(trigger) {
    var full = trigger.getAttribute('data-photo-zoom');
    var thumb = trigger.querySelector('img');
    if (!full) return;

    track(full, trigger);

    lastTrigger = trigger;
    image.src = full;
    // O alt da miniatura já descreve a foto (autor, ou serviço realizado). Repetir aqui
    // evita uma segunda descrição para desencontrar da primeira.
    image.alt = thumb ? thumb.alt : '';
    overlay.hidden = false;
    // Travar o scroll do documento: sem isto, rolar sobre o fundo escuro move a página
    // atrás da foto, que é desorientador no celular.
    document.body.classList.add('has-lightbox-open');
    closeButton.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove('has-lightbox-open');
    // `src` fica; limpar causaria um flash de imagem quebrada na próxima abertura antes
    // de o novo arquivo carregar.
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  Array.prototype.forEach.call(triggers, function (trigger) {
    trigger.addEventListener('click', function () {
      open(trigger);
    });
  });

  closeButton.addEventListener('click', close);

  // Clique no fundo fecha; clique na própria foto não. `currentTarget` é o overlay, então
  // comparar com `target` distingue os dois sem precisar de `stopPropagation` na imagem.
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });

  document.addEventListener('keydown', function (event) {
    if (overlay.hidden) return;
    if (event.key === 'Escape') {
      close();
      return;
    }
    // Prende o Tab no diálogo. O botão de fechar é o ÚNICO elemento focável aqui: a
    // imagem não recebe foco (não tem tabindex, e dar um a ela criaria uma parada de
    // teclado que não faz nada). Então o ciclo tem tamanho um — barrar o default e
    // devolver o foco ao botão. Sem isto o foco sai para os links da página atrás do
    // fundo escuro, que continuam clicáveis por teclado.
    if (event.key === 'Tab') {
      event.preventDefault();
      closeButton.focus();
    }
  });
})();
