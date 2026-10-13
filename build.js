/**
 * Site builder. Reads Markdown content and regenerates every page that shows it.
 *
 *   posts/*.md                 -> blog
 *   content/projects/*.md      -> projects
 *   content/technologies/*.md  -> technologies
 *
 * Run:  node build.js      (the GitHub Action runs this for you on every content change)
 * Needs only Node 16+; no npm packages.
 */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const fmtDate = (d) => { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); };
const write = (rel, text) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text, 'utf8'); };

// ---------- content loading ----------
function parseFrontmatter(src) {
  src = src.replace(/\r\n/g, '\n');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src.trim() };
  const data = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) { try { val = JSON.parse(val); } catch { val = val.slice(1, -1); } }
    else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    data[key] = val;
  }
  return { data, body: m[2].trim() };
}

// A cover is either a CSS gradient or an image path such as /assets/images/uploads/photo.jpg
const coverCss = (c) => /gradient|^#|^rgb|^url\(/i.test(c) ? c : `url('${String(c).replace(/'/g, '%27')}') center/cover no-repeat`;

const DEFAULT_COVER = 'linear-gradient(135deg,#0f172a 0%, #1d4ed8 45%, #5ccbff 100%)';

function load(dir, defaults = {}) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((f) => f.endsWith('.md')).map((file) => {
    const { data, body } = parseFrontmatter(fs.readFileSync(path.join(abs, file), 'utf8'));
    const id = path.basename(file, '.md');
    return {
      id,
      title: 'Untitled', category: 'General', date: '', readTime: '', excerpt: '', author: 'ATL Team',
      cover: DEFAULT_COVER, ...defaults, ...data,
      content: body.split(/\n{2,}/).map((p) => p.trim().replace(/\n/g, ' ')).filter(Boolean),
    };
  });
}
const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));

// ---------- shared page pieces ----------
function header(prefix) {
  return `
    <header>
      <a href="${prefix}index.html" class="logo" aria-label="Go to home page">
        <img src="${prefix}assets/logos/ATL_LOGO_transperent.png" alt="ATAL Tinkering Lab Logo" class="logo-img">
        <div class="logo-copy">
          <div class="atl">ATAL</div>
          <div class="name">TINKERING LAB</div>
        </div>
      </a>
      <nav>
        <a href="${prefix}index.html">LAB</a>
        <a href="${prefix}projects.html">PROJECTS</a>
        <a href="${prefix}technologies.html">TECHNOLOGY</a>
        <a href="${prefix}index.html#gallery">GALLERY</a>
        <a href="${prefix}blog.html">BLOG</a>
        <a href="${prefix}index.html#about">ABOUT</a>
        <a href="${prefix}index.html#contact">CONTACT</a>
      </nav>
    </header>`;
}

function shell({ title, description, prefix, css, bodyClass, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>${description ? `\n  <meta name="description" content="${esc(description)}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}css/hero.css">
  <link rel="stylesheet" href="${prefix}css/${css}.css">
</head>
<body class="${bodyClass}">
${header(prefix)}
${body}
</body>
</html>
`;
}

const paragraphs = (item) => item.content.map((p) => `<p>${esc(p)}</p>`).join('\n          ');

// ---------- blog ----------
function buildBlog(posts) {
  const cards = posts.map((p) => `
        <article class="blog-list-card">
          <div class="blog-thumb" style="background:${coverCss(p.cover)};"></div>
          <div class="blog-content">
            <div class="blog-meta"><span>${esc(p.category)}</span><span>${esc(p.readTime)}</span></div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.excerpt)}</p>
            <a href="posts/${p.id}.html">Read story</a>
          </div>
        </article>`).join('\n');

  write('blog.html', shell({
    title: 'ATL Blog', prefix: '', css: 'blog', bodyClass: 'blog-page',
    description: 'Stories from the lab: insights, experiments and ideas from young creators.',
    body: `    <main class="blog-shell">
      <div class="blog-page-header">
        <div class="header-tag"><span></span>BLOG<span></span></div>
        <h1>Stories from the lab</h1>
        <p>Insights, experiments, and ideas from creators who are building solutions for tomorrow.</p>
      </div>
      <div class="blog-list-grid">${cards}
      </div>
    </main>`,
  }));

  for (const p of posts) {
    write(`posts/${p.id}.html`, shell({
      title: p.title, prefix: '../', css: 'blog', bodyClass: 'blog-page', description: p.excerpt,
      body: `    <main class="blog-shell">
      <article class="blog-article">
        <div class="article-cover" style="background:${coverCss(p.cover)};"></div>
        <div class="article-body">
          <div class="article-meta"><span>${esc(p.category)}</span><span>${fmtDate(p.date)}</span><span>${esc(p.readTime)}</span></div>
          <h1>${esc(p.title)}</h1>
          <div class="article-author">By ${esc(p.author)}</div>
          ${paragraphs(p)}
          <a href="../blog.html" class="blog-back-link">← Back to all blog posts</a>
        </div>
      </article>
    </main>`,
    }));
  }
  removeOrphans('posts', posts);
}

// ---------- projects ----------
function buildProjects(projects) {
  const cards = projects.map((p) => `
        <article class="project-list-card">
          <div class="project-thumb" style="background:${coverCss(p.cover)};"></div>
          <div class="project-content">
            <div class="project-meta"><span>${esc(p.category)}</span><span>${esc(p.readTime)}</span></div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.excerpt)}</p>
            <a href="projects/${p.id}.html">View Project</a>
          </div>
        </article>`).join('\n');

  write('projects.html', shell({
    title: 'ATL Projects', prefix: '', css: 'projects', bodyClass: 'projects-page',
    description: 'Real solutions built by students who turned curiosity into creation.',
    body: `    <main class="projects-shell">
      <div class="projects-page-header">
        <div class="header-tag"><span></span>PROJECTS<span></span></div>
        <h1>Student Innovations</h1>
        <p>Real solutions built by students who turned curiosity into creation. Explore projects that solve community challenges.</p>
      </div>
      <div class="projects-list-grid">${cards}
      </div>
    </main>`,
  }));

  for (const p of projects) {
    write(`projects/${p.id}.html`, shell({
      title: p.title, prefix: '../', css: 'projects', bodyClass: 'projects-page', description: p.excerpt,
      body: `    <main class="projects-shell">
      <article class="project-article">
        <div class="article-cover" style="background:${coverCss(p.cover)};"></div>
        <div class="article-body">
          <div class="article-meta"><span>${esc(p.category)}</span><span>${fmtDate(p.date)}</span><span>${esc(p.readTime)}</span></div>
          <h1>${esc(p.title)}</h1>
          <div class="article-author">By ${esc(p.author)}</div>
          ${paragraphs(p)}
          <a href="../projects.html" class="project-back-link">← Back to all projects</a>
        </div>
      </article>
    </main>`,
    }));
  }
  removeOrphans('projects', projects);
}

// Delete generated pages whose Markdown source was deleted in the admin.
function removeOrphans(dir, items) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return;
  const ids = new Set(items.map((i) => i.id));
  for (const f of fs.readdirSync(abs)) if (f.endsWith('.html') && !ids.has(path.basename(f, '.html'))) fs.unlinkSync(path.join(abs, f));
}

// ---------- JS data files used by the technologies pages (and old ?id= links) ----------
function dataFile(rel, varName, items, fields) {
  const out = items.map((i) => {
    const o = {}; fields.forEach((k) => { if (i[k] !== undefined) o[k] = i[k]; }); o.cover = coverCss(i.cover); o.content = i.content; return o;
  });
  write(rel, `// AUTO-GENERATED by build.js from Markdown files. Do not edit by hand.\nwindow.${varName} = ${JSON.stringify(out, null, 2)};\n`);
}

// ---------- home page: "Latest stories" ----------
function patchHome(posts) {
  const file = path.join(ROOT, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const cards = posts.slice(0, 3).map((p) => `
        <article class="blog-card">
            <div class="blog-thumb" style="background:${coverCss(p.cover)};"></div>
            <div class="blog-content">
                <div class="blog-meta"><span>${esc(p.category)}</span><span>${esc(p.readTime)}</span></div>
                <h3>${esc(p.title)}</h3>
                <p>${esc(p.excerpt)}</p>
                <a href="posts/${p.id}.html">Read story</a>
            </div>
        </article>`).join('\n');
  const block = `<!-- BLOG:START (auto-generated) -->${cards}\n        <!-- BLOG:END -->`;
  if (html.includes('<!-- BLOG:START')) {
    html = html.replace(/<!-- BLOG:START[\s\S]*?<!-- BLOG:END -->/, block);
  } else {
    html = html.replace(/(<div class="blog-grid">)[\s\S]*?(\n\s*<\/div>\s*\n\s*<\/section>)/, `$1\n        ${block}$2`);
  }
  fs.writeFileSync(file, html, 'utf8');
}

// ---------- run ----------
const posts = load('posts').sort(byDateDesc);
const projects = load('content/projects').sort(byDateDesc);
const technologies = load('content/technologies', { icon: '◆', level: '', order: '999' })
  .sort((a, b) => (Number(a.order) - Number(b.order)) || a.title.localeCompare(b.title));

buildBlog(posts);
buildProjects(projects);
patchHome(posts);
dataFile('js/blog-data.js', 'blogPosts', posts, ['id', 'title', 'category', 'date', 'readTime', 'excerpt', 'cover', 'author']);
dataFile('js/project-data.js', 'projectPosts', projects, ['id', 'title', 'category', 'date', 'readTime', 'excerpt', 'cover', 'author']);
dataFile('js/technology-data.js', 'technologies', technologies, ['id', 'order', 'title', 'icon', 'category', 'level', 'excerpt', 'cover', 'author']);

console.log(`Built ${posts.length} posts, ${projects.length} projects, ${technologies.length} technologies.`);
