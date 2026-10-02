import { useRef, useState } from "react";
import { Camera, LogOut } from "lucide-react";
import api, { errMsg } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../components/Toast";
import { CURRENCIES } from "../utils/constants";
import Avatar from "../components/Avatar";

const DATE_FORMATS = [
  ["MMM DD", "Sep 30"],
  ["DD/MM/YYYY", "30/09/2026"],
  ["MM/DD/YYYY", "09/30/2026"],
];
const NOTIFS = [
  ["budget", "Budget alerts"],
  ["recurring", "Upcoming recurring payments"],
  ["goals", "Goal progress"],
  ["spending", "Spending alerts"],
];

const Section = ({ title, children }) => (
  <section className="card p-6">
    <h2 className="mb-4 font-bold">{title}</h2>
    {children}
  </section>
);

// shrink the picked image to a 128px square data URL so it stays small
const resize = (file) =>
  new Promise((res, rej) => {
    const img = new Image();
    const fr = new FileReader();
    fr.onload = () => {
      img.src = fr.result;
    };
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const s = Math.min(img.width, img.height);
      c.getContext("2d").drawImage(
        img,
        (img.width - s) / 2,
        (img.height - s) / 2,
        s,
        s,
        0,
        0,
        128,
        128,
      );
      res(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = rej;
    fr.readAsDataURL(file);
  });

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const fileRef = useRef();
  const [p, setP] = useState({ name: user.name, email: user.email });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState("");

  const save = async (patch, msg = "Settings saved.") => {
    try {
      await updateUser(patch);
      toast(msg);
      return true;
    } catch (e) {
      toast(errMsg(e), "error");
      return false;
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!p.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))
      return toast("Enter a valid name and email.", "error");
    setBusy("profile");
    await save(p, "Profile updated.");
    setBusy("");
  };

  const pickAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await save({ avatar: await resize(file) }, "Profile picture updated.");
    } catch {
      toast("Could not read that image.", "error");
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6)
      return toast("New password must be at least 6 characters.", "error");
    setBusy("pw");
    try {
      await api.put("/auth/password", pw);
      toast("Password updated.");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (e2) {
      toast(errMsg(e2), "error");
    }
    setBusy("");
  };

  const prefs = user.notifPrefs || {};
  const toggleNotif = (k) =>
    save({ notifPrefs: { ...prefs, [k]: prefs[k] === false } });
  const setThemePref = (t) => {
    setTheme(t);
    save({ theme: t });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-extrabold">Settings</h1>

      <Section title="Profile">
        <div className="mb-5 flex items-center gap-4">
          <Avatar user={user} size={64} />
          <div>
            <button
              onClick={() => fileRef.current.click()}
              className="btn-secondary !py-2"
            >
              <Camera size={15} />
              Change photo
            </button>
            {user.avatar && (
              <button
                onClick={() => save({ avatar: "" }, "Photo removed.")}
                className="ml-2 text-xs font-semibold text-slate-400 hover:text-red-500"
              >
                Remove
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={pickAvatar}
            />
          </div>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              value={p.name}
              onChange={(e) => setP({ ...p, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={p.email}
              onChange={(e) => setP({ ...p, email: e.target.value })}
            />
          </div>
          <button disabled={busy === "profile"} className="btn-primary">
            Save profile
          </button>
        </form>
      </Section>

      <Section title="Preferences">
        <div className="space-y-4">
          <div>
            <label className="label">Currency</label>
            <select
              className="input"
              value={user.currency}
              onChange={(e) => save({ currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date format</label>
            <select
              className="input"
              value={user.dateFormat}
              onChange={(e) => save({ dateFormat: e.target.value })}
            >
              {DATE_FORMATS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {["light", "dark"].map((t) => (
                <button
                  key={t}
                  onClick={() => setThemePref(t)}
                  className={`rounded-xl border py-2.5 text-sm font-semibold capitalize ${theme === t ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-slate-200 dark:border-white/10"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Notifications">
        <div className="space-y-3">
          {NOTIFS.map(([k, l]) => (
            <div key={k} className="flex items-center justify-between text-sm">
              <span>{l}</span>
              <button
                onClick={() => toggleNotif(k)}
                className={`relative h-6 w-11 rounded-full transition ${prefs[k] !== false ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${prefs[k] !== false ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Security">
        <form onSubmit={changePw} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              value={pw.currentPassword}
              onChange={(e) =>
                setPw({ ...pw, currentPassword: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy === "pw"} className="btn-primary">
              Change password
            </button>
            <button type="button" onClick={logout} className="btn-secondary">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
}
