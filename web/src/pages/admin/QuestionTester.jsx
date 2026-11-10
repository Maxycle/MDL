import { useMemo, useState } from 'react';
import { BASE } from '../../lib/api.js';
import { Button, Modal, Notice } from '../../components/ui.jsx';
import { AnswerList, LockedNote, QuestionImage, ValidateBar } from '../../components/Question.jsx';

const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Plays a question the way a member gets it, from the editor's current values (saved or not):
 * shuffled answers, blurred image, "Valider ma réponse", then the full image and the points.
 * Nothing is sent to the questionnaire: no attempt, no try used, no level change.
 */
export function QuestionTester({ question, onClose }) {
  const answers = useMemo(() => question.answers
    .filter((a) => String(a.content ?? '').trim() !== '')
    .map((a, i) => ({ id: a.id ?? `new-${i}`, content: a.content, points: Number(a.points) || 0 })), [question]);
  const url = (question.image_url || '').trim();
  const image = /^https?:\/\/\S+$/i.test(url) ? url : null;
  const [run, setRun] = useState(0);
  const [order, setOrder] = useState(() => shuffle(answers));
  const [selected, setSelected] = useState(null);
  const [validated, setValidated] = useState(false);

  const restart = () => {
    setRun((r) => r + 1);
    setOrder(shuffle(answers));
    setSelected(null);
    setValidated(false);
  };
  const best = Math.max(...answers.map((a) => a.points));
  const chosen = answers.find((a) => a.id === selected);
  const letter = (id) => String.fromCharCode(65 + order.findIndex((a) => a.id === id));
  const src = (state) => `${BASE}api/admin/questions/image-preview?${new URLSearchParams({ url: image, state })}`;

  return (
    <Modal open onClose={onClose} size="lg" title="Tester la question" footer={
      <>
        <Button variant="secondary" icon="refresh" onClick={restart}>Recommencer</Button>
        <Button onClick={onClose}>Fermer</Button>
      </>
    }>
      <Notice className="mb-6">
        La question telle qu'un membre la voit, avec le contenu actuel de l'éditeur, même non enregistré. Rien n'est enregistré et aucun essai n'est compté.
      </Notice>
      <section key={run} aria-labelledby="tester-question">
        <h3 id="tester-question" className="text-xl font-semibold leading-snug sm:text-2xl">{question.content || 'Question sans texte'}</h3>
        {image && <QuestionImage src={src} revealed={validated} />}
        {answers.length < 2 && <Notice tone="warning" className="mt-6">Ajoutez au moins deux réponses pour tester la question.</Notice>}
        <AnswerList answers={order} selected={selected} locked={validated} labelledBy="tester-question"
          onChoose={(id) => { if (!validated) setSelected(id); }}
          points={validated ? Object.fromEntries(answers.map((a) => [a.id, a.points])) : null} />
        {!validated && (image
          ? <ValidateBar answered={selected !== null} onValidate={() => setValidated(true)} />
          : (
            <div className="mt-5 flex justify-end">
              <Button size="sm" variant="secondary" icon="eye" disabled={selected === null} onClick={() => setValidated(true)}>Voir les points</Button>
            </div>
          ))}
        {validated && image && <LockedNote />}
        {validated && chosen && (
          <Notice tone={chosen.points >= best ? 'success' : 'warning'} className="mt-4">
            Réponse {letter(chosen.id)} : {chosen.points} points. Meilleure réponse : {best} points.
          </Notice>
        )}
      </section>
    </Modal>
  );
}
