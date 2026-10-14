/* ================================================================
   STANFORD MSU  ·  gallery.js  (gallery.html only)
   ================================================================ */

// ── Gallery: random-order staggered pop-in ────────────────────────
//
// Each gallery item gets a random transition delay when it enters
// the viewport, so images appear to pop in at different times
// rather than all at once or strictly left-to-right.
//
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

// Shuffle helper (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Assign random delays (0 – 500 ms) once at load so the order is
// locked in but still random each page visit.
const shuffled = shuffle(galleryItems);
shuffled.forEach((item, i) => {
  item.style.transitionDelay = `${i * 70}ms`;
});

const galleryObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('pop-in');
        galleryObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);
galleryItems.forEach(item => galleryObserver.observe(item));

// ── Lightbox: click a photo to view it full-screen ────────────────
//
// Reads its slides straight from the grid, so adding or removing a
// .gallery-item in gallery.html is all that's needed — nothing here
// has to be kept in sync.
//
const lightbox = document.getElementById('lightbox');

if (lightbox && galleryItems.length) {
  const lbImg     = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption-text');
  const lbCount   = document.getElementById('lightbox-count');
  const btnClose  = document.getElementById('lightbox-close');
  const btnPrev   = document.getElementById('lightbox-prev');
  const btnNext   = document.getElementById('lightbox-next');

  const slides = galleryItems.map(item => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.caption');
    return { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '', caption: cap ? cap.textContent.trim() : '' };
  });

  let index = 0;
  let lastFocused = null;

  function show(i) {
    index = (i + slides.length) % slides.length;   // wraps both ways
    const slide = slides[index];
    lbImg.src = slide.src;
    lbImg.alt = slide.alt;
    lbCaption.textContent = slide.caption;
    lbCount.textContent = `${index + 1} / ${slides.length}`;
  }

  function openLightbox(i) {
    lastFocused = document.activeElement;
    show(i);
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    requestAnimationFrame(() => lightbox.classList.add('open'));
    btnClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('lightbox-open');
    setTimeout(() => { lightbox.hidden = true; lbImg.removeAttribute('src'); }, 250);
    if (lastFocused) lastFocused.focus();
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    // keyboard users: make each tile a real control
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View photo: ${slides[i].caption || slides[i].alt}`);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  btnPrev.addEventListener('click', () => show(index - 1));
  btnNext.addEventListener('click', () => show(index + 1));
  btnClose.addEventListener('click', closeLightbox);

  // click the backdrop (but not the photo or a button) to dismiss
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-figure')) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  // swipe left/right on touch screens
  let touchX = null;
  lightbox.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) show(dx < 0 ? index + 1 : index - 1);
    touchX = null;
  }, { passive: true });
}
