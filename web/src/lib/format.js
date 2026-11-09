export const DOMAINS = { DN: 'Droit Naturel', EA: 'École Autrichienne' };
export const LEVELS = { beginner: 'Débutant', BA: 'Bases Acquises', SA: 'Sait Analyser', SE: 'Sait Extrapoler' };
export const LEVEL_RANK = { beginner: 0, BA: 1, SA: 2, SE: 3 };
export const CERTS = { SM: 'Simple membre', MC: 'Membre certifié', PP: 'Porte-parole' };
export const CERT_TONE = { SM: 'pill-neutral', MC: 'pill-blue', PP: 'pill-flame' };
export const DIFFICULTIES = { LOW: 'Facile', MID: 'Intermédiaire', HIGH: 'Difficile' };

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const fmtDate = (iso) => (iso ? dateFmt.format(new Date(iso)) : '');
export const fmtShort = (iso) => (iso ? shortFmt.format(new Date(iso)) : '');
export const fmtDateTime = (iso) => (iso ? dateTimeFmt.format(new Date(iso)) : '');

export const fullName = (p) => (p ? `${p.first_name} ${p.last_name}` : '');
export const initials = (p) => `${p?.first_name?.[0] || ''}${p?.last_name?.[0] || ''}`.toUpperCase();
export const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
export const fmtScore = (n) => (n === null || n === undefined ? '—' : Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));

export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

/** Accent- and case-insensitive search key. */
export function searchKey(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
