const technologyItems = window.technologies || [];

function technologyQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function renderTechnologyList() {
  const listEl = document.querySelector('[data-technology-list]');
  if (!listEl) return;

  listEl.innerHTML = technologyItems.map((technology) => `
    <article class="technology-list-card">
      <div class="technology-thumb" style="background:${technology.cover};" aria-hidden="true">${technology.icon}</div>
      <div class="technology-card-content">
        <h3>${technology.title}</h3>
      </div>
    </article>
  `).join('');
}

function renderTechnologyPost() {
  const articleEl = document.querySelector('[data-technology-article]');
  if (!articleEl) return;

  const technology = technologyItems.find((item) => item.id === technologyQueryParam('id'));
  if (!technology) {
    articleEl.innerHTML = '<div class="project-empty"><h2>Technology not found</h2><p>The technology page you are looking for does not exist.</p><a href="technologies.html" class="project-back-link">Back to all technologies</a></div>';
    return;
  }

  articleEl.innerHTML = `
    <article class="project-article technology-article">
      <div class="article-cover" style="background:${technology.cover};"></div>
      <div class="article-body">
        <div class="article-meta"><span>${technology.category}</span><span>${technology.level}</span></div>
        <h1>${technology.title}</h1>
        <div class="article-author">${technology.author}</div>
        ${technology.content.map((paragraph) => `<p>${paragraph}</p>`).join('')}
        <a href="technologies.html" class="project-back-link">← Back to all technologies</a>
      </div>
    </article>
  `;
}

if (document.body.dataset.page === 'technology-post') {
  renderTechnologyPost();
} else {
  renderTechnologyList();
}