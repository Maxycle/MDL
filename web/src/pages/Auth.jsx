import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { api } from '../lib/api.js';
import { useForm, useLoad, useTitle } from '../lib/hooks.js';
import { useSession } from '../lib/session.jsx';
import { Button, Field, Notice, PasswordInput, Spinner, Switch } from '../components/ui.jsx';
import { Mark } from '../components/Mark.jsx';

function AuthCard({ title, subtitle, children, footer, wide }) {
  return (
    <div className={`page flex flex-col items-center py-12 sm:py-20 ${wide ? 'max-w-xl' : 'max-w-md'}`}>
      <Mark size={56} certification="PP" label="Mouvement des Libertariens" />
      <h1 className="mt-5 text-center text-3xl font-bold">{title}</h1>
      {subtitle && <p className="mt-2 text-center text-muted">{subtitle}</p>}
      <div className="card mt-8 w-full p-6 sm:p-8">{children}</div>
      {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}

export function Login() {
  useTitle('Connexion');
  const { user, setUser } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { field, busy, message, submit } = useForm({ login: '', password: '' });
  const to = location.state?.from || '/espace';
  if (user) return <Navigate to={to} replace />;

  const onSubmit = submit(async (values) => {
    const { user: u } = await api('/login', { method: 'POST', body: values });
    setUser(u);
    navigate(to, { replace: true });
  });
  return (
    <AuthCard title="Connexion" subtitle="Accédez à votre espace membre." footer={<>Pas encore membre ? <Link to="/adherer" className="link">Déposer une candidature</Link></>}>
      <form onSubmit={onSubmit} className="space-y-5">
        {message && <Notice tone="error">{message}</Notice>}
        <Field label="Email ou nom d'utilisateur" htmlFor="login"><input className="input" autoComplete="username" autoFocus {...field('login')} /></Field>
        <Field label={<span className="flex justify-between"><span>Mot de passe</span><Link to="/mot-de-passe-oublie" className="link font-normal">Oublié ?</Link></span>} htmlFor="password">
          <PasswordInput autoComplete="current-password" {...field('password')} />
        </Field>
        <Button type="submit" size="lg" className="w-full" busy={busy}>Se connecter</Button>
      </form>
    </AuthCard>
  );
}

export function Forgot() {
  useTitle('Mot de passe oublié');
  const [sent, setSent] = useState('');
  const { field, errors, busy, message, submit } = useForm({ email: '' });
  const onSubmit = submit(async (values) => {
    const res = await api('/password/forgot', { method: 'POST', body: values });
    setSent(res.message);
  });
  return (
    <AuthCard title="Mot de passe oublié" subtitle="Recevez un lien pour en choisir un nouveau." footer={<Link to="/connexion" className="link">Retour à la connexion</Link>}>
      {sent ? <Notice tone="success" title="Email envoyé">{sent}</Notice> : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {message && !errors.email && <Notice tone="error">{message}</Notice>}
          <Field label="Adresse email" error={errors.email} htmlFor="email"><input className="input" type="email" autoComplete="email" autoFocus {...field('email')} /></Field>
          <Button type="submit" size="lg" className="w-full" busy={busy}>Envoyer le lien</Button>
        </form>
      )}
    </AuthCard>
  );
}

export function Reset() {
  useTitle('Nouveau mot de passe');
  const { token } = useParams();
  const { setUser } = useSession();
  const navigate = useNavigate();
  const { field, errors, busy, message, submit } = useForm({ password: '' });
  const onSubmit = submit(async (values) => {
    const { user } = await api('/password/reset', { method: 'POST', body: { ...values, token } });
    setUser(user);
    navigate('/espace', { replace: true });
  });
  return (
    <AuthCard title="Nouveau mot de passe" subtitle="Vous serez connecté juste après." footer={<Link to="/mot-de-passe-oublie" className="link">Demander un nouveau lien</Link>}>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {message && !errors.password && <Notice tone="error">{message}</Notice>}
        <Field label="Nouveau mot de passe" error={errors.password} hint="8 caractères minimum." htmlFor="password">
          <PasswordInput autoComplete="new-password" autoFocus {...field('password')} />
        </Field>
        <Button type="submit" size="lg" className="w-full" busy={busy}>Enregistrer et me connecter</Button>
      </form>
    </AuthCard>
  );
}

export function Signup() {
  useTitle('Créer mon compte');
  const { token } = useParams();
  const { setUser } = useSession();
  const navigate = useNavigate();
  const invite = useLoad(() => api(`/signup/${token}`), [token]);
  const form = useForm({ username: '', password: '', first_name: '', last_name: '', intro: '', profile_public: true });
  const { field, errors, busy, message, submit, values, setValues } = form;

  useEffect(() => {
    if (invite.data) setValues((v) => ({ ...v, first_name: invite.data.first_name, last_name: invite.data.last_name }));
  }, [invite.data, setValues]);
  const onSubmit = submit(async (v) => {
    const { user } = await api('/signup', { method: 'POST', body: { ...v, token } });
    setUser(user);
    navigate('/espace', { replace: true });
  });

  if (invite.loading) return <div className="flex justify-center py-24 text-muted"><Spinner size={28} /></div>;
  if (invite.error) {
    return (
      <AuthCard title="Lien d'inscription">
        <Notice tone="error" title="Ce lien ne fonctionne pas">{invite.error.message}</Notice>
      </AuthCard>
    );
  }
  return (
    <AuthCard wide title="Bienvenue au mouvement" subtitle="Votre candidature a été acceptée. Créez votre compte.">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {message && Object.keys(errors).length === 0 && <Notice tone="error">{message}</Notice>}
        <Field label="Adresse email" htmlFor="email" hint="L'adresse de votre candidature."><input id="email" className="input" value={invite.data.email} readOnly /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom" error={errors.first_name} htmlFor="first_name"><input className="input" autoComplete="given-name" {...field('first_name')} /></Field>
          <Field label="Nom" error={errors.last_name} htmlFor="last_name"><input className="input" autoComplete="family-name" {...field('last_name')} /></Field>
        </div>
        <Field label="Nom d'utilisateur" error={errors.username} hint="Visible des autres membres. Lettres, chiffres, point, tiret." htmlFor="username">
          <input className="input" autoComplete="username" {...field('username')} />
        </Field>
        <Field label="Mot de passe" error={errors.password} hint="8 caractères minimum." htmlFor="password">
          <PasswordInput autoComplete="new-password" {...field('password')} />
        </Field>
        <Field label="Présentation (facultatif)" error={errors.intro} htmlFor="intro">
          <textarea className="input" placeholder="Quelques mots sur vous, visibles sur votre profil." {...field('intro')} />
        </Field>
        <Switch id="profile_public" checked={values.profile_public} onChange={(v) => setValues((s) => ({ ...s, profile_public: v }))}
          label="Profil public" description="Apparaître dans l'annuaire des membres avec vos niveaux." />
        <Button type="submit" size="lg" className="w-full" busy={busy}>Créer mon compte</Button>
      </form>
    </AuthCard>
  );
}
