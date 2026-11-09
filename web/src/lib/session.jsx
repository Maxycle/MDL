import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, settings: {} });

  const refresh = useCallback(async () => {
    try {
      const data = await api('/session');
      setState({ loading: false, user: data.user, settings: data.settings || {} });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo(() => ({
    ...state,
    refresh,
    setUser: (user) => setState((s) => ({ ...s, user })),
    logout: async () => {
      await api('/logout', { method: 'POST' }).catch(() => {});
      setState((s) => ({ ...s, user: null }));
    },
  }), [state, refresh]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

export function rolesOf(user) {
  const pp = user?.certification === 'PP';
  const admin = !!user?.is_admin;
  return {
    isPP: pp,
    isAdmin: admin,
    isStaff: pp || admin,
    canCoopt: admin || ['MC', 'PP'].includes(user?.certification),
  };
}
