export function htmlSnippet(theme = '#ffffff') {
  return `<link rel="icon" href="/favicons/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">\n<link rel="manifest" href="/favicons/site.webmanifest">\n<meta name="msapplication-config" content="/favicons/browserconfig.xml">\n<meta name="theme-color" content="${theme}">`;
}

export function manifestCode(theme = '#ffffff') {
  return JSON.stringify({
    name: 'Website', short_name: 'Website', start_url: '/', display: 'standalone', background_color: theme, theme_color: theme,
    icons: [
      { src: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  }, null, 2);
}

export function browserConfig(theme = '#ffffff') {
  return `<?xml version="1.0" encoding="utf-8"?>\n<browserconfig>\n  <msapplication>\n    <tile>\n      <square150x150logo src="/favicons/mstile-150x150.png"/>\n      <TileColor>${theme}</TileColor>\n    </tile>\n  </msapplication>\n</browserconfig>`;
}

export function allSnippets(theme = '#ffffff') {
  const html = htmlSnippet(theme);
  return {
    'html-snippet.txt': html,
    'react-snippet.txt': `export function Favicons() {\n  return (\n    <>\n      ${html.replaceAll('\n', '\n      ')}\n    </>\n  );\n}`,
    'nextjs-snippet.txt': `export const metadata = {\n  icons: { icon: ['/favicons/favicon.ico', '/favicons/favicon-32x32.png'], apple: '/favicons/apple-touch-icon.png' },\n  manifest: '/favicons/site.webmanifest'\n};`,
    'jekyll-snippet.html': `{% comment %} Add to _includes/head.html {% endcomment %}\n${html}`
  };
}

export function readme() {
  return 'Favicon package\n\nUpload these files to /favicons on your site. Paste html-snippet.txt into your <head>. All images were processed locally in the browser.';
}
