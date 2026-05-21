import { drawIcon, generateIcons, htmlSnippet, manifestCode } from './icon-generator.js';
import { loadImage } from './image-processor.js';
import { initPwa } from './pwa.js';
import { makeZip, saveBlob } from './zip-generator.js';
import { qualityRows, resetDuplicateTracking, sanitizeFilename, validateFile } from './validators.js';

const state = { file: null, image: null, objectUrl: '', fileUrls: [], files: [], zip: null, generating: false };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function options() {
  return {
    fit: $('#fitMode').value,
    background: $('#backgroundColor').value,
    transparent: $('#transparentOutput').checked,
    padding: Number($('#paddingRange').value),
    radius: Number($('#radiusRange').value)
  };
}

function announce(message, kind = 'info') {
  const status = $('#statusMessage');
  status.textContent = message;
  status.dataset.kind = kind;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  $('#toastRegion').append(toast);
  setTimeout(() => toast.remove(), 4000);
}

function progress(value, label) {
  $('#progressBar').style.width = `${value}%`;
  $('#progressValue').textContent = `${value}%`;
  $('#progressLabel').textContent = label;
}

function revokeFileUrls() {
  state.fileUrls.forEach((url) => URL.revokeObjectURL(url));
  state.fileUrls = [];
}

function setButtons() {
  const hasImage = Boolean(state.image);
  const hasFiles = state.files.length > 0;
  const hasSelection = selectedFiles().length > 0;
  $('#generateButton').disabled = !hasImage || state.generating;
  $('#regenerateButton').disabled = !hasImage || state.generating;
  $('#downloadZipButton').disabled = !state.zip || state.generating;
  $('#downloadSelectedButton').disabled = !hasFiles || !hasSelection || state.generating;
  $('#clearButton').disabled = !hasImage && !hasFiles && !state.zip;
}

function renderCanvas(selector, width, height) {
  if (!state.image) return;
  const canvas = $(selector);
  const generated = drawIcon(state.image, width, height, options());
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(generated, 0, 0, canvas.width, canvas.height);
}

function renderPreviews() {
  requestAnimationFrame(() => {
    renderCanvas('#browserPreview', 32, 32);
    renderCanvas('#iosPreview', 180, 180);
    renderCanvas('#androidPreview', 192, 192);
    renderCanvas('#windowsPreview', 150, 150);
    renderCanvas('#pwaPreview', 512, 512);
  });
}

function renderQuality() {
  $('#qualityGrid').innerHTML = qualityRows(state.file, state.image).map(([label, value]) => `<div class="metric"><dt>${label}</dt><dd>${value}</dd></div>`).join('');
}

function renderCode() {
  $('#htmlCode').value = htmlSnippet($('#backgroundColor').value);
  $('#manifestCode').value = manifestCode($('#backgroundColor').value);
}

function renderFiles() {
  $('#fileCount').textContent = `${state.files.length} ${state.files.length === 1 ? 'file' : 'files'}`;
  if (!state.files.length) {
    $('#outputRows').innerHTML = '<p class="empty">Upload an image, adjust the icon, then generate files to see downloads here.</p>';
    setButtons();
    return;
  }
  revokeFileUrls();
  $('#outputRows').innerHTML = state.files.map((file, index) => {
    const isImage = file.blob.type.startsWith('image/');
    const url = isImage ? URL.createObjectURL(file.blob) : '';
    if (url) state.fileUrls.push(url);
    const thumb = url ? `<img src="${url}" alt="Preview of ${file.name}">` : '<i class="fa-regular fa-file-lines" aria-hidden="true"></i>';
    return `<article class="file-card"><div class="file-card-header"><input type="checkbox" data-select="${index}" checked aria-label="Select ${file.name}"><div class="file-thumb">${thumb}</div><div class="file-meta"><span class="file-name">${file.name}</span><span class="file-detail">${file.dimensions} - ${(file.size / 1024).toFixed(1)} KB</span><span class="badge">${file.status}</span></div></div><button class="small-btn" data-download="${index}" type="button">Download</button></article>`;
  }).join('');
  setButtons();
}

async function setFile(file) {
  await validateFile(file);
  progress(10, 'Validating image');
  if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
  const loaded = await loadImage(file);
  state.file = file;
  state.image = loaded.image;
  state.objectUrl = loaded.url;
  $('#sourcePreview').src = loaded.url;
  $('#sourcePreview').hidden = false;
  $('#fileName').textContent = sanitizeFilename(file.name);
  state.files = [];
  state.zip = null;
  renderQuality();
  renderPreviews();
  renderCode();
  renderFiles();
  progress(100, 'Image ready');
  announce('Image loaded. Generate Icons is now available.', 'success');
  setButtons();
}

async function generate() {
  if (!state.image) return announce('Upload an image first.', 'error');
  state.generating = true;
  state.zip = null;
  $('#generateButton').textContent = 'Generating...';
  $('#regenerateButton').textContent = 'Generating...';
  setButtons();
  progress(0, 'Starting generation');
  try {
    state.files = await generateIcons(state.image, options(), progress);
    renderFiles();
    progress(92, 'Building ZIP');
    state.zip = await makeZip(state.files);
    progress(100, 'Package ready');
    announce(`ZIP ready. ${state.files.length} files generated.`, 'success');
  } catch (error) {
    progress(0, 'Generation failed');
    announce(error.message || 'Generation failed.', 'error');
  } finally {
    state.generating = false;
    $('#generateButton').textContent = 'Generate Icons';
    $('#regenerateButton').textContent = 'Regenerate';
    setButtons();
  }
}

function selectedFiles() {
  const checked = $$('[data-select]:checked').map((input) => Number(input.dataset.select));
  return checked.map((index) => state.files[index]).filter(Boolean);
}

function bind() {
  const drop = $('#dropZone');
  drop.addEventListener('click', () => $('#fileInput').click());
  drop.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $('#fileInput').click(); } });
  ['dragenter', 'dragover'].forEach((eventName) => drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.add('is-dragging'); }));
  ['dragleave', 'drop'].forEach((eventName) => drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.remove('is-dragging'); }));
  drop.addEventListener('drop', (event) => setFile(event.dataTransfer.files[0]).catch((error) => announce(error.message, 'error')));
  $('#fileInput').addEventListener('change', (event) => setFile(event.target.files[0]).catch((error) => announce(error.message, 'error')));
  window.addEventListener('paste', (event) => {
    const file = [...event.clipboardData.files].find((item) => item.type.startsWith('image/'));
    if (file) setFile(file).catch((error) => announce(error.message, 'error'));
  });
  ['fitMode', 'backgroundColor', 'transparentOutput', 'paddingRange', 'radiusRange'].forEach((id) => $(`#${id}`).addEventListener('input', () => { $('#paddingOutput').textContent = `${$('#paddingRange').value}%`; $('#radiusOutput').textContent = `${$('#radiusRange').value}%`; renderPreviews(); renderCode(); }));
  $('#resetButton').addEventListener('click', () => { $('#fitMode').value = 'contain'; $('#paddingRange').value = 12; $('#radiusRange').value = 0; $('#transparentOutput').checked = true; $('#paddingOutput').textContent = '12%'; $('#radiusOutput').textContent = '0%'; renderPreviews(); renderCode(); });
  $('#generateButton').addEventListener('click', generate);
  $('#regenerateButton').addEventListener('click', generate);
  $('#downloadZipButton').addEventListener('click', () => state.zip && saveBlob(state.zip, 'favicon-package.zip'));
  $('#downloadSelectedButton').addEventListener('click', async () => { const files = selectedFiles(); if (!files.length) return announce('Select generated files first.', 'error'); const zip = await makeZip(files); saveBlob(zip, 'selected-favicons.zip'); });
  $('#clearButton').addEventListener('click', () => {
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    revokeFileUrls();
    state.file = null;
    state.image = null;
    state.objectUrl = '';
    state.files = [];
    state.zip = null;
    resetDuplicateTracking();
    $('#sourcePreview').removeAttribute('src');
    $('#sourcePreview').hidden = true;
    $('#fileInput').value = '';
    $('#fileName').textContent = 'None';
    $('#qualityGrid').innerHTML = '';
    renderFiles();
    progress(0, 'Cleared');
    announce('All files and the uploaded image were cleared.');
  });
  $('#outputRows').addEventListener('click', (event) => { const index = event.target.closest('[data-download]')?.dataset.download; if (index !== undefined) saveBlob(state.files[Number(index)].blob, state.files[Number(index)].name); });
  $('#outputRows').addEventListener('change', (event) => { if (event.target.matches('[data-select]')) setButtons(); });
  $$('[data-copy]').forEach((button) => button.addEventListener('click', async () => { await navigator.clipboard.writeText($(button.dataset.copy).value); announce('Code copied.', 'success'); }));
  $('#themeToggle').addEventListener('click', () => { document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); });
  window.addEventListener('app-update', () => announce('A new offline version is available after refresh.', 'success'));
}

function init() {
  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark');
  renderCode();
  renderFiles();
  setButtons();
  bind();
  initPwa();
  if (window.jQuery) window.jQuery('[data-accordion]').on('toggle', function () { window.jQuery(this).attr('aria-expanded', this.open ? 'true' : 'false'); });
}

init();
