const blogPosts = window.blogPosts || [];

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

function renderBlogList() {
  const listEl = document.querySelector('[data-blog-list]');
  if (!listEl || !blogPosts.length) return;

  listEl.innerHTML = blogPosts.map((post) => `
    <article class="blog-card">
      <div class="blog-thumb" style="background:${post.cover};"></div>
      <div class="blog-content">
        <div class="blog-meta">
          <span>${post.category}</span>
          <span>${post.readTime}</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <a href="blog-post.html?id=${post.id}">Read story</a>
      </div>
    </article>
  `).join('');
}

function renderBlogPost() {
  const articleEl = document.querySelector('[data-blog-article]');
  if (!articleEl) return;

  const postId = getQueryParam('id');
  const post = blogPosts.find((item) => item.id === postId);

  if (!post) {
    articleEl.innerHTML = `
      <div class="blog-empty">
        <h2>Article not found</h2>
        <p>The blog post you are looking for does not exist.</p>
        <a href="blog.html" class="blog-back-link">Back to blog</a>
      </div>
    `;
    return;
  }

  articleEl.innerHTML = `
    <article class="blog-article">
      <div class="article-cover" style="background:${post.cover};"></div>
      <div class="article-body">
        <div class="article-meta">
          <span>${post.category}</span>
          <span>${formatDate(post.date)}</span>
          <span>${post.readTime}</span>
        </div>
        <h1>${post.title}</h1>
        <div class="article-author">By ${post.author}</div>
        ${post.content.map((paragraph) => `<p>${paragraph}</p>`).join('')}
        <a href="blog.html" class="blog-back-link">← Back to all blog posts</a>
      </div>
    </article>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'blog-list') {
    renderBlogList();
  }

  if (document.body.dataset.page === 'blog-post') {
    renderBlogPost();
  }
});
