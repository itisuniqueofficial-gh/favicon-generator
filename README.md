# Advanced Static Favicon Generator

A production-ready, fully static favicon generator for Cloudflare Pages. It has no backend, no server upload, no database and no runtime dependency on Node.js. Uploaded images stay inside the browser and are processed with Canvas, ES modules and static CDN libraries.

## Features

- Drag and drop upload, click upload, clipboard paste and mobile camera/image picker support.
- Browser-side PNG, JPG, JPEG, WEBP and SVG decoding where supported by the browser.
- Fit controls for contain, cover and center crop, plus safe padding, transparent output, custom background color and rounded corners.
- Live previews for browser tab, iOS home screen, Android launcher, Windows tile and PWA icon.
- Generates `favicon.ico`, favicon PNG sizes, Apple touch icon, Android Chrome icons, Microsoft tile, Safari pinned tab SVG, Open Graph image and Twitter card image.
- Generates `manifest.json`, `site.webmanifest`, `browserconfig.xml`, `README.txt`, `html-snippet.txt`, `jekyll-snippet.html`, `nextjs-snippet.txt` and `react-snippet.txt`.
- Individual downloads, selected downloads and complete `favicon-package.zip` downloads.
- SEO metadata, JSON-LD, sitemap, robots, PWA manifest, offline service worker, Cloudflare `_headers` and `_redirects`.

## Static Project Structure

```text
favicon-generator/
  assets/css/style.css
  assets/css/responsive.css
  assets/js/app.js
  assets/js/image-processor.js
  assets/js/icon-generator.js
  assets/js/zip-generator.js
  assets/js/validators.js
  assets/js/snippets.js
  assets/js/pwa.js
  assets/images/
  favicons/
  index.html
  manifest.json
  site.webmanifest
  robots.txt
  sitemap.xml
  sw.js
  _headers
  _redirects
  package.json
  README.md
  DEPLOYMENT.md
```

## Local Use

Open `index.html` with a static file server. The optional build command copies deployable files to `dist`:

```bash
npm install
npm run build
```

No Node.js server is used by the application.

## Privacy

Images are never uploaded. Generation happens locally in the browser with Canvas and JSZip.
