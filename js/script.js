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
