import { api } from '../lib/api.js';
import { useForm, useTitle } from '../lib/hooks.js';
import { useSession } from '../lib/session.jsx';
import { Button, Field, Notice, PageHeader, PasswordInput, Switch, useToast } from '../components/ui.jsx';

export default function Profile() {
  useTitle('Mon profil');
  const { user, setUser } = useSession();
  const toast = useToast();
  const info = useForm({
    first_name: user.first_name, last_name: user.last_name, username: user.username,
    email: user.email, intro: user.intro || '', profile_public: user.profile_public, current_password: '',
  });
  const pwd = useForm({ current_password: '', password: '' });
  const emailChanged = info.values.email.trim().toLowerCase() !== user.email.toLowerCase();

  const saveInfo = info.submit(async (v) => {
    const body = { ...v };
    if (!emailChanged) delete body.current_password;
    const { user: u } = await api('/me', { method: 'PUT', body });
    setUser(u);
    info.setValues((s) => ({ ...s, current_password: '' }));
    toast('Profil enregistré');
  });
  const savePassword = pwd.submit(async (v) => {
    await api('/me/password', { method: 'PUT', body: v });
    pwd.setValues({ current_password: '', password: '' });
    toast('Mot de passe modifié');
  });

  return (
    <div className="page max-w-3xl">
      <PageHeader eyebrow="Compte" title="Mon profil" />
      <div className="space-y-6">
        <form onSubmit={saveInfo} className="card space-y-5 p-6 sm:p-8" noValidate>
          <h2 className="text-xl font-semibold">Informations</h2>
          {info.message && Object.keys(info.errors).length === 0 && <Notice tone="error">{info.message}</Notice>}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Prénom" error={info.errors.first_name} htmlFor="first_name"><input className="input" autoComplete="given-name" {...info.field('first_name')} /></Field>
            <Field label="Nom" error={info.errors.last_name} htmlFor="last_name"><input className="input" autoComplete="family-name" {...info.field('last_name')} /></Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom d'utilisateur" error={info.errors.username} htmlFor="username"><input className="input" autoComplete="username" {...info.field('username')} /></Field>
            <Field label="Adresse email" error={info.errors.email} htmlFor="email"><input className="input" type="email" autoComplete="email" {...info.field('email')} /></Field>
          </div>
          {emailChanged && (
            <Field label="Mot de passe actuel" error={info.errors.current_password} hint="Requis pour changer d'adresse email." htmlFor="current_password">
              <PasswordInput autoComplete="current-password" {...info.field('current_password')} />
            </Field>
          )}
          <Field label="Présentation" error={info.errors.intro} hint="Visible sur votre fiche dans l'annuaire si votre profil est public." htmlFor="intro">
            <textarea className="input" {...info.field('intro')} />
          </Field>
          <Switch id="profile_public" checked={info.values.profile_public} onChange={(v) => info.setValues((s) => ({ ...s, profile_public: v }))}
            label="Profil public" description="Apparaître dans l'annuaire des membres." />
          <Button type="submit" busy={info.busy}>Enregistrer</Button>
        </form>

        <form onSubmit={savePassword} className="card space-y-5 p-6 sm:p-8" noValidate>
          <h2 className="text-xl font-semibold">Mot de passe</h2>
          {pwd.message && Object.keys(pwd.errors).length === 0 && <Notice tone="error">{pwd.message}</Notice>}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Mot de passe actuel" error={pwd.errors.current_password} htmlFor="pwd_current">
              <PasswordInput autoComplete="current-password" {...pwd.field('current_password')} id="pwd_current" />
            </Field>
            <Field label="Nouveau mot de passe" error={pwd.errors.password} hint="8 caractères minimum." htmlFor="pwd_new">
              <PasswordInput autoComplete="new-password" {...pwd.field('password')} id="pwd_new" />
            </Field>
          </div>
          <p className="text-sm text-muted">Vos autres sessions (autres appareils) seront déconnectées.</p>
          <Button type="submit" busy={pwd.busy} variant="secondary">Changer le mot de passe</Button>
        </form>
      </div>
    </div>
  );
}
