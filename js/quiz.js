(function () {
  'use strict';
  const Q = [
    { q: 'Amor, qual é a data do nosso namoro? 💗',
      o: ['14/02', '27/09', '01/09', '12/12'], a: 1,
      ok: 'ISSOOO! 💗 Essa data ficou guardadinha no meu coração!' },
    { q: 'Você lembra onde foi o nosso primeiro encontro? 🎬',
      o: ['Na praia', 'No cinema', 'No shopping', 'Na escola'], a: 1,
      ok: 'Acertou, meu amor! Mais uma lembrança nossa para guardar. ❤️' },
    { q: 'Qual foi o filme que assistimos no nosso primeiro encontro? 🍿',
      o: ['Barbie', 'Batman', 'Homem-Aranha: Um Novo Dia', 'Vingadores: Ultimato'], a: 2,
      ok: 'SIMMMM! 🕷️❤️ Esse encontro ficou marcado na nossa história!' },
    { q: 'Como eu pedi para segurar a sua mão pela primeira vez? 🥹',
      o: ['Pessoalmente, olhando nos seus olhos', 'Por uma ligação telefônica',
          'Pelo celular, na barra de mensagens, porque eu estava com vergonha',
          'Por um bilhetinho entregue na escola'], a: 2,
      ok: 'KKKKKKK, EU ESTAVA COM VERGONHA MESMO! 😭❤️' },
    { q: 'Onde aconteceu aquele momento em que pedi para segurar sua mão? 💞',
      o: ['Na escola', 'No cinema', 'Na praça', 'No shopping'], a: 1,
      ok: 'Meu Deus, amor! Você lembra de tudo! 🥹💕' },
    { q: 'Onde foi o primeiro beijo que eu te dei? 😳❤️',
      o: ['Na testa', 'Na bochecha', 'Na mão', 'Na boca'], a: 1,
      ok: 'AAAAAAH! ❤️ Uma lembrança tão pequenininha e tão especial!' }
  ];
  const WRONG = [
    'Hmm, quase! Tenta de novo, amor 💗',
    'Ihh, essa não foi... mas eu sei que você lembra! 😘',
    'Calma, respira... a resposta está guardadinha aí! 💕'
  ];

  const count = document.getElementById('qCount');
  const text = document.getElementById('qText');
  const opts = document.getElementById('qOptions');
  const fb = document.getElementById('qFeedback');
  const scoreEl = document.getElementById('scoreText');
  let idx = 0, score = 0, answered = 0, locked = false, missed = false, wrongN = 0, timer = null;

  function show() {
    const q = Q[idx];
    locked = false; missed = false;
    count.textContent = 'Pergunta ' + (idx + 1) + ' de ' + Q.length;
    text.textContent = q.q;
    opts.textContent = '';
    fb.textContent = ''; fb.className = 'feedback';
    q.o.forEach((t, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'opt';
      const l = document.createElement('span'); l.className = 'letter'; l.textContent = 'ABCD'[i];
      const s = document.createElement('span'); s.textContent = t;
      b.append(l, s);
      b.addEventListener('click', () => pick(i, b));
      opts.appendChild(b);
    });
    text.focus({ preventScroll: true });
  }

  function pick(i, btn) {
    if (locked || btn.disabled) return;
    const q = Q[idx];
    if (i === q.a) {
      locked = true;
      btn.classList.add('correct');
      Array.from(opts.children).forEach(b => { b.disabled = true; });
      fb.textContent = q.ok; fb.className = 'feedback good';
      const r = btn.getBoundingClientRect();
      Effects.burst(r.left + r.width / 2, r.top + r.height / 2, 14, 'heart');
      if (!missed) score++;
      answered++;
      Nav.setFrac(answered / Q.length);
      timer = setTimeout(next, 1700);
    } else {
      missed = true;
      btn.disabled = true; btn.classList.add('wrong');
      fb.textContent = WRONG[wrongN++ % WRONG.length]; fb.className = 'feedback soft';
    }
  }

  function next() {
    idx++;
    if (idx >= Q.length) {
      scoreEl.textContent = 'Você acertou ' + score + ' de ' + Q.length + ' de primeira! 💗';
      Nav.go('quizEnd');
    } else show();
  }

  function reset() { clearTimeout(timer); idx = 0; score = 0; answered = 0; wrongN = 0; locked = false; }
  function start() { reset(); Nav.setFrac(0); show(); }

  window.Quiz = { start, reset };
})();
