export async function makeZip(files) {
  const zip = new JSZip();
  const folder = zip.folder('favicons');
  files.forEach((file) => folder.file(file.name, file.blob));
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
}

export function saveBlob(blob, filename) {
  if (window.saveAs) return window.saveAs(blob, filename);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}
