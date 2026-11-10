import { useEffect, useState } from 'react';
import { BASE } from '../../lib/api.js';
import { Notice } from '../../components/ui.jsx';

/**
 * A question image as members see it: blurred before the answer, clear after validation.
 * `top`/`bottom` (in %) preview a blurred band other than the saved one; `blurredOnly` hides the clear copy.
 */
export function ImagePreview({ url, top, bottom, blurredOnly = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  const src = (state) => {
    const params = new URLSearchParams({ url, state });
    if (top != null && bottom != null) {
      params.set('top', top);
      params.set('bottom', bottom);
    }
    return `${BASE}api/admin/questions/image-preview?${params}`;
  };
  if (failed) return <Notice tone="warning">Aucune image lisible à cette adresse.</Notice>;
  const views = blurredOnly ? [['blurred', 'Avant la réponse']] : [['blurred', 'Avant la réponse'], ['clear', 'Après validation']];
  return (
    <div className={`grid gap-3 ${views.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {views.map(([state, label]) => (
        <figure key={state}>
          <img src={src(state)} alt={label} onError={() => setFailed(true)} className="block min-h-16 w-full rounded-lg border border-line bg-sunken" />
          <figcaption className="mt-1 text-xs text-muted">{label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
