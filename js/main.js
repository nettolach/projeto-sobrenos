(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const INTRO = [
    'Oi, amor... 💗',
    'Preparei uma coisinha especial para você.',
    'É um pequeno joguinho sobre nós dois, algumas lembranças e uma pergunta muito importante...',
    'Será que você está preparada?',
    'Prometo que não precisa ficar nervosa. KKKKKK ❤️'
  ];
  const LETTER = [
    "Desde o nosso primeiro 'oi' até agora...",
    'Cada momento com você se tornou uma lembrança especial.',
    'Entre conversas, vergonhas, risadas e pequenas doideirinhas, fomos construindo uma história que eu tenho muito carinho em viver.',
    'Talvez esse joguinho tenha começado com uma brincadeira sobre casamento, mas o que eu sinto por você é algo que quero demonstrar todos os dias, com carinho, respeito e sinceridade.',
    'Obrigado por fazer parte da minha vida, por compartilhar seus momentos comigo e por construir tantas lembranças ao meu lado.',
    'Espero que ainda tenhamos muitos capítulos para escrever juntos.',
    'E, se depender de mim, quero continuar descobrindo cada um deles com você. ❤️',
    'Eu te amo, Sofia. ❤️',
    'Do seu Garoto Atrapalhado,\nNetto.'
  ];
  const NO_MSGS = ['EI, CALMA AÍ! KKKKKK 😭', 'Tem certeza, senhorita? 👀', 'EU SÓ ESTAVA BRINCANDO! KKKKK 💗'];
  const CALM = ['transition', 'proposal', 'letter'];

  let introTyper = null, letterTyper = null, noCount = 0, answered = false;

  /* ---------- Pedido ---------- */
  function resetProposal() {
    noCount = 0; answered = false;
    $('askBox').hidden = false; $('yesBox').hidden = true;
    $('noMsg').textContent = ''; $('noOptions').hidden = true;
    $('btnNo').style.transform = '';
  }

  function dodge() {
    const b = $('btnNo'); b.style.transform = '';
    const r = b.getBoundingClientRect();
    let dx = (Math.random() < 0.5 ? -1 : 1) * 70, dy = (Math.random() < 0.5 ? -1 : 1) * 36;
    if (r.left + dx < 8 || r.right + dx > window.innerWidth - 8) dx = -dx;
    if (r.top + dy < 60 || r.bottom + dy > window.innerHeight - 8) dy = -dy;
    b.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (dx > 0 ? 6 : -6) + 'deg)';
  }

  $('btnYes').addEventListener('click', () => {
    if (answered) return;
    answered = true;
    $('askBox').hidden = true; $('yesBox').hidden = false;
    $('yesT').focus({ preventScroll: true });
    Effects.confetti();
    Effects.burst(window.innerWidth / 2, window.innerHeight / 2, 24, 'heart');
  });

  $('btnNo').addEventListener('click', () => {
    if (answered) return;
    noCount++;
    $('noMsg').textContent = NO_MSGS[(noCount - 1) % NO_MSGS.length];
    $('noOptions').hidden = false;
    if (noCount === 1 && !Effects.reduced()) dodge();
    else $('btnNo').style.transform = '';
  });

  $('btnBack').addEventListener('click', resetProposal);
  $('btnEnd').addEventListener('click', () => Nav.go('letter'));
  $('btnToLetter').addEventListener('click', () => Nav.go('letter'));

  /* ---------- Carta ---------- */
  function startLetter() {
    $('letterEnd').hidden = true; $('btnSkip').hidden = false;
    if (letterTyper) letterTyper.cancel();
    letterTyper = Effects.typeSequence($('letterText'), LETTER, 22, () => {
      $('btnSkip').hidden = true; $('letterEnd').hidden = false;
      Effects.burst(window.innerWidth / 2, window.innerHeight / 3, 14, 'heart');
    });
  }
  $('btnSkip').addEventListener('click', () => { if (letterTyper) letterTyper.skip(); });

  /* ---------- Reiniciar ---------- */
  function restart(to) {
    if (letterTyper) letterTyper.cancel();
    if (introTyper) introTyper.cancel();
    Quiz.reset(); Minigame.reset(); Effects.clear(); resetProposal();
    Nav.reset(to);
  }
  $('btnRestart').addEventListener('click', () => restart('quizIntro'));
  $('btnTop').addEventListener('click', () => restart('intro'));

  /* ---------- Navegação entre etapas ---------- */
  $('btnStart').addEventListener('click', () => {
    if (introTyper) introTyper.cancel();
    const r = $('btnStart').getBoundingClientRect();
    Effects.burst(r.left + r.width / 2, r.top, 14, 'star');
    Nav.go('quizIntro');
  });
  $('btnQuizStart').addEventListener('click', () => Nav.go('quiz'));
  $('btnQuizEnd').addEventListener('click', () => Nav.go('game'));
  $('btnGameStart').addEventListener('click', () => Minigame.begin());
  $('btnGameContinue').addEventListener('click', () => Nav.go('transition'));
  $('btnAsk').addEventListener('click', () => Nav.go('proposal'));

  Nav.onEnter((id) => {
    Effects.setMood(CALM.indexOf(id) >= 0 ? 'calm' : 'pink');
    if (id === 'intro') {
      if (introTyper) introTyper.cancel();
      introTyper = Effects.typeSequence($('introText'), INTRO, 24);
    }
    if (id === 'quiz') Quiz.start();
    if (id === 'game') Minigame.reset();
    if (id === 'proposal') resetProposal();
    if (id === 'letter') startLetter();
  });

  Nav.go('intro');
})();
