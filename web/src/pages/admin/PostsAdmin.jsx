import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../lib/api.js';
import { useLoad, useTitle } from '../../lib/hooks.js';
import { fmtShort } from '../../lib/format.js';
import { Button, Confirm, Empty, LoadError, Skeleton, useToast } from '../../components/ui.jsx';
import { AdminOnly, SectionHeader } from './AdminLayout.jsx';

export default function PostsAdmin() {
  useTitle('Articles');
  return <AdminOnly><PostsPage /></AdminOnly>;
}

function PostsPage() {
  const toast = useToast();
  const { data, error, loading, reload } = useLoad(() => api('/posts').then((d) => d.posts), []);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <SectionHeader title="Articles" actions={<Button to="/gestion/articles/nouveau" icon="plus">Nouvel article</Button>}>
        Les brouillons ne sont visibles que des administrateurs.
      </SectionHeader>
      {error && <LoadError error={error} onRetry={reload} />}
      {loading && !data && <Skeleton className="h-64" />}
      {data?.length === 0 && <Empty icon="book" title="Aucun article" action={<Button to="/gestion/articles/nouveau" icon="plus">Écrire le premier</Button>} />}
      {data?.length > 0 && (
        <ul className="card divide-y divide-line">
          {data.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
              <div className="min-w-0 flex-1">
                <Link to={`/gestion/articles/${p.id}`} className="font-semibold hover:text-link">{p.title}</Link>
                <p className="mt-0.5 text-sm text-muted">{fmtShort(p.created_at)}{p.author && ` · ${p.author}`}</p>
              </div>
              <span className={`pill ${p.published ? 'pill-green' : 'pill-yellow'}`}>{p.published ? 'Publié' : 'Brouillon'}</span>
              <div className="flex gap-1">
                {p.published && <Button to={`/blog/${p.slug}`} variant="ghost" size="sm" icon="eye" aria-label="Voir l'article" />}
                <Button to={`/gestion/articles/${p.id}`} variant="ghost" size="sm" icon="edit" aria-label="Modifier" />
                <Button variant="ghost" size="sm" icon="trash" aria-label="Supprimer" onClick={() => setDel(p)} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <Confirm open={!!del} onClose={() => setDel(null)} busy={busy} tone="danger" confirmLabel="Supprimer" title="Supprimer l'article"
        onConfirm={async () => {
          setBusy(true);
          try { await api(`/admin/posts/${del.id}`, { method: 'DELETE' }); toast('Article supprimé'); setDel(null); reload(); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
        }}>
        <p>« {del?.title} » sera supprimé définitivement.</p>
      </Confirm>
    </div>
  );
}
