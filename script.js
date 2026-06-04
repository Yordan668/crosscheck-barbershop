/* ═══════════════════════════════════════════
   CROSSCHECK — Premium JS Experience
═══════════════════════════════════════════ */

// ── SMOOTH SCROLL (lerp-based)
let scrollY_smooth = 0, scrollY_target = 0;
const LERP_FACTOR = 0.1;
let ticking = false;

function smoothScroll() {
  scrollY_target = window.scrollY;
}
window.addEventListener('scroll', smoothScroll, { passive: true });

// ── CUSTOM CURSOR (само на устройства с мишка)
const isTouch = window.matchMedia('(pointer: coarse)').matches;
const curDot  = document.getElementById('curDot');
const curRing = document.getElementById('curRing');
let mx = 0, my = 0, rx = 0, ry = 0;

if (isTouch) {
  if (curDot)  curDot.style.display  = 'none';
  if (curRing) curRing.style.display = 'none';
}

if (!isTouch) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (curDot) { curDot.style.left = mx + 'px'; curDot.style.top = my + 'px'; }
  });
}

// Magnetic buttons
document.querySelectorAll('.btn-dark, .btn-outline, .btn-gold, .nav__cta').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width/2);
    const dy = e.clientY - (r.top  + r.height/2);
    btn.style.transform = `translate(${dx * .18}px, ${dy * .18}px)`;
    if (curRing) { curRing.style.width = '70px'; curRing.style.height = '70px'; curRing.style.borderColor = 'var(--gold)'; }
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    if (curRing) { curRing.style.width = '40px'; curRing.style.height = '40px'; curRing.style.borderColor = ''; }
  });
});

// ── CINEMATIC LOADER
const loader     = document.getElementById('loader');
const loaderWord = document.getElementById('loaderWord');
const loaderBar  = document.getElementById('loaderBar');

if (loader && loaderWord) {
  const letters = 'CROSSCHECK'.split('');
  loaderWord.innerHTML = letters.map(l => `<span>${l}</span>`).join('');
  const spans = loaderWord.querySelectorAll('span');

  // animate letters in
  spans.forEach((s, i) => {
    setTimeout(() => { s.classList.add('in'); }, 80 + i * 60);
  });

  // progress bar
  let prog = 0;
  const barFill = document.querySelector('.loader__fill');
  const barInt = setInterval(() => {
    prog += Math.random() * 18 + 4;
    if (prog >= 100) { prog = 100; clearInterval(barInt); }
    if (barFill) barFill.style.width = prog + '%';
  }, 80);

  // hide loader
  setTimeout(() => {
    loader.classList.add('out');
    setTimeout(() => { loader.style.display = 'none'; }, 900);
  }, 1800);
}

// ── GOLD PARTICLE CANVAS
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function Particle() {
    this.reset = function() {
      this.x  = Math.random() * W;
      this.y  = H + 10;
      this.vx = (Math.random() - .5) * .6;
      this.vy = -(Math.random() * .8 + .3);
      this.r  = Math.random() * 1.5 + .3;
      this.alpha = Math.random() * .6 + .2;
      this.life  = 0;
      this.maxLife = Math.random() * 200 + 100;
    };
    this.reset();
    this.y = Math.random() * H; // start spread
  }

  for (let i = 0; i < 55; i++) particles.push(new Particle());

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life++;
      const t = p.life / p.maxLife;
      const a = p.alpha * Math.sin(t * Math.PI);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(184,146,42,${a})`;
      ctx.fill();
      if (p.life >= p.maxLife || p.y < -10) p.reset();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// ── SPLIT TEXT REVEAL
function splitReveal(selector) {
  document.querySelectorAll(selector).forEach(el => {
    if (el.dataset.split) return;
    el.dataset.split = 'true';
    const words = el.innerText.split(' ');
    el.innerHTML = words.map(w =>
      `<span class="word"><span class="word-inner">${w}</span></span>`
    ).join(' ');
  });
}
splitReveal('.services__top h2');
splitReveal('.about__body h2');
splitReveal('.team__top h2');

// ── SCROLL REVEAL (words)
const wordObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.word-inner').forEach((w, i) => {
      setTimeout(() => w.classList.add('revealed'), i * 55);
    });
    wordObs.unobserve(entry.target);
  });
}, { threshold: 0.4 });

document.querySelectorAll('[data-r]').forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = el.dataset.r === 'right' ? 'translateX(50px)' : 'translateY(28px)';
  el.style.transition = 'opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1)';
});

document.querySelectorAll('.services__top h2, .about__body h2, .team__top h2').forEach(el => {
  wordObs.observe(el);
});

const revObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (!e.isIntersecting) return;
    setTimeout(() => {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'none';
    }, i * 80);
    revObs.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('[data-r]').forEach(el => revObs.observe(el));

// ── COUNTER ANIMATION
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const dur = 1800;
  const startTime = performance.now();
  function update(now) {
    const t = Math.min((now - startTime) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = (Number.isInteger(target) ? Math.round(ease * target) : (ease * target).toFixed(0)) + suffix;
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const val = el.dataset.count;
    if (val === '∞') return;
    animateCounter(el, parseInt(val), el.dataset.suffix || '');
    counterObs.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

// ── PINNED SCROLL — continuous progress-driven
const pinWrap      = document.getElementById('pinWrap');
const heroProgress = document.getElementById('heroProgress');
const heroVideo    = document.querySelector('.hero__video');
const heroPhotoEl  = document.querySelector('.hero__photo');
const s1Title      = document.querySelector('.hero__title');
const s1eyebrow    = document.querySelector('.pin-step--1 .hero__eyebrow');
const s1tagline    = document.querySelector('.hero__tagline');
const s1hint       = document.querySelector('.hero__scroll-hint2');
const s2           = document.getElementById('step2');
const s2inner      = s2 ? s2.querySelector('.pin-step__inner') : null;
const s2items      = s2 ? s2.querySelectorAll('.pin-services li') : [];
const s3           = document.getElementById('step3');
const s3h2         = s3 ? s3.querySelector('h2') : null;
const s3cta        = s3 ? s3.querySelector('.pin-cta') : null;
const s3hours      = s3 ? s3.querySelector('.hero__hours2') : null;
const veil         = document.querySelector('.hero__veil');

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, mn=0, mx=1) => Math.max(mn, Math.min(mx, v));
const norm  = (v, a, b) => clamp((v - a) / (b - a));
const ease  = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;

function updatePin() {
  if (!pinWrap) return;
  const total    = pinWrap.offsetHeight - window.innerHeight;
  const scrolled = Math.max(0, -pinWrap.getBoundingClientRect().top);
  const p        = clamp(scrolled / total);

  if (heroProgress) heroProgress.style.width = (p * 100) + '%';

  // ── STEP 1: 0 → 0.30  (влиза бавно, излиза много бавно)
  const e1in  = ease(norm(p, 0,    0.08));
  const e1out = ease(norm(p, 0.25, 0.45)); // много по-широк диапазон
  const s1vis = e1in * (1 - e1out);

  if (s1Title) {
    const sc = lerp(0.92, 1, e1in) * lerp(1, 1.15, e1out);
    s1Title.style.opacity   = s1vis;
    s1Title.style.transform = `scale(${sc}) translateY(${lerp(0, -90, e1out)}px)`;
    s1Title.style.filter    = `blur(${lerp(0, 6, e1out)}px)`;
  }
  if (s1eyebrow) {
    s1eyebrow.style.opacity   = s1vis;
    s1eyebrow.style.transform = `translateY(${lerp(16, 0, e1in) + lerp(0, -40, e1out)}px)`;
  }

  // ── BACKGROUND crossfade + много бавен zoom
  const bgFade  = ease(norm(p, 0.28, 0.52)); // по-широк = по-бавен
  const bgScale = 1 + p * 0.08;             // по-малък zoom
  if (heroVideo)   { heroVideo.style.opacity   = 1 - bgFade; heroVideo.style.transform   = `scale(${bgScale})`; }
  if (heroPhotoEl) { heroPhotoEl.style.opacity = bgFade;     heroPhotoEl.style.transform = `scale(${bgScale})`; }

  // ── VEIL
  const veilBoost = ease(norm(p, .35, .58)) * (1 - ease(norm(p, .65, .78))) * 0.25;
  if (veil) veil.style.background = `linear-gradient(to top,rgba(17,17,16,${.65+veilBoost}) 0%,rgba(17,17,16,${.2+veilBoost}) 55%,rgba(17,17,16,${veilBoost}) 100%)`;

  // ── STEP 2: 0.40 → 0.68  (влиза и излиза плавно)
  const e2in  = ease(norm(p, 0.40, 0.57));
  const e2out = ease(norm(p, 0.62, 0.76));
  const s2vis = e2in * (1 - e2out);

  if (s2inner) {
    s2inner.style.opacity   = s2vis;
    s2inner.style.transform = `translateX(${lerp(60, 0, e2in)}px)`;
    s2inner.style.filter    = `blur(${lerp(5, 0, e2in) + lerp(0, 3, e2out)}px)`;
  }
  s2items.forEach((li, i) => {
    const d   = i * 0.05;
    const tin = ease(norm(p, 0.43 + d, 0.58 + d));
    li.style.opacity   = tin * (1 - e2out);
    li.style.transform = `translateX(${lerp(40, 0, tin)}px)`;
  });

  // ── STEP 3: 0.74 → 1.0
  const e3in  = ease(norm(p, 0.74, 0.88));
  const e3cta = ease(norm(p, 0.82, 0.94));
  const e3hrs = ease(norm(p, 0.90, 0.98));

  if (s3h2) {
    s3h2.style.opacity   = e3in;
    s3h2.style.transform = `translateY(${lerp(50, 0, e3in)}px)`;
    s3h2.style.filter    = `blur(${lerp(6, 0, e3in)}px)`;
  }
  if (s3cta) {
    s3cta.style.opacity   = e3cta;
    s3cta.style.transform = `translateY(${lerp(30, 0, e3cta)}px)`;
  }
  if (s3hours) {
    s3hours.style.opacity   = e3hrs;
    s3hours.style.transform = `translateY(${lerp(15, 0, e3hrs)}px)`;
  }

  // pointer events
  document.getElementById('step1').style.pointerEvents = p < 0.38 ? 'auto' : 'none';
  s2.style.pointerEvents = p >= 0.38 && p < 0.73 ? 'auto' : 'none';
  s3.style.pointerEvents = p >= 0.73 ? 'auto' : 'none';
  document.getElementById('step1').classList.add('active');
  s2.classList.add('active'); s3.classList.add('active');
}
window.addEventListener('scroll', updatePin, { passive: true });
updatePin();

// ── CURSOR RING RAF (само на десктоп)
if (!isTouch) {
  function cursorLoop() {
    rx += (mx - rx) * 0.09;
    ry += (my - ry) * 0.09;
    if (curRing) { curRing.style.left = rx + 'px'; curRing.style.top = ry + 'px'; }
    requestAnimationFrame(cursorLoop);
  }
  cursorLoop();
}

// ── NAV
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav && nav.classList.toggle('shadow', scrollY > 40), { passive: true });

// ── ACTIVE NAV
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
  document.querySelectorAll('.nav__links a').forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--dark)' : '';
  });
}, { passive: true });

// ── CLIPPER
const clipWrap   = document.getElementById('clipperWrap');
const clipBanner = document.getElementById('clipperBanner');
let clipPos = -140, clipLast = 0;
window.addEventListener('scroll', () => {
  if (!clipBanner) return;
  const r = clipBanner.getBoundingClientRect();
  if (r.bottom > 0 && r.top < window.innerHeight) {
    const d = window.scrollY - clipLast;
    clipPos += d * 2.4;
    const w = clipBanner.offsetWidth;
    if (clipPos > w + 60) clipPos = -140;
    if (clipPos < -140)   clipPos = w + 60;
    if (clipWrap) {
      clipWrap.style.left      = clipPos + 'px';
      clipWrap.style.transform = d < 0 ? 'translateY(-50%) scaleX(-1)' : 'translateY(-50%) scaleX(1)';
    }
  }
  clipLast = window.scrollY;
}, { passive: true });

// ── MOBILE MENU
const burger = document.getElementById('burger');
const links  = document.getElementById('navLinks');
let menuOpen = false;
if (burger) {
  burger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      links.style.cssText = `display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.5rem;position:fixed;inset:0;background:rgba(250,248,243,.98);z-index:300;`;
      links.querySelectorAll('a').forEach(a => {
        a.style.fontSize = '2rem';
        a.style.fontFamily = "'Playfair Display',serif";
        a.style.color = '#111110';
      });
    } else {
      links.removeAttribute('style');
      links.querySelectorAll('a').forEach(a => a.removeAttribute('style'));
    }
    const sp = burger.querySelectorAll('span');
    sp[0].style.transform = menuOpen ? 'translateY(6.5px) rotate(45deg)' : '';
    sp[1].style.opacity   = menuOpen ? '0' : '';
    sp[2].style.transform = menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : '';
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (menuOpen) burger.click(); }));
}
