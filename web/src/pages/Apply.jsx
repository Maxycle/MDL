import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { api } from '../lib/api.js';
import { useForm, useTitle } from '../lib/hooks.js';
import { useSession, rolesOf } from '../lib/session.jsx';
import { Button, Field, Notice, PageHeader, Spinner } from '../components/ui.jsx';
import { Icon } from '../components/Icon.jsx';
import { Mark } from '../components/Mark.jsx';

const EMPTY = { first_name: '', last_name: '', email: '', motivations: '' };

export function Apply() {
  const { user } = useSession();
  const { canCoopt } = rolesOf(user);
  const coopt = !!user && canCoopt;
  useTitle(coopt ? 'Coopter un candidat' : 'Adhérer');
  const [done, setDone] = useState(null);
  const form = useForm(EMPTY);
  const { field, errors, busy, message, submit } = form;

  const send = submit(async (values) => {
    const res = await api('/applications', { method: 'POST', body: values });
    setDone({ ...res, name: `${values.first_name} ${values.last_name}`, email: values.email });
    form.setValues(EMPTY);
  });

  if (user && !canCoopt) {
    return (
      <div className="page max-w-2xl py-16">
        <Notice title="Vous êtes déjà membre">
          La cooptation de nouveaux candidats est ouverte aux membres certifiés. <Link to="/questionnaire" className="link">Passez les questionnaires</Link> pour y accéder.
        </Notice>
      </div>
    );
  }

  const steps = coopt
    ? ['Votre candidat n\'a pas besoin de confirmer son email : la candidature part directement chez les porte-parole.', 'Chaque porte-parole donne son avis. L\'unanimité est requise.', 'Votre candidat reçoit par email un lien personnel pour créer son compte.']
    : ['Vous recevez un email pour confirmer votre adresse.', 'Les porte-parole examinent votre candidature. L\'unanimité est requise.', 'Si elle est acceptée, vous recevez un lien personnel pour créer votre compte.'];

  return (
    <div className="page">
      <PageHeader eyebrow={coopt ? 'Cooptation' : 'Candidature'} title={coopt ? 'Coopter un candidat' : 'Rejoindre le mouvement'}>
        {coopt ? 'Recommandez une personne que vous connaissez et dont vous partagez les convictions.' : 'Présentez-vous en quelques lignes. Votre candidature est lue par les porte-parole du mouvement.'}
      </PageHeader>
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div className="card p-6 sm:p-8">
          {done ? (
            <div className="rise flex flex-col items-start">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success"><Icon name={done.cooptation ? 'check' : 'mail'} size={24} /></span>
              <h2 className="mt-5 text-2xl font-bold">{done.cooptation ? 'Cooptation envoyée' : 'Vérifiez votre boîte mail'}</h2>
              <p className="mt-2 max-w-lg text-muted">
                {done.cooptation
                  ? `La candidature de ${done.name} est transmise aux porte-parole.`
                  : `Nous avons envoyé un lien de confirmation à ${done.email}. Cliquez dessus dans les 48 heures pour transmettre votre candidature.`}
              </p>
              <Button variant="secondary" className="mt-6" onClick={() => setDone(null)}>{done.cooptation ? 'Coopter une autre personne' : 'Corriger ma candidature'}</Button>
            </div>
          ) : (
            <form onSubmit={send} className="space-y-5" noValidate>
              {message && <Notice tone="error">{message}</Notice>}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Prénom" error={errors.first_name} htmlFor="first_name"><input className="input" autoComplete={coopt ? 'off' : 'given-name'} {...field('first_name')} /></Field>
                <Field label="Nom" error={errors.last_name} htmlFor="last_name"><input className="input" autoComplete={coopt ? 'off' : 'family-name'} {...field('last_name')} /></Field>
              </div>
              <Field label="Adresse email" error={errors.email} htmlFor="email"><input className="input" type="email" autoComplete={coopt ? 'off' : 'email'} {...field('email')} /></Field>
              <Field label={coopt ? 'Pourquoi cooptez-vous cette personne ?' : 'Vos motivations'} error={errors.motivations} htmlFor="motivations"
                hint={`${form.values.motivations.trim().length} caractères · 20 minimum`}>
                <textarea className="input min-h-40" placeholder={coopt ? 'Comment la connaissez-vous, quelles lectures, quel engagement…' : 'Ce qui vous amène au libertarianisme, vos lectures, ce que vous attendez du mouvement…'} {...field('motivations')} />
              </Field>
              <Button type="submit" size="lg" busy={busy} iconRight={busy ? undefined : 'send'}>{coopt ? 'Envoyer la cooptation' : 'Envoyer ma candidature'}</Button>
            </form>
          )}
        </div>
        <aside>
          <h2 className="font-display text-lg font-semibold">Ce qui se passe ensuite</h2>
          <ol className="mt-5 space-y-5">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-bg tabular-nums">{i + 1}</span>
                <p className="text-sm leading-relaxed text-muted">{s}</p>
              </li>
            ))}
          </ol>
          {!user && <p className="mt-8 text-sm text-muted">Déjà membre ? <Link to="/connexion" className="link">Connectez-vous</Link></p>}
        </aside>
      </div>
    </div>
  );
}

export function VerifyEmail() {
  useTitle('Confirmation de candidature');
  const { token } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice in development; the link is single-use.
    started.current = true;
    api('/applications/verify', { method: 'POST', body: { token } })
      .then((d) => setState({ status: 'ok', name: d.first_name }))
      .catch((e) => setState({ status: 'error', message: e.message }));
  }, [token]);

  return (
    <div className="page flex max-w-xl flex-col items-center py-20 text-center">
      {state.status === 'loading' && <><Spinner size={32} className="text-muted" /><p className="mt-4 text-muted">Confirmation en cours…</p></>}
      {state.status === 'ok' && (
        <div className="rise flex flex-col items-center">
          <Mark size={80} />
          <h1 className="mt-6 text-3xl font-bold">Merci {state.name} !</h1>
          <p className="mt-3 text-muted">Votre adresse est confirmée et votre candidature est transmise aux porte-parole. Vous recevrez leur réponse par email.</p>
          <Button to="/" variant="secondary" className="mt-8">Retour à l'accueil</Button>
        </div>
      )}
      {state.status === 'error' && (
        <div className="rise w-full text-left">
          <Notice tone="error" title="Confirmation impossible">{state.message}</Notice>
          <Button to="/adherer" variant="secondary" className="mt-6">Déposer une candidature</Button>
        </div>
      )}
    </div>
  );
}
