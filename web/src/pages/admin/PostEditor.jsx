import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api, assetUrl } from '../../lib/api.js';
import { useTitle } from '../../lib/hooks.js';
import { Button, Field, Notice, Spinner, Switch, Tabs, useToast } from '../../components/ui.jsx';
import { Markdown } from '../../components/Markdown.jsx';
import { Icon } from '../../components/Icon.jsx';
import { AdminOnly } from './AdminLayout.jsx';

export default function PostEditor() {
  return <AdminOnly><Editor /></AdminOnly>;
}

async function uploadImage(file) {
  const form = new FormData();
  form.append('file', file);
  return (await api('/admin/uploads', { method: 'POST', form })).url;
}

const TOOLS = [
  { icon: 'heading', label: 'Intertitre', wrap: ['\n## ', ''], line: true },
  { icon: 'bold', label: 'Gras', wrap: ['**', '**'] },
  { icon: 'italic', label: 'Italique', wrap: ['*', '*'] },
  { icon: 'link', label: 'Lien', wrap: ['[', '](https://)'] },
  { icon: 'quote', label: 'Citation', wrap: ['\n> ', ''], line: true },
  { icon: 'list', label: 'Liste', wrap: ['\n- ', ''], line: true },
];

function Editor() {
  const { id } = useParams();
  const isNew = !id;
  useTitle(isNew ? 'Nouvel article' : 'Modifier l\'article');
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState(isNew ? { title: '', body: '', cover_url: '', published: true } : null);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState('write');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState('');
  const area = useRef(null);
  const imageInput = useRef(null);
  const coverInput = useRef(null);

  useEffect(() => {
    if (isNew) return;
    api(`/posts/${id}`).then((d) => setPost({ ...d.post, cover_url: d.post.cover_url || '' })).catch((e) => setLoadError(e.message));
  }, [id, isNew]);

  const insert = (before, after = '', placeholder = '') => {
    const el = area.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = post.body.slice(start, end) || placeholder;
    const body = post.body.slice(0, start) + before + selected + after + post.body.slice(end);
    setPost((p) => ({ ...p, body }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const addImage = async (file, target) => {
    if (!file) return;
    setUploading(target);
    try {
      const url = await uploadImage(file);
      if (target === 'cover') setPost((p) => ({ ...p, cover_url: url }));
      else insert(`\n![${file.name.replace(/\.[^.]+$/, '')}](${url})\n`);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading('');
    }
  };

  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      const body = { title: post.title, body: post.body, cover_url: post.cover_url || null, published: post.published };
      const res = await api(isNew ? '/admin/posts' : `/admin/posts/${id}`, { method: isNew ? 'POST' : 'PUT', body });
      setErrors({});
      toast(post.published ? 'Article publié' : 'Brouillon enregistré');
      if (isNew) navigate(`/gestion/articles/${res.post.id}`, { replace: true });
    } catch (e) {
      setErrors(e.fields || {});
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loadError) return <Notice tone="error">{loadError}</Notice>;
  if (!post) return <div className="flex justify-center py-16 text-muted"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button to="/gestion/articles" variant="ghost" icon="arrow-left">Articles</Button>
        <div className="flex flex-wrap items-center gap-4">
          <Switch id="published" checked={post.published} onChange={(v) => setPost((p) => ({ ...p, published: v }))} label="Publié" />
          {!isNew && post.published && <Button to={`/blog/${post.slug}`} variant="secondary" icon="eye">Voir</Button>}
          <Button onClick={save} busy={busy}>{isNew ? 'Créer' : 'Enregistrer'}</Button>
        </div>
      </div>
      {message && <Notice tone="error" className="mb-5">{message}</Notice>}
      <div className="space-y-5">
        <Field error={errors.title} htmlFor="post-title">
          <input id="post-title" className="input !h-14 font-display !text-2xl font-bold" placeholder="Titre de l'article" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} aria-label="Titre" />
        </Field>

        <div className="card flex flex-wrap items-center gap-4 p-4">
          {post.cover_url
            ? <img src={assetUrl(post.cover_url)} alt="Image de couverture" className="h-20 w-32 rounded-lg object-cover" />
            : <span className="flex h-20 w-32 items-center justify-center rounded-lg bg-sunken text-muted"><Icon name="image" size={24} /></span>}
          <div className="flex-1">
            <p className="text-sm font-semibold">Image de couverture</p>
            <p className="text-sm text-muted">Facultative. Affichée en tête de l'article et dans la liste du blog.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon="upload" busy={uploading === 'cover'} onClick={() => coverInput.current.click()}>{post.cover_url ? 'Changer' : 'Choisir'}</Button>
            {post.cover_url && <Button variant="ghost" size="sm" icon="x" onClick={() => setPost({ ...post, cover_url: '' })} aria-label="Retirer l'image" />}
          </div>
          <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={(e) => { addImage(e.target.files?.[0], 'cover'); e.target.value = ''; }} />
        </div>

        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <Tabs value={tab} onChange={setTab} tabs={[{ value: 'write', label: 'Écrire' }, { value: 'preview', label: 'Aperçu' }]} />
            {tab === 'write' && (
              <div className="flex flex-wrap gap-0.5">
                {TOOLS.map((t) => (
                  <button key={t.icon} type="button" title={t.label} aria-label={t.label} onClick={() => insert(t.wrap[0], t.wrap[1], t.line ? '' : 'texte')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-sunken hover:text-ink"><Icon name={t.icon} /></button>
                ))}
                <button type="button" title="Insérer une image" aria-label="Insérer une image" onClick={() => imageInput.current.click()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-sunken hover:text-ink">{uploading === 'body' ? <Spinner size={16} /> : <Icon name="image" />}</button>
                <input ref={imageInput} type="file" accept="image/*" className="hidden" onChange={(e) => { addImage(e.target.files?.[0], 'body'); e.target.value = ''; }} />
              </div>
            )}
          </div>
          {tab === 'write' ? (
            <textarea ref={area} id="post-body" aria-label="Contenu de l'article" value={post.body} onChange={(e) => setPost({ ...post, body: e.target.value })}
              onDrop={(e) => { const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith('image/')) { e.preventDefault(); addImage(f, 'body'); } }}
              onPaste={(e) => { const f = e.clipboardData.files?.[0]; if (f?.type.startsWith('image/')) { e.preventDefault(); addImage(f, 'body'); } }}
              className="block min-h-[28rem] w-full resize-y bg-surface px-5 py-4 font-mono text-[0.9375rem] leading-relaxed text-ink outline-none"
              placeholder={'Écrivez en Markdown.\n\n## Un intertitre\n\nUn paragraphe avec du **gras** et un [lien](https://exemple.org).\n\n> Une citation\n\nGlissez ou collez une image pour l\'insérer.'} />
          ) : (
            <div className="min-h-[28rem] px-5 py-6">{post.body.trim() ? <Markdown source={post.body} /> : <p className="text-muted">Rien à afficher pour l'instant.</p>}</div>
          )}
        </div>
        {errors.body && <p className="field-error">{errors.body}</p>}
      </div>
    </div>
  );
}
