import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr('Enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErr('Enter a valid email address.');
    if (f.password.length < 6) return setErr('Password must be at least 6 characters.');
    if (f.password !== f.confirm) return setErr('Passwords do not match.');
    setBusy(true); setErr('');
    try { await register(f.name, f.email, f.password); nav('/onboarding'); }
    catch (e2) { setErr(errMsg(e2)); setBusy(false); }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start managing your money in under a minute."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-emerald-500">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Full name</label><input className="input" value={f.name} onChange={set('name')} /></div>
        <div><label className="label">Email</label><input type="email" className="input" value={f.email} onChange={set('email')} /></div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} className="input !pr-10" value={f.password} onChange={set('password')} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </div>
        <div><label className="label">Confirm password</label><input type={show ? 'text' : 'password'} className="input" value={f.confirm} onChange={set('confirm')} /></div>
        {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{err}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Creating account...' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}