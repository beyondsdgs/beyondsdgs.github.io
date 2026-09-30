(function () {
  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var menu   = document.getElementById('menu');

  // hairline appears once the page leaves the top
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    });
  }, { passive: true });

  // mobile menu
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  });

  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'メニューを開く');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.focus();
    }
  });

  // 期間限定バナー：終了日を過ぎたら自動で隠す
  var promo = document.getElementById('promoWFD');
  if (promo) {
    var until = new Date(promo.getAttribute('data-until') + 'T00:00:00+09:00');
    if (!isNaN(until) && Date.now() >= until.getTime()) promo.style.display = 'none';
  }

  // contact form: send in the background so the visitor stays on the page
  var form = document.getElementById('contactForm');
  if (form) {
    var statusEl = document.getElementById('formStatus');
    var sendBtn = form.querySelector('button[type="submit"]');

    var noteEl = form.querySelector('.form-note');

    function say(kind, text) {
      statusEl.className = 'form-status is-' + kind;
      statusEl.textContent = text;
      statusEl.hidden = false;
      if (noteEl) noteEl.hidden = (kind === 'ok');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusEl.hidden = true;
      var label = sendBtn.textContent;
      sendBtn.disabled = true;
      sendBtn.textContent = '送信中…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            say('ok', '送信しました。3営業日以内にご返信します。');
            return;
          }
          return res.json().then(function (data) {
            var msg = data && data.errors
              ? data.errors.map(function (x) { return x.message; }).join(' ')
              : '';
            throw new Error(msg);
          });
        })
        .catch(function () {
          say('ng', '送信できませんでした。お手数ですが、時間をおいて再度お試しください。');
        })
        .then(function () {
          sendBtn.disabled = false;
          sendBtn.textContent = label;
        });
    });
  }

  // one entrance, on load
  requestAnimationFrame(function () {
    document.body.classList.add('is-ready');
  });
})();
