import { useMemo, useState } from 'react';
import { api, download } from '../../lib/api.js';
import { useLoad, useTitle } from '../../lib/hooks.js';
import { DIFFICULTIES, DOMAINS, LEVELS, plural, searchKey } from '../../lib/format.js';
import { Button, Confirm, Empty, Field, LoadError, Modal, Notice, Skeleton, Spinner, Switch, useToast } from '../../components/ui.jsx';
import { Icon } from '../../components/Icon.jsx';
import { AdminOnly, SectionHeader } from './AdminLayout.jsx';
import { ImagePreview } from './ImagePreview.jsx';
import { QuestionTester } from './QuestionTester.jsx';

const DIFF_TONE = { LOW: 'pill-green', MID: 'pill-yellow', HIGH: 'pill-red' };
const TRACKS = [['DN', 'BA'], ['DN', 'SA'], ['EA', 'BA'], ['EA', 'SA']];

export default function Questions() {
  useTitle('Questions');
  return <AdminOnly><QuestionsPage /></AdminOnly>;
}

function QuestionsPage() {
  const toast = useToast();
  const { data, error, loading, reload } = useLoad(() => api('/admin/questions').then((d) => d.questions), []);
  const [filters, setFilters] = useState({ domain: '', level: '', difficulty: '', status: 'active', q: '' });
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [wipe, setWipe] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [exporting, setExporting] = useState(false);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const pool = useMemo(() => {
    const p = {};
    (data || []).filter((q) => q.active).forEach((q) => {
      const k = `${q.domain}${q.level}`;
      p[k] ??= { LOW: 0, MID: 0, HIGH: 0 };
      p[k][q.difficulty]++;
    });
    return p;
  }, [data]);
  const shown = useMemo(() => {
    const q = searchKey(filters.q);
    return (data || []).filter((x) =>
      (!filters.domain || x.domain === filters.domain) && (!filters.level || x.level === filters.level) &&
      (!filters.difficulty || x.difficulty === filters.difficulty) &&
      (filters.status === 'all' || (filters.status === 'active') === x.active) &&
      (!q || searchKey(`${x.content} ${x.answers.map((a) => a.content).join(' ')}`).includes(q)));
  }, [data, filters]);

  const exportXlsx = async () => {
    setExporting(true);
    try { await download('/admin/questions/export', 'questions.xlsx'); } catch (e) { toast(e.message, 'error'); } finally { setExporting(false); }
  };

  return (
    <div>
      <SectionHeader title="Questions" actions={
        <>
          <Button icon="plus" onClick={() => setEditing({ content: '', image_url: '', domain: 'DN', level: 'BA', difficulty: 'LOW', active: true, answers: [{ content: '', points: 100 }, { content: '', points: 0 }] })}>Nouvelle question</Button>
          <Button variant="secondary" icon="upload" onClick={() => setImporting(true)}>Importer</Button>
          <Button variant="secondary" icon="download" busy={exporting} onClick={exportXlsx}>Exporter</Button>
        </>
      }>
        Les questionnaires piochent au hasard dans les questions actives, en respectant la proportion de chaque difficulté.
      </SectionHeader>

      {error && <LoadError error={error} onRetry={reload} />}
      {loading && !data && <Skeleton className="h-96" />}
      {data && (
        <>
          <div className="card mb-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-2.5 font-semibold">Questions actives</th>
                  {Object.values(DIFFICULTIES).map((d) => <th key={d} className="px-4 py-2.5 text-right font-semibold">{d}</th>)}
                  <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {TRACKS.map(([d, l]) => {
                  const c = pool[`${d}${l}`] || { LOW: 0, MID: 0, HIGH: 0 };
                  const total = c.LOW + c.MID + c.HIGH;
                  return (
                    <tr key={d + l} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5">{DOMAINS[d]} · {LEVELS[l]}</td>
                      {['LOW', 'MID', 'HIGH'].map((k) => <td key={k} className={`px-4 py-2.5 text-right tabular-nums ${c[k] ? '' : 'text-muted'}`}>{c[k]}</td>)}
                      <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${total ? '' : 'text-danger'}`}>{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="relative sm:col-span-2 lg:col-span-4">
              <span className="sr-only">Rechercher</span>
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input id="q-search" className="input pl-10" placeholder="Rechercher dans les questions" value={filters.q} onChange={set('q')} />
            </label>
            <select id="q-domain" className="input" value={filters.domain} onChange={set('domain')} aria-label="Domaine">
              <option value="">Tous domaines</option>{Object.entries(DOMAINS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select id="q-level" className="input" value={filters.level} onChange={set('level')} aria-label="Niveau">
              <option value="">Tous niveaux</option><option value="BA">{LEVELS.BA}</option><option value="SA">{LEVELS.SA}</option>
            </select>
            <select id="q-diff" className="input" value={filters.difficulty} onChange={set('difficulty')} aria-label="Difficulté">
              <option value="">Toutes difficultés</option>{Object.entries(DIFFICULTIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select id="q-status" className="input" value={filters.status} onChange={set('status')} aria-label="Statut">
              <option value="active">Actives</option><option value="inactive">Inactives</option><option value="all">Toutes</option>
            </select>
          </div>

          <p className="mb-3 text-sm text-muted">{plural(shown.length, 'question', 'questions')} sur {data.length}</p>
          {shown.length === 0 && <Empty icon="list" title="Aucune question" action={data.length === 0 && <Button variant="secondary" icon="upload" onClick={() => setImporting(true)}>Importer un fichier</Button>}>
            {data.length === 0 ? 'Importez votre fichier Excel de questions ou créez-les une à une.' : 'Aucune question ne correspond à ces filtres.'}
          </Empty>}
          <ul className="space-y-2">
            {shown.map((q) => (
              <li key={q.id}>
                <button onClick={() => setEditing(q)} className={`card flex w-full flex-col gap-2 p-4 text-left transition-colors hover:border-line-strong ${q.active ? '' : 'opacity-60'}`}>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="pill pill-blue">{q.domain} · {q.level}</span>
                    <span className={`pill ${DIFF_TONE[q.difficulty]}`}>{DIFFICULTIES[q.difficulty]}</span>
                    {q.image_url && <span className="pill pill-neutral"><Icon name="image" size={13} />Image</span>}
                    {!q.active && <span className="pill pill-neutral">Inactive</span>}
                    <span className="ml-auto text-xs text-muted">{plural(q.answers.length, 'réponse', 'réponses')} · max {Math.max(...q.answers.map((a) => a.points))} pts</span>
                  </span>
                  <span className="line-clamp-2 font-medium">{q.content}</span>
                </button>
              </li>
            ))}
          </ul>
          {data.length > 0 && (
            <div className="mt-10 border-t border-line pt-6">
              <Button variant="danger-soft" icon="trash" onClick={() => setWipe(true)}>Supprimer toutes les questions</Button>
            </div>
          )}
        </>
      )}

      {editing && <QuestionEditor question={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      {importing && <ImportModal existing={data?.length || 0} onClose={() => setImporting(false)} onDone={reload} />}
      <Confirm open={wipe} onClose={() => setWipe(false)} busy={wiping} tone="danger" requireText="SUPPRIMER" confirmLabel="Tout supprimer" title="Supprimer toutes les questions"
        onConfirm={async () => {
          setWiping(true);
          try {
            const r = await api('/admin/questions', { method: 'DELETE', body: { confirm: 'SUPPRIMER' } });
            toast(`${plural(r.deleted, 'question supprimée', 'questions supprimées')}`);
            setWipe(false);
            reload();
          } catch (e) { toast(e.message, 'error'); } finally { setWiping(false); }
        }}>
        <p>Les {data?.length} questions et leurs réponses seront supprimées. Pensez à exporter le fichier avant.</p>
      </Confirm>
    </div>
  );
}

function QuestionEditor({ question, onClose, onSaved }) {
  const toast = useToast();
  const [q, setQ] = useState(() => ({ ...question, answers: question.answers.map((a) => ({ ...a })) }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const [testing, setTesting] = useState(false);
  // The preview follows the address once the field loses focus, not on every keystroke.
  const [previewUrl, setPreviewUrl] = useState(question.image_url || '');
  const isNew = !question.id;
  const setAnswer = (i, k, v) => setQ((s) => ({ ...s, answers: s.answers.map((a, j) => (j === i ? { ...a, [k]: v } : a)) }));

  const save = async () => {
    setBusy(true);
    try {
      const body = { ...q, answers: q.answers.map((a) => ({ ...a, points: a.points === '' ? '' : Number(a.points) })) };
      await api(isNew ? '/admin/questions' : `/admin/questions/${q.id}`, { method: isNew ? 'POST' : 'PUT', body });
      toast(isNew ? 'Question créée' : 'Question enregistrée');
      onSaved();
    } catch (e) {
      setErrors({ ...e.fields, _: Object.keys(e.fields || {}).length ? '' : e.message });
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    try { await api(`/admin/questions/${q.id}`, { method: 'DELETE' }); toast('Question supprimée'); onSaved(); } catch (e) { toast(e.message, 'error'); setBusy(false); }
  };

  return (
    <Modal open onClose={onClose} size="lg" title={isNew ? 'Nouvelle question' : 'Modifier la question'} footer={
      <>
        {!isNew && <Button variant="danger-soft" icon="trash" className="mr-auto" onClick={() => setAskDelete(true)}>Supprimer</Button>}
        <Button variant="secondary" icon="eye" onClick={() => setTesting(true)}>Tester</Button>
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button onClick={save} busy={busy}>Enregistrer</Button>
      </>
    }>
      <div className="space-y-5">
        {errors._ && <Notice tone="error">{errors._}</Notice>}
        <Field label="Question" error={errors.content} htmlFor="q-content">
          <textarea id="q-content" className="input" value={q.content} onChange={(e) => setQ({ ...q, content: e.target.value })} />
        </Field>
        <Field label="Image (facultative)" error={errors.image_url} htmlFor="q-image"
          hint="Adresse https:// d'une image. Le membre la voit avec une zone floutée jusqu'à ce qu'il valide sa réponse ; cette zone se règle dans Paramètres.">
          <input id="q-image" type="url" inputMode="url" className="input" placeholder="https://…" value={q.image_url || ''}
            onChange={(e) => setQ({ ...q, image_url: e.target.value })} onBlur={() => setPreviewUrl((q.image_url || '').trim())} />
        </Field>
        {/^https?:\/\/\S+$/i.test(previewUrl) && <ImagePreview url={previewUrl} />}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Domaine" htmlFor="q-edit-domain">
            <select id="q-edit-domain" className="input" value={q.domain} onChange={(e) => setQ({ ...q, domain: e.target.value })}>
              {Object.entries(DOMAINS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Niveau" htmlFor="q-edit-level">
            <select id="q-edit-level" className="input" value={q.level} onChange={(e) => setQ({ ...q, level: e.target.value })}>
              <option value="BA">{LEVELS.BA}</option><option value="SA">{LEVELS.SA}</option>
            </select>
          </Field>
          <Field label="Difficulté" htmlFor="q-edit-diff">
            <select id="q-edit-diff" className="input" value={q.difficulty} onChange={(e) => setQ({ ...q, difficulty: e.target.value })}>
              {Object.entries(DIFFICULTIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </div>
        <div>
          <p className="label">Réponses et points</p>
          {errors.answers && <p className="field-error mb-2 !mt-0">{errors.answers}</p>}
          <ul className="space-y-2">
            {q.answers.map((a, i) => (
              <li key={a.id ?? `new-${i}`} className="flex items-start gap-2">
                <span className="mt-2.5 w-5 shrink-0 text-center text-sm font-semibold text-muted">{String.fromCharCode(65 + i)}</span>
                <textarea aria-label={`Réponse ${String.fromCharCode(65 + i)}`} className="input !min-h-11 flex-1" rows={1} value={a.content} onChange={(e) => setAnswer(i, 'content', e.target.value)} />
                <input aria-label={`Points de la réponse ${String.fromCharCode(65 + i)}`} type="number" className="input !w-24 tabular-nums" value={a.points} onChange={(e) => setAnswer(i, 'points', e.target.value)} />
                <Button variant="ghost" icon="x" aria-label="Retirer cette réponse" disabled={q.answers.length <= 2} onClick={() => setQ((s) => ({ ...s, answers: s.answers.filter((_, j) => j !== i) }))} />
              </li>
            ))}
          </ul>
          {q.answers.length < 8 && <Button variant="ghost" size="sm" icon="plus" className="mt-2" onClick={() => setQ((s) => ({ ...s, answers: [...s.answers, { content: '', points: 0 }] }))}>Ajouter une réponse</Button>}
          <p className="hint">L'ordre des réponses est mélangé pour chaque membre.</p>
        </div>
        <Switch id="q-active" checked={q.active} onChange={(v) => setQ({ ...q, active: v })} label="Active" description="Seules les questions actives sont proposées dans les questionnaires." />
      </div>
      <Confirm open={askDelete} onClose={() => setAskDelete(false)} onConfirm={remove} busy={busy} tone="danger" confirmLabel="Supprimer" title="Supprimer la question">
        <p>Cette question et ses réponses seront supprimées.</p>
      </Confirm>
      {testing && <QuestionTester question={q} onClose={() => setTesting(false)} />}
    </Modal>
  );
}

const statusLabel = (s) => s || '(sans statut)';

function ImportModal({ existing, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [activeStatuses, setActiveStatuses] = useState([]);
  const [mode, setMode] = useState('append');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // The file is analysed as soon as it is chosen; nothing is saved until "Importer".
  const choose = async (chosen) => {
    setFile(chosen);
    setPreview(null);
    setError('');
    if (!chosen) return;
    setAnalysing(true);
    const form = new FormData();
    form.append('file', chosen);
    form.append('mode', 'preview');
    try {
      const p = await api('/admin/questions/import', { method: 'POST', form });
      setPreview(p);
      setActiveStatuses(p.statuses.filter((s) => s.default).map((s) => s.status));
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalysing(false);
    }
  };
  const toggleStatus = (status, on) => setActiveStatuses((list) => (on ? [...list, status] : list.filter((s) => s !== status)));

  const send = async () => {
    setBusy(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    form.append('mode', mode);
    form.append('active_statuses', JSON.stringify(activeStatuses));
    try {
      setResult(await api('/admin/questions/import', { method: 'POST', form }));
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} size="lg" title="Importer des questions" footer={result
      ? <Button onClick={onClose}>Fermer</Button>
      : <><Button variant="secondary" onClick={onClose}>Annuler</Button><Button icon="upload" onClick={send} busy={busy} disabled={!preview || preview.total === 0}>Importer</Button></>}>
      {result ? (
        <div className="space-y-4">
          <Notice tone="success" title={`${plural(result.imported, 'question importée', 'questions importées')}`}>
            {plural(result.active, 'active', 'actives')}, {plural(result.inactive, 'inactive', 'inactives')}.
            {result.replaced && ' Les anciennes questions ont été remplacées.'}
            {result.duplicates > 0 && ` ${plural(result.duplicates, 'doublon ignoré', 'doublons ignorés')}.`}
          </Notice>
          {result.error_count > 0 && (
            <div>
              <p className="text-sm font-semibold">{plural(result.error_count, 'ligne refusée', 'lignes refusées')}</p>
              <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl bg-sunken p-3 text-sm">
                {result.errors.map((e, i) => <li key={i}><span className="font-semibold tabular-nums">Ligne {e.row}</span> : {e.message}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5 text-sm">
          {error && <Notice tone="error">{error}</Notice>}
          <Field label="Fichier Excel (.xlsx)" htmlFor="import-file">
            <input id="import-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sunken file:px-3 file:py-2 file:font-semibold file:text-ink"
              onChange={(e) => choose(e.target.files?.[0] || null)} />
          </Field>
          {analysing && <p className="flex items-center gap-2 text-muted"><Spinner size={16} />Analyse du fichier…</p>}

          {preview && (
            <>
              <div>
                <p className="font-semibold">
                  {plural(preview.total, 'question reconnue', 'questions reconnues')}
                  {preview.with_image > 0 && <span className="font-normal text-muted">, dont {preview.with_image} avec une image</span>}
                </p>
                <div className="mt-2 overflow-x-auto rounded-xl border border-line">
                  <table className="w-full min-w-[32rem]">
                    <thead>
                      <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                        <th className="px-3 py-2 font-semibold">Questionnaire</th>
                        {preview.has_status && <th className="px-3 py-2 font-semibold">Statut</th>}
                        {Object.values(DIFFICULTIES).map((d) => <th key={d} className="px-3 py-2 text-right font-semibold">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.breakdown.map((b) => (
                        <tr key={`${b.domain}${b.level}${b.status}`} className="border-b border-line last:border-0">
                          <td className="px-3 py-2">{DOMAINS[b.domain]} · {LEVELS[b.level]}</td>
                          {preview.has_status && <td className="px-3 py-2"><code>{statusLabel(b.status)}</code></td>}
                          {['LOW', 'MID', 'HIGH'].map((k) => <td key={k} className="px-3 py-2 text-right tabular-nums">{b[k]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {preview.statuses.length > 0 && (
                <fieldset className="space-y-2">
                  <legend className="label">Statuts à rendre actifs</legend>
                  {preview.statuses.map((s) => (
                    <label key={s.status} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 accent-[var(--c-primary)]" checked={activeStatuses.includes(s.status)} onChange={(e) => toggleStatus(s.status, e.target.checked)} />
                      <code>{statusLabel(s.status)}</code><span className="text-muted">{plural(s.count, 'question', 'questions')}</span>
                    </label>
                  ))}
                  <p className="hint">Les autres questions sont importées comme inactives : vous les verrez ici, mais elles ne seront jamais proposées aux membres.</p>
                </fieldset>
              )}

              {preview.error_count > 0 && (
                <Notice tone="warning" title={`${plural(preview.error_count, 'ligne sera refusée', 'lignes seront refusées')}`}>
                  <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto">
                    {preview.errors.map((e, i) => <li key={i}><span className="font-semibold tabular-nums">Ligne {e.row}</span> : {e.message}</li>)}
                  </ul>
                </Notice>
              )}

              <fieldset className="space-y-2">
                <legend className="label">Mode</legend>
                <label className="flex items-start gap-2">
                  <input type="radio" name="mode" className="mt-1 accent-[var(--c-primary)]" checked={mode === 'append'} onChange={() => setMode('append')} />
                  <span><span className="font-semibold">Ajouter</span> les nouvelles questions{preview.duplicates > 0 && <span className="text-muted"> ({plural(preview.duplicates, 'question existe déjà et sera ignorée', 'questions existent déjà et seront ignorées')})</span>}</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="radio" name="mode" className="mt-1 accent-[var(--c-primary)]" checked={mode === 'replace'} onChange={() => setMode('replace')} />
                  <span><span className="font-semibold">Remplacer</span> toutes les questions par celles du fichier{existing > 0 && <span className="text-danger"> ({plural(existing, 'question actuelle sera supprimée', 'questions actuelles seront supprimées')})</span>}</span>
                </label>
              </fieldset>
            </>
          )}

          <div className="rounded-xl bg-sunken p-4 text-muted">
            <p className="font-semibold text-ink">Colonnes reconnues (première feuille, dans n'importe quel ordre)</p>
            <p className="mt-1"><code>question_content</code>, <code>question_domain</code> (DN ou EA), <code>question_level</code> (BA ou SA), <code>LMH</code> (LOW, MID ou HIGH), <code>status</code>, <code>Image</code> (adresse https://, facultative), puis <code>answer1_content</code>, <code>answer1_value</code>, <code>answer2_content</code>… Les autres colonnes sont ignorées.</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
