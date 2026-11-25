/* =========================================================
   MELLOW BEAN — main.js
   1. 스크롤하면 메뉴바 배경 바꾸기
   2. 모바일 햄버거 메뉴 열고 닫기
   3. 첫 화면에 은은한 반짝이
   4. 스크롤하면 내용이 부드럽게 나타나기
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('siteNav');

  /* ---------- 1. 메뉴바 배경 ---------- */
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- 2. 모바일 메뉴 ---------- */
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  };

  toggle.addEventListener('click', () => {
    setMenu(!nav.classList.contains('is-open'));
  });

  // 메뉴 링크를 누르면 메뉴 닫기
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  // 메뉴 바깥을 탭하면 메뉴 닫기
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !header.contains(e.target)) {
      setMenu(false);
    }
  });

  // Esc 키로 메뉴 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // 화면이 넓어지면 열린 메뉴 정리
  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- 3. 첫 화면 반짝이 ---------- */
  const sparkleBox = document.getElementById('heroSparkles');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (sparkleBox && !reduceMotion) {
    const count = window.innerWidth <= 768 ? 8 : 14;
    const random = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('span');
      const isStar = Math.random() < 0.6;
      sparkle.className = 'sparkle ' + (isStar ? 'sparkle--star' : 'sparkle--dot');
      sparkle.style.left = random(4, 96) + '%';
      sparkle.style.top = random(8, 88) + '%';
      sparkle.style.setProperty('--size', (isStar ? random(10, 18) : random(3, 6)) + 'px');
      sparkle.style.setProperty('--duration', random(3, 6) + 's');
      sparkle.style.setProperty('--delay', random(0, 5) + 's');
      sparkleBox.appendChild(sparkle);
    }
  }

  /* ---------- 4. 스크롤 등장 효과 ---------- */
  const revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealItems.forEach((el) => observer.observe(el));
});
