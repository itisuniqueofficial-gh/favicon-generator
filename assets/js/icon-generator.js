import { canvasBlob, drawIcon } from './image-processor.js';
import { allSnippets, browserConfig, htmlSnippet, manifestCode, readme } from './snippets.js';

const ICONS = [16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512];
const NAMED = [
  ['apple-touch-icon.png', 180, 180], ['android-chrome-192x192.png', 192, 192], ['android-chrome-512x512.png', 512, 512], ['mstile-150x150.png', 150, 150], ['og-image.png', 1200, 630], ['twitter-card.png', 1200, 675]
];

async function bytes(blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

function ico(pngs) {
  const header = new DataView(new ArrayBuffer(6));
  header.setUint16(2, 1, true);
  header.setUint16(4, pngs.length, true);
  const offset = 6 + pngs.length * 16;
  let dataOffset = offset;
  const total = offset + pngs.reduce((sum, item) => sum + item.bytes.length, 0);
  const out = new Uint8Array(total);
  out.set(new Uint8Array(header.buffer), 0);
  pngs.forEach((item, index) => {
    const entry = new DataView(new ArrayBuffer(16));
    entry.setUint8(0, item.size >= 256 ? 0 : item.size);
    entry.setUint8(1, item.size >= 256 ? 0 : item.size);
    entry.setUint16(4, 1, true);
    entry.setUint16(6, 32, true);
    entry.setUint32(8, item.bytes.length, true);
    entry.setUint32(12, dataOffset, true);
    out.set(new Uint8Array(entry.buffer), 6 + index * 16);
    out.set(item.bytes, dataOffset);
    dataOffset += item.bytes.length;
  });
  return new Blob([out], { type: 'image/x-icon' });
}

function text(name, content, type = 'text/plain') {
  return { name, blob: new Blob([content], { type }), dimensions: '-', size: content.length, status: 'Ready' };
}

export async function generateIcons(image, options, onProgress) {
  const files = [];
  const icoPngs = [];
  const total = ICONS.length + NAMED.length + 9;
  let done = 0;
  const tick = (label) => onProgress?.(Math.round((++done / total) * 100), label);
  for (const size of ICONS) {
    await new Promise(requestAnimationFrame);
    const blob = await canvasBlob(drawIcon(image, size, size, options));
    files.push({ name: `favicon-${size}x${size}.png`, blob, dimensions: `${size}x${size}`, size: blob.size, status: 'Ready' });
    if ([16, 32, 48, 64].includes(size)) icoPngs.push({ size, bytes: await bytes(blob) });
    tick(`Generated ${size}x${size}`);
  }
  for (const [name, width, height] of NAMED) {
    await new Promise(requestAnimationFrame);
    const blob = await canvasBlob(drawIcon(image, width, height, options));
    files.push({ name, blob, dimensions: `${width}x${height}`, size: blob.size, status: 'Ready' });
    tick(`Generated ${name}`);
  }
  files.unshift({ name: 'favicon.ico', blob: ico(icoPngs), dimensions: '16/32/48/64', size: 0, status: 'Ready' }); tick('Created favicon.ico');
  files.push(text('manifest.json', manifestCode(options.background), 'application/json')); tick('Created manifest.json');
  files.push(text('site.webmanifest', manifestCode(options.background), 'application/manifest+json')); tick('Created site.webmanifest');
  files.push(text('browserconfig.xml', browserConfig(options.background), 'application/xml')); tick('Created browserconfig.xml');
  files.push(text('safari-pinned-tab.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 64h384v384H64z"/></svg>', 'image/svg+xml')); tick('Created Safari SVG');
  Object.entries(allSnippets(options.background)).forEach(([name, content]) => files.push(text(name, content))); tick('Created snippets');
  files.push(text('README.txt', readme())); tick('Created README');
  return files.map((file) => ({ ...file, size: file.size || file.blob.size }));
}

export { drawIcon, htmlSnippet, manifestCode };
