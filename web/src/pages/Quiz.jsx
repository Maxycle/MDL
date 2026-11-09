import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useLoad, useTitle } from '../lib/hooks.js';
import { useSession } from '../lib/session.jsx';
import { DIFFICULTIES, DOMAINS, LEVELS, fmtDate, plural } from '../lib/format.js';
import { Button, Confirm, LoadError, Notice, PageHeader, Skeleton } from '../components/ui.jsx';
import { Icon } from '../components/Icon.jsx';
import { Mark } from '../components/Mark.jsx';
import { ScoreBar, Track } from '../components/Progress.jsx';

export default function Quiz() {
  useTitle('Questionnaires');
  const { setUser } = useSession();
  const overview = useLoad(() => api('/quiz'), []);
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  // An attempt already running (page reloaded, other tab): resume it, the clock kept going.
  const currentId = overview.data?.current_attempt_id;
  useEffect(() => {
    if (currentId && !attempt) api('/quiz/attempts/current').then((d) => d.attempt && setAttempt(d.attempt)).catch(() => {});
  }, [currentId, attempt]);

  const start = async () => {
    setStarting(true);
    setError('');
    try {
      const d = await api('/quiz/attempts', { method: 'POST', body: { domain: confirm.domain, level: confirm.level } });
      setAttempt(d.attempt);
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e.message);
      overview.reload();
    } finally {
      setStarting(false);
      setConfirm(null);
    }
  };

  const finished = (data) => {
    setAttempt(null);
    setResult(data);
    setUser(data.user);
    overview.reload();
    window.scrollTo(0, 0);
  };

  if (attempt) return <AttemptView key={attempt.id} attempt={attempt} onFinished={finished} />;
  if (result) return <ResultView data={result} onBack={() => setResult(null)} />;

  const d = overview.data;
  const rules = d?.rules;
  return (
    <div className="page">
      <PageHeader eyebrow="Certification" title="Questionnaires">
        Deux domaines, deux niveaux. Validez « Sait Analyser » en Droit Naturel et en École Autrichienne pour devenir membre certifié.
      </PageHeader>
      {error && <Notice tone="error" className="mb-6">{error}</Notice>}
      {overview.error && <LoadError error={overview.error} onRetry={overview.reload} />}
      {!d && overview.loading && <div className="grid gap-5 md:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>}
      {d && (
        <>
          <ul className="mb-8 flex flex-wrap gap-2 text-sm">
            <li className="pill pill-neutral !h-8 !px-3 !text-sm"><Icon name="list" size={15} />{plural(rules.questions_per_attempt, 'question', 'questions')} max.</li>
            <li className="pill pill-neutral !h-8 !px-3 !text-sm"><Icon name="clock" size={15} />{rules.time_limit_minutes} minutes</li>
            <li className="pill pill-neutral !h-8 !px-3 !text-sm"><Icon name="refresh" size={15} />{plural(rules.tries_permitted, 'essai', 'essais')} sur {rules.try_length_days} jours</li>
            <li className="pill pill-neutral !h-8 !px-3 !text-sm">Nouveau cycle après {rules.cycle_length_days} jours</li>
          </ul>
          <div className="grid gap-5 md:grid-cols-2">
            {Object.entries(DOMAINS).map(([code, label]) => (
              <section key={code} className="card flex flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{label}</h2>
                    <p className="mt-1 text-sm text-muted">Niveau actuel : <span className="font-semibold text-ink">{LEVELS[d.levels[code]]}</span></p>
                  </div>
                  <Mark size={52} levels={code === 'DN' ? { DN: d.levels.DN, EA: 'beginner' } : { DN: 'beginner', EA: d.levels.EA }} label={`${label} : ${LEVELS[d.levels[code]]}`} />
                </div>
                <div className="mt-5"><Track level={d.levels[code]} /></div>
                <div className="mt-6 divide-y divide-line border-t border-line">
                  {d.tracks.filter((t) => t.domain === code).map((t) => <TrackRow key={t.level} track={t} onStart={() => setConfirm(t)} />)}
                </div>
              </section>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            Moyennes requises : facile {rules.thresholds.LOW}, intermédiaire {rules.thresholds.MID}, difficile {rules.thresholds.HIGH}. Une question sans réponse compte 0 point.
          </p>
        </>
      )}
      <Confirm open={!!confirm} onClose={() => setConfirm(null)} onConfirm={start} busy={starting} confirmLabel="Commencer"
        title={confirm ? `${DOMAINS[confirm.domain]} · ${LEVELS[confirm.level]}` : ''}>
        {rules && <p>{plural(rules.questions_per_attempt, 'question', 'questions')} au plus, {rules.time_limit_minutes} minutes. Le chronomètre démarre tout de suite et continue si vous quittez la page.</p>}
        <p className="font-semibold">Commencer compte pour un essai.</p>
      </Confirm>
    </div>
  );
}

function TrackRow({ track, onStart }) {
  const name = LEVELS[track.level];
  let status;
  let action = null;
  switch (track.state) {
    case 'done':
      status = <span className="pill pill-green"><Icon name="check" size={14} />Validé</span>;
      break;
    case 'available':
      status = (
        <span className="text-sm text-muted">
          {track.tries_left === null ? 'Essais illimités (administrateur)' : `${plural(track.tries_left, 'essai restant', 'essais restants')}`}
          {track.window_ends_at && ` jusqu'au ${fmtDate(track.window_ends_at)}`}
        </span>
      );
      action = <Button size="sm" onClick={onStart} iconRight="arrow-right">Commencer</Button>;
      break;
    case 'cooldown':
      status = <span className="text-sm text-muted">Essais utilisés. <span className="font-semibold text-ink">De nouveau disponible le {fmtDate(track.next_available_at)}.</span></span>;
      break;
    case 'locked':
      status = <span className="inline-flex items-center gap-1.5 text-sm text-muted"><Icon name="lock" size={15} />Validez d'abord « Bases Acquises »</span>;
      break;
    case 'closed':
      status = <span className="text-sm text-muted">Bientôt disponible : ce questionnaire est en préparation.</span>;
      break;
    default:
      status = <span className="text-sm text-muted">Aucune question disponible pour le moment.</span>;
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="min-w-0">
        <p className="font-semibold">{name}</p>
        <div className="mt-0.5">{status}</div>
      </div>
      {action}
    </div>
  );
}

function formatClock(ms) {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function AttemptView({ attempt, onFinished }) {
  useTitle('Questionnaire en cours');
  const questions = attempt.questions;
  const [answers, setAnswers] = useState(() => ({ ...attempt.answers }));
  const [index, setIndex] = useState(() => Math.max(0, questions.findIndex((q) => !attempt.answers[q.id])));
  const [error, setError] = useState('');
  const [askFinish, setAskFinish] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const finishingRef = useRef(false);
  const queue = useRef(Promise.resolve());

  // Server time is the reference: the deadline cannot be extended from the browser.
  const offset = useMemo(() => Date.parse(attempt.server_now) - Date.now(), [attempt.server_now]);
  const deadline = Date.parse(attempt.deadline_at);
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), 500);
    return () => clearInterval(t);
  }, [offset]);
  const remaining = Math.max(0, deadline - now);

  const choose = (questionId, answerId) => {
    setAnswers((a) => ({ ...a, [questionId]: answerId }));
    queue.current = queue.current
      .then(() => api(`/quiz/attempts/${attempt.id}/answers`, { method: 'PUT', body: { question_id: questionId, answer_id: answerId } }))
      .then(() => setError(''))
      .catch((e) => setError(e.message));
  };

  const finish = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setFinishing(true);
    try {
      await queue.current;
      onFinished(await api(`/quiz/attempts/${attempt.id}/finish`, { method: 'POST' }));
    } catch (e) {
      setError(e.message);
      finishingRef.current = false;
      setFinishing(false);
    }
  }, [attempt.id, onFinished]);

  const timeUp = remaining <= 0;
  useEffect(() => { if (timeUp) finish(); }, [timeUp, finish]);

  const q = questions[index];
  const answered = questions.filter((x) => answers[x.id]).length;
  const unanswered = questions.length - answered;
  const last = index === questions.length - 1;

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, [role=dialog]')) return;
      const letter = e.key.toUpperCase().charCodeAt(0) - 65;
      if (e.key.length === 1 && letter >= 0 && letter < (q?.answers.length || 0)) choose(q.id, q.answers[letter].id);
      if (e.key === 'ArrowRight' && !last) setIndex((i) => i + 1);
      if (e.key === 'ArrowLeft' && index > 0) setIndex((i) => i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const low = remaining < 60_000;
  const warn = remaining < 5 * 60_000;
  return (
    <div className="pb-10">
      <div className="sticky top-16 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="page flex h-14 items-center gap-3">
          <span className="hidden truncate text-sm font-semibold sm:block">{DOMAINS[attempt.domain]} · {LEVELS[attempt.level]}</span>
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:ml-4">
            <div className="h-1.5 min-w-12 flex-1 rounded-full bg-sunken" aria-hidden="true">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(answered / questions.length) * 100}%` }} />
            </div>
            <span className="shrink-0 text-sm tabular-nums text-muted">{answered}/{questions.length}</span>
          </div>
          <span className={`pill !h-8 !px-3 !text-sm tabular-nums ${low ? 'pill-red pulse-soft' : warn ? 'pill-yellow' : 'pill-neutral'}`} role="timer" aria-label={`Temps restant ${formatClock(remaining)}`}>
            <Icon name="clock" size={15} />{formatClock(remaining)}
          </span>
          <Button size="sm" variant="secondary" onClick={() => setAskFinish(true)} disabled={finishing}>Terminer</Button>
        </div>
      </div>

      <div className="page max-w-3xl pt-8 sm:pt-12">
        {error && <Notice tone="error" className="mb-6">{error}</Notice>}
        {q && (
          <section key={q.id} className="rise" aria-labelledby={`q-${q.id}`}>
            <p className="eyebrow">Question {index + 1} sur {questions.length}</p>
            <h1 id={`q-${q.id}`} className="mt-3 text-2xl font-semibold leading-snug sm:text-[1.9rem]">{q.content}</h1>
            <div className="mt-8 space-y-3" role="radiogroup" aria-labelledby={`q-${q.id}`}>
              {q.answers.map((a, i) => {
                const selected = answers[q.id] === a.id;
                return (
                  <button key={a.id} role="radio" aria-checked={selected} onClick={() => choose(q.id, a.id)}
                    className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors ${selected ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:border-line-strong'}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${selected ? 'bg-primary text-primary-fg' : 'bg-sunken text-muted'}`}>{String.fromCharCode(65 + i)}</span>
                    <span className="pt-1 leading-relaxed">{a.content}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" icon="arrow-left" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>Précédente</Button>
          {last
            ? <Button onClick={() => setAskFinish(true)} busy={finishing}>Terminer</Button>
            : <Button variant={answers[q?.id] ? 'primary' : 'secondary'} iconRight="arrow-right" onClick={() => setIndex((i) => i + 1)}>Suivante</Button>}
        </div>

        <nav className="mt-10 border-t border-line pt-6" aria-label="Aller à une question">
          <p className="mb-3 text-sm text-muted">Toutes les questions <span className="hidden sm:inline">· raccourcis : touches A, B, C… et flèches</span></p>
          <div className="flex flex-wrap gap-2">
            {questions.map((x, i) => (
              <button key={x.id} onClick={() => setIndex(i)} aria-current={i === index ? 'step' : undefined} aria-label={`Question ${i + 1}${answers[x.id] ? ', répondue' : ''}`}
                className={`h-9 w-9 rounded-lg text-sm font-semibold tabular-nums transition-colors ${i === index ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg' : ''} ${answers[x.id] ? 'bg-ink text-bg' : 'bg-sunken text-muted hover:text-ink'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <Confirm open={askFinish} onClose={() => setAskFinish(false)} onConfirm={finish} busy={finishing} confirmLabel="Voir mon résultat" title="Terminer le questionnaire ?">
        {unanswered > 0
          ? <p><span className="font-semibold">{plural(unanswered, 'question reste', 'questions restent')} sans réponse</span> et {unanswered > 1 ? 'compteront' : 'comptera'} 0 point.</p>
          : <p>Vous avez répondu à toutes les questions.</p>}
        <p className="text-muted">Il vous reste {formatClock(remaining)}.</p>
      </Confirm>
    </div>
  );
}

function ResultView({ data, onBack }) {
  useTitle('Résultat');
  const r = data.result;
  return (
    <div className="page max-w-3xl py-10 sm:py-14">
      <div className="card overflow-hidden">
        <div className={`flex flex-col items-center px-6 py-10 text-center ${r.passed ? 'bg-brand text-white' : ''}`}>
          <Mark size={128} levels={data.levels} certification={data.certification} />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{r.passed ? 'Niveau validé !' : 'Pas cette fois'}</h1>
          <p className={`mt-3 max-w-lg ${r.passed ? 'text-white/75' : 'text-muted'}`}>
            {r.passed
              ? `Vous avez validé « ${LEVELS[r.level]} » en ${DOMAINS[r.domain]}.`
              : `Les moyennes requises ne sont pas atteintes pour « ${LEVELS[r.level]} » en ${DOMAINS[r.domain]}.`}
          </p>
          {r.passed && data.certification === 'MC' && r.level === 'SA' && (
            <span className="pill pill-flame mt-5 !h-8 !px-4 !text-sm">Vous êtes membre certifié</span>
          )}
        </div>
        <div className="space-y-5 border-t border-line p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Moyennes par difficulté</h2>
          {['LOW', 'MID', 'HIGH'].map((k) => r.averages[k] !== null && (
            <ScoreBar key={k} label={DIFFICULTIES[k]} value={r.averages[k]} threshold={r.thresholds[k]} />
          ))}
          <p className="text-sm text-muted">{r.answered} réponses sur {plural(r.total, 'question', 'questions')}.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={onBack} icon="arrow-left" variant="secondary">Questionnaires</Button>
            <Button to="/espace">Mon espace</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
