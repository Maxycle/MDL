import { api } from '../lib/api.js';
import { useLoad, useTitle } from '../lib/hooks.js';
import { useSession } from '../lib/session.jsx';
import { hostOf } from '../lib/format.js';
import { Button, Empty, LoadError, PageHeader, Skeleton } from '../components/ui.jsx';
import { Icon } from '../components/Icon.jsx';

export default function Links() {
  useTitle('Liens');
  const { user } = useSession();
  const { data, error, loading, reload } = useLoad(() => api('/resources').then((d) => d.resources), []);

  return (
    <div className="page max-w-4xl">
      <PageHeader eyebrow="Ressources" title="Liens" actions={user?.is_admin && <Button to="/gestion/liens" variant="secondary" icon="edit">Gérer les liens</Button>}>
        Une sélection de sites pour approfondir le droit naturel et l'économie autrichienne.
      </PageHeader>
      {error && <LoadError error={error} onRetry={reload} />}
      {loading && <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>}
      {data?.length === 0 && <Empty icon="link" title="Aucun lien pour l'instant" />}
      {data?.length > 0 && (
        <ul className="space-y-3">
          {data.map((r) => (
            <li key={r.id}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="card group flex items-start gap-4 p-5 transition-colors hover:border-line-strong">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-link"><Icon name="link" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold group-hover:text-link">{r.title}</span>
                    <span className="text-sm text-muted">{hostOf(r.url)}</span>
                  </span>
                  {r.description && <span className="mt-1 block text-sm leading-relaxed text-muted">{r.description}</span>}
                </span>
                <Icon name="external" className="mt-1 text-muted group-hover:text-link" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
