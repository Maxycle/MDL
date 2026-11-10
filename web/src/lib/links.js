// Web addresses written in plain text: "https://…", "http://…" or "www.…".
const ADDRESS = /\b(?:https?:\/\/|www\.)[^\s<>"]+/gi;
const ENDING = /[.,;:!?'"»’\]}>)]$/;

/** Drops punctuation that ends the sentence rather than the address, but keeps a balanced ")" (Wikipedia links). */
function trimEnd(url) {
  let out = url;
  while (ENDING.test(out)) {
    if (out.endsWith(')') && (out.match(/\(/g) || []).length >= (out.match(/\)/g) || []).length) break;
    out = out.slice(0, -1);
  }
  return out;
}

/**
 * Splits text into plain parts and addresses: [{ text }, { text, href }, …].
 * Only http(s) addresses become links ("www.…" gets https://), so a "javascript:" text can never be one.
 */
export function splitLinks(text) {
  const source = String(text ?? '');
  const parts = [];
  let last = 0;
  for (const m of source.matchAll(ADDRESS)) {
    const url = trimEnd(m[0]);
    if (!/^(https?:\/\/|www\.)[^\s]+$/i.test(url) || m.index < last) continue;
    if (m.index > last) parts.push({ text: source.slice(last, m.index) });
    parts.push({ text: url, href: /^https?:\/\//i.test(url) ? url : `https://${url}` });
    last = m.index + url.length;
  }
  if (last < source.length) parts.push({ text: source.slice(last) });
  return parts;
}
