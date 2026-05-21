# Deployment

## Cloudflare Pages Through GitHub

1. Push this repository to GitHub.
2. In Cloudflare Pages, create a project from the GitHub repository.
3. Set build command to `npm run build`.
4. Set output directory to `dist`.
5. Deploy.

## Static-Only Deployment

This project does not use Express, Functions, Workers, APIs, databases or server uploads. The `wrangler.toml` file only declares the Pages output directory.

## Optional No-Build Deployment

You can also deploy the repository root as static files if your host supports root deployments. Cloudflare Pages is usually cleaner with `npm run build` and `dist`.

## Headers And Caching

Cloudflare Pages reads `_headers` from the deployed output. The file includes CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and cache rules for static assets.

## Updating SEO URLs

Before production launch, replace `https://example.com/` in `index.html`, `robots.txt` and `sitemap.xml` with your real domain.
