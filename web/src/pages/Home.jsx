import { Link } from 'react-router';
import { api, assetUrl } from '../lib/api.js';
import { useLoad, useTitle } from '../lib/hooks.js';
import { useSession } from '../lib/session.jsx';
import { fmtDate } from '../lib/format.js';
import { Mark } from '../components/Mark.jsx';
import { Button } from '../components/ui.jsx';
import { Icon } from '../components/Icon.jsx';

const STEPS = [
  { title: 'Candidature', text: 'Présentez-vous et dites ce qui vous amène. Un membre certifié peut aussi vous coopter.', levels: { DN: 'beginner', EA: 'beginner' } },
  { title: 'Cooptation', text: 'Les porte-parole examinent votre candidature : elle est acceptée à l\'unanimité.', levels: { DN: 'beginner', EA: 'beginner' } },
  { title: 'Questionnaires', text: 'Droit Naturel et École Autrichienne : validez « Bases Acquises », puis « Sait Analyser ».', levels: { DN: 'BA', EA: 'BA' } },
  { title: 'Certification', text: 'Les deux domaines validés font de vous un membre certifié, qui peut devenir porte-parole.', levels: { DN: 'SA', EA: 'SA' } },
];

export default function Home() {
  useTitle('');
  const { user } = useSession();
  const posts = useLoad(() => api('/posts').then((d) => d.posts.filter((p) => p.published).slice(0, 3)), []);

  return (
    <>
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:py-24">
          <div>
            <p className="eyebrow !text-white/55">Mouvement des Libertariens · relancé en 2026</p>
            <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.02] sm:text-6xl lg:text-[4.25rem]">
              Le phare des libertariens <span className="bg-gradient-to-r from-flame-1 via-flame-2 to-flame-3 bg-clip-text text-transparent">francophones.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              Un cadre clair et de référence pour la doctrine de la Liberté, héritée de Murray Rothbard, Hans-Hermann Hoppe et de ses grands auteurs.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {user
                ? <Button variant="accent" size="lg" to="/espace" iconRight="arrow-right">Mon espace</Button>
                : <Button variant="accent" size="lg" to="/adherer" iconRight="arrow-right">Adhérer au mouvement</Button>}
              <a href="#manifeste" className="btn btn-on-dark btn-lg">Lire le manifeste</a>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Mark size={null} plate={false} ignite className="w-56 sm:w-72 lg:w-[23rem]" label="Insigne du Mouvement des Libertariens" />
          </div>
        </div>
        <div className="flame-rule" />
      </section>

      <section id="manifeste" className="page grid gap-10 py-16 sm:py-24 lg:grid-cols-[17rem_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Manifeste</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Pourquoi un mouvement</h2>
          <p className="mt-4 text-muted">Radicale, anarchiste et capitaliste à la fois : la doctrine libertarienne mérite un repère fédérateur en France.</p>
        </div>
        <div className="prose-mdl">
          <p>En 2012 renaissait une première fois le Mouvement des Libertariens en France, plus de dix ans après sa création par de célèbres pionniers tels que Bertrand Lemennicier. Hélas, il se perdit avec la création du Parti Libertarien.</p>
          <p>En 2026, nous relançons le Mouvement des Libertariens pour contribuer à donner un cadre clair et de référence à la doctrine de la Liberté héritée de ses grands auteurs : Murray Rothbard, <a href="https://bit.ly/hhh-democratie" target="_blank" rel="noopener noreferrer">Hans-Hermann Hoppe</a> et bien d'autres.</p>
          <h3>Motivations</h3>
          <p>La doctrine libertarienne est la seule pensée permettant à tout individu, homme, femme, occidental ou d'autre origine, d'envisager un avenir de Liberté, de Paix et de Prospérité pleines et entières, un réel avenir de Civilisation, sinon pour l'année qui vient, au moins pour ses enfants.</p>
          <p>Malgré des temps qui se troublent, parce que les sombres idées ayant signé le XXᵉ siècle ressurgissent, cette doctrine se développe un peu partout dans le monde. En 2023, l'élection jusqu'alors inimaginable d'un Président de la République se disant libertarien en Argentine a donné un puissant élan de visibilité à notre étiquette. Être « libertarien » est soudain devenu un objet de convoitise, d'étonnement, et de haine, aussi.</p>
          <p>En France, pourtant, si diverses initiatives, groupes et personnalités s'activent à promouvoir nos idées, la constellation libertarienne ne dispose pas de son panache blanc fédérateur : sa flamme n'a aucune Lady Liberty évidente d'où éclairer et guider les esprits neufs qui souhaiteraient nous rejoindre.</p>
          <p><strong>Le Mouvement des Libertariens aspire ainsi à devenir ce phare reconnu des libertariens francophones.</strong></p>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="page py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Le parcours</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">De la candidature à la certification</h2>
            <p className="mt-4 text-muted">Votre insigne évolue avec vos niveaux : la moitié haute de chaque anneau correspond au Droit Naturel, la moitié basse à l'École Autrichienne. Les porte-parole portent l'insigne entièrement embrasé.</p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col rounded-2xl border border-line bg-bg p-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-muted tabular-nums">Étape {i + 1}</span>
                  <Mark size={44} levels={s.levels} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {posts.data?.length > 0 && (
        <section className="page py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Blog</p>
              <h2 className="mt-3 text-3xl font-bold">Derniers articles</h2>
            </div>
            <Link to="/blog" className="link hidden text-sm font-semibold sm:inline">Tous les articles</Link>
          </div>
          <div className={`mt-8 grid gap-5 ${['', 'md:grid-cols-2 lg:w-2/3', 'md:grid-cols-2', 'md:grid-cols-3'][posts.data.length]}`}>
            {posts.data.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                {p.cover_url && <img src={assetUrl(p.cover_url)} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs text-muted">{fmtDate(p.created_at)}</p>
                  <h3 className="mt-2 text-lg font-semibold group-hover:text-link">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{p.excerpt}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-link">Lire <Icon name="arrow-right" size={16} /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!user && (
        <section className="page pb-4">
          <div className="flex flex-col items-start gap-6 rounded-2xl bg-brand px-6 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Prêt à rejoindre le mouvement ?</h2>
              <p className="mt-2 text-white/70">La candidature prend deux minutes. Les porte-parole vous répondent par email.</p>
            </div>
            <Button variant="accent" size="lg" to="/adherer" iconRight="arrow-right">Déposer ma candidature</Button>
          </div>
        </section>
      )}
    </>
  );
}
