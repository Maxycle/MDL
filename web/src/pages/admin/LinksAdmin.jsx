import { useState } from 'react';
import { api } from '../../lib/api.js';
import { useForm, useLoad, useTitle } from '../../lib/hooks.js';
import { hostOf } from '../../lib/format.js';
import { Button, Confirm, Empty, Field, LoadError, Modal, Notice, Skeleton, useToast } from '../../components/ui.jsx';
import { AdminOnly, SectionHeader } from './AdminLayout.jsx';

export default function LinksAdmin() {
  useTitle('Liens');
  return <AdminOnly><LinksPage /></AdminOnly>;
}

function LinksPage() {
  const toast = useToast();
  const { data, error, loading, reload } = useLoad(() => api('/resources').then((d) => d.resources), []);
  const [editing, setEditing] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <SectionHeader title="Liens" actions={<Button icon="plus" onClick={() => setEditing({ title: '', url: 'https://', description: '' })}>Ajouter un lien</Button>}>
        Les liens apparaissent sur la page « Liens », du plus récent au plus ancien.
      </SectionHeader>
      {error && <LoadError error={error} onRetry={reload} />}
      {loading && !data && <Skeleton className="h-64" />}
      {data?.length === 0 && <Empty icon="link" title="Aucun lien" />}
      {data?.length > 0 && (
        <ul className="card divide-y divide-line">
          {data.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-3 px-4 py-3.5 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{r.title} <span className="font-normal text-muted">· {hostOf(r.url)}</span></p>
                {r.description && <p className="mt-0.5 line-clamp-2 text-sm text-muted">{r.description}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" icon="edit" aria-label="Modifier" onClick={() => setEditing(r)} />
                <Button variant="ghost" size="sm" icon="trash" aria-label="Supprimer" onClick={() => setDel(r)} />
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && <LinkForm link={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      <Confirm open={!!del} onClose={() => setDel(null)} busy={busy} tone="danger" confirmLabel="Supprimer" title="Supprimer le lien"
        onConfirm={async () => {
          setBusy(true);
          try { await api(`/admin/resources/${del.id}`, { method: 'DELETE' }); toast('Lien supprimé'); setDel(null); reload(); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
        }}>
        <p>« {del?.title} » sera retiré de la page Liens.</p>
      </Confirm>
    </div>
  );
}

function LinkForm({ link, onClose, onSaved }) {
  const toast = useToast();
  const form = useForm({ title: link.title, url: link.url, description: link.description || '' });
  const save = form.submit(async (v) => {
    await api(link.id ? `/admin/resources/${link.id}` : '/admin/resources', { method: link.id ? 'PUT' : 'POST', body: v });
    toast(link.id ? 'Lien enregistré' : 'Lien ajouté');
    onSaved();
  });
  return (
    <Modal open onClose={onClose} title={link.id ? 'Modifier le lien' : 'Ajouter un lien'} footer={
      <><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={save} busy={form.busy}>Enregistrer</Button></>
    }>
      <form onSubmit={save} className="space-y-5" noValidate>
        {form.message && Object.keys(form.errors).length === 0 && <Notice tone="error">{form.message}</Notice>}
        <Field label="Titre" error={form.errors.title} htmlFor="title"><input className="input" {...form.field('title')} /></Field>
        <Field label="Adresse" error={form.errors.url} htmlFor="url"><input className="input" type="url" inputMode="url" {...form.field('url')} /></Field>
        <Field label="Description" error={form.errors.description} htmlFor="description"><textarea className="input" {...form.field('description')} /></Field>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}
