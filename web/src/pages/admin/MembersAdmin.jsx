import { useMemo, useState } from 'react';
import { api, download } from '../../lib/api.js';
import { useLoad, useTitle } from '../../lib/hooks.js';
import { useSession } from '../../lib/session.jsx';
import { CERTS, CERT_TONE, DOMAINS, LEVELS, fmtShort, searchKey } from '../../lib/format.js';
import { Button, Confirm, Empty, LoadError, Modal, Skeleton, Switch, useToast } from '../../components/ui.jsx';
import { Icon } from '../../components/Icon.jsx';
import { Mark } from '../../components/Mark.jsx';
import { Linkify } from '../../components/Linkify.jsx';
import { SectionHeader } from './AdminLayout.jsx';

export default function MembersAdmin() {
  useTitle('Gestion des membres');
  const toast = useToast();
  const { data, error, loading, reload, setData } = useLoad(() => api('/admin/members').then((d) => d.members), []);
  const [query, setQuery] = useState('');
  const [cert, setCert] = useState('');
  const [wantsPP, setWantsPP] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const rows = useMemo(() => {
    const q = searchKey(query);
    return (data || []).filter((m) =>
      (!cert || m.certification === cert) && (!wantsPP || m.wants_pp) &&
      (!q || searchKey(`${m.first_name} ${m.last_name} ${m.username} ${m.email}`).includes(q)));
  }, [data, query, cert, wantsPP]);
  const open = data?.find((m) => m.id === openId);

  const exportXlsx = async () => {
    setExporting(true);
    try { await download('/admin/members/export', 'membres.xlsx'); } catch (e) { toast(e.message, 'error'); } finally { setExporting(false); }
  };

  return (
    <div>
      <SectionHeader title="Membres" actions={<Button variant="secondary" icon="download" busy={exporting} onClick={exportXlsx}>Exporter (.xlsx)</Button>}>
        {data ? `${data.length} comptes, dont ${data.filter((m) => !m.profile_public).length} au profil privé.` : 'Tous les comptes, y compris les profils privés.'}
      </SectionHeader>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative md:w-80">
          <span className="sr-only">Rechercher</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input id="members-search" className="input pl-10" placeholder="Nom, pseudo ou email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <select id="members-cert" className="input md:w-56" value={cert} onChange={(e) => setCert(e.target.value)} aria-label="Certification">
          <option value="">Toutes les certifications</option>
          {Object.entries(CERTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input id="members-wants" type="checkbox" className="h-4 w-4 accent-[var(--c-primary)]" checked={wantsPP} onChange={(e) => setWantsPP(e.target.checked)} />
          Souhaitent devenir porte-parole
        </label>
      </div>
      {error && <LoadError error={error} onRetry={reload} />}
      {loading && !data && <Skeleton className="h-96" />}
      {data && rows.length === 0 && <Empty icon="users" title="Aucun membre trouvé" />}
      {rows.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-semibold">Membre</th>
                <th className="px-4 py-3 font-semibold">Certification</th>
                <th className="px-4 py-3 font-semibold">{DOMAINS.DN}</th>
                <th className="px-4 py-3 font-semibold">{DOMAINS.EA}</th>
                <th className="px-4 py-3 font-semibold">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} onClick={() => setOpenId(m.id)} className="cursor-pointer border-b border-line last:border-0 hover:bg-sunken">
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-3 text-left" onClick={(e) => { e.stopPropagation(); setOpenId(m.id); }}>
                      <Mark size={34} levels={m.levels} certification={m.certification} />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5 font-semibold">
                          {m.last_name.toUpperCase()} {m.first_name}
                          {m.is_admin && <span className="pill pill-neutral !h-5">admin</span>}
                          {m.wants_pp && <span className="pill pill-orange !h-5">veut être PP</span>}
                          {!m.profile_public && <Icon name="eye-off" size={14} className="text-muted" title="Profil privé" />}
                        </span>
                        <span className="block text-xs text-muted">@{m.username} · {m.email}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3"><span className={`pill ${CERT_TONE[m.certification]}`}>{CERTS[m.certification]}</span></td>
                  <td className="px-4 py-3">{LEVELS[m.levels.DN]}</td>
                  <td className="px-4 py-3">{LEVELS[m.levels.EA]}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{fmtShort(m.member_since)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && <MemberModal member={open} onClose={() => setOpenId(null)} onChanged={reload} onDeleted={() => { setOpenId(null); setData((d) => d.filter((m) => m.id !== open.id)); }} />}
    </div>
  );
}

function MemberModal({ member, onClose, onChanged, onDeleted }) {
  const { user, refresh } = useSession();
  const toast = useToast();
  const [cert, setCert] = useState(member.certification);
  const [busy, setBusy] = useState('');
  const [ask, setAsk] = useState(null);

  const run = async (key, fn, message) => {
    setBusy(key);
    try {
      await fn();
      toast(message);
      setAsk(null);
      await onChanged();
      if (member.id === user.id) refresh();
      return true;
    } catch (e) {
      toast(e.message, 'error');
      return false;
    } finally {
      setBusy('');
    }
  };

  return (
    <Modal open onClose={onClose} title={`${member.first_name} ${member.last_name}`} size="lg">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-3 sm:w-40">
          <Mark size={112} levels={member.levels} certification={member.certification} />
          <span className={`pill ${CERT_TONE[member.certification]}`}>{CERTS[member.certification]}</span>
        </div>
        <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted">Pseudo</dt><dd>@{member.username}</dd>
          <dt className="text-muted">Email</dt><dd className="select-all break-all">{member.email}</dd>
          <dt className="text-muted">Inscrit le</dt><dd>{fmtShort(member.member_since)}</dd>
          <dt className="text-muted">Profil</dt><dd>{member.profile_public ? 'Public' : 'Privé'}</dd>
          {member.wants_pp && <><dt className="text-muted">Demande</dt><dd>Souhaite devenir porte-parole</dd></>}
          {member.intro && <><dt className="text-muted">Présentation</dt><dd className="whitespace-pre-line"><Linkify text={member.intro} /></dd></>}
        </dl>
      </div>

      <div className="mt-8 space-y-6 border-t border-line pt-6">
        <section>
          <h3 className="text-sm font-semibold">Certification</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <select id="member-cert" className="input w-auto" value={cert} onChange={(e) => setCert(e.target.value)} aria-label="Certification">
              {Object.entries(CERTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <Button disabled={cert === member.certification} busy={busy === 'cert'}
              onClick={() => run('cert', () => api(`/admin/members/${member.id}/certification`, { method: 'PUT', body: { certification: cert } }), 'Certification modifiée')}>
              Enregistrer
            </Button>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Niveaux</h3>
          <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
            {Object.entries(DOMAINS).map(([code, label]) => (
              <li key={code} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span><span className="text-muted">{label} :</span> <span className="font-semibold">{LEVELS[member.levels[code]]}</span></span>
                <Button size="sm" variant="ghost" icon="refresh" onClick={() => setAsk({ type: 'level', code, label })}>Réinitialiser</Button>
              </li>
            ))}
          </ul>
        </section>

        {user.is_admin && (
          <section className="space-y-4">
            <Switch id="member-admin" checked={member.is_admin} disabled={busy === 'admin'}
              onChange={(v) => run('admin', () => api(`/admin/members/${member.id}/admin`, { method: 'PUT', body: { is_admin: v } }), v ? 'Droits administrateur accordés' : 'Droits administrateur retirés')}
              label="Administrateur" description="Gère les questions, les paramètres, les articles et les liens." />
            {member.id !== user.id && (
              <Button variant="danger-soft" icon="trash" onClick={() => setAsk({ type: 'delete' })}>Supprimer le compte</Button>
            )}
          </section>
        )}
      </div>

      {ask?.type === 'level' && (
        <Confirm open onClose={() => setAsk(null)} busy={busy === 'level'} tone="danger" confirmLabel="Réinitialiser" title={`Réinitialiser ${ask.label}`}
          onConfirm={() => run('level', () => api(`/admin/members/${member.id}/levels/${ask.code}`, { method: 'DELETE' }), 'Niveau réinitialisé')}>
          <p>Le niveau de {member.first_name} en {ask.label} repasse à « Débutant » et ses essais dans ce domaine sont effacés. Sa certification ne change pas.</p>
        </Confirm>
      )}
      {ask?.type === 'delete' && (
        <Confirm open onClose={() => setAsk(null)} busy={busy === 'delete'} tone="danger" confirmLabel="Supprimer définitivement" title="Supprimer le compte" requireText="SUPPRIMER"
          onConfirm={async () => {
            setBusy('delete');
            try {
              await api(`/admin/members/${member.id}`, { method: 'DELETE' });
              toast('Compte supprimé');
              onDeleted();
            } catch (e) { toast(e.message, 'error'); } finally { setBusy(''); }
          }}>
          <p>Le compte de <span className="font-semibold">{member.first_name} {member.last_name}</span>, ses niveaux et ses essais seront supprimés. Ses articles éventuels sont conservés sans auteur. Cette action est irréversible.</p>
        </Confirm>
      )}
    </Modal>
  );
}
