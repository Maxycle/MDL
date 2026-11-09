import { useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useLoad, useTitle } from '../lib/hooks.js';
import { CERTS, CERT_TONE, DOMAINS, LEVELS, fmtDate, searchKey } from '../lib/format.js';
import { Empty, LoadError, Modal, PageHeader, Skeleton, Tabs } from '../components/ui.jsx';
import { Mark } from '../components/Mark.jsx';
import { Icon } from '../components/Icon.jsx';

export function LevelLine({ levels, compact }) {
  return (
    <dl className={`grid gap-1 ${compact ? 'text-xs' : 'text-sm'}`}>
      {Object.entries(DOMAINS).map(([code, label]) => (
        <div key={code} className="flex justify-between gap-3">
          <dt className="text-muted">{label}</dt>
          <dd className={`font-semibold ${levels[code] === 'beginner' ? 'text-muted' : ''}`}>{LEVELS[levels[code]]}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Members() {
  useTitle('Membres');
  const { data, error, loading, reload } = useLoad(() => api('/members').then((d) => d.members), []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const counts = useMemo(() => {
    const c = { all: 0, PP: 0, MC: 0, SM: 0 };
    (data || []).forEach((m) => { c.all++; c[m.certification]++; });
    return c;
  }, [data]);
  const shown = useMemo(() => {
    const q = searchKey(query);
    return (data || []).filter((m) =>
      (filter === 'all' || m.certification === filter) &&
      (!q || searchKey(`${m.first_name} ${m.last_name} ${m.username}`).includes(q)));
  }, [data, query, filter]);

  return (
    <div className="page">
      <PageHeader eyebrow="Annuaire" title="Membres">
        Les membres qui ont choisi de rendre leur profil public, avec leur niveau dans chaque domaine.
      </PageHeader>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={filter} onChange={setFilter} tabs={[
          { value: 'all', label: 'Tous', count: counts.all },
          { value: 'PP', label: 'Porte-parole', count: counts.PP },
          { value: 'MC', label: 'Certifiés', count: counts.MC },
          { value: 'SM', label: 'Membres', count: counts.SM },
        ]} />
        <label className="relative md:w-72">
          <span className="sr-only">Rechercher un membre</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input id="member-search" className="input pl-10" placeholder="Rechercher un nom" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      {error && <LoadError error={error} onRetry={reload} />}
      {loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-44" />)}</div>}
      {data && shown.length === 0 && <Empty icon="users" title="Aucun membre trouvé">{query ? 'Essayez une autre orthographe.' : 'Aucun profil public dans cette catégorie.'}</Empty>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((m) => (
          <button key={m.id} onClick={() => setSelected(m)} className="card flex flex-col p-5 text-left transition-shadow hover:shadow-lg">
            <div className="flex items-start gap-4">
              <Mark size={56} levels={m.levels} certification={m.certification} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-semibold leading-snug">{m.first_name} {m.last_name}</p>
                <p className="truncate text-sm text-muted">@{m.username}</p>
                <span className={`pill mt-2 ${CERT_TONE[m.certification]}`}>{CERTS[m.certification]}</span>
              </div>
            </div>
            <div className="mt-4 border-t border-line pt-3"><LevelLine levels={m.levels} compact /></div>
            {m.intro && <p className="mt-3 line-clamp-2 text-sm text-muted">{m.intro}</p>}
          </button>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.first_name} ${selected.last_name}` : ''}>
        {selected && (
          <div>
            <div className="flex items-center gap-5">
              <Mark size={96} levels={selected.levels} certification={selected.certification} />
              <div>
                <p className="text-muted">@{selected.username}</p>
                <span className={`pill mt-2 ${CERT_TONE[selected.certification]}`}>{CERTS[selected.certification]}</span>
                {selected.member_since && <p className="mt-2 text-sm text-muted">Membre depuis le {fmtDate(selected.member_since)}</p>}
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-sunken p-4"><LevelLine levels={selected.levels} /></div>
            {selected.intro && <p className="mt-6 whitespace-pre-line leading-relaxed">{selected.intro}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
