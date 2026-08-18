const projectPosts = window.projectPosts || [];

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function renderProjectList() {
  const listEl = document.querySelector('[data-project-list]');
  if (!listEl || !projectPosts.length) return;

  listEl.innerHTML = projectPosts.map((project) => `
    <article class="project-card">
      <div class="project-thumb" style="background:${project.cover};"></div>
      <div class="project-content">
        <div class="project-meta">
          <span>${project.category}</span>
          <span>${project.readTime}</span>
        </div>
        <h3>${project.title}</h3>
        <p>${project.excerpt}</p>
        <a href="project-post.html?id=${project.id}">View Project</a>
      </div>
    </article>
  `).join('');
}

function renderProjectPost() {
  const articleEl = document.querySelector('[data-project-article]');
  if (!articleEl) return;

  const projectId = getQueryParam('id');
  const project = projectPosts.find((item) => item.id === projectId);

  if (!project) {
    articleEl.innerHTML = `
      <div class="project-empty">
        <h2>Project not found</h2>
        <p>The project you are looking for does not exist.</p>
        <a href="projects.html" class="project-back-link">Back to all projects</a>
      </div>
    `;
    return;
  }

  const contentHtml = project.content.map((text) => `<p>${text}</p>`).join('');

  articleEl.innerHTML = `
    <article class="project-article">
      <div class="article-cover" style="background:${project.cover};"></div>
      <div class="article-body">
        <div class="article-meta">
          <span>${project.category}</span>
          <span>${formatDate(project.date)}</span>
          <span>${project.readTime}</span>
        </div>
        <h1>${project.title}</h1>
        <div class="article-author">By ${project.author}</div>
        ${contentHtml}
        <a href="projects.html" class="project-back-link">← Back to all projects</a>
      </div>
    </article>
  `;
}

// Initialize based on page type
if (document.body.classList.contains('projects-page')) {
  if (document.body.dataset.page === 'project-post') {
    renderProjectPost();
  } else {
    renderProjectList();
  }
}
