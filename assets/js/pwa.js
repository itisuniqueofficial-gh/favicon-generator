export function initPwa() {
  const install = document.querySelector('#installButton');
  let promptEvent;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    promptEvent = event;
    install.hidden = false;
  });
  install?.addEventListener('click', async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    promptEvent = null;
    install.hidden = true;
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => window.dispatchEvent(new CustomEvent('app-update')));
    }).catch(() => {});
  }
}
