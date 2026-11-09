import { LEVEL_RANK, LEVELS, fmtScore } from '../lib/format.js';

/** Débutant → Bases Acquises → Sait Analyser, with the reached steps lit. */
export function Track({ level }) {
  const rank = LEVEL_RANK[level] ?? 0;
  return (
    <ol className="grid grid-cols-3 gap-1.5" aria-label={`Niveau actuel : ${LEVELS[level]}`}>
      {['beginner', 'BA', 'SA'].map((step, i) => (
        <li key={step}>
          <div className={`h-1.5 rounded-full ${i === 0 ? 'bg-line-strong' : i <= rank ? 'bg-gradient-to-r from-flame-1 via-flame-2 to-flame-3' : 'bg-sunken'}`} />
          <p className={`mt-1.5 text-xs ${i === rank ? 'font-semibold text-ink' : 'text-muted'}`}>{LEVELS[step]}</p>
        </li>
      ))}
    </ol>
  );
}

/** Average score against the required threshold, drawn on one shared scale. */
export function ScoreBar({ label, value, threshold }) {
  const max = Math.max(100, value ?? 0, threshold);
  const ok = value !== null && value >= threshold;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums text-muted"><span className={`font-semibold ${ok ? 'text-success' : 'text-danger'}`}>{fmtScore(value)}</span> / {threshold} requis</span>
      </div>
      <div className="relative mt-2 h-2.5 rounded-full bg-sunken">
        <div className={`absolute inset-y-0 left-0 rounded-full ${ok ? 'bg-success' : 'bg-accent'}`} style={{ width: `${Math.min(100, ((value ?? 0) / max) * 100)}%` }} />
        <div className="absolute -inset-y-1 w-0.5 rounded bg-ink" style={{ left: `calc(${(threshold / max) * 100}% - 1px)` }} title={`Seuil : ${threshold}`} />
      </div>
    </div>
  );
}
