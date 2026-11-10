/* «Майстерня» — позначки демо.
   1) Пігулка «ДЕМО» одразу після логотипа (за макетом Figma, node 511-169).
   2) Коли колода (інструменти чи ситуації) закінчилась — на її місці
      розмита картка з замком. Натиснули на неї — плашка «Купити гру».
   Підключення: <script src="demo-limit.js" defer></script> перед </body>.
   Основний код демо не змінюється. */
(function () {
  'use strict';

  var BUY_URL = 'https://maisternia-youth-work.com.ua/buy';
  var TIP_TITLE = 'Більше карток у повній грі';
  var TIP_TEXT = 'У коробці 122 інструменти, 40 ситуацій і 16 додаткових карток.';
  var TIP_BTN = 'Придбати гру';

  /* ---------- стилі ---------- */
  var css = '' +
    /* пігулка: розміри відносно логотипа (у Figma лого 42 px, пігулка 35 px, заходить на лого на 4 px) */
    '#demoPill{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;flex:none;' +
    'box-sizing:border-box;height:calc(var(--logo-h,42px)*0.8333);padding:0 calc(var(--logo-h,42px)*0.238);' +
    'margin-left:calc(var(--logo-h,42px)*-0.095);align-self:center;transform:translateY(calc(var(--logo-h,42px)*0.083));' +
    'border-radius:999px;background:#476036;color:#E5F1D4;' +
    'font-family:"Fixel Text",system-ui,-apple-system,Arial,sans-serif;font-weight:600;' +
    'font-size:calc(var(--logo-h,42px)*0.31);line-height:1;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;' +
    'pointer-events:none;user-select:none}' +

    /* заблокована картка поверх порожньої колоди */
    '.demoLocked{position:absolute;left:0;top:0;width:100%;height:100%;z-index:5;cursor:pointer;' +
    'border-radius:7px;overflow:hidden;background:var(--card,#DEF2C5);' +
    'box-shadow:0 2px 3px rgba(var(--shadow,14,24,6),.35),0 8px 18px rgba(var(--shadow,14,24,6),.25)}' +
    '.demoLocked img{display:block;width:100%;height:100%;object-fit:cover;filter:blur(6px);transform:scale(1.1);opacity:.85;pointer-events:none}' +
    '.demoLocked .dl-veil{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12%;' +
    'background:rgba(222,242,197,.62)}' +
    '.demoLocked .dl-lock{width:52%;aspect-ratio:1;border-radius:50%;background:var(--deep,#40542D);display:grid;place-items:center}' +
    '.demoLocked .dl-lock svg{width:48%;height:48%;fill:none;stroke:var(--light,#E5F1D4);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
    '.demoLocked .dl-cap{font:700 13px/1.15 var(--f-text,"Fixel Text",Arial,sans-serif);letter-spacing:.08em;text-transform:uppercase;' +
    'color:var(--deep,#40542D);text-align:center;padding:0 6px}' +
    '.demoLocked:focus-visible{outline:3px solid var(--light,#E5F1D4);outline-offset:3px}' +

    /* плашка «Купити гру» (поза столом, щоб не масштабувалась разом із ним) */
    '#demoBuyTip{position:fixed;z-index:1000;box-sizing:border-box;width:280px;max-width:calc(100vw - 32px);' +
    'padding:16px 16px 14px;border-radius:16px;background:var(--light,#E5F1D4);color:var(--text,#1d2814);' +
    'box-shadow:0 8px 24px rgba(var(--shadow,14,24,6),.3)}' +
    '#demoBuyTip[hidden]{display:none}' +
    '#demoBuyTip h4{margin:0 26px 6px 0;font:600 16px/1.15 var(--f-text,"Fixel Text",Arial,sans-serif);color:var(--green,#51643C)}' +
    '#demoBuyTip p{margin:0 0 12px;font:400 13px/1.4 var(--f-text,"Fixel Text",Arial,sans-serif)}' +
    '#demoBuyTip a{display:inline-flex;align-items:center;height:38px;padding:0 16px;background:var(--green,#51643C);color:var(--light,#E5F1D4);' +
    'font:500 12px/1 var(--f-text,"Fixel Text",Arial,sans-serif);letter-spacing:.1em;text-transform:uppercase;text-decoration:none}' +
    '#demoBuyTip .dl-x{position:absolute;top:8px;right:8px;width:28px;height:28px;border:0;background:none;cursor:pointer;' +
    'color:var(--green,#51643C);font-size:20px;line-height:1}';

  var style = document.createElement('style');
  style.id = 'demoLimitStyles';
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- 1. пігулка «ДЕМО» ---------- */
  function addPill() {
    var logo = document.getElementById('logo');
    if (!logo || document.getElementById('demoPill')) return;
    var pill = document.createElement('span');
    pill.id = 'demoPill';
    pill.textContent = 'Демо';
    logo.insertAdjacentElement('afterend', pill);

    var img = logo.querySelector('img') || logo;
    function sync() {
      var h = img.getBoundingClientRect().height;
      if (h > 0) document.documentElement.style.setProperty('--logo-h', h + 'px');
      // у шапці між елементами є gap — компенсуємо його, щоб пігулка заходила на лого, як у Figma
      var parent = pill.parentElement;
      var gap = parent ? parseFloat(getComputedStyle(parent).columnGap) || 0 : 0;
      pill.style.marginLeft = 'calc(' + (-gap) + 'px + var(--logo-h,42px)*-0.095)';
    }
    sync();
    if (img.complete === false) img.addEventListener('load', sync);
    if (window.ResizeObserver) new ResizeObserver(sync).observe(img);
    window.addEventListener('resize', sync);
  }

  /* ---------- 2. заблоковані картки ---------- */
  var tip;
  function buildTip() {
    tip = document.createElement('div');
    tip.id = 'demoBuyTip';
    tip.setAttribute('role', 'dialog');
    tip.setAttribute('aria-label', TIP_TITLE);
    tip.hidden = true;
    tip.innerHTML =
      '<button class="dl-x" type="button" aria-label="Закрити">×</button>' +
      '<h4></h4><p></p><a target="_blank" rel="noopener"></a>';
    tip.querySelector('h4').textContent = TIP_TITLE;
    tip.querySelector('p').textContent = TIP_TEXT;
    var a = tip.querySelector('a');
    a.textContent = TIP_BTN;
    a.href = BUY_URL;
    tip.querySelector('.dl-x').addEventListener('click', hideTip);
    tip.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    tip.addEventListener('click', function (e) { e.stopPropagation(); });
    document.body.appendChild(tip);
  }

  function showTip(anchor) {
    if (!tip) buildTip();
    tip.hidden = false;
    var r = anchor.getBoundingClientRect();
    var w = tip.offsetWidth, h = tip.offsetHeight, gap = 14, m = 16;
    var vw = window.innerWidth, vh = window.innerHeight;
    var left = r.right + gap;
    if (left + w > vw - m) left = r.left - gap - w;          // не влазить праворуч — ліворуч
    if (left < m) left = Math.max(m, Math.min(vw - w - m, r.left)); // телефон — під карткою, по її лівому краю
    var top = r.top;
    if (left === r.right + gap || left === r.left - gap - w) {
      top = Math.min(Math.max(m, r.top), vh - h - m);
    } else {
      top = r.bottom + gap;                                    // під карткою
      if (top + h > vh - m) top = Math.max(m, r.top - gap - h);
    }
    tip.style.left = Math.round(left) + 'px';
    tip.style.top = Math.round(top) + 'px';
    var link = tip.querySelector('a');
    if (link && link.focus) link.focus({ preventScroll: true });
  }
  function hideTip() { if (tip) tip.hidden = true; }

  document.addEventListener('pointerdown', function (e) {
    if (tip && !tip.hidden && !e.target.closest('.demoLocked')) hideTip();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTip(); });
  window.addEventListener('wheel', hideTip, { passive: true });
  window.addEventListener('resize', hideTip);

  // зразок лицьової сторони для розмиття: будь-яка картка цієї колоди, що вже є на сторінці
  function faceFor(kind) {
    var re = kind === 's' ? /\/cards\/s\d+s?\.webp/ : /\/cards\/t\d+s?\.webp/;
    var imgs = document.images;
    for (var i = 0; i < imgs.length; i++) if (re.test(imgs[i].src)) return imgs[i].src;
    return 'cards/back-' + kind + '.webp';
  }

  function deckKind(deck) {
    var label = deck.querySelector('.label');
    var t = (label ? label.textContent : deck.textContent || '').toLowerCase();
    if (t.indexOf('ситуац') !== -1) return 's';
    if (t.indexOf('інструмент') !== -1) return 't';
    return null;
  }

  function deckCount(deck) {
    var label = deck.querySelector('.label');
    var m = (label ? label.textContent : '').match(/(\d+)\s*$/);
    return m ? parseInt(m[1], 10) : null;
  }

  function lockDeck(deck, kind) {
    if (deck.querySelector(':scope > .demoLocked')) return;
    if (getComputedStyle(deck).position === 'static') deck.style.position = 'relative';
    var el = document.createElement('div');
    el.className = 'demoLocked';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Колода закінчилась. ' + TIP_TITLE);
    el.innerHTML =
      '<img alt="">' +
      '<div class="dl-veil"><div class="dl-lock"><svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div>' +
      '<div class="dl-cap">Повна гра</div></div>';
    el.querySelector('img').src = faceFor(kind);
    var open = function (e) { e.preventDefault(); e.stopPropagation(); showTip(el); };
    el.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    el.addEventListener('click', open);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') open(e); });
    var stack = deck.querySelector('.stack');
    var box = stack || deck;
    // кладемо картку точно на місце стосу
    if (stack) {
      el.style.left = stack.offsetLeft + 'px';
      el.style.top = stack.offsetTop + 'px';
      el.style.width = stack.offsetWidth + 'px';
      el.style.height = stack.offsetHeight + 'px';
    }
    deck.appendChild(el);
    if (box !== deck) box.style.visibility = 'hidden';
  }

  function unlockDeck(deck) {
    var el = deck.querySelector(':scope > .demoLocked');
    if (!el) return;
    el.remove();
    var stack = deck.querySelector('.stack');
    if (stack) stack.style.visibility = '';
    hideTip();
  }

  function scan() {
    var decks = document.querySelectorAll('.deck');
    for (var i = 0; i < decks.length; i++) {
      var d = decks[i], kind = deckKind(d), n = deckCount(d);
      if (!kind || n === null) continue;
      if (n === 0) lockDeck(d, kind); else unlockDeck(d);
    }
  }

  var queued = false;
  function queueScan() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; scan(); });
  }

  function start() {
    addPill();
    scan();
    new MutationObserver(queueScan).observe(document.body, { subtree: true, childList: true, characterData: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
