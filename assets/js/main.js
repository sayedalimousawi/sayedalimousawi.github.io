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
})();
