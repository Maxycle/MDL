import { useState } from 'react';
import { api } from '../lib/api.js';
import { useLoad, useTitle } from '../lib/hooks.js';
import { useSession, rolesOf } from '../lib/session.jsx';
import { CERTS, CERT_TONE, DOMAINS, LEVELS, fmtShort } from '../lib/format.js';
import { Button, PageHeader, Switch, useToast } from '../components/ui.jsx';
import { Mark } from '../components/Mark.jsx';
import { Track } from '../components/Progress.jsx';
import { Icon } from '../components/Icon.jsx';
import { LevelLine } from './Members.jsx';

const CERT_TEXT = {
  SM: 'Validez « Sait Analyser » dans les deux domaines pour devenir membre certifié.',
  MC: 'Vous pouvez coopter des candidats et demander à devenir porte-parole.',
  PP: 'Vous examinez les candidatures et représentez le mouvement.',
};

export default function Space() {
  useTitle('Mon espace');
  const { user, settings, setUser } = useSession();
  const roles = rolesOf(user);
  const toast = useToast();
  const quiz = useLoad(() => api('/quiz'), []);
  const [saving, setSaving] = useState('');
  const levels = quiz.data?.levels || user.levels;
  const greeting = (settings.welcome_start || settings.welcome_end)
    ? `${settings.welcome_start || ''} ${user.username}${settings.welcome_end || ''}`.trim()
    : `Bonjour ${user.first_name}`;

  const save = async (key, url, body, message) => {
    setSaving(key);
    try {
      const { user: u } = await api(url, { method: 'PUT', body });
      setUser(u);
      toast(message);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving('');
    }
  };

  const next = Object.keys(DOMAINS).map((d) => ({ d, level: levels[d] })).find((x) => x.level !== 'SA' && x.level !== 'SE');

  return (
    <div className="page">
      <PageHeader eyebrow="Mon espace" title={greeting}>{settings.intro}</PageHeader>
      <div className="grid gap-6 lg:grid-cols-[21rem_1fr]">
        <section className="card flex flex-col items-center p-8 text-center lg:self-start">
          <Mark size={168} levels={levels} certification={user.certification} />
          <span className={`pill mt-6 ${CERT_TONE[user.certification]}`}>{CERTS[user.certification]}</span>
          <p className="mt-3 text-sm text-muted">{CERT_TEXT[user.certification]}</p>
          <div className="mt-6 w-full rounded-xl bg-sunken p-4 text-left"><LevelLine levels={levels} /></div>
        </section>

        <div className="space-y-6">
          <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Ma progression</h2>
                <p className="mt-1 text-sm text-muted">
                  {next ? `Prochaine étape : « ${LEVELS[next.level === 'beginner' ? 'BA' : 'SA']} » en ${DOMAINS[next.d]}.` : 'Vous avez validé tous les questionnaires ouverts.'}
                </p>
              </div>
              <Button to="/questionnaire" iconRight="arrow-right">Questionnaires</Button>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {Object.entries(DOMAINS).map(([code, label]) => (
                <div key={code}>
                  <p className="mb-3 text-sm font-semibold">{label}</p>
                  <Track level={levels[code]} />
                </div>
              ))}
            </div>
          </section>

          {user.certification === 'MC' && (
            <section className="card p-6">
              <h2 className="text-xl font-semibold">Devenir porte-parole</h2>
              <p className="mt-1 text-sm text-muted">Les porte-parole examinent les candidatures et représentent le mouvement. Votre demande leur est envoyée par email ; ils vous contacteront.</p>
              <div className="mt-5">
                <Switch id="wants_pp" checked={user.wants_pp} disabled={saving === 'pp'}
                  onChange={(v) => save('pp', '/me/pp-request', { wants_pp: v }, v ? 'Demande envoyée aux porte-parole' : 'Demande annulée')}
                  label={user.wants_pp ? 'Demande envoyée' : 'Je souhaite devenir porte-parole'} />
              </div>
            </section>
          )}

          <section className="card p-6">
            <h2 className="text-xl font-semibold">Visibilité</h2>
            <div className="mt-4">
              <Switch id="profile_public" checked={user.profile_public} disabled={saving === 'public'}
                onChange={(v) => save('public', '/me', { profile_public: v }, v ? 'Votre profil est public' : 'Votre profil est privé')}
                label="Profil public" description="Votre nom, votre présentation et vos niveaux apparaissent dans l'annuaire des membres." />
            </div>
          </section>

          {roles.canCoopt && (
            <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <h2 className="text-xl font-semibold">Coopter un candidat</h2>
                <p className="mt-1 text-sm text-muted">Recommandez une personne : sa candidature part directement chez les porte-parole.</p>
              </div>
              <Button to="/adherer" variant="secondary" icon="send">Coopter</Button>
            </section>
          )}

          {quiz.data?.history?.length > 0 && (
            <section className="card p-6">
              <h2 className="text-xl font-semibold">Mes derniers essais</h2>
              <ul className="mt-4 divide-y divide-line">
                {quiz.data.history.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-medium">{DOMAINS[h.domain]} · {LEVELS[h.level]}</p>
                      <p className="text-sm text-muted">{fmtShort(h.finished_at)} · {h.answered}/{h.total} réponses</p>
                    </div>
                    <span className={`pill ${h.passed ? 'pill-green' : 'pill-neutral'}`}><Icon name={h.passed ? 'check' : 'x'} size={14} />{h.passed ? 'Validé' : 'Non validé'}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
