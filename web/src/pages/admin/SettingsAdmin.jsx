import { useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useForm, useLoad, useTitle } from '../../lib/hooks.js';
import { useSession } from '../../lib/session.jsx';
import { Button, Field, LoadError, Notice, Skeleton, Switch, useToast } from '../../components/ui.jsx';
import { AdminOnly, SectionHeader } from './AdminLayout.jsx';

export default function SettingsAdmin() {
  useTitle('Paramètres');
  return <AdminOnly><SettingsPage /></AdminOnly>;
}

function NumberField({ form, name, label, hint, suffix }) {
  return (
    <Field label={label} error={form.errors[name]} hint={hint} htmlFor={name}>
      <div className="relative">
        <input type="number" inputMode="numeric" className={`input tabular-nums ${suffix ? 'pr-20' : ''}`} {...form.field(name)} />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">{suffix}</span>}
      </div>
    </Field>
  );
}

function SettingsPage() {
  const toast = useToast();
  const { refresh } = useSession();
  const { data, error, loading, reload } = useLoad(() => api('/admin/settings').then((d) => d.settings), []);
  const form = useForm(null);
  useEffect(() => { if (data) form.setValues(data); }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = form.submit(async (values) => {
    const { settings } = await api('/admin/settings', { method: 'PUT', body: values });
    form.setValues(settings);
    refresh();
    toast('Paramètres enregistrés');
  });

  if (error) return <LoadError error={error} onRetry={reload} />;
  if (loading || !form.values) return <Skeleton className="h-96" />;
  const v = form.values;
  return (
    <form onSubmit={save} noValidate>
      <SectionHeader title="Paramètres" actions={<Button type="submit" busy={form.busy}>Enregistrer</Button>}>
        Règles des questionnaires et textes d'accueil.
      </SectionHeader>
      {form.message && <Notice tone="error" className="mb-6">{form.message}</Notice>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-5 p-6">
          <h2 className="text-lg font-semibold">Questionnaire</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField form={form} name="questions_per_attempt" label="Questions par questionnaire" />
            <NumberField form={form} name="time_limit_minutes" label="Durée" suffix="minutes" />
          </div>
          <Switch id="sa_open" checked={v.sa_open} onChange={(x) => form.setValues((s) => ({ ...s, sa_open: x }))}
            label="Ouvrir « Sait Analyser »" description="Tant que ce niveau est fermé, les membres voient « Bientôt disponible »." />
        </section>

        <section className="card space-y-5 p-6">
          <h2 className="text-lg font-semibold">Essais</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <NumberField form={form} name="tries_permitted" label="Essais autorisés" />
            <NumberField form={form} name="try_length_days" label="Période d'essais" suffix="jours" />
            <NumberField form={form} name="cycle_length_days" label="Cycle complet" suffix="jours" />
          </div>
          <p className="text-sm text-muted">
            Un membre a {v.tries_permitted || '…'} essai(s) pendant les {v.try_length_days || '…'} jours qui suivent son premier essai. Ensuite, il attend {v.cycle_length_days || '…'} jours après ce premier essai pour recommencer un cycle.
          </p>
        </section>

        <section className="card space-y-5 p-6">
          <h2 className="text-lg font-semibold">Moyennes requises</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <NumberField form={form} name="low_threshold" label="Questions faciles" suffix="pts" />
            <NumberField form={form} name="mid_threshold" label="Intermédiaires" suffix="pts" />
            <NumberField form={form} name="high_threshold" label="Difficiles" suffix="pts" />
          </div>
          <p className="text-sm text-muted">Pour valider, le membre doit atteindre chaque moyenne, calculée sur les questions de cette difficulté. Une question sans réponse vaut 0.</p>
        </section>

        <section className="card space-y-5 p-6">
          <h2 className="text-lg font-semibold">Textes</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Début du message d'accueil" error={form.errors.welcome_start} htmlFor="welcome_start"><input className="input" {...form.field('welcome_start')} /></Field>
            <Field label="Fin du message d'accueil" error={form.errors.welcome_end} htmlFor="welcome_end"><input className="input" {...form.field('welcome_end')} /></Field>
          </div>
          <p className="-mt-2 text-sm text-muted">Aperçu : « {`${v.welcome_start || ''} pseudo${v.welcome_end || ''}`.trim()} »</p>
          <Field label="Texte d'introduction de « Mon espace »" error={form.errors.intro} htmlFor="intro"><textarea className="input" {...form.field('intro')} /></Field>
        </section>
      </div>
    </form>
  );
}
