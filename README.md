
# Webaby Angular

Angular version of your Webaby site with:
- Sticky header (transparent → 50% white on scroll), mobile hamburger.
- Hero with centered logo scrolling down to Products.
- Products ribbon: v2 tile style in a horizontal carousel (3 tiles desktop / 1 tile mobile),
  arrows with hover move + spring animation on click, autoplay.
- About + Contact restored: big image + text strip; email line expands to full form.
- Footer with social icons.
- GitHub Actions workflow to auto-deploy to GitHub Pages.

## Quickstart
```bash
npm install
npm start
# open http://localhost:4200
```

## Deploy (GitHub Pages)
1. Commit & push to `main` in a GitHub repo.
2. In Settings → Pages, set Source to **GitHub Actions** (if needed).
3. The included workflow builds and deploys automatically.
   It uses `--base-href ./` and creates a `404.html` for SPA fallback.
# webabyPage_angular 
## CI/CD automated deployment
## 
