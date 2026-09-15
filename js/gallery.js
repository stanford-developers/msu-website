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
