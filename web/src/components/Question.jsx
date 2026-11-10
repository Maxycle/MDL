import { useState } from 'react';
import { Button, Notice } from './ui.jsx';
import { Icon } from './Icon.jsx';

/*
 * A question as members see it. Shared by the questionnaire and by the "Tester" window in Gestion,
 * so what an administrator tests is exactly what members get.
 */

/**
 * The question image, blurred until `revealed`; then the clear copy fades in over it.
 * `src(state)` returns the address of the "blurred" or "clear" version.
 */
export function QuestionImage({ src, revealed }) {
  const [loaded, setLoaded] = useState(false);
  const [clearLoaded, setClearLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (failed) return <Notice tone="warning" className="mt-6">L'image de cette question n'a pas pu être chargée.</Notice>;
  const img = 'block max-h-[65vh] w-full object-contain';
  return (
    <figure className={`relative mt-6 overflow-hidden rounded-xl border border-line bg-sunken ${loaded ? '' : 'min-h-48 animate-pulse'}`}>
      <img src={src('blurred')} alt="Illustration de la question, texte masqué" className={img}
        onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
      {revealed && (
        <a href={src('clear')} target="_blank" rel="noopener" aria-label="Ouvrir l'image en grand"
          className={`absolute inset-0 transition-opacity duration-700 ${clearLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <img src={src('clear')} alt="Illustration de la question" className={`${img} h-full`} onLoad={() => setClearLoaded(true)} />
        </a>
      )}
    </figure>
  );
}

/** Answers A, B, C… `points` (id → points) is only given in the administrators' test window. */
export function AnswerList({ answers, selected, locked, onChoose, labelledBy, points }) {
  return (
    <div className="mt-8 space-y-3" role="radiogroup" aria-labelledby={labelledBy}>
      {answers.map((a, i) => {
        const isSelected = selected === a.id;
        return (
          <button key={a.id} type="button" role="radio" aria-checked={isSelected} aria-disabled={locked || undefined} onClick={() => onChoose(a.id)}
            className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors ${isSelected ? 'border-primary bg-primary-soft' : `border-line bg-surface ${locked ? 'cursor-default opacity-60' : 'hover:border-line-strong'}`}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${isSelected ? 'bg-primary text-primary-fg' : 'bg-sunken text-muted'}`}>{String.fromCharCode(65 + i)}</span>
            <span className="pt-1 leading-relaxed">{a.content}</span>
            {points && <span className="pill pill-neutral ml-auto mt-1 shrink-0 tabular-nums">{points[a.id]} pts</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Under an image question, until the answer is validated. */
export function ValidateBar({ answered, onValidate, busy }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sunken p-4">
      <p className="min-w-0 flex-1 basis-60 text-sm text-muted">
        {answered
          ? 'Validez votre réponse pour afficher le texte de l\'image. Elle ne pourra plus être modifiée.'
          : 'Le texte de l\'image s\'affichera une fois votre réponse choisie et validée.'}
      </p>
      <Button size="sm" icon="eye" onClick={onValidate} busy={busy} disabled={!answered}>Valider ma réponse</Button>
    </div>
  );
}

export function LockedNote() {
  return <p className="mt-4 flex items-center gap-1.5 text-sm text-muted"><Icon name="lock" size={15} />Réponse validée : elle ne peut plus être modifiée.</p>;
}
