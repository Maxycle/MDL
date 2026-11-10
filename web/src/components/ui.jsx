import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { Icon } from './Icon.jsx';

export function Button({ variant = 'primary', size, icon, iconRight, busy, children, className = '', to, ...props }) {
  const cls = `btn btn-${variant} ${size ? `btn-${size}` : ''} ${!children ? 'btn-icon' : ''} ${className}`;
  const content = (
    <>
      {busy ? <Spinner size={16} /> : icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </>
  );
  if (to) return <Link to={to} className={cls} {...props}>{content}</Link>;
  return <button type="button" className={cls} disabled={busy || props.disabled} {...props}>{content}</button>;
}

export function Spinner({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Field({ label, error, hint, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="label" htmlFor={htmlFor}>{label}</label>}
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className={`input pr-11 ${props.className || ''}`} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink" aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
        <Icon name={show ? 'eye-off' : 'eye'} size={18} />
      </button>
    </div>
  );
}

export function Switch({ checked, onChange, label, description, disabled, id }) {
  return (
    <label htmlFor={id} className={`flex items-start gap-3 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" className="peer sr-only" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-10 rounded-full bg-line-strong transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
    </label>
  );
}

const NOTICE = {
  info: ['bg-primary-soft text-ink', 'info', 'text-link'],
  success: ['bg-success-soft text-ink', 'check', 'text-success'],
  warning: ['bg-warning-soft text-ink', 'alert', 'text-warning'],
  error: ['bg-danger-soft text-ink', 'alert', 'text-danger'],
};
export function Notice({ tone = 'info', title, children, className = '', action }) {
  const [cls, icon, iconCls] = NOTICE[tone];
  return (
    <div className={`flex gap-3 rounded-xl px-4 py-3 text-sm ${cls} ${className}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={icon} size={18} className={`mt-0.5 ${iconCls}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children, actions }) {
  return (
    <div className="flex flex-col gap-4 pb-8 pt-10 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-muted">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ icon = 'info', title, children, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sunken text-muted"><Icon name={icon} size={22} /></span>
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadError({ error, onRetry }) {
  return (
    <Notice tone="error" title="Chargement impossible" action={onRetry && <Button variant="secondary" size="sm" icon="refresh" onClick={onRetry}>Réessayer</Button>}>
      {error?.message}
    </Notice>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

// Open windows, innermost last: Escape closes only the top one, and the page scrolls again once all are closed.
const openModals = [];

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const token = {};
    openModals.push(token);
    const previous = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape' && openModals[openModals.length - 1] === token) closeRef.current?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const target = ref.current?.querySelector('[data-autofocus], input:not([type=hidden]), textarea, select');
      (target || ref.current)?.focus();
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      openModals.splice(openModals.indexOf(token), 1);
      if (!openModals.length) document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  const width = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={`rise relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl ${width}`}>
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" icon="x" onClick={onClose} aria-label="Fermer" />
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/** A confirmation step built into the page (no window.confirm). */
export function Confirm({ open, title, children, confirmLabel = 'Confirmer', tone = 'primary', busy, onConfirm, onClose, requireText }) {
  const [typed, setTyped] = useState('');
  useEffect(() => { if (!open) setTyped(''); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={
      <>
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button variant={tone} busy={busy} disabled={requireText && typed !== requireText} onClick={onConfirm} data-autofocus>{confirmLabel}</Button>
      </>
    }>
      <div className="space-y-4 text-sm leading-relaxed">
        {children}
        {requireText && (
          <Field label={`Tapez ${requireText} pour confirmer`} htmlFor="confirm-text">
            <input id="confirm-text" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </Field>
        )}
      </div>
    </Modal>
  );
}

const ToastContext = createContext(() => {});
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="rise pointer-events-auto flex items-center gap-2.5 rounded-xl bg-brand px-4 py-3 text-sm font-medium text-white shadow-xl">
            <Icon name={t.tone === 'error' ? 'alert' : 'check'} size={18} className={t.tone === 'error' ? 'text-red-300' : 'text-emerald-300'} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`-mx-1 flex gap-1 overflow-x-auto overflow-y-hidden px-1 py-px [scrollbar-width:none] ${className}`} role="tablist">
      {tabs.map((t) => (
        <button key={t.value} role="tab" aria-selected={value === t.value} onClick={() => onChange(t.value)}
          className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${value === t.value ? 'bg-ink text-bg' : 'text-muted hover:bg-sunken hover:text-ink'}`}>
          {t.label}
          {t.count !== undefined && <span className={`rounded-full px-1.5 text-xs tabular-nums ${value === t.value ? 'bg-bg/20' : 'bg-sunken'}`}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
