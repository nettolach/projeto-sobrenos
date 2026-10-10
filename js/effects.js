(function () {
  'use strict';
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const COLORS = ['#FF3D9A', '#FFB8DC', '#A855F7', '#FFD98A', '#FFF7FC'];
  const bg = document.getElementById('bg'), bx = bg.getContext('2d');
  const fx = document.getElementById('fx'), fxc = fx.getContext('2d');
  let W = 0, H = 0, dpr = 1, stars = [], hearts = [], mood = 'pink';
  let bgRaf = 0, bgLast = 0;

  /* ---------- Fundo estrelado ---------- */
  const newStar = () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + 0.3, p: Math.random() * 6.28, s: 0.5 + Math.random() * 1.5 });
  const newHeart = (rand) => ({ x: Math.random() * W, y: rand ? Math.random() * H : H + 30, s: 10 + Math.random() * 16, v: 12 + Math.random() * 22, a: 0.15 + Math.random() * 0.25, ph: Math.random() * 6.28, c: COLORS[Math.random() * 2 | 0] });

  function fit() {
    const k = Math.max(0.6, Math.min(1.4, W * H / 320000));
    const ts = mq.matches ? 70 : Math.round((mood === 'calm' ? 170 : 110) * k);
    while (stars.length < ts) stars.push(newStar());
    stars.length = Math.min(stars.length, ts);
    const th = mood === 'calm' ? 4 : 14;
    while (hearts.length < th) hearts.push(newHeart(true));
    hearts.length = Math.min(hearts.length, th);
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    [bg, fx].forEach(c => { c.width = W * dpr; c.height = H * dpr; });
    bx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fxc.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = []; hearts = [];
    fit();
    if (mq.matches) drawBg(0);
  }

  function drawBg(t) {
    bx.clearRect(0, 0, W, H);
    bx.fillStyle = '#FFF7FC';
    for (const s of stars) {
      bx.globalAlpha = mq.matches ? 0.8 : 0.35 + 0.65 * (Math.sin(t * s.s + s.p) * 0.5 + 0.5);
      bx.beginPath(); bx.arc(s.x, s.y, s.r, 0, 6.283); bx.fill();
    }
    bx.textAlign = 'center'; bx.textBaseline = 'middle';
    for (const h of hearts) {
      bx.globalAlpha = h.a; bx.fillStyle = h.c; bx.font = h.s + 'px sans-serif';
      bx.fillText('♥', h.x + Math.sin(t + h.ph) * 10, h.y);
    }
    bx.globalAlpha = 1;
  }

  function bgLoop(ts) {
    const dt = Math.min(0.05, (ts - bgLast) / 1000 || 0); bgLast = ts;
    for (const h of hearts) { h.y -= h.v * dt; if (h.y < -30) Object.assign(h, newHeart(false)); }
    drawBg(ts / 1000);
    bgRaf = requestAnimationFrame(bgLoop);
  }

  function startBg() {
    cancelAnimationFrame(bgRaf);
    if (mq.matches) { fit(); drawBg(0); } else { bgLast = performance.now(); bgRaf = requestAnimationFrame(bgLoop); }
  }

  /* ---------- Partículas (confete, corações, estrelas) ---------- */
  const parts = []; const MAX = 220;
  let fxRaf = 0, fxLast = 0, timers = [];

  function spawn(p) {
    if (parts.length >= MAX) parts.shift();
    parts.push(p);
    if (!fxRaf) { fxLast = performance.now(); fxRaf = requestAnimationFrame(fxLoop); }
  }

  function fxLoop(ts) {
    const dt = Math.min(0.05, (ts - fxLast) / 1000); fxLast = ts;
    fxc.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      fxc.globalAlpha = Math.min(1, p.life / 0.6);
      fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.rot); fxc.fillStyle = p.c;
      if (p.k === 'rect') fxc.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6);
      else { fxc.font = p.s + 'px sans-serif'; fxc.textAlign = 'center'; fxc.textBaseline = 'middle'; fxc.fillText(p.k === 'heart' ? '♥' : '✦', 0, 0); }
      fxc.restore();
    }
    fxc.globalAlpha = 1;
    if (parts.length) fxRaf = requestAnimationFrame(fxLoop);
    else { fxRaf = 0; fxc.clearRect(0, 0, W, H); }
  }

  function burst(x, y, n, kind) {
    n = n || 12; kind = kind || 'heart';
    if (mq.matches) n = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, sp = 120 + Math.random() * 200;
      spawn({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, g: 300, rot: 0, vr: (Math.random() - 0.5) * 6,
        s: 12 + Math.random() * 12, c: COLORS[Math.random() * COLORS.length | 0],
        k: Math.random() < 0.3 ? 'star' : kind, life: 0.9 + Math.random() * 0.7 });
    }
  }

  function confetti() {
    cancelTimers();
    const rm = mq.matches, waves = rm ? 1 : 4;
    for (let w = 0; w < waves; w++) {
      timers.push(setTimeout(() => {
        const n = rm ? 25 : 34;
        for (let i = 0; i < n; i++) {
          const side = i % 3; let x, y, vx, vy;
          if (side === 0) { x = 0; y = H * 0.7; vx = 200 + Math.random() * 350; vy = -(500 + Math.random() * 500); }
          else if (side === 1) { x = W; y = H * 0.7; vx = -(200 + Math.random() * 350); vy = -(500 + Math.random() * 500); }
          else { x = Math.random() * W; y = -10; vx = (Math.random() - 0.5) * 160; vy = 100 + Math.random() * 200; }
          const kind = ['rect', 'rect', 'heart', 'star'][Math.random() * 4 | 0];
          spawn({ x, y, vx, vy, g: 700, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10,
            s: kind === 'rect' ? 9 + Math.random() * 7 : 14 + Math.random() * 12,
            c: COLORS[Math.random() * COLORS.length | 0], k: kind, life: 2.4 + Math.random() * 1.2 });
        }
      }, w * 450));
    }
  }

  function cancelTimers() { timers.forEach(clearTimeout); timers = []; }
  function clear() { cancelTimers(); parts.length = 0; fxc.clearRect(0, 0, W, H); }

  /* ---------- Humor do cenário ---------- */
  function setMood(m) { mood = m; document.body.dataset.mood = m; fit(); }

  /* ---------- Digitação acessível ---------- */
  function typeSequence(box, paras, speed, done) {
    box.textContent = '';
    const chars = paras.map(t => Array.from(t));
    const els = paras.map(() => { const p = document.createElement('p'); box.appendChild(p); return p; });
    let pi = 0, ci = 0, timer = null, finished = false;
    const finish = () => {
      if (finished) return; finished = true; clearTimeout(timer);
      els.forEach((p, i) => { p.textContent = paras[i]; });
      if (done) done();
    };
    const api = { skip: finish, cancel() { finished = true; clearTimeout(timer); } };
    if (mq.matches) { finish(); return api; }
    const tick = () => {
      if (finished) return;
      if (pi >= chars.length) { finish(); return; }
      ci++;
      els[pi].textContent = chars[pi].slice(0, ci).join('');
      if (ci >= chars[pi].length) { pi++; ci = 0; timer = setTimeout(tick, 350); }
      else timer = setTimeout(tick, speed);
    };
    tick();
    return api;
  }

  window.addEventListener('resize', size);
  mq.addEventListener('change', () => { size(); startBg(); });
  size(); startBg();

  window.Effects = { burst, confetti, clear, setMood, typeSequence, reduced: () => mq.matches };
})();
