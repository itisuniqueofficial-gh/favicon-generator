const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const ALLOWED_EXT = /\.(png|jpe?g|webp|svg)$/i;
let lastKey = '';

export function sanitizeFilename(name = 'favicon-source') {
  return name.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'favicon-source';
}

export function resetDuplicateTracking() {
  lastKey = '';
}

export async function validateFile(file) {
  if (!file) throw new Error('Select or paste an image first.');
  if (file.size > MAX_BYTES) throw new Error('File is too large. Maximum size is 10 MB.');
  if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXT.test(file.name)) throw new Error('Unsupported file. Use PNG, JPG, JPEG, WEBP or SVG.');
  const key = `${file.name}:${file.size}:${file.lastModified}`;
  if (key === lastKey) throw new Error('This image is already loaded.');
  lastKey = key;
  return true;
}

export function qualityRows(file, image) {
  const min = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const score = min >= 512 ? 'Excellent' : min >= 256 ? 'Good' : min >= 128 ? 'Usable' : 'Low';
  return [
    ['Type', file.type || 'Detected by extension'],
    ['Dimensions', `${image.naturalWidth || image.width} x ${image.naturalHeight || image.height}`],
    ['Quality', score],
    ['Size', `${(file.size / 1024).toFixed(1)} KB`]
  ];
}
