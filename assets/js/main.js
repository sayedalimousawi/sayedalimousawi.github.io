(function () {
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

  // Theme toggle
  const themeBtn = $('#themeToggle');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
  themeBtn?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme',
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
  });

  // Year
  $('#year').textContent = new Date().getFullYear();

  // Load projects
  const list = $('#projects');
  const chips = $$('.chip');
  let all = [], current = 'all';

  function render() {
    list.innerHTML = '';
    const items = current === 'all' ? all : all.filter(p => p.category === current);
    for (const p of items) {
      const li = document.createElement('li');
      li.className = 'project';
      li.innerHTML = `
        <img src="${p.cover}" alt="${p.title}" loading="lazy" />
        <div class="box">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="tags">
            ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <div style="margin-top:10px">
            ${p.link ? `<a class="btn" href="${p.link}" target="_blank" rel="noopener">مشاهده</a>` : ''}
            ${p.repo ? `<a class="btn" href="${p.repo}" target="_blank" rel="noopener">گیت‌هاب</a>` : ''}
          </div>
        </div>
      `;
      list.appendChild(li);
    }
  }

  fetch('/assets/data/projects.json')
    .then(r => r.json())
    .then(data => { all = data; render(); })
    .catch(() => { list.innerHTML = '<p>عدم امکان بارگذاری نمونه‌کارها.</p>'; });

  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    current = c.dataset.filter;
    chips.forEach(x => x.setAttribute('aria-selected', x === c ? 'true' : 'false'));
    render();
  }));

  // Smooth scroll & active navigation state
  const anchors = $$('a[href^="#"]:not([href="#"])');
  anchors.forEach(link => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    link.addEventListener('click', evt => {
      evt.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', `#${targetId}`);
    });
  });

  const navLinks = $$('.menu a[href^="#"]:not([href="#"])');
  const sections = navLinks
    .map(link => {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  function setActiveLink(activeLink) {
    navLinks.forEach(link => {
      if (link === activeLink) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveSection() {
    if (!sections.length) return;
    const scrollPos = window.scrollY + 120;
    let current = null;

    for (const { section, link } of sections) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        current = link;
        break;
      }
    }

    if (!current) {
      const last = sections[sections.length - 1];
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
        current = last?.link || null;
      }
    }

    setActiveLink(current);
  }

  function throttle(fn, wait) {
    let last = 0;
    let timeout;
    return function (...args) {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        last = now;
        fn.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          last = Date.now();
          timeout = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }

  const onScroll = throttle(updateActiveSection, 100);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', throttle(updateActiveSection, 200));
  updateActiveSection();
})();
