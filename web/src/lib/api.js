/** The folder the site is served from: "/" or e.g. "/libertarien.net/" (Vite's `base`). */
export const BASE = import.meta.env.BASE_URL;

/** Uploaded files are stored as relative paths ("uploads/2026/11/x.jpg") so they survive a move. */
export function assetUrl(url) {
  if (!url) return url;
  return /^(https?:|data:|blob:|\/)/i.test(url) ? url : BASE + url;
}

export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/**
 * Calls the PHP API. The session lives in an HttpOnly cookie, so there is no token to manage.
 * The X-Requested-With header is required by the server on every write (CSRF protection).
 */
export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = { Accept: 'application/json', 'X-Requested-With': 'mdl' };
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${BASE}api${path}`, { method, headers, body: payload, credentials: 'same-origin' });
  } catch {
    throw new ApiError('Impossible de joindre le serveur. Vérifiez votre connexion.');
  }
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    throw new ApiError(data?.error || `Erreur ${res.status}`, res.status, data?.fields || {});
  }
  return data;
}

/** Downloads a file produced by the API (e.g. an .xlsx export). */
export async function download(path, fallbackName) {
  const res = await fetch(`${BASE}api${path}`, { headers: { 'X-Requested-With': 'mdl' }, credentials: 'same-origin' });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.error || `Erreur ${res.status}`, res.status);
  }
  const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
