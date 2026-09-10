(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------------------------------------------------------
     Theme + sound toggles
     --------------------------------------------------------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('toggleTheme');
  const soundBtn = document.getElementById('toggleSound');

  const savedTheme = localStorage.getItem('ayushi-theme');
  if (savedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    themeBtn.setAttribute('aria-pressed', 'true');
  }

  themeBtn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      localStorage.setItem('ayushi-theme', 'light');
      themeBtn.setAttribute('aria-pressed', 'false');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('ayushi-theme', 'dark');
      themeBtn.setAttribute('aria-pressed', 'true');
    }
  });

  soundBtn.addEventListener('click', () => {
    const on = soundBtn.getAttribute('aria-pressed') === 'true';
    soundBtn.setAttribute('aria-pressed', String(!on));
  });

  /* ---------------------------------------------------------
     Project data + work rows
     --------------------------------------------------------- */
  const projects = [
    {
      key: 'venu',
      name: 'Venu',
      tag: 'AI Event Planner — Product Design',
      type: 'laptop',
      ui: `<div class="app-ui venu-ui">
             <p class="app-title">What's the venue vibe?</p>
             <div class="venu-grid">
               <span></span><span></span><span class="is-active"></span>
               <span></span><span></span><span></span>
             </div>
             <div class="venu-bar"></div>
           </div>`
    },
    {
      key: 'roam',
      name: 'Roam',
      tag: 'Mobile Data Plans — UX',
      type: 'phone',
      ui: `<div class="app-ui roam-ui">
             <div class="roam-top"><span>5GB</span><span>left</span></div>
             <div class="roam-ring"><span>5GB</span></div>
             <div class="roam-card">Your perfect mobile plan<br>is a tap away</div>
           </div>`
    }
  ];

  function buildCard(project) {
    const a = document.createElement('a');
    a.href = '#work';
    a.className = 'project-card ' + (project.type === 'laptop' ? 'project-card--lg' : 'project-card--sm');
    a.setAttribute('data-cursor', 'View');
    a.setAttribute('aria-label', 'Open the ' + project.name + ' case study');

    const deviceWrap = project.type === 'laptop'
      ? `<div class="laptop-frame"><div class="laptop-screen">${project.ui}</div><div class="laptop-base"></div></div>`
      : `<div class="phone-frame"><div class="phone-screen">${project.ui}</div></div>`;

    a.innerHTML = `
      <div class="device device--${project.type}">
        <div class="device-surface"></div>
        ${deviceWrap}
      </div>
      <div class="project-meta">
        <span class="project-name">${project.name}</span>
        <span class="project-tag">${project.tag}</span>
      </div>`;
    return a;
  }

  function fillTrack(trackEl, order, repeats) {
    for (let i = 0; i < repeats; i++) {
      order.forEach((key) => {
        const project = projects.find((p) => p.key === key);
        trackEl.appendChild(buildCard(project));
      });
    }
  }

  fillTrack(document.getElementById('track1'), ['venu', 'roam'], 4);
  fillTrack(document.getElementById('track2'), ['roam', 'venu'], 4);
  fillTrack(document.getElementById('track3'), ['venu', 'roam'], 4);

  /* ---------------------------------------------------------
     Footer flowers
     --------------------------------------------------------- */
  const flowerLayer = document.getElementById('flowerLayer');
  const flowerSpots = [30, 140, 260, 360, 470, 600, 760, 880, 1010, 1140, 1260, 1380];
  flowerSpots.forEach((x, i) => {
    const isLavender = i % 3 === 0;
    const h = 60 + (i % 4) * 12;
    const y = 195 + (i % 3) * 6;
    const pos = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pos.setAttribute('transform', `translate(${x} ${y})`);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'flower');
    g.style.animationDelay = (i * 0.35) + 's';

    if (isLavender) {
      g.innerHTML = `
        <rect x="-1.5" y="${-h}" width="3" height="${h}" fill="#3E5B33"/>
        ${Array.from({ length: 6 }).map((_, k) => `<circle cx="${(k % 2 === 0 ? -4 : 4)}" cy="${-h + k * 6}" r="3.2" fill="#8E7FC7"/>`).join('')}
        <path d="M-10 4 Q0 -10 10 4 Z" fill="#3E5B33"/>`;
    } else {
      const petals = Array.from({ length: 8 }).map((_, k) => {
        const angle = (k / 8) * Math.PI * 2;
        const cx = Math.cos(angle) * 10.5;
        const cy = -h + Math.sin(angle) * 10.5;
        return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.6" fill="#FFFFFF" stroke="rgba(20,20,15,0.12)" stroke-width="0.6"/>`;
      }).join('');
      g.innerHTML = `
        <rect x="-1.5" y="${-h}" width="3" height="${h}" fill="#C9622B"/>
        ${petals}
        <circle cx="0" cy="${-h}" r="5" fill="#F2B33D"/>
        <path d="M-12 4 Q0 -12 12 4 Z" fill="#3E5B33"/>`;
    }
    pos.appendChild(g);
    flowerLayer.appendChild(pos);
  });

  /* ---------------------------------------------------------
     Contact drawer
     --------------------------------------------------------- */
  const drawer = document.getElementById('contactDrawer');
  const openBtn = document.getElementById('openContact');
  const closeBtn = document.getElementById('closeContact');
  const overlay = document.getElementById('drawerOverlay');
  let drawerLenisLock = null;

  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (drawerLenisLock) drawerLenisLock.stop();
    document.body.style.overflow = 'hidden';
    closeBtn.focus({ preventScroll: true });

    if (!reduceMotion && window.gsap) {
      gsap.fromTo(
        '#contactDrawer .drawer-top > *, #contactDrawer .drawer-bottom > *',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.15 }
      );
    }
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (drawerLenisLock) drawerLenisLock.start();
    document.body.style.overflow = '';
    openBtn.focus({ preventScroll: true });
  }

  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });

  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    const subject = encodeURIComponent(`New project inquiry from ${name || 'your site'}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:ayushiajmera2@gmail.com?subject=${subject}&body=${body}`;
    formNote.textContent = 'Opening your email app…';
  });

  /* ---------------------------------------------------------
     Custom cursor
     --------------------------------------------------------- */
  if (!isCoarse && !reduceMotion && window.gsap) {
    document.body.classList.add('has-custom-cursor');
    const cursor = document.getElementById('cursor');
    const label = document.getElementById('cursorLabel');

    let mx = -100, my = -100;
    window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; });

    const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3' });
    const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3' });
    const labelX = gsap.quickTo(label, 'x', { duration: 0.28, ease: 'power3' });
    const labelY = gsap.quickTo(label, 'y', { duration: 0.28, ease: 'power3' });

    gsap.ticker.add(() => {
      cursorX(mx); cursorY(my);
      labelX(mx); labelY(my);
    });

    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const text = el.getAttribute('data-cursor');
        if (text) {
          label.textContent = text;
          gsap.to(label, { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' });
          gsap.to(cursor, { opacity: 0, duration: 0.2 });
        } else {
          gsap.to(cursor, { width: 34, height: 34, marginTop: -17, marginLeft: -17, duration: 0.3 });
        }
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(label, { opacity: 0, scale: 0.6, duration: 0.25 });
        gsap.to(cursor, { opacity: 1, width: 14, height: 14, marginTop: -7, marginLeft: -7, duration: 0.3 });
      });
    });
  }

  /* ---------------------------------------------------------
     GSAP + Lenis + ScrollTrigger
     --------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (window.Lenis && window.gsap && !reduceMotion) {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    drawerLenisLock = lenis;
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  const nav = document.getElementById('siteNav');
  const hero = document.getElementById('top');

  function splitWords() {
    document.querySelectorAll('[data-split]').forEach((line) => {
      const words = line.textContent.trim().split(/\s+/);
      line.innerHTML = words.map((w) => `<span class="word">${w}&nbsp;</span>`).join('');
    });
  }
  splitWords();

  window.addEventListener('load', () => {
    if (!window.gsap) return;

    if (reduceMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-illustration', { opacity: 0, duration: 1.1 })
      .from('.sun', { opacity: 0, scale: 0.6, duration: 1, ease: 'back.out(1.4)' }, '-=0.7')
      .from('.eyebrow', { opacity: 0, y: 16, duration: 0.7 }, '-=0.6')
      .from('.hero-title .word', { yPercent: 115, duration: 1, stagger: 0.05 }, '-=0.35');

    if (window.ScrollTrigger) {
      gsap.utils.toArray('.reveal-up').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 36, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
      });

      ScrollTrigger.create({
        trigger: hero,
        start: 'bottom top+=80',
        onEnter: () => nav.classList.add('is-scrolled'),
        onLeaveBack: () => nav.classList.remove('is-scrolled')
      });

      gsap.utils.toArray('.work-row').forEach((row) => {
        const track = row.querySelector('.work-track');
        const dir = parseFloat(row.dataset.dir || '1');
        const speed = parseFloat(row.dataset.speed || '0.6');
        const distance = Math.max(track.scrollWidth - row.clientWidth, 400) * speed * dir;

        gsap.fromTo(track,
          { xPercent: dir > 0 ? -8 : 8 },
          {
            x: -distance,
            ease: 'none',
            scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
          }
        );
      });
    }
  });

  /* Magnetic buttons */
  if (!isCoarse && !reduceMotion && window.gsap) {
    document.querySelectorAll('.nav-cta, .btn-send').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        gsap.to(btn, { x, y, duration: 0.3, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1,0.4)' });
      });
    });
  }
})();
