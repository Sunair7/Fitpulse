const KEY = 'fitpulse-theme-override';

export function applyTheme(pref) {
  const root = document.documentElement;
  const stored = localStorage.getItem(KEY);
  const mode = stored || pref || 'dark';
  const effective =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
      : mode;
  root.dataset.theme = effective;
  if (effective === 'light') {
    root.classList.add('theme-light');
    root.classList.remove('theme-dark');
  } else {
    root.classList.add('theme-dark');
    root.classList.remove('theme-light');
  }
}

export function setLocalThemeOverride(value) {
  if (!value || value === 'system') localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, value);
  applyTheme(value);
}
