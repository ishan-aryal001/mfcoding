import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../services/api';
import { CURRENCIES } from '../utils/constants';
import { currencySymbol } from '../utils/format';

const GOALS = [
  ['Control spending', '🎯'], ['Save money', '💰'], ['Track expenses', '🧾'],
  ['Build an emergency fund', '🛟'], ['Manage monthly budget', '📊'],
];

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState([]);
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [target, setTarget] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (g) => setGoals((l) => (l.includes(g) ? l.filter((x) => x !== g) : [...l, g]));

  const next = () => {
    setErr('');
    if (step === 1 && !goals.length) return setErr('Pick at least one goal.');
    if (step === 2 && !(Number(income) > 0)) return setErr('Enter your monthly income.');
    setStep(step + 1);
  };

  const finish = async (withDemo) => {
    setBusy(true);
    try {
      await updateUser({ goals, currency, monthlyIncome: Number(income), savingsTarget: Number(target) || 0, onboarded: true });
      if (withDemo) await api.post('/auth/demo-data');
      nav('/dashboard');
    } catch (e) { setErr(errMsg(e)); setBusy(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="card w-full max-w-lg animate-fade p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white"><Wallet size={16} /></span>FinFlow</div>
          <span className="text-xs font-semibold text-slate-400">Step {step} of 3</span>
        </div>
        <div className="mb-6 flex gap-1.5">{[1, 2, 3].map((n) => <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />)}</div>

        {step === 1 && (
          <>
            <h1 className="text-xl font-extrabold">What do you want to achieve?</h1>
            <p className="mb-4 mt-1 text-sm text-slate-500">Select all that apply.</p>
            <div className="space-y-2">
              {GOALS.map(([g, e]) => (
                <button key={g} onClick={() => toggle(g)} className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm font-medium transition ${goals.includes(g) ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5'}`}>
                  <span className="text-xl">{e}</span><span className="flex-1">{g}</span>
                  {goals.includes(g) && <Check size={18} className="text-emerald-500" />}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-xl font-extrabold">Tell us about your money</h1>
            <p className="mb-4 mt-1 text-sm text-slate-500">This helps personalize your dashboard.</p>
            <div className="space-y-4">
              <div>
                <label className="label">Currency</label>
                <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
              </div>
              <div>
                <label className="label">Monthly income</label>
                <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">{currencySymbol(currency)}</span>
                  <input type="number" min="0" className="input !pl-9" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="2000" /></div>
              </div>
              <div>
                <label className="label">Monthly savings target</label>
                <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">{currencySymbol(currency)}</span>
                  <input type="number" min="0" className="input !pl-9" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="400" /></div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-xl font-extrabold">You're all set, {user.name.split(' ')[0]}! 🎉</h1>
            <p className="mb-4 mt-1 text-sm text-slate-500">Your personalized dashboard is ready.</p>
            <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-white/5">
              <p><b>Goals:</b> {goals.join(', ')}</p>
              <p><b>Income:</b> {currencySymbol(currency)}{income}/month</p>
              <p><b>Savings target:</b> {currencySymbol(currency)}{target || 0}/month</p>
            </div>
            <div className="mt-5 space-y-2">
              <button disabled={busy} onClick={() => finish(false)} className="btn-primary w-full">Go to my dashboard</button>
              <button disabled={busy} onClick={() => finish(true)} className="btn-secondary w-full">Load sample data to explore</button>
            </div>
          </>
        )}

        {err && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{err}</p>}
        {step < 3 && (
          <div className="mt-6 flex gap-2">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="btn-secondary">Back</button>}
            <button onClick={next} className="btn-primary flex-1">Continue</button>
          </div>
        )}
      </div>
    </div>
  );
}