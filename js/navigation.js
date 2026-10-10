(function () {
  'use strict';
  const order = ['intro', 'quizIntro', 'quiz', 'quizEnd', 'game', 'transition', 'proposal', 'letter'];
  const bar = document.getElementById('bar');
  const prog = document.querySelector('.progress');
  let cur = null, busy = false, frac = 0, enterCb = null;

  function render() {
    const i = Math.max(0, order.indexOf(cur));
    const f = Math.min(1, Math.max(0, frac));
    const pct = Math.round(Math.min(1, (i + f) / (order.length - 1)) * 100);
    bar.style.width = pct + '%';
    prog.setAttribute('aria-valuenow', pct);
  }

  function go(id) {
    if (busy || id === cur || order.indexOf(id) < 0) return false;
    busy = true;
    const next = document.getElementById(id);
    const prev = cur ? document.getElementById(cur) : null;
    const show = () => {
      if (prev) prev.classList.remove('active', 'leaving');
      cur = id; frac = 0;
      next.classList.add('active');
      next.scrollTop = 0;
      render();
      const f = next.querySelector('[data-focus]') || next;
      f.setAttribute('tabindex', '-1');
      f.focus({ preventScroll: true });
      if (enterCb) enterCb(id);
      busy = false;
    };
    if (prev) { prev.classList.add('leaving'); setTimeout(show, Effects.reduced() ? 0 : 350); }
    else show();
    return true;
  }

  function reset(id) {
    busy = false; cur = null;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'leaving'));
    go(id);
  }

  window.Nav = {
    go, reset,
    setFrac(f) { frac = f; render(); },
    onEnter(fn) { enterCb = fn; },
    current: () => cur
  };
})();
