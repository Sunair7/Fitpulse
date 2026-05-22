const API_PREFIX = import.meta.env.VITE_API_URL;

export async function api(path, init = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  let data = {};
  try {
    const text = await res.text();
    if (text) data = JSON.parse(text);
  } catch {
    data = {};
  }
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function uploadImage(path, fieldName, file) {
  const fd = new FormData();
  fd.append(fieldName, file);
  const res = await fetch(`${API_PREFIX}${path}`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  let data = {};
  try {
    const text = await res.text();
    if (text) data = JSON.parse(text);
  } catch {
    data = {};
  }
  if (!res.ok) {
    const err = new Error(data.message || `Upload failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Download binary/text from API (cookies included). */
export async function downloadApi(path, filename) {
  const res = await fetch(`${API_PREFIX}${path}`, { credentials: 'include' });
  if (!res.ok) {
    const err = new Error(`Download failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
