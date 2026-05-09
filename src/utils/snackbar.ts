import './snackbar.css';

export const showSnackbar = (message: string, type: 'success' | 'error') => {
  const container = document.getElementById('snackbar-container') || createSnackbarContainer();
  
  // Bring to front in top layer if popover is supported
  if ('popover' in container) {
    try {
      (container as any).hidePopover();
      (container as any).showPopover();
    } catch (e) {}
  }
  
  const snackbar = document.createElement('div');
  snackbar.className = `snackbar ${type}`;
  
  const icon = document.createElement('span');
  icon.className = 'snackbar-icon';
  if (type === 'success') {
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>';
  } else {
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>';
  }

  const text = document.createElement('span');
  text.className = 'snackbar-text';
  text.innerText = message;

  snackbar.appendChild(icon);
  snackbar.appendChild(text);
  
  container.appendChild(snackbar);

  // Trigger animation
  setTimeout(() => {
    snackbar.classList.add('show');
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    snackbar.classList.remove('show');
    setTimeout(() => {
      snackbar.remove();
    }, 300); // match transition duration
  }, 3000);
};

const createSnackbarContainer = () => {
  const container = document.createElement('div');
  container.id = 'snackbar-container';
  if ('popover' in container) {
    container.setAttribute('popover', 'manual');
  }
  document.body.appendChild(container);
  if ('popover' in container) {
    try {
      (container as any).showPopover();
    } catch (e) {}
  }
  return container;
};
