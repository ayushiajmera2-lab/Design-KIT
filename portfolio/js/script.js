(() => {
  'use strict';

  /* Scroll reveal (from starter, unmodified) */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 70, 350)}ms`;
    observer.observe(el);
  });

  /* Theme toggle */
  const root = document.documentElement;
  const themeBtn = document.getElementById('toggleTheme');
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

  /* Sound toggle (stub — wire to a real track when available) */
  const soundBtn = document.getElementById('toggleSound');
  soundBtn.addEventListener('click', () => {
    const on = soundBtn.getAttribute('aria-pressed') === 'true';
    soundBtn.setAttribute('aria-pressed', String(!on));
  });

  /* Contact drawer */
  const drawer = document.getElementById('contactDrawer');
  const openBtn = document.getElementById('openContact');
  const closeBtn = document.getElementById('closeContact');
  const overlay = document.getElementById('drawerOverlay');

  function openDrawer(e) {
    if (e) e.preventDefault();
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus({ preventScroll: true });
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
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
})();
