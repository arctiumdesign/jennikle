/* ============================================================
   ARCTIUM DESIGN — script.js
   ============================================================ */

'use strict';

/* -- NAV: Scroll-State -- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* -- MOBILE BURGER -- */
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Schließen bei Link-Klick
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* -- INTERSECTION OBSERVER: Reveal -- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

let revealsStarted = false;
function startReveals() {
  if (revealsStarted) return;
  revealsStarted = true;
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
// Ohne Intro sofort starten, mit Intro erst beim Klick (siehe INTRO unten)
if (!document.getElementById('intro')) startReveals();

/* -- LIGHTBOX -- */
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCap = document.getElementById('lightboxCaption');
const closeBtn    = document.getElementById('lightboxClose');

function openLightbox(src, alt, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxCap.textContent = caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// Nur Items mit echten Bildern öffnen
document.querySelectorAll('.arbeit-item').forEach(item => {
  const img = item.querySelector('img');
  if (!img) return;
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  const caption = item.querySelector('h4')?.textContent || '';
  item.addEventListener('click', () => openLightbox(img.src, img.alt, caption));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(img.src, img.alt, caption);
    }
  });
});

/* -- SMOOTH PARALLAX: Hero Logo Mark -- */
const heroMark = document.querySelector('.hero__logo-mark');
if (heroMark) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroMark.style.transform = `translateY(calc(-50% + ${y * 0.15}px))`;
    heroMark.style.opacity = Math.max(0, 0.4 - y * 0.001);
  }, { passive: true });
}

/* -- HOVER TILT: Leistung Cards -- */
document.querySelectorAll('.leistung-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-4px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });
});

/* -- ACTIVE NAV LINK on Scroll -- */
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav__links a[href^="#"]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      links.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${id}`) {
          link.style.color = 'var(--copper)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

/* -- YEAR im Footer automatisch aktualisieren -- */
const yearEl = document.querySelector('.footer p');
if (yearEl) {
  yearEl.textContent = yearEl.textContent.replace('2026', new Date().getFullYear());
}

/* -- STORY TOGGLE -- */
const storyToggle = document.getElementById('storyToggle');
const storyFull   = document.getElementById('storyFull');

if (storyToggle && storyFull) {
  storyToggle.addEventListener('click', () => {
    const isOpen = storyFull.classList.toggle('open');
    storyToggle.classList.toggle('open', isOpen);
    storyToggle.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      setTimeout(() => {
        storyFull.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  });
}

/* -- STORY BUTTON: Klick nicht an arbeit-item weitergeben -- */
document.querySelectorAll('.btn-success').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
  });
});

/* -- LUCIDE ICONS -- */
if (window.lucide) lucide.createIcons();

/* ============================================================
   INTRO: aufsteigende A's, Klick startet nach oben
   ============================================================ */
(function () {
  const LOGO = 'img/logo-mark.png';   // A-Logo (nur die Form wird genutzt, Farbe = Kupfer). Leer lassen = Buchstabe "A"

  const intro = document.getElementById('intro');
  if (!intro) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forced = /[?&]intro\b/.test(location.search);   // ?intro erzwingt das Intro (zum Testen)
  let seen = false;
  try { seen = sessionStorage.getItem('introSeen') === '1'; } catch (e) {}
  if ((seen && !forced) || reduce) { intro.remove(); startReveals(); return; }

  const root = document.documentElement;
  const field = document.getElementById('introField');
  root.classList.add('intro-lock');

  // A's erzeugen: große sind schneller und deutlicher, kleine langsamer und blasser
  const N = window.innerWidth < 600 ? 9 : 16;
  for (let i = 0; i < N; i++) {
    const depth = Math.random();
    const size  = 28 + depth * depth * 130;
    const dur   = 20 - depth * 9;
    const el = document.createElement('span');
    el.className = 'intro__a';
    el.style.setProperty('--l', (((i + Math.random() * 0.8) / N) * 100).toFixed(1) + '%');
    el.style.setProperty('--s', size.toFixed(0) + 'px');
    el.style.setProperty('--d', dur.toFixed(1) + 's');
    el.style.setProperty('--delay', (-Math.random() * dur).toFixed(1) + 's');
    el.style.setProperty('--o', (0.10 + depth * 0.20).toFixed(2));
    el.style.setProperty('--dx', ((Math.random() - 0.5) * 80).toFixed(0) + 'px');
    el.style.setProperty('--r', ((Math.random() - 0.5) * 36).toFixed(0) + 'deg');
    if (LOGO) {
      el.classList.add('intro__a--img');
      el.style.webkitMaskImage = el.style.maskImage = 'url("' + LOGO + '")';
    } else {
      el.textContent = 'A';
    }
    field.appendChild(el);
  }

  function finish() {
    if (intro.classList.contains('is-done')) return;
    startReveals();
    intro.classList.add('is-done');
    root.classList.remove('intro-lock');
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    setTimeout(() => intro.remove(), 800);
  }

  function launch() {
    if (intro.classList.contains('is-launch')) return;
    intro.classList.add('is-launch');
    startReveals();   // Hero-Texte blenden ein, während der Screen nach oben wegfährt
    intro.addEventListener('transitionend', e => {
      if (e.target === intro && e.propertyName === 'transform') finish();
    });
    setTimeout(finish, 2200);
  }

  intro.addEventListener('pointermove', e => {
    const w = window.innerWidth, h = window.innerHeight;
    intro.style.setProperty('--x', e.clientX + 'px');
    intro.style.setProperty('--y', e.clientY + 'px');
    intro.style.setProperty('--px', ((e.clientX / w - 0.5) * -16) + 'px');
    intro.style.setProperty('--py', ((e.clientY / h - 0.5) * -10) + 'px');
    intro.style.setProperty('--fx', ((e.clientX / w - 0.5) * -50) + 'px');
  });

  intro.addEventListener('click', launch);
  document.getElementById('introSkip').addEventListener('click', e => { e.stopPropagation(); finish(); });
})();
