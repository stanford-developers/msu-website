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
