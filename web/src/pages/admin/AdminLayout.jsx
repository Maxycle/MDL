import { NavLink, Navigate, Outlet, useLocation } from 'react-router';
import { useSession, rolesOf } from '../../lib/session.jsx';
import { Icon } from '../../components/Icon.jsx';
import NotFound from '../NotFound.jsx';

export default function AdminLayout() {
  const { user } = useSession();
  const roles = rolesOf(user);
  const { pathname } = useLocation();
  if (!roles.isStaff) {
    return <NotFound title="Accès réservé">Cette section est réservée aux porte-parole et aux administrateurs.</NotFound>;
  }
  const tabs = [
    { to: 'candidatures', label: 'Candidatures', icon: 'send' },
    { to: 'membres', label: 'Membres', icon: 'users' },
    roles.isAdmin && { to: 'questions', label: 'Questions', icon: 'list' },
    roles.isAdmin && { to: 'parametres', label: 'Paramètres', icon: 'sliders' },
    roles.isAdmin && { to: 'articles', label: 'Articles', icon: 'book' },
    roles.isAdmin && { to: 'liens', label: 'Liens', icon: 'link' },
  ].filter(Boolean);
  if (pathname.replace(/\/$/, '') === '/gestion') return <Navigate to={tabs[0].to} replace />;

  return (
    <div className="page">
      <p className="eyebrow pt-8 sm:pt-10">Gestion</p>
      <nav className="-mx-1 mt-3 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line px-1 [scrollbar-width:none]" aria-label="Sections de gestion">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to}
            className={({ isActive }) => `-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${isActive ? 'border-primary text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
            <Icon name={t.icon} size={16} />{t.label}
          </NavLink>
        ))}
      </nav>
      <div className="pt-8"><Outlet /></div>
    </div>
  );
}

export function AdminOnly({ children }) {
  const { user } = useSession();
  if (!user?.is_admin) return <NotFound title="Accès réservé">Cette page est réservée aux administrateurs.</NotFound>;
  return children;
}

export function SectionHeader({ title, children, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {children && <p className="mt-1.5 max-w-2xl text-sm text-muted">{children}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
