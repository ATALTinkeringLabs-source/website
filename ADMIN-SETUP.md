# Using the admin panel

Open `https://atlmlm.in/admin/` and sign in.

## One-time setup
1. Copy everything in this folder into your GitHub repo (keep the folder structure, including `.github/`), commit and push.
2. In the repo: **Settings → Actions → General → Workflow permissions → Read and write permissions** → Save.
3. Create a token: github.com/settings/personal-access-tokens/new
   - Repository access: **Only select repositories** → this repo
   - Repository permissions → **Contents: Read and write**
   - Expiry: 90 days (put a reminder in your calendar to make a new one)
4. Open `/admin/`, enter your GitHub username, repo name, branch (usually `main`) and the token.

## How it works
- Content lives in Markdown files: `posts/*.md`, `content/projects/*.md`, `content/technologies/*.md`.
- The admin edits those files through GitHub. Every save is a normal commit.
- A GitHub Action (`.github/workflows/build.yml`) runs `node build.js`, which regenerates `blog.html`, `projects.html`, every post/project page, the home page "Latest stories", and the `js/*-data.js` files.
- Allow about a minute between saving and seeing the change live. Progress shows in the repo's **Actions** tab.

## Rules
- Never edit generated files by hand (`blog.html`, `projects.html`, `posts/*.html`, `projects/*.html`, `js/*-data.js`); the next build overwrites them. Edit the `.md` files or use the admin.
- To change page layout or design, edit `build.js` (templates) and `css/`.
- Run locally anytime with `node build.js`.
