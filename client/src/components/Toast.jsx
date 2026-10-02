jsx
import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const Ctx = createContext();
export const useToast = () => useContext(Ctx); // toast('Saved!') or toast('Oops', 'error')

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, message, type }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3000);
  }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="fixed bottom-24 right-4 z-[100] space-y-2 md:bottom-6">
        {list.map((t) => (
          <div key={t.id} className="card flex animate-slide items-center gap-2 px-4 py-3 text-sm font-medium shadow-lg">
            {t.type === 'error' ? <XCircle size={18} className="text-red-500" /> : <CheckCircle2 size={18} className="text-emerald-500" />}
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
