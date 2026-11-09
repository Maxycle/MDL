import { Button } from '../components/ui.jsx';
import { Mark } from '../components/Mark.jsx';
import { useTitle } from '../lib/hooks.js';

export default function NotFound({ title = 'Page introuvable', children }) {
  useTitle(title);
  return (
    <div className="page flex flex-col items-center py-24 text-center">
      <Mark size={72} />
      <h1 className="mt-6 text-3xl font-bold">{title}</h1>
      <p className="mt-3 max-w-md text-muted">{children || 'Cette adresse ne mène nulle part. Elle a peut-être changé avec la nouvelle version du site.'}</p>
      <Button to="/" className="mt-8" icon="arrow-left" variant="secondary">Retour à l'accueil</Button>
    </div>
  );
}
