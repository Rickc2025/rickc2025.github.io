/* Sonexa Studios — interactions */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const links = document.getElementById("navlinks");

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revealer.unobserve(en.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

  /* ---------- Game card glow follows the pointer ---------- */
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".game").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ---------- Screenshot lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  let lastFocus = null;

  const openLightbox = (src, alt) => {
    lastFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "Screenshot";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  document.querySelectorAll(".shot-btn").forEach((btn) => {
    const img = btn.querySelector("img");
    btn.addEventListener("click", () => openLightbox(img.src, img.alt));
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });

  /* ---------- Hero particles ---------- */
  const canvas = document.getElementById("fx");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;

  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const COUNT = isMobile ? 38 : 90;
  const COLORS = ["139,92,246", "34,211,238", "236,72,153", "244,244,245"];
  let particles = [];
  let w = 0, h = 0, dpr = 1;
  let mouseX = 0.5, mouseY = 0.5;
  let raf = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(0.06 + Math.random() * 0.3),
      c: COLORS[(Math.random() * COLORS.length) | 0],
      tw: Math.random() * Math.PI * 2,          // twinkle phase
      depth: 0.35 + Math.random() * 0.65,       // parallax depth
    }));
  }

  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    const px = (mouseX - 0.5) * 26;
    const py = (mouseY - 0.5) * 18;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
      if (p.x < -6) p.x = w + 6;
      if (p.x > w + 6) p.x = -6;
      const a = 0.25 + 0.45 * Math.abs(Math.sin(p.tw + t * 0.0011));
      ctx.beginPath();
      ctx.arc(p.x + px * p.depth, p.y + py * p.depth, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${a.toFixed(3)})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => { resize(); spawn(); });
  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  }, { passive: true });

  // Pause when the hero is off screen
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting) {
      if (!raf) raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }).observe(hero);

  resize();
  spawn();
})();
