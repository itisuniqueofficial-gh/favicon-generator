export async function loadImage(file) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  try {
    await image.decode();
    if ((image.naturalWidth || 0) < 16 || (image.naturalHeight || 0) < 16) throw new Error('Image must be at least 16 x 16 pixels.');
    return { image, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw new Error('The image could not be decoded. It may be corrupted or unsupported by this browser.');
  }
}

export function drawIcon(image, width, height, options) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const radius = Math.round(Math.min(width, height) * (options.radius / 100));
  if (radius) {
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius);
    ctx.clip();
  }
  if (!options.transparent) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);
  }
  const padding = Math.round(Math.min(width, height) * (options.padding / 100));
  const boxW = Math.max(1, width - padding * 2);
  const boxH = Math.max(1, height - padding * 2);
  const sourceW = image.naturalWidth || image.width;
  const sourceH = image.naturalHeight || image.height;
  const sourceRatio = sourceW / sourceH;
  const targetRatio = boxW / boxH;
  let drawW = boxW;
  let drawH = boxH;
  if (options.fit === 'contain') {
    if (sourceRatio > targetRatio) drawH = boxW / sourceRatio;
    else drawW = boxH * sourceRatio;
  } else if (options.fit === 'center') {
    drawW = Math.min(sourceW, boxW);
    drawH = Math.min(sourceH, boxH);
  } else {
    if (sourceRatio > targetRatio) drawW = boxH * sourceRatio;
    else drawH = boxW / sourceRatio;
  }
  ctx.drawImage(image, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
  return canvas;
}

export function canvasBlob(canvas, type = 'image/png', quality = 0.92) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
