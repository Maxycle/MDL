import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useSession, rolesOf } from '../lib/session.jsx';
import { CERTS, CERT_TONE, initials } from '../lib/format.js';
import { Icon } from './Icon.jsx';
import { Mark } from './Mark.jsx';
import { Button, Spinner } from './ui.jsx';

const PUBLIC_LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/blog', label: 'Blog' },
  { to: '/liens', label: 'Liens' },
  { to: '/membres', label: 'Membres' },
];

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:shadow">Aller au contenu</a>
      <Header />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageSpinner />}><Outlet /></Suspense>
      </main>
      <Footer />
    </div>
  );
}

export function PageSpinner() {
  return <div className="flex justify-center py-24 text-muted"><Spinner size={28} /></div>;
}

function navClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-[0.9375rem] font-medium transition-colors ${isActive ? 'bg-sunken text-ink' : 'text-muted hover:text-ink'}`;
}

function Header() {
  const { user } = useSession();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  const links = user ? [...PUBLIC_LINKS, { to: '/questionnaire', label: 'Questionnaire' }] : PUBLIC_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/80" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="page flex h-16 items-center gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Mouvement des Libertariens, accueil">
          <Mark size={36} levels={{ DN: 'SA', EA: 'SA' }} label="Mouvement des Libertariens" />
          <span className="hidden font-display text-[15px] font-bold leading-tight min-[400px]:block">Mouvement<br className="sm:hidden" /> des Libertariens</span>
        </Link>
        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>{l.label}</NavLink>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <AccountMenu />
          ) : (
            <>
              <Link to="/connexion" className="btn btn-ghost hidden sm:inline-flex">Connexion</Link>
              <Button to="/adherer" variant="primary">Adhérer</Button>
            </>
          )}
          <button className="btn btn-ghost btn-icon lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label="Menu">
            <Icon name={open ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="rise border-t border-line bg-surface lg:hidden" aria-label="Navigation mobile">
          <div className="page flex flex-col gap-1 py-3">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>{l.label}</NavLink>)}
            {!user && <NavLink to="/connexion" className={navClass}>Connexion</NavLink>}
          </div>
        </nav>
      )}
    </header>
  );
}

function AccountMenu() {
  const { user, logout } = useSession();
  const roles = rolesOf(user);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const item = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-sunken';
  return (
    <div className="relative" ref={ref}>
      <button className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-2.5 hover:bg-sunken" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{initials(user)}</span>
        <span className="hidden max-w-[9rem] truncate text-sm font-semibold sm:block">{user.first_name}</span>
        <Icon name="chevron-down" size={16} className="text-muted" />
      </button>
      {open && (
        <div role="menu" className="rise absolute right-0 top-12 w-64 rounded-xl border border-line bg-surface p-1.5 shadow-xl">
          <div className="px-3 pb-2.5 pt-2">
            <p className="truncate font-semibold">{user.first_name} {user.last_name}</p>
            <p className="truncate text-sm text-muted">@{user.username}</p>
            <span className={`pill mt-2 ${CERT_TONE[user.certification]}`}>{CERTS[user.certification]}</span>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link role="menuitem" to="/espace" className={item}><Icon name="target" />Mon espace</Link>
          <Link role="menuitem" to="/questionnaire" className={item}><Icon name="book" />Questionnaires</Link>
          <Link role="menuitem" to="/profil" className={item}><Icon name="user" />Mon profil</Link>
          {roles.canCoopt && <Link role="menuitem" to="/adherer" className={item}><Icon name="send" />Coopter un candidat</Link>}
          {(roles.isStaff) && <Link role="menuitem" to="/gestion" className={item}><Icon name="sliders" />Gestion</Link>}
          <div className="my-1 h-px bg-line" />
          <button role="menuitem" className={`${item} w-full text-left`} onClick={async () => { navigate('/'); await logout(); }}>
            <Icon name="logout" />Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}

const THEMES = [
  { value: 'system', label: 'Système', icon: 'monitor' },
  { value: 'light', label: 'Clair', icon: 'sun' },
  { value: 'dark', label: 'Sombre', icon: 'moon' },
];

function ThemeSwitch() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('mdl-theme') || 'system'; } catch { return 'system'; }
  });
  const choose = (value) => {
    setTheme(value);
    if (value === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;
    try { localStorage.setItem('mdl-theme', value); } catch { /* storage unavailable */ }
  };
  return (
    <div className="inline-flex rounded-lg border border-line p-0.5" role="radiogroup" aria-label="Thème">
      {THEMES.map((t) => (
        <button key={t.value} role="radio" aria-checked={theme === t.value} onClick={() => choose(t.value)} title={t.label}
          className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold ${theme === t.value ? 'bg-sunken text-ink' : 'text-muted hover:text-ink'}`}>
          <Icon name={t.icon} size={15} /><span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="page flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-sm items-start gap-3">
          <Mark size={40} certification="PP" label="Mouvement des Libertariens" />
          <div>
            <p className="font-display font-bold">Mouvement des Libertariens</p>
            <p className="mt-1 text-sm text-muted">Liberté, Paix et Prospérité. Le phare des libertariens francophones.</p>
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm" aria-label="Pied de page">
          <Link to="/blog" className="text-muted hover:text-ink">Blog</Link>
          <Link to="/membres" className="text-muted hover:text-ink">Membres</Link>
          <Link to="/liens" className="text-muted hover:text-ink">Liens</Link>
          <Link to="/adherer" className="text-muted hover:text-ink">Adhérer</Link>
        </nav>
        <ThemeSwitch />
      </div>
      <div className="page pb-[max(2rem,env(safe-area-inset-bottom))] text-xs text-muted">© {new Date().getFullYear()} Mouvement des Libertariens</div>
    </footer>
  );
}
