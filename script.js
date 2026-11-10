/* =====================================================
   HUBERT SCHWAZ JUNIOR SCHOOL - WEBSITE BEHAVIOUR (script.js)
   Everything that moves or reacts on the page is here.
   Each part has a heading comment. The numbers and photo
   names you may want to change are in the SETTINGS below.
   ===================================================== */

/* ---------- SETTINGS (safe to edit) ---------- */
// WhatsApp number that receives messages from the contact form (country code, no + or spaces)
var WHATSAPP_NUMBER = "256776049149";

// Photos used in the rotating campus gallery (files must be in the same folder as index.html)
var CAMPUS_IMAGES = [
  "IMG_1486.JPG", "IMG_1497.JPG", "IMG_1502.JPG", "IMG_1519.JPG", "IMG_1520.JPG", "IMG_1521.JPG",
  "IMG_1522.JPG", "IMG_1523.JPG", "IMG_1524.JPG", "IMG_1526.JPG",
  "IMG_1527.JPG", "IMG_1528.JPG", "IMG_1529.JPG"
];

// How long each gallery photo stays before changing (milliseconds: 3000 = 3 seconds)
var SLIDE_MS = 3000;

// File endings the site tries when looking for staff and photo-card pictures
var EXTS = ["JPG", "jpg", "jpeg", "JPEG", "png", "PNG", "webp"];


/* ---------- 1. Mobile menu (the three-line button on phones) ---------- */
var navToggle = document.querySelector("#navToggle");
var navLinks = document.querySelector("#navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", function () {
    navToggle.classList.toggle("active");
    navLinks.classList.toggle("open");
  });
  // Close the menu after a link is tapped
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    a.addEventListener("click", function () {
      navToggle.classList.remove("active");
      navLinks.classList.remove("open");
    });
  });
}


/* ---------- 2. Top bar glass: hidden at the very top, appears as soon as you scroll ---------- */
var nav = document.querySelector("#navbar");
if (nav) {
  var updateNav = function () {
    nav.style.boxShadow = window.scrollY > 10 ? "0 4px 20px rgba(0,0,0,.08)" : "none";
    nav.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();
}


/* ---------- 3. Application form (shows a thank-you message) ---------- */
var applyForm = document.querySelector("#applyForm");
if (applyForm) {
  applyForm.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Thank you! Your application for Hubert Schwaz Junior School has been simulated.");
    applyForm.reset();
  });
}


/* ---------- 4. Contact form (opens WhatsApp with the message ready) ---------- */
var contactForm = document.querySelector("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(contactForm);
    var lines = [
      "Hello Hurbert Schwaz Junior School,",
      "Name: " + f.get("name"),
      "Phone: " + f.get("phone"),
      f.get("email") ? "Email: " + f.get("email") : null,
      "",
      String(f.get("message") || "")
    ].filter(function (l) { return l !== null; });
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    contactForm.reset();
    window.location.href = url;
  });
}


/* ---------- 5. Numbers that count up (students, teachers, ...) ---------- */
var counters = document.querySelectorAll(".count");
if (counters.length && "IntersectionObserver" in window) {
  var runCounter = function (el) {
    var target = +(el.dataset.count || 0);
    var suffix = el.dataset.suffix || "";
    var start = performance.now();
    var duration = 1600;
    var step = function (now) {
      var p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        runCounter(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(function (el) { counterObserver.observe(el); });
}


/* ---------- 6. Rotating campus photo gallery ---------- */
var tiles = document.querySelectorAll("#mosaic .tile");
if (tiles.length) {
  // Only use photos that really exist in the folder
  var checkImage = function (src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(src); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  };
  Promise.all(CAMPUS_IMAGES.map(checkImage)).then(function (list) {
    var imgs = list.filter(Boolean);
    if (!imgs.length) return;

    var shown = new Array(tiles.length).fill(null);   // photo currently in each tile
    var queue = [];                                    // shuffled photos waiting to be shown

    var nextImage = function (retry) {
      if (retry === undefined) retry = true;
      if (!queue.length) queue = imgs.slice().sort(function () { return Math.random() - 0.5; });
      var k = queue.findIndex(function (s) { return !shown.includes(s); });
      if (k > -1) return queue.splice(k, 1)[0] || null;
      if (retry) { queue = []; return nextImage(false); }
      return null;
    };

    var setTile = function (i) {
      var src = nextImage();
      if (!src) return;
      shown[i] = src;
      var layer = document.createElement("div");
      layer.className = "layer";
      layer.style.backgroundImage = 'url("' + src + '")';
      tiles[i].appendChild(layer);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { layer.classList.add("on"); });
      });
      var all = tiles[i].querySelectorAll(".layer");
      if (all.length > 2) all[0].remove();
    };

    tiles.forEach(function (_, i) { setTile(i); });
    if (imgs.length <= tiles.length) return;

    var t = 0;
    setInterval(function () {
      setTile(t);
      t = (t + 1) % tiles.length;
    }, SLIDE_MS);
  });
}


/* ---------- 7. Sections glide up as you scroll to them ---------- */
if ("IntersectionObserver" in window) {
  // Which parts of the page glide in (add a class name here to animate more parts)
  var revealSelector = ".section-head, .about-text > *, .about-image, .req, .stat, .mosaic, .ict-media, .ict-text > *, .campus-sub, .team-intro, .member, .team-photo, .contact, .map, .footer-sub, .wa-form, .connect";
  var siblingCount = new Map();
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add("in");
      setTimeout(function () { el.style.transitionDelay = ""; }, 1400);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0, rootMargin: "0px 0px -5% 0px" });

  document.querySelectorAll(revealSelector).forEach(function (el) {
    var n = siblingCount.get(el.parentElement) || 0;
    siblingCount.set(el.parentElement, n + 1);
    el.style.transitionDelay = (n % 4) * 90 + "ms";
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
}


/* ---------- 8. Requirement cards (click one to highlight it) ---------- */
var reqCards = document.querySelectorAll(".req");
var selectCard = function (card) {
  reqCards.forEach(function (c) {
    var isOn = c === card;
    c.classList.toggle("active", isOn);
    c.setAttribute("aria-pressed", String(isOn));
  });
};
reqCards.forEach(function (card) {
  card.addEventListener("click", function () { selectCard(card); });
  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectCard(card);
    }
  });
});


/* ---------- 9. Staff photos (tries JPG, jpg, png... keeps the icon if no photo) ---------- */
document.querySelectorAll("img[data-photo]").forEach(function (img) {
  var i = 0;
  var tryNext = function () {
    if (i >= EXTS.length) { img.remove(); return; }
    img.src = img.dataset.photo + "." + EXTS[i++];
  };
  img.onerror = tryNext;
  tryNext();
});


/* ---------- 10. Photos behind the number boxes ---------- */
document.querySelectorAll(".stat[data-photo]").forEach(function (el) {
  var i = 0;
  var tryNext = function () {
    if (i >= EXTS.length) return;
    var im = new Image();
    im.onload = function () { el.style.setProperty("--img", 'url("' + im.src + '")'); };
    im.onerror = tryNext;
    im.src = el.dataset.photo + "." + EXTS[i++];
  };
  tryNext();
});
