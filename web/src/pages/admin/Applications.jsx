import { useMemo, useRef, useState } from 'react';
import { api } from '../../lib/api.js';
import { useLoad, useTitle } from '../../lib/hooks.js';
import { CERTS, fmtDate, fmtDateTime, searchKey } from '../../lib/format.js';
import { Button, Confirm, Empty, LoadError, Notice, Skeleton, Tabs, useToast } from '../../components/ui.jsx';
import { Icon } from '../../components/Icon.jsx';
import { SectionHeader } from './AdminLayout.jsx';

const STATUS = {
  pending: { label: 'À examiner', tone: 'pill-orange' },
  unverified: { label: 'Email non confirmé', tone: 'pill-neutral' },
  accepted: { label: 'Acceptée', tone: 'pill-green' },
  refused: { label: 'Refusée', tone: 'pill-red' },
  banned: { label: 'Bannie', tone: 'pill-red' },
};
const EVENTS = {
  submit: 'Candidature déposée', coopt: 'Cooptation', verify: 'Email confirmé', approve: 'Approuvée',
  refuse: 'Refusée', ban: 'Bannie', unban: 'Bannissement levé', accepted: 'Acceptée à l\'unanimité',
  resend: 'Invitation renvoyée', signup: 'Compte créé',
};
const CONFIRMS = {
  refuse: { title: 'Refuser la candidature', label: 'Refuser', tone: 'danger', text: 'Le candidat est prévenu par email et pourra postuler de nouveau plus tard.' },
  ban: { title: 'Bannir le candidat', label: 'Bannir', tone: 'danger', text: 'Le candidat est prévenu par email et ne pourra plus postuler avec cette adresse.' },
  unban: { title: 'Lever le bannissement', label: 'Lever le bannissement', tone: 'primary', text: 'La candidature repasse en « refusée » et le candidat est prévenu qu\'il peut postuler de nouveau.' },
  resend: { title: 'Renvoyer l\'invitation', label: 'Renvoyer', tone: 'primary', text: 'Un nouveau lien d\'inscription, valable 30 jours, est envoyé au candidat. L\'ancien ne fonctionne plus.' },
};
const DONE = { approve: 'Approbation enregistrée', refuse: 'Candidature refusée', ban: 'Candidat banni', unban: 'Bannissement levé', resend: 'Invitation renvoyée' };

export default function Applications() {
  useTitle('Candidatures');
  const toast = useToast();
  const { data, error, loading, reload } = useLoad(() => api('/admin/applications'), []);
  const [tab, setTab] = useState('pending');
  const [onlyTodo, setOnlyTodo] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const detailRef = useRef(null);

  const counts = useMemo(() => {
    const c = { pending: 0, unverified: 0, accepted: 0, refused: 0, banned: 0 };
    data?.applications.forEach((a) => { c[a.status]++; });
    return c;
  }, [data]);
  const list = useMemo(() => {
    if (!data) return [];
    const q = searchKey(query);
    return data.applications.filter((a) =>
      a.status === tab &&
      (!onlyTodo || !a.approvals.includes(data.me)) &&
      (!q || searchKey(`${a.first_name} ${a.last_name} ${a.email}`).includes(q)));
  }, [data, tab, onlyTodo, query]);
  const selected = list.find((a) => a.id === selectedId) || list[0];

  const act = async (action, app) => {
    setBusy(true);
    try {
      const res = await api(`/admin/applications/${app.id}/${action}`, { method: 'POST' });
      toast(res.status === 'accepted' && action === 'approve' ? 'Unanimité atteinte : l\'invitation est envoyée' : DONE[action]);
      setPending(null);
      await reload();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const select = (id) => {
    setSelectedId(id);
    if (window.matchMedia('(max-width: 1023px)').matches) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <div>
      <SectionHeader title="Candidatures">Une candidature est acceptée quand tous les porte-parole l'ont approuvée. Un seul refus suffit à la rejeter.</SectionHeader>
      {error && <LoadError error={error} onRetry={reload} />}
      {loading && !data && <div className="grid gap-6 lg:grid-cols-[22rem_1fr]"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>}
      {data && (
        <>
          {!data.can_vote && <Notice className="mb-6">Vous consultez les candidatures en tant qu'administrateur. Seuls les porte-parole peuvent voter.</Notice>}
          <Tabs className="mb-5" value={tab} onChange={(t) => { setTab(t); setSelectedId(null); }}
            tabs={Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label, count: counts[value] }))} />
          <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
            <div className="space-y-3">
              <label className="relative block">
                <span className="sr-only">Rechercher une candidature</span>
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input id="app-search" className="input pl-10" placeholder="Nom ou email" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
              {tab === 'pending' && data.can_vote && (
                <label className="flex items-center gap-2 text-sm">
                  <input id="only-todo" type="checkbox" className="h-4 w-4 accent-[var(--c-primary)]" checked={onlyTodo} onChange={(e) => setOnlyTodo(e.target.checked)} />
                  Seulement celles où je n'ai pas voté
                </label>
              )}
              {list.length === 0 && <Empty icon="send" title="Rien ici">Aucune candidature dans cette liste.</Empty>}
              <ul className="space-y-2">
                {list.map((a) => {
                  const active = selected?.id === a.id;
                  return (
                    <li key={a.id}>
                      <button onClick={() => select(a.id)} aria-current={active ? 'true' : undefined}
                        className={`w-full rounded-xl border p-3.5 text-left transition-colors ${active ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:border-line-strong'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="min-w-0 truncate font-semibold">{a.first_name} {a.last_name}</span>
                          {a.status === 'pending' && <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">{a.approvals.length}/{data.pps.length}</span>}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                          <span>{fmtDate(a.submitted_at || a.created_at)}</span>
                          {a.referrer && <span className="pill pill-blue !h-5">Cooptée</span>}
                          {a.approvals.includes(data.me) && <span className="pill pill-green !h-5"><Icon name="check" size={12} />Mon vote</span>}
                          {a.status === 'accepted' && <span>{a.has_account ? 'Compte créé' : 'En attente d\'inscription'}</span>}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div ref={detailRef} className="scroll-mt-24">
              {selected && <Detail app={selected} data={data} busy={busy} onApprove={() => act('approve', selected)} onAsk={(action) => setPending({ action, app: selected })} />}
            </div>
          </div>
        </>
      )}
      {pending && (
        <Confirm open onClose={() => setPending(null)} busy={busy} onConfirm={() => act(pending.action, pending.app)}
          title={CONFIRMS[pending.action].title} confirmLabel={CONFIRMS[pending.action].label} tone={CONFIRMS[pending.action].tone}>
          <p><span className="font-semibold">{pending.app.first_name} {pending.app.last_name}</span> · {pending.app.email}</p>
          <p className="text-muted">{CONFIRMS[pending.action].text}</p>
        </Confirm>
      )}
    </div>
  );
}

function Detail({ app, data, busy, onApprove, onAsk }) {
  const toast = useToast();
  const approved = app.approvals.includes(data.me);
  const pct = data.pps.length ? (app.approvals.length / data.pps.length) * 100 : 0;
  const copy = async () => {
    try { await navigator.clipboard.writeText(app.email); toast('Adresse copiée'); } catch { /* clipboard unavailable */ }
  };
  return (
    <article className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">{app.first_name} {app.last_name}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="select-all break-all">{app.email}</span>
            <button onClick={copy} className="rounded p-1 hover:bg-sunken hover:text-ink" aria-label="Copier l'adresse"><Icon name="copy" size={15} /></button>
          </p>
        </div>
        <span className={`pill ${STATUS[app.status].tone}`}>{STATUS[app.status].label}</span>
      </div>
      <p className="mt-3 text-sm text-muted">
        Déposée le {fmtDate(app.submitted_at || app.created_at)}
        {app.referrer && <> · cooptée par <span className="font-semibold text-ink">{app.referrer.name}</span> ({CERTS[app.referrer.certification]})</>}
      </p>

      <h3 className="mt-6 text-sm font-semibold">{app.referrer ? 'Motif de la cooptation' : 'Motivations'}</h3>
      <p className="mt-2 whitespace-pre-line rounded-xl bg-sunken p-4 leading-relaxed">{app.motivations}</p>

      {app.status === 'pending' && (
        <div className="mt-6">
          <div className="flex items-baseline justify-between text-sm">
            <h3 className="font-semibold">Avis des porte-parole</h3>
            <span className="tabular-nums text-muted">{app.approvals.length} sur {data.pps.length}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-sunken"><div className="h-full rounded-full bg-success transition-[width]" style={{ width: `${pct}%` }} /></div>
          <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {data.pps.map((p) => {
              const yes = app.approvals.includes(p.id);
              return (
                <li key={p.id} className="flex items-center gap-2">
                  <Icon name={yes ? 'check' : 'clock'} size={16} className={yes ? 'text-success' : 'text-muted'} />
                  <span className={yes ? '' : 'text-muted'}>{p.name}{p.id === data.me ? ' (vous)' : ''}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {app.status === 'accepted' && !app.has_account && app.invite_expires_at && (
        <Notice className="mt-6">Invitation envoyée, valable jusqu'au {fmtDate(app.invite_expires_at)}.</Notice>
      )}

      {data.can_vote && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
          {app.status === 'pending' && (
            <>
              <Button icon={approved ? 'check' : 'thumbs-up'} onClick={onApprove} busy={busy} disabled={approved}>{approved ? 'Vous avez approuvé' : 'Approuver'}</Button>
              <Button variant="danger-soft" onClick={() => onAsk('refuse')}>Refuser</Button>
              <Button variant="ghost" icon="ban" onClick={() => onAsk('ban')}>Bannir</Button>
            </>
          )}
          {['refused', 'unverified'].includes(app.status) && <Button variant="ghost" icon="ban" onClick={() => onAsk('ban')}>Bannir</Button>}
          {app.status === 'banned' && <Button variant="secondary" onClick={() => onAsk('unban')}>Lever le bannissement</Button>}
          {app.status === 'accepted' && !app.has_account && <Button variant="secondary" icon="mail" onClick={() => onAsk('resend')}>Renvoyer l'invitation</Button>}
        </div>
      )}

      {app.history.length > 0 && (
        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-sm font-semibold">Historique</h3>
          <ol className="mt-3 space-y-2.5">
            {app.history.map((h, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-line-strong" />
                <span className="min-w-0"><span className="font-medium">{EVENTS[h.action] || h.action}</span>{h.by && <span className="text-muted"> par {h.by}</span>}<span className="text-muted"> · {fmtDateTime(h.at)}</span></span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}
