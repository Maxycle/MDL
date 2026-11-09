import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { assetUrl } from '../lib/api.js';

marked.setOptions({ gfm: true, breaks: true });

// External links open in a new tab; everything is sanitized before reaching the page.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') || '')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
  if (node.tagName === 'IMG') {
    node.setAttribute('loading', 'lazy');
    // Uploaded images are stored relative to the site folder ("uploads/…").
    if (node.getAttribute('src')) node.setAttribute('src', assetUrl(node.getAttribute('src')));
  }
});

export function Markdown({ source, className = '' }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(source || '')), [source]);
  return <div className={`prose-mdl ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
