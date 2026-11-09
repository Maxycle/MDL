import { Link, useParams } from 'react-router';
import { api, assetUrl } from '../lib/api.js';
import { useLoad, useTitle } from '../lib/hooks.js';
import { useSession } from '../lib/session.jsx';
import { fmtDate } from '../lib/format.js';
import { Button, Empty, LoadError, PageHeader, Skeleton } from '../components/ui.jsx';
import { Markdown } from '../components/Markdown.jsx';
import { Icon } from '../components/Icon.jsx';
import NotFound from './NotFound.jsx';

export function BlogList() {
  useTitle('Blog');
  const { user } = useSession();
  const { data, error, loading, reload } = useLoad(() => api('/posts').then((d) => d.posts), []);
  const [first, ...rest] = data || [];

  return (
    <div className="page">
      <PageHeader eyebrow="Articles" title="Blog" actions={user?.is_admin && <Button to="/gestion/articles/nouveau" icon="plus">Nouvel article</Button>}>
        Analyses, lectures et nouvelles du mouvement.
      </PageHeader>
      {error && <LoadError error={error} onRetry={reload} />}
      {loading && <div className="grid gap-5 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>}
      {data && data.length === 0 && <Empty icon="book" title="Aucun article pour l'instant">Les premiers articles arrivent bientôt.</Empty>}
      {first && (
        <div className="space-y-5">
          <Link to={`/blog/${first.slug}`} className="card group grid overflow-hidden transition-shadow hover:shadow-lg md:grid-cols-2">
            {first.cover_url
              ? <img src={assetUrl(first.cover_url)} alt="" className="aspect-[16/10] h-full w-full object-cover" />
              : <div className="hidden bg-brand md:flex md:items-center md:justify-center"><div className="flame-rule w-2/3" /></div>}
            <div className="flex flex-col p-6 sm:p-8">
              <PostMeta post={first} />
              <h2 className="mt-3 text-2xl font-bold group-hover:text-link sm:text-3xl">{first.title}</h2>
              <p className="mt-3 text-muted">{first.excerpt}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-6 font-semibold text-link">Lire l'article <Icon name="arrow-right" size={16} /></span>
            </div>
          </Link>
          {rest.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                  {p.cover_url && <img src={assetUrl(p.cover_url)} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />}
                  <div className="flex flex-1 flex-col p-5">
                    <PostMeta post={p} />
                    <h3 className="mt-2 text-lg font-semibold group-hover:text-link">{p.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostMeta({ post }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
      {!post.published && <span className="pill pill-yellow">Brouillon</span>}
      <span>{fmtDate(post.created_at)}</span>
      {post.author && <><span aria-hidden="true">·</span><span>{post.author}</span></>}
    </p>
  );
}

export function PostPage() {
  const { slug } = useParams();
  const { user } = useSession();
  const { data: post, error, loading, reload } = useLoad(() => api(`/posts/${encodeURIComponent(slug)}`).then((d) => d.post), [slug]);
  useTitle(post?.title || 'Blog');

  if (error?.status === 404) return <NotFound title="Article introuvable">Cet article n'existe pas ou n'est plus publié.</NotFound>;
  return (
    <article className="page max-w-3xl pb-8 pt-8 sm:pt-12">
      <div className="flex items-center justify-between gap-3">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><Icon name="arrow-left" size={16} />Blog</Link>
        {user?.is_admin && post && <Button to={`/gestion/articles/${post.id}`} variant="secondary" size="sm" icon="edit">Modifier</Button>}
      </div>
      {error && <div className="mt-8"><LoadError error={error} onRetry={reload} /></div>}
      {loading && <div className="mt-10 space-y-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-64" /></div>}
      {post && (
        <>
          <header className="mt-8">
            <PostMeta post={post} />
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
          </header>
          {post.cover_url && <img src={assetUrl(post.cover_url)} alt="" className="mt-8 w-full rounded-2xl" />}
          <Markdown source={post.body} className="mt-10" />
        </>
      )}
    </article>
  );
}
