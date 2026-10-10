(function () {
  'use strict';
  const GOAL = 20, MAX_ON_SCREEN = 10;
  const $ = (id) => document.getElementById(id);
  const layer = $('gameLayer'), intro = $('gameIntro'), play = $('gamePlay'), win = $('gameWin');
  const fill = $('heartFill'), counter = $('gameCount'), meter = $('gameMeter').firstElementChild;
  const svg = document.querySelector('.bigheart-svg'), keyBtn = $('btnKey');

  let running = false, done = false, count = 0, spawnT = null, winT = null;
  const live = new Map(); // elemento -> timeout de remoção

  function setProgress() {
    const p = Math.min(100, count / GOAL * 100);
    const h = 90 * p / 100;
    fill.setAttribute('y', 90 - h);
    fill.setAttribute('height', h);
    meter.style.width = p + '%';
    counter.textContent = Math.min(count, GOAL) + ' / ' + GOAL + ' corações';
    Nav.setFrac(p / 100);
  }

  function removeHeart(el) {
    clearTimeout(live.get(el));
    live.delete(el);
    el.remove();
  }

  function spawn() {
    if (!running || live.size >= MAX_ON_SCREEN) return;
    const rm = Effects.reduced();
    const s = 40 + Math.random() * 24, w = s * 1.6;
    const lh = layer.clientHeight, lw = layer.clientWidth;
    const dur = rm ? 7000 : 4200 + Math.random() * 2800;
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'falling'; el.textContent = '💗';
    el.setAttribute('aria-label', 'Coletar coração');
    el.style.setProperty('--s', s + 'px');
    el.style.left = Math.random() * Math.max(1, lw - w) + 'px';
    if (rm) {
      el.classList.add('still');
      el.style.top = (60 + Math.random() * Math.max(1, lh - w - 120)) + 'px';
    } else {
      el.style.setProperty('--d', dur + 'ms');
      el.style.setProperty('--h', (lh + 120) + 'px');
    }
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); collect(el, e.clientX, e.clientY); });
    el.addEventListener('click', (e) => {
      if (e.detail === 0) { const r = el.getBoundingClientRect(); collect(el, r.left + r.width / 2, r.top + r.height / 2); }
    });
    live.set(el, setTimeout(() => removeHeart(el), dur));
    layer.appendChild(el);
  }

  function collect(el, x, y) {
    if (!running || !live.has(el)) return;
    removeHeart(el);
    gain(x, y);
  }

  function gain(x, y) {
    if (!running) return;
    count++;
    Effects.burst(x, y, 8, 'heart');
    setProgress();
    if (count >= GOAL) finish();
  }

  function stopSpawning() {
    running = false;
    clearInterval(spawnT); spawnT = null;
    Array.from(live.keys()).forEach(removeHeart);
  }

  function finish() {
    stopSpawning();
    done = true;
    svg.classList.add('complete');
    keyBtn.hidden = true;
    const r = svg.getBoundingClientRect();
    Effects.burst(r.left + r.width / 2, r.top + r.height / 2, 30, 'heart');
    winT = setTimeout(() => { win.hidden = false; win.querySelector('.btn').focus(); }, Effects.reduced() ? 0 : 1100);
  }

  function begin() {
    if (running || done) return;
    running = true; count = 0;
    intro.hidden = true; play.hidden = false;
    setProgress();
    spawn();
    spawnT = setInterval(spawn, Effects.reduced() ? 1100 : 650);
  }

  function reset() {
    stopSpawning();
    clearTimeout(winT);
    done = false; count = 0;
    intro.hidden = false; play.hidden = true; win.hidden = true;
    keyBtn.hidden = false;
    svg.classList.remove('complete');
    setProgress();
    Nav.setFrac(0);
  }

  keyBtn.addEventListener('click', () => {
    const r = svg.getBoundingClientRect();
    gain(r.left + r.width / 2, r.top + r.height / 2);
  });

  window.Minigame = { begin, reset };
})();
