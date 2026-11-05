// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Subtle navbar shadow on scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 30) nav.style.boxShadow = '0 4px 20px rgba(0,0,0,.08)';
  else nav.style.boxShadow = 'none';
});

// Form submission
document.getElementById('applyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thank you! Your application for Hurbert Schwaz Junior School has been simulated.');
  e.target.reset();
});

/* ---------- Contact form -> WhatsApp ---------- */
const WHATSAPP_NUMBER = '256776049149'; // country code + number, no + or spaces

document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const lines = [
    'Hello Hurbert Schwaz Junior School,',
    `Name: ${f.get('name')}`,
    `Phone: ${f.get('phone')}`,
    f.get('email') ? `Email: ${f.get('email')}` : null,
    '',
    f.get('message')
  ].filter(l => l !== null);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank', 'noopener');
  e.target.reset();
});

/* ---------- Count-up numbers (FIXED: no longer blocked by reduce-motion) ---------- */
(function () {
  const els = document.querySelectorAll('.count');
  if (!els.length || !('IntersectionObserver' in window)) return;
  const run = (el) => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const start = performance.now(), dur = 1600;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

/* ---------- Auto-changing campus photos (FIXED: always rotates, no repeats) ---------- */
// These photos sit in the same folder as index.html. Add or remove names here.
// Files that are missing are skipped automatically.
const CAMPUS_IMAGES = [
  'IMG_1486.JPG', 'IMG_1497.JPG', 'IMG_1502.JPG', 'IMG_1519.JPG', 'IMG_1520.JPG', 'IMG_1521.JPG',
  'IMG_1522.JPG', 'IMG_1523.JPG', 'IMG_1524.JPG', 'IMG_1526.JPG',
  'IMG_1527.JPG', 'IMG_1528.JPG', 'IMG_1529.JPG'
];
const SLIDE_MS = 3000; // one tile changes every 3 seconds

(function () {
  const tiles = [...document.querySelectorAll('#mosaic .tile')];
  if (!tiles.length) return;
  const check = (src) => new Promise(res => {
    const i = new Image();
    i.onload = () => res(src);
    i.onerror = () => res(null);
    i.src = src;
  });
  Promise.all(CAMPUS_IMAGES.map(check)).then(list => {
    const imgs = list.filter(Boolean);
    if (!imgs.length) return;
    const shown = new Array(tiles.length).fill(null);
    let queue = [];
    const nextImg = (retry = true) => {
      if (!queue.length) queue = imgs.slice().sort(() => Math.random() - 0.5);
      const k = queue.findIndex(s => !shown.includes(s));
      if (k > -1) return queue.splice(k, 1)[0];
      if (retry) { queue = []; return nextImg(false); }
      return null;
    };
    const setTile = (i) => {
      const src = nextImg();
      if (!src) return;
      shown[i] = src;
      const layer = document.createElement('div');
      layer.className = 'layer';
      layer.style.backgroundImage = 'url("' + src + '")';
      tiles[i].appendChild(layer);
      requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('on')));
      const all = tiles[i].querySelectorAll('.layer');
      if (all.length > 2) all[0].remove();
    };
    tiles.forEach((_, i) => setTile(i));
    if (imgs.length <= tiles.length) return; // need more photos than tiles to rotate
    let t = 0;
    setInterval(() => { setTile(t); t = (t + 1) % tiles.length; }, SLIDE_MS);
  });
})();

/* ---------- Navbar turns solid when you scroll ---------- */
(function () {
  const nav = document.getElementById('navbar');
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---------- Smooth glide-up on scroll (FIXED: works on phones) ---------- */
(function () {
  if (!('IntersectionObserver' in window)) return;
  const sel = '.section-head, .about-text > *, .about-image, .req, .stat, .mosaic, .campus-sub, .team-intro, .member, .team-photo, .contact, .map, .footer-sub, .wa-form, .connect';
  const counts = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      setTimeout(() => { e.target.style.transitionDelay = ''; }, 1400);
      io.unobserve(e.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll(sel).forEach(el => {
    const n = counts.get(el.parentElement) || 0;
    counts.set(el.parentElement, n + 1);
    el.style.transitionDelay = (n % 4) * 90 + 'ms';
    el.classList.add('reveal');
    io.observe(el);
  });
})();

/* ---------- Tap or click a requirement card to highlight it ---------- */
(function () {
  const cards = [...document.querySelectorAll('.req')];
  const select = (card) => cards.forEach(c => {
    const on = c === card;
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', on);
  });
  cards.forEach(card => {
    card.addEventListener('click', () => select(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(card); }
    });
  });
})();

/* ---------- Staff photos - just drop the file in the images folder ---------- */
// Staff photos: IMG_1525, IMG_1518, IMG_1517 and IMG_1514 (see data-photo in index.html).
// jpg, jpeg, png or webp all work. If no photo is found, the placeholder icon stays.
document.querySelectorAll('img[data-photo]').forEach(img => {
  const exts = ['JPG', 'jpg', 'jpeg', 'JPEG', 'png', 'PNG', 'webp'];
  let i = 0;
  const next = () => {
    if (i >= exts.length) { img.remove(); return; }
    img.src = img.dataset.photo + '.' + exts[i++];
  };
  img.onerror = next;
  next();
});

/* ---------- NEW: "Our school in numbers" photos (tries every extension) ---------- */
document.querySelectorAll('.stat[data-photo]').forEach(el => {
  const exts = ['JPG', 'jpg', 'jpeg', 'JPEG', 'png', 'PNG', 'webp'];
  let i = 0;
  const next = () => {
    if (i >= exts.length) return;
    const im = new Image();
    im.onload = () => el.style.setProperty('--img', 'url("' + im.src + '")');
    im.onerror = next;
    im.src = el.dataset.photo + '.' + exts[i++];
  };
  next();
});
