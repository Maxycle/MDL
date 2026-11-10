import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useForm, useLoad, useTitle } from '../../lib/hooks.js';
import { useSession } from '../../lib/session.jsx';
import { Button, Field, LoadError, Notice, Skeleton, Switch, useToast } from '../../components/ui.jsx';
import { AdminOnly, SectionHeader } from './AdminLayout.jsx';
import { ImagePreview } from './ImagePreview.jsx';

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
  const { data, error, loading, reload } = useLoad(() => api('/admin/settings'), []);
  const form = useForm(null);
  useEffect(() => { if (data) form.setValues(data.settings); }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

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

        <section className="card space-y-5 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Images des questions</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <NumberField form={form} name="image_blur_top" label="Zone floutée : début" suffix="%" />
                <NumberField form={form} name="image_blur_bottom" label="Zone floutée : fin" suffix="%" />
              </div>
              <p className="text-sm text-muted">
                En pourcentage de la hauteur de l'image : 0 % en haut, 100 % en bas. Cette bande reste floutée jusqu'à ce que le membre valide sa réponse ; ensuite l'image s'affiche en entier et sa réponse ne peut plus changer.
              </p>
            </div>
            <BlurPreview sample={data?.sample_image} top={v.image_blur_top} bottom={v.image_blur_bottom} />
          </div>
        </section>
      </div>
    </form>
  );
}

/** Shows the band on a real question image when there is one, otherwise on a plain diagram. */
function BlurPreview({ sample, top, bottom }) {
  const t = Number(top);
  const b = Number(bottom);
  const valid = Number.isInteger(t) && Number.isInteger(b) && t >= 0 && b <= 100 && t < b;
  // Wait for typing to pause before asking the server for a new preview.
  const [band, setBand] = useState(valid ? [t, b] : null);
  useEffect(() => {
    if (!valid) return undefined;
    const timer = setTimeout(() => setBand([t, b]), 500);
    return () => clearTimeout(timer);
  }, [t, b, valid]);

  if (!band) return null;
  if (sample) return <ImagePreview url={sample} top={band[0]} bottom={band[1]} blurredOnly />;
  return (
    <figure>
      <div className="relative aspect-[3/2] w-full max-w-sm overflow-hidden rounded-lg border border-line bg-sunken">
        <div className="absolute inset-x-0 bg-[var(--c-primary)] opacity-30" style={{ top: `${band[0]}%`, height: `${band[1] - band[0]}%` }} />
      </div>
      <figcaption className="mt-1 text-xs text-muted">Zone floutée. Un aperçu réel s'affichera ici dès qu'une question aura une image.</figcaption>
    </figure>
  );
}
