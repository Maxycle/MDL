import { splitLinks } from '../lib/links.js';

/**
 * Text written by a member, with its web addresses clickable. Everything else stays plain text,
 * so nothing a member types can turn into HTML. Links open in a new tab and carry no referrer.
 */
export function Linkify({ text }) {
  return (
    <>
      {splitLinks(text).map((part, i) => (part.href
        ? (
          <a key={i} href={part.href} target="_blank" rel="noopener noreferrer nofollow ugc"
            className="text-link underline underline-offset-2 [overflow-wrap:anywhere] hover:no-underline">
            {part.text}
          </a>
        )
        : part.text))}
    </>
  );
}
