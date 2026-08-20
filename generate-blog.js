const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const postsDir = path.join(rootDir, 'posts');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: markdown.trim() };
  }

  const metadata = {};
  const lines = match[1].split(/\r?\n/);

  for (const line of lines) {
    const index = line.indexOf(':');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    metadata[key] = value;
  }

  return {
    data: metadata,
    content: match[2].trim()
  };
}

function renderParagraphs(content) {
  return content
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim().replace(/\n/g, ' '))}</p>`)
    .join('\n');
}

function renderHeader(currentPage = 'blog') {
  const nav = `
    <nav>
      <a href="../index.html">LAB</a>
      <a href="../index.html#projects">PROJECTS</a>
      <a href="../technologies.html">TECHNOLOGY</a>
      <a href="../index.html#gallery">GALLERY</a>
      <a href="${currentPage === 'blog' ? 'blog.html' : '../blog.html'}">BLOG</a>
      <a href="../index.html#about">ABOUT</a>
      <a href="../index.html#contact">CONTACT</a>
    </nav>
  `;

  return `
    <header>
      <a href="${currentPage === 'blog' ? 'index.html' : '../index.html'}" class="logo" aria-label="Go to home page">
        <img src="${currentPage === 'blog' ? 'assets/logos/ATL_LOGO_transperent.png' : '../assets/logos/ATL_LOGO_transperent.png'}" alt="ATAL Tinkering Lab Logo" class="logo-img">
        <div class="logo-copy">
          <div class="atl">ATAL</div>
          <div class="name">TINKERING LAB</div>
        </div>
      </a>
      ${nav}
    </header>
  `;
}

function renderPageShell(bodyHtml, title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${title === 'ATL Blog' ? 'css/hero.css' : '../css/hero.css'}">
  <link rel="stylesheet" href="${title === 'ATL Blog' ? 'css/blog.css' : '../css/blog.css'}">
</head>
<body class="blog-page">
  ${bodyHtml}
</body>
</html>`;
}

function buildBlogList(posts) {
  const cards = posts.map((post) => `
    <article class="blog-list-card">
      <div class="blog-thumb" style="background:${post.cover};"></div>
      <div class="blog-content">
        <div class="blog-meta">
          <span>${escapeHtml(post.category)}</span>
          <span>${escapeHtml(post.readTime)}</span>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt)}</p>
        <a href="posts/${post.slug}.html">Read story</a>
      </div>
    </article>
  `).join('\n');

  return `
    ${renderHeader('blog')}
    <main class="blog-shell">
      <div class="blog-page-header">
        <div class="header-tag">
          <span></span>
          BLOG
          <span></span>
        </div>
        <h1>Stories from the lab</h1>
        <p>Insights, experiments, and ideas from creators who are building solutions for tomorrow.</p>
      </div>

      <div class="blog-list-grid">
        ${cards}
      </div>
    </main>
  `;
}

function buildBlogPost(post) {
  return `
    ${renderHeader('post')}
    <main class="blog-shell">
      <article class="blog-article">
        <div class="article-cover" style="background:${post.cover};"></div>
        <div class="article-body">
          <div class="article-meta">
            <span>${escapeHtml(post.category)}</span>
            <span>${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>${escapeHtml(post.readTime)}</span>
          </div>
          <h1>${escapeHtml(post.title)}</h1>
          <div class="article-author">By ${escapeHtml(post.author)}</div>
          ${renderParagraphs(post.content)}
          <a href="../blog.html" class="blog-back-link">← Back to all blog posts</a>
        </div>
      </article>
    </main>
  `;
}

function loadPosts() {
  const files = fs.readdirSync(postsDir)
    .filter((file) => file.endsWith('.md'))
    .sort();

  return files.map((file) => {
    const markdown = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data, content } = parseFrontmatter(markdown);
    const slug = path.basename(file, '.md');

    return {
      slug,
      title: data.title || 'Untitled post',
      category: data.category || 'General',
      date: data.date || new Date().toISOString(),
      readTime: data.readTime || '5 min read',
      excerpt: data.excerpt || '',
      author: data.author || 'ATL Team',
      cover: data.cover || 'linear-gradient(135deg,#0f172a 0%, #1d4ed8 45%, #5ccbff 100%)',
      content: content.trim()
    };
  });
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function main() {
  const posts = loadPosts();

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const blogHtml = renderPageShell(buildBlogList(posts), 'ATL Blog');
  writeFile(path.join(rootDir, 'blog.html'), blogHtml);

  const postsFolder = path.join(rootDir, 'posts');
  for (const post of posts) {
    const postHtml = renderPageShell(buildBlogPost(post), post.title);
    writeFile(path.join(postsFolder, `${post.slug}.html`), postHtml);
  }

  console.log(`Generated ${posts.length} blog posts.`);
}

main();
