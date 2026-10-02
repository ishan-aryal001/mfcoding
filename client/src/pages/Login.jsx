import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '', remember: true });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErr('Enter a valid email address.');
    if (!f.password) return setErr('Enter your password.');
    setBusy(true); setErr('');
    try { await login(f.email, f.password, f.remember); nav('/dashboard'); }
    catch (e2) { setErr(errMsg(e2)); setBusy(false); }
  };

  const demo = async () => {
    setBusy(true); setErr('');
    try { await demoLogin(); nav('/dashboard'); } catch (e2) { setErr(errMsg(e2)); setBusy(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your FinFlow account."
      footer={<>New here? <Link to="/register" className="font-semibold text-emerald-500">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Email</label><input type="email" className="input" placeholder="you@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} className="input !pr-10" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <input type="checkbox" checked={f.remember} onChange={(e) => setF({ ...f, remember: e.target.checked })} className="accent-emerald-500" /> Remember me
        </label>
        {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{err}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Signing in...' : 'Sign in'}</button>
        <button type="button" onClick={demo} disabled={busy} className="btn-secondary w-full">Try the demo account</button>
      </form>
    </AuthShell>
  );
}