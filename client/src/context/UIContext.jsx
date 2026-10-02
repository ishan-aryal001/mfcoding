jsx
import { createContext, useCallback, useContext, useState } from 'react';

const Ctx = createContext();
export const useUI = () => useContext(Ctx);

// modal types: 'transaction' | 'budget' | 'goal'
export function UIProvider({ children }) {
  const [modal, setModal] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  return (
    <Ctx.Provider value={{ modal, openModal, closeModal, refreshKey, refresh, sidebarOpen, setSidebarOpen }}>
      {children}
    </Ctx.Provider>
  );
}
