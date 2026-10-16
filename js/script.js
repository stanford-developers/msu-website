/* ================================================================
   STANFORD MSU  ·  script.js
   ================================================================ */

// ── Load shared nav/footer partials, then wire up everything that
//    depends on them existing in the DOM ──────────────────────────
async function loadPartial(placeholderId, url) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  const res = await fetch(url);
  el.outerHTML = await res.text();
}

async function initPartials() {
  await Promise.all([
    loadPartial('site-nav', 'partials/nav.html'),
    loadPartial('site-footer', 'partials/footer.html')
  ]);

  // ── Footer year ──────────────────────────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Navbar: solid on non-home pages, scroll-triggered on home ────
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  if (window.navSolid) navbar.classList.add('navbar-solid');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── Mobile hamburger menu ─────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is tapped
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // ── Resources dropdown ─────────────────────────────────────────────
  document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = btn.closest('.nav-dropdown');
      const isOpen   = dropdown.classList.contains('open');

      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
  });
}

initPartials();

// ── Generic reveal-on-scroll (.reveal elements) ───────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Committee honeycomb (about.html): hover or tap a hexagon to enlarge it ──
//
// A mouse opens a committee on hover. Touch and keyboard toggle it on
// click; tapping outside or pressing Escape closes it.
document.querySelectorAll('.committee-orbit').forEach(orbit => {
  const nodes = [...orbit.querySelectorAll('.committee-node')];
  let lastPointer = '';

  const setActive = (node) => {
    nodes.forEach(n => {
      n.classList.toggle('active', n === node);
      n.setAttribute('aria-expanded', String(n === node));
    });
    orbit.classList.toggle('has-active', Boolean(node));
  };

  nodes.forEach(node => {
    node.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') setActive(node); });
    node.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') setActive(null); });
    node.addEventListener('pointerdown', e => { lastPointer = e.pointerType; });
    node.addEventListener('click', () => {
      const wasMouse = lastPointer === 'mouse';
      lastPointer = '';
      if (wasMouse) return;   // hover already opened it
      setActive(node.classList.contains('active') ? null : node);
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.committee-node')) setActive(null);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setActive(null);
  });
});

// ── Recurring events: click a flyer circle to see the full flyer ──
//
// Each .flyer-circle names its image in data-flyer. Until that file
// exists in assets/flyers/, the circle shows its icon and isn't clickable.
//
const flyerViewer = document.getElementById('flyer-viewer');

if (flyerViewer) {
  const fvImg     = document.getElementById('flyer-viewer-img');
  const fvCaption = document.getElementById('flyer-viewer-caption');
  const fvClose   = document.getElementById('flyer-viewer-close');
  let lastFocused = null;

  function openFlyer(circle) {
    const text = sel => circle.querySelector(sel).textContent.trim();
    lastFocused = circle;
    fvImg.src = circle.dataset.flyer;
    fvImg.alt = `${text('.flyer-name')} flyer`;
    fvCaption.textContent = `${text('.flyer-name')} · ${text('.flyer-when')} · ${text('.flyer-where')}`;
    flyerViewer.hidden = false;
    document.body.classList.add('lightbox-open');
    requestAnimationFrame(() => flyerViewer.classList.add('open'));
    fvClose.focus();
  }

  function closeFlyer() {
    flyerViewer.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    setTimeout(() => { flyerViewer.hidden = true; fvImg.removeAttribute('src'); }, 250);
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.flyer-circle').forEach(circle => {
    const img = circle.querySelector('img');
    const markMissing = () => {
      circle.querySelector('.flyer-thumb').classList.add('missing');
      circle.classList.add('no-flyer');
    };
    if (img.complete && !img.naturalWidth) markMissing();
    img.addEventListener('error', markMissing);

    circle.addEventListener('click', () => {
      if (!circle.classList.contains('no-flyer')) openFlyer(circle);
    });
  });

  fvClose.addEventListener('click', closeFlyer);
  flyerViewer.addEventListener('click', e => {
    if (e.target === flyerViewer || e.target.classList.contains('lightbox-figure')) closeFlyer();
  });
  document.addEventListener('keydown', e => {
    if (!flyerViewer.hidden && e.key === 'Escape') closeFlyer();
  });
}

// ── Announcement popup: shown once per calendar week per visitor ──
//
// To run a new announcement, edit the text below. To turn it off,
// set ANNOUNCEMENT to null. It also stops by itself from the start of
// the endsOn date (visitor's local time).
//
const ANNOUNCEMENT = {
  title: 'Did you sign up for Golden Gate Fajr 2026?!',
  text:  'See details and RSVP at:',
  link:  'https://tinyurl.com/MSU-GGF-26',
  endsOn: '2026-10-17'   // Saturday: no popup from this day on
};

function weekKey(date = new Date()) {
  // the Monday that starts this week, e.g. "2026-10-12"
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function showAnnouncement() {
  const STORE = 'msu-announcement-seen';
  const week  = weekKey();
  try {
    if (localStorage.getItem(STORE) === week) return;
    localStorage.setItem(STORE, week);
  } catch (e) { /* storage blocked: just show it */ }

  const popup = document.createElement('div');
  popup.className = 'announce';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute('aria-labelledby', 'announce-title');
  popup.innerHTML = `
    <div class="announce-card">
      <button class="announce-close" type="button" aria-label="Close">&times;</button>
      <p class="announce-title" id="announce-title"></p>
      <p class="announce-text"></p>
      <a class="announce-link" target="_blank" rel="noopener"></a>
    </div>`;
  popup.querySelector('.announce-title').textContent = ANNOUNCEMENT.title;
  popup.querySelector('.announce-text').textContent  = ANNOUNCEMENT.text;
  const link = popup.querySelector('.announce-link');
  link.href = ANNOUNCEMENT.link;
  link.textContent = ANNOUNCEMENT.link.replace(/^https?:\/\//, '');

  const close = () => {
    popup.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => popup.remove(), 250);
  };
  const onKey = e => { if (e.key === 'Escape') close(); };

  popup.querySelector('.announce-close').addEventListener('click', close);
  popup.addEventListener('click', e => { if (e.target === popup) close(); });
  document.addEventListener('keydown', onKey);

  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add('open'));
  popup.querySelector('.announce-close').focus();
}

function announcementActive() {
  if (!ANNOUNCEMENT) return false;
  if (!ANNOUNCEMENT.endsOn) return true;
  const [y, m, d] = ANNOUNCEMENT.endsOn.split('-').map(Number);
  return new Date() < new Date(y, m - 1, d);   // midnight starting endsOn
}

if (announcementActive()) setTimeout(showAnnouncement, 900);
