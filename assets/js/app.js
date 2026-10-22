/* ==========================================================================
   Marienbräu — page behaviour
   No dependencies. Data: data.js · Translations: i18n.js
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var I18N = window.MB_I18N || { de: {} };
  var HOURS = window.MB_HOURS || {};
  var MENU = window.MB_MENU || [];
  var REVIEWS = window.MB_REVIEWS || [];
  var TZ = 'Europe/Vienna';
  var LAST_SEATING_BEFORE_CLOSE = 90; // minutes
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  /* ------------------------------------------------------------------------
     i18n — snapshot the German copy from the DOM, overlay English on demand
     ------------------------------------------------------------------------ */
  var lang = 'de';
  var LOCALES = { de: 'de-AT', en: 'en-GB', it: 'it-IT', hu: 'hu-HU', pl: 'pl-PL', ro: 'ro-RO' };
  var LANG_KEY = 'mb_lang';
  // Primary language subtags we serve (gsw = Swiss German)
  var LANG_ALIASES = { de: 'de', gsw: 'de', en: 'en', it: 'it', hu: 'hu', pl: 'pl', ro: 'ro', mo: 'ro' };
  var TZ_LANGS = {
    'Europe/Vienna': 'de', 'Europe/Berlin': 'de', 'Europe/Zurich': 'de', 'Europe/Busingen': 'de', 'Europe/Vaduz': 'de',
    'Europe/Rome': 'it', 'Europe/San_Marino': 'it', 'Europe/Vatican': 'it',
    'Europe/Budapest': 'hu', 'Europe/Warsaw': 'pl', 'Europe/Bucharest': 'ro', 'Europe/Chisinau': 'ro'
  };
  var onLangChange = [];

  $$('[data-i18n]').forEach(function (el) { I18N.de[el.dataset.i18n] = I18N.de[el.dataset.i18n] || el.textContent.trim(); });
  $$('[data-i18n-html]').forEach(function (el) { I18N.de[el.dataset.i18nHtml] = I18N.de[el.dataset.i18nHtml] || el.innerHTML.trim(); });
  $$('[data-i18n-attr]').forEach(function (el) {
    el.dataset.i18nAttr.split(';').forEach(function (pair) {
      var parts = pair.split(':');
      var key = parts[1];
      if (!(key in I18N.de)) I18N.de[key] = el.getAttribute(parts[0]) || '';
    });
  });

  function t(key, vars) {
    var str = (I18N[lang] && I18N[lang][key]) || I18N.de[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { str = str.split('{' + k + '}').join(vars[k]); });
    return str;
  }

  /* A language the visitor clicked always wins; otherwise the first supported
     browser language, then the time zone, then English. */
  function detectUserLanguage() {
    var saved = store.get(LANG_KEY) || store.get('mb-lang');
    if (saved && LOCALES[saved]) return saved;
    var prefs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < prefs.length; i++) {
      var match = LANG_ALIASES[String(prefs[i] || '').toLowerCase().split(/[-_]/)[0]];
      if (match) return match;
    }
    try {
      var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (TZ_LANGS[zone]) return TZ_LANGS[zone];
    } catch (e) { /* no Intl time zone support */ }
    return 'en';
  }

  function setLang(next) {
    lang = LOCALES[next] ? next : 'en';
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(';').forEach(function (pair) {
        var parts = pair.split(':');
        el.setAttribute(parts[0], t(parts[1]));
      });
    });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    onLangChange.forEach(function (fn) { fn(); });
  }

  $$('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.dataset.lang); store.set(LANG_KEY, lang); });
  });

  /* ------------------------------------------------------------------------
     Vienna time helpers
     ------------------------------------------------------------------------ */
  var WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function viennaNow() {
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      day: WEEKDAYS[parts.weekday],
      minutes: (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10),
      iso: parts.year + '-' + parts.month + '-' + parts.day
    };
  }

  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function parseIsoDate(iso) {
    var p = iso.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  /* ------------------------------------------------------------------------
     Opening hours & live status
     ------------------------------------------------------------------------ */
  function computeStatus() {
    var now = viennaNow();
    var today = HOURS[now.day];
    if (today && now.minutes >= today.open && now.minutes < today.close) {
      var soon = today.close - now.minutes <= 60;
      return { state: soon ? 'soon' : 'open', text: t(soon ? 'status.soon' : 'status.open', { close: fmt(today.close) }) };
    }
    if (today && now.minutes < today.open) {
      return { state: 'closed', text: t('status.today', { open: fmt(today.open) }) };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (HOURS[d]) {
        var key = i === 1 ? 'status.tomorrow' : 'status.later';
        return { state: 'closed', text: t(key, { open: fmt(HOURS[d].open), day: t('day.' + d) }) };
      }
    }
    return { state: 'closed', text: '' };
  }

  function renderStatus() {
    var s = computeStatus();
    var now = viennaNow();
    $$('[data-live-status]').forEach(function (el) {
      el.classList.remove('is-open', 'is-soon', 'is-closed');
      el.classList.add('is-' + s.state);
      var txt = $('[data-live-text]', el);
      if (txt) txt.textContent = s.text;
    });
    var headline = $('[data-live-headline]');
    if (headline) headline.textContent = t(s.state === 'closed' ? 'headline.closed' : 'headline.' + s.state);

    $$('[data-hours-table] tr').forEach(function (tr) {
      var isToday = Number(tr.dataset.day) === now.day;
      tr.classList.toggle('is-today', isToday);
      var th = $('th', tr);
      if (isToday) th.setAttribute('data-today', t('hours.today')); else th.removeAttribute('data-today');
    });

    var todayHours = HOURS[now.day];
    $$('[data-today-hours]').forEach(function (el) {
      el.textContent = todayHours
        ? t('today.hours', { open: fmt(todayHours.open), close: fmt(todayHours.close) })
        : t('today.closed');
    });
  }

  renderStatus();
  setInterval(renderStatus, 60 * 1000);
  onLangChange.push(renderStatus);

  /* ------------------------------------------------------------------------
     Header: scrolled state, mobile menu, active section
     ------------------------------------------------------------------------ */
  var header = $('[data-header]');
  var toggle = $('[data-menu-toggle]');
  var actionBar = $('[data-action-bar]');
  var hero = $('.hero');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 24);
    if (actionBar && hero) actionBar.classList.toggle('is-visible', y > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  }
  toggle.addEventListener('click', function () { setMenu(!header.classList.contains('is-open')); });
  $$('[data-mobile-nav] a, [data-mobile-nav] button').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1280) setMenu(false); });

  if ('IntersectionObserver' in window) {
    var links = $$('.nav-link');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) spy.observe(s); });

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealer.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el) { revealer.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------------
     Optional photos: use real images when present, keep illustrations otherwise
     ------------------------------------------------------------------------ */
  function probe(src, ok) {
    var img = new Image();
    img.onload = function () { if (img.naturalWidth > 0) ok(src); };
    img.src = src;
  }

  var heroPhoto = $('[data-hero-photo]');
  if (heroPhoto) probe(heroPhoto.dataset.src, function (src) {
    heroPhoto.style.backgroundImage = 'url("' + src + '")';
    heroPhoto.classList.add('is-loaded');
  });

  $$('[data-photo]').forEach(function (fig) {
    probe(fig.dataset.photo, function (src) {
      $('.g-photo', fig).style.backgroundImage = 'url("' + src + '")';
      fig.classList.add('has-photo');
    });
  });

  var ownerFrame = $('[data-owner-frame]');
  var ownerImg = $('[data-owner-photo]');
  if (ownerFrame && ownerImg) {
    var markOwner = function () { if (ownerImg.naturalWidth > 0) ownerFrame.classList.add('has-photo'); };
    if (ownerImg.complete) markOwner(); else ownerImg.addEventListener('load', markOwner);
  }

  /* ------------------------------------------------------------------------
     Menu
     ------------------------------------------------------------------------ */
  var TAG_ICONS = { veg: 'i-leaf', regional: 'i-mountain', house: 'i-chef', beer: 'i-beer', season: 'i-sun' };
  var menuGrid = $('[data-menu-grid]');
  var activeFilter = 'all';

  function price(n) {
    return '€ ' + n.toLocaleString(LOCALES[lang], { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderMenu() {
    if (!menuGrid) return;
    var items = MENU.filter(function (d) { return activeFilter === 'all' || d.cat === activeFilter; });
    if (!items.length) {
      menuGrid.innerHTML = '<p>' + escapeHtml(t('menu.empty')) + '</p>';
      return;
    }
    menuGrid.innerHTML = items.map(function (d, i) {
      var copy = d[lang] || d.de;
      var size = d.size ? (lang === 'en' ? d.size.replace(/,/g, '.') : d.size) : '';
      var tags = d.tags.map(function (tag) {
        return '<span class="tag tag--' + tag + '"><svg aria-hidden="true"><use href="#' + TAG_ICONS[tag] + '"/></svg>' + escapeHtml(t('tag.' + tag)) + '</span>';
      }).join('');
      return '<article class="dish" style="animation-delay:' + Math.min(i * 40, 400) + 'ms">' +
        (d.star ? '<span class="dish-star">★ ' + escapeHtml(t('menu.recommend')) + '</span>' : '') +
        '<div class="dish-head"><h3 class="dish-name">' + escapeHtml(copy.name) + '</h3><span class="dish-dots" aria-hidden="true"></span>' +
        '<span class="dish-price">' + price(d.price) + '</span></div>' +
        (size ? '<p class="dish-meta">' + escapeHtml(size) + '</p>' : '') +
        '<p class="dish-desc">' + escapeHtml(copy.desc) + '</p>' +
        (d.allergens ? '<p class="text-[11px] mt-1 tracking-wide" style="color:var(--muted);opacity:0.85">' + escapeHtml(t('menu.allergens')) + ': ' + escapeHtml(d.allergens) + '</p>' : '') +
        '<div class="flex flex-wrap gap-1.5 mt-auto pt-1">' + tags + '</div>' +
        '</article>';
    }).join('');
  }

  $$('[data-menu-filters] .pill').forEach(function (pill) {
    var count = pill.dataset.filter === 'all' ? MENU.length : MENU.filter(function (d) { return d.cat === pill.dataset.filter; }).length;
    var badge = document.createElement('span');
    badge.className = 'count';
    badge.textContent = count;
    pill.appendChild(badge);
    pill.addEventListener('click', function () {
      activeFilter = pill.dataset.filter;
      $$('[data-menu-filters] .pill').forEach(function (p) { p.setAttribute('aria-pressed', String(p === pill)); });
      renderMenu();
    });
  });
  renderMenu();
  onLangChange.push(renderMenu);

  /* ------------------------------------------------------------------------
     Reviews carousel
     ------------------------------------------------------------------------ */
  var track = $('[data-carousel-track]');
  var dotsWrap = $('[data-carousel-dots]');
  var autoTimer = null;

  function starRow() {
    var s = '';
    for (var i = 0; i < 5; i++) s += '<svg><use href="#i-star"/></svg>';
    return '<span class="stars" aria-label="5 / 5">' + s + '</span>';
  }

  function renderReviews() {
    if (!track) return;
    track.innerHTML = REVIEWS.map(function (r, i) {
      var initials = r.name.split(' ').map(function (p) { return p.charAt(0); }).join('').slice(0, 2);
      return '<article class="review" role="group" aria-roledescription="slide" aria-label="' +
        escapeHtml(t('reviews.slide', { i: i + 1, n: REVIEWS.length })) + '">' +
        starRow() +
        '<blockquote class="mt-3">' + escapeHtml(r[lang] || r.de) + '</blockquote>' +
        '<footer class="mt-5 flex items-center gap-3">' +
        '<span class="avatar" style="background:' + r.color + '" aria-hidden="true">' + escapeHtml(initials) + '</span>' +
        '<span><strong class="block text-sm">' + escapeHtml(r.name) + '</strong>' +
        '<span class="text-xs" style="color:var(--muted)">' + escapeHtml(t('reviews.source')) + '</span></span>' +
        '</footer></article>';
    }).join('');
    renderDots();
  }

  function slideWidth() {
    var first = track.firstElementChild;
    if (!first) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return first.getBoundingClientRect().width + gap;
  }

  function pageCount() {
    return Math.max(1, Math.ceil((track.scrollWidth - track.clientWidth) / slideWidth()) + 1);
  }

  function currentPage() {
    return Math.round(track.scrollLeft / slideWidth());
  }

  function renderDots() {
    if (!dotsWrap) return;
    var n = pageCount();
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<button type="button" aria-label="' + escapeHtml(t('reviews.slide', { i: i + 1, n: n })) + '" data-dot="' + i + '"></button>';
    }
    dotsWrap.innerHTML = html;
    updateDots();
  }

  function updateDots() {
    var cur = currentPage();
    $$('[data-dot]', dotsWrap).forEach(function (d) {
      d.setAttribute('aria-current', String(Number(d.dataset.dot) === cur));
    });
  }

  function goTo(i) {
    var n = pageCount();
    var idx = (i + n) % n;
    track.scrollTo({ left: idx * slideWidth(), behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  if (track) {
    renderReviews();
    onLangChange.push(renderReviews);
    $('[data-carousel-prev]').addEventListener('click', function () { goTo(currentPage() - 1); });
    $('[data-carousel-next]').addEventListener('click', function () { goTo(currentPage() + 1); });
    dotsWrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dot]');
      if (b) goTo(Number(b.dataset.dot));
    });
    var scrollTick;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTick);
      scrollTick = setTimeout(updateDots, 80);
    }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentPage() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentPage() - 1); }
    });
    window.addEventListener('resize', renderDots);

    var carousel = $('[data-carousel]');
    var startAuto = function () {
      if (reducedMotion || autoTimer) return;
      autoTimer = setInterval(function () { goTo(currentPage() + 1); }, 6000);
    };
    var stopAuto = function () { clearInterval(autoTimer); autoTimer = null; };
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin', stopAuto);
    carousel.addEventListener('focusout', startAuto);
    carousel.addEventListener('touchstart', stopAuto, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) startAuto(); else stopAuto(); });
      }).observe(carousel);
    }
  }

  /* ------------------------------------------------------------------------
     Modals (reservation + legal) with focus trap
     ------------------------------------------------------------------------ */
  var openModalEl = null;
  var lastFocus = null;

  function focusables(root) {
    return $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }

  function openModal(name) {
    var modal = $('[data-modal="' + name + '"]');
    if (!modal) return;
    if (header.classList.contains('is-open')) setMenu(false);
    lastFocus = document.activeElement;
    openModalEl = modal;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(function () {
      var first = $('input, select, textarea', modal) || focusables(modal)[0];
      if (first) first.focus();
    }, 60);
  }

  function closeModal() {
    if (!openModalEl) return;
    openModalEl.classList.remove('is-open');
    openModalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    openModalEl = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var groupBtn = e.target.closest('[data-open-reservation-group]');
    if (groupBtn) {
      e.preventDefault();
      prepareReservation();
      var gVal = groupBtn.getAttribute('data-open-reservation-group') || '80';
      if (guestSelect) guestSelect.value = gVal;
      openModal('reservation');
      return;
    }
    if (e.target.closest('[data-open-reservation]')) { e.preventDefault(); prepareReservation(); openModal('reservation'); }
    var openM = e.target.closest('[data-open-modal]');
    if (openM) { e.preventDefault(); openModal(openM.dataset.openModal); }
    if (e.target.closest('[data-close-modal]')) closeModal();
    var legal = e.target.closest('[data-open-legal]');
    if (legal) { e.preventDefault(); showLegal(legal.dataset.openLegal); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (openModalEl) closeModal();
      else if (header.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    }
    if (e.key === 'Tab' && openModalEl) {
      var f = focusables(openModalEl);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function showLegal(which) {
    var key = which === 'privacy' ? 'privacy' : 'impressum';
    $('[data-legal-title]').textContent = t('legal.' + key + '.title');
    $('[data-legal-body]').innerHTML = t('legal.' + key + '.body');
    openModal('legal');
  }

  /* ------------------------------------------------------------------------
     Reservation form
     ------------------------------------------------------------------------ */
  var form = $('[data-res-form]');
  var dateInput = $('#r-date');
  var timeSelect = $('#r-time');
  var guestSelect = $('[data-guests]');

  function renderGuests() {
    var selected = guestSelect.value || '2';
    var html = '';
    for (var n = 1; n <= 12; n++) {
      html += '<option value="' + n + '">' + escapeHtml(n === 1 ? t('res.guest1') : t('res.guestN', { n: n })) + '</option>';
    }
    html += '<option value="20">' + escapeHtml(t('res.group15') || '13 – 25 Personen (Gruppe)') + '</option>';
    html += '<option value="40">' + escapeHtml(t('res.group35') || '25 – 50 Personen (Gruppe)') + '</option>';
    html += '<option value="80">' + escapeHtml(t('res.group80') || 'Bis zu 80 Personen (Großgruppe / Bus)') + '</option>';
    html += '<option value="more">' + escapeHtml(t('res.guestMore') || 'Mehr als 80 Personen') + '</option>';
    guestSelect.innerHTML = html;
    guestSelect.value = selected;
  }

  function dateProblem(iso) {
    if (!iso) return 'err.date';
    if (iso < viennaNow().iso) return 'err.past';
    if (!HOURS[parseIsoDate(iso).getDay()]) return 'err.monday';
    return null;
  }

  function renderTimes() {
    var iso = dateInput.value;
    var previous = timeSelect.value;
    var hours = iso && !dateProblem(iso) ? HOURS[parseIsoDate(iso).getDay()] : null;
    if (!hours) {
      timeSelect.innerHTML = '<option value="">' + escapeHtml(t('res.timePick')) + '</option>';
      return;
    }
    var now = viennaNow();
    var earliest = iso === now.iso ? now.minutes + 30 : 0;
    var html = '<option value="">' + escapeHtml(t('res.timeChoose')) + '</option>';
    for (var m = hours.open; m <= hours.close - LAST_SEATING_BEFORE_CLOSE; m += 30) {
      if (m >= earliest) html += '<option value="' + fmt(m) + '">' + fmt(m) + '</option>';
    }
    timeSelect.innerHTML = html;
    if (previous && $('option[value="' + previous + '"]', timeSelect)) timeSelect.value = previous;
  }

  function prepareReservation() {
    dateInput.min = viennaNow().iso;
    renderTimes();
  }

  function setError(input, key) {
    var field = input.closest('.field');
    field.classList.toggle('has-error', !!key);
    input.setAttribute('aria-invalid', String(!!key));
    var msg = $('.error', field);
    if (key && msg) {
      msg.textContent = t(key);
      if (!msg.id) msg.id = input.id + '-error';
      input.setAttribute('aria-describedby', msg.id);
    }
  }

  var validators = {
    name: function (v) { return v.trim().length >= 2 ? null : 'err.name'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'err.email'; },
    phone: function (v) { return /^\+?[0-9\s/()-]{6,20}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 6 ? null : 'err.phone'; },
    date: dateProblem,
    time: function (v) { return v ? null : 'err.time'; },
    guests: function (v) {
      return v ? null : 'err.guests';
    }
  };

  function validateField(input) {
    var fn = validators[input.name];
    if (!fn) return true;
    var problem = fn(input.value);
    setError(input, problem);
    return !problem;
  }

  if (form) {
    renderGuests();
    guestSelect.value = '2';
    onLangChange.push(function () {
      renderGuests();
      renderTimes();
      $$('.field.has-error', form).forEach(function (f) {
        var input = $('input, select, textarea', f);
        validateField(input);
      });
    });

    dateInput.addEventListener('change', function () { renderTimes(); validateField(dateInput); });
    $$('input, select', form).forEach(function (input) {
      input.addEventListener('blur', function () { if (input.value) validateField(input); });
      input.addEventListener('input', function () {
        if (input.closest('.field') && input.closest('.field').classList.contains('has-error')) validateField(input);
      });
    });
    guestSelect.addEventListener('change', function () { validateField(guestSelect); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var inputs = Object.keys(validators).map(function (n) { return form.elements[n]; });
      var firstBad = null;
      inputs.forEach(function (input) { if (!validateField(input) && !firstBad) firstBad = input; });
      if (firstBad) { firstBad.focus(); return; }

      /* Client-side static reservation mailer: 0 API, 0 server.
         Fills a complete structured email over the user's computer and opens it to marienbraeu@gmx.at */
      var data = new FormData(form);
      var rawGuests = data.get('guests');
      var dateLabel = parseIsoDate(data.get('date')).toLocaleDateString(LOCALES[lang], {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      var guestLabel = '';
      if (rawGuests === '1') guestLabel = t('res.guest1');
      else if (!isNaN(Number(rawGuests)) && Number(rawGuests) <= 12) guestLabel = t('res.guestN', { n: Number(rawGuests) });
      else if (rawGuests === '20') guestLabel = t('res.group15') || '13 – 25 Personen (Gruppe)';
      else if (rawGuests === '40') guestLabel = t('res.group35') || '25 – 50 Personen (Gruppe)';
      else if (rawGuests === '80') guestLabel = t('res.group80') || 'Bis zu 80 Personen (Großgruppe / Bus)';
      else guestLabel = t('res.guestMore') || 'Gruppe über 80 Personen';
      var name = (data.get('name') || '').trim();
      var email = (data.get('email') || '').trim();
      var phone = (data.get('phone') || '').trim();
      var time = (data.get('time') || '').trim();
      var seatVal = data.get('seat') || 'egal';
      var seatNames = {
        stube: { de: 'Gaststube (drinnen)', en: 'Inside dining room (Gaststube)', it: 'Sala interna (Gaststube)' },
        garten: { de: 'Gastgarten (draußen)', en: 'Beer garden (Gastgarten)', it: 'Giardino all’aperto (Gastgarten)' },
        egal: { de: 'Keine Präferenz / egal', en: 'No preference', it: 'Nessuna preferenza' }
      };
      var seatLabel = (seatNames[seatVal] && seatNames[seatVal][lang]) || seatNames[seatVal].de;
      var notes = (data.get('notes') || '').trim() || (lang === 'de' ? 'Keine' : (lang === 'it' ? 'Nessuna' : 'None'));
      // guestLabel already computed above

      var subject = 'Tischreservierung Marienbräu: ' + name + ' – ' + dateLabel + ' um ' + time + ' Uhr (' + guestLabel + ')';
      var body = 'Hallo Marienbräu-Team,\n\n' +
        'ich möchte gerne einen Tisch bei Ihnen reservieren:\n\n' +
        '• Name: ' + name + '\n' +
        '• Telefon: ' + phone + '\n' +
        '• E-Mail: ' + email + '\n' +
        '• Datum: ' + dateLabel + '\n' +
        '• Uhrzeit: ' + time + ' Uhr\n' +
        '• Personenanzahl: ' + guestLabel + '\n' +
        '• Sitzplatzwunsch: ' + seatLabel + '\n' +
        '• Besondere Wünsche / Anmerkungen: ' + notes + '\n\n' +
        'Bitte um kurze Bestätigung dieser Reservierungsanfrage.\n\n' +
        'Mit freundlichen Grüßen,\n' + name;

      var mailtoUrl = 'mailto:marienbraeu@gmx.at?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      // Trigger user\'s local email client on their computer/phone
      window.location.href = mailtoUrl;

      showToast(
        t('toast.title'),
        t('toast.text') + '<br><span class="text-xs opacity-90">' + t('toast.detail', { date: dateLabel, time: time, guests: guestLabel }) + '</span>',
        mailtoUrl
      );

      form.reset();
      guestSelect.value = '2';
      renderTimes();
      $$('.field', form).forEach(function (f) { f.classList.remove('has-error'); });
      closeModal();
    });
  }

  /* ------------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------------ */
  var toast = $('[data-toast]');
  var toastTimer = null;
  function showToast(title, text, mailtoUrl) {
    $('[data-toast-title]', toast).textContent = title;
    var bodyHtml = text;
    if (mailtoUrl) {
      bodyHtml += '<div class="mt-3 pt-2 border-t border-white/20"><a href="' + mailtoUrl + '" class="inline-flex items-center gap-1.5 underline font-bold text-xs" style="color:var(--amber)"><svg style="width:14px;height:14px"><use href="#i-mail"/></svg><span>' + escapeHtml(t('toast.reopen') || 'E-Mail nochmals öffnen') + '</span></a></div>';
    }
    $('[data-toast-text]', toast).innerHTML = bodyHtml;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 14000);
  }
  $('[data-toast-close]').addEventListener('click', function () { toast.classList.remove('is-visible'); });

  /* ------------------------------------------------------------------------
     Google Maps — only embedded after an explicit click (DSGVO)
     ------------------------------------------------------------------------ */
  var loadMapBtn = $('[data-load-map]');
  if (loadMapBtn) loadMapBtn.addEventListener('click', function () {
    var shell = $('[data-map]');
    var iframe = document.createElement('iframe');
    iframe.title = 'Google Maps — Marienbräu, Rupertistraße 80, 8075 Hart bei Graz';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Marienbräu, Rupertistraße 80, 8075 Hart bei Graz') + '&output=embed';
    shell.appendChild(iframe);
    $('[data-map-placeholder]').remove();
  });

  /* ------------------------------------------------------------------------
     Misc
     ------------------------------------------------------------------------ */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  setLang(detectUserLanguage());
})();
