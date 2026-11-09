import { useCallback, useEffect, useRef, useState } from 'react';

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Mouvement des Libertariens` : 'Mouvement des Libertariens';
  }, [title]);
}

/** Loads data on mount (and when deps change). Returns { data, error, loading, reload, setData }. */
export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const latest = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(async () => {
    const id = ++latest.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await loader();
      if (id === latest.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === latest.current) setState({ data: null, error, loading: false });
    }
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);
  return { ...state, reload, setData };
}

/** Form state with server-side field errors. */
export function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const field = (name) => ({
    id: name,
    name,
    value: values[name] ?? '',
    'aria-invalid': errors[name] ? 'true' : undefined,
    onChange: (e) => {
      const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setValues((s) => ({ ...s, [name]: v }));
      if (errors[name]) setErrors((s) => ({ ...s, [name]: undefined }));
    },
  });
  const submit = (fn) => async (e) => {
    e?.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await fn(values);
      setErrors({});
    } catch (err) {
      setErrors(err.fields || {});
      setMessage(err.message || 'Une erreur est survenue.');
    } finally {
      setBusy(false);
    }
  };
  return { values, setValues, errors, message, setMessage, busy, field, submit };
}
