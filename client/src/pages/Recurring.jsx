import { useEffect, useState } from "react";
import { Plus, Repeat, Pencil, Trash2 } from "lucide-react";
import api, { errMsg } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { useToast } from "../components/Toast";
import {
  useFmt,
  currencySymbol,
  toInputDate,
  toISODate,
} from "../utils/format";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  catMeta,
} from "../utils/constants";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";

function RecurringModal({ data, onClose }) {
  const edit = !!data?._id;
  const { user } = useAuth();
  const toast = useToast();
  const { refresh } = useUI();
  const [f, setF] = useState({
    name: data?.name || "",
    amount: data?.amount || "",
    type: data?.type || "expense",
    category: data?.category || "",
    frequency: data?.frequency || "monthly",
    startDate: toInputDate(data?.startDate),
    endDate: data?.endDate ? toInputDate(data.endDate) : "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const cats = f.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr("Enter a name.");
    if (!(Number(f.amount) > 0)) return setErr("Enter a valid amount.");
    if (!f.category) return setErr("Choose a category.");
    setBusy(true);
    try {
      const body = {
        name: f.name,
        amount: Number(f.amount),
        type: f.type,
        category: f.category,
        frequency: f.frequency,
        endDate: f.endDate ? toISODate(f.endDate) : "",
      };
      if (edit)
        await api.put(`/recurring/${data._id}`, {
          ...body,
          nextDate: data.nextDate,
        });
      else
        await api.post("/recurring", {
          ...body,
          startDate: toISODate(f.startDate),
        });
      toast(
        edit
          ? "Recurring item updated."
          : "Recurring item created successfully.",
      );
      refresh();
      onClose();
    } catch (e2) {
      setErr(errMsg(e2));
      setBusy(false);
    }
  };

  return (
    <Modal title={edit ? "Edit recurring" : "Add recurring"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          {["expense", "income"].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setF((p) => ({ ...p, type: t, category: "" }))}
              className={`rounded-lg py-2 text-sm font-semibold capitalize ${f.type === t ? "bg-white shadow dark:bg-navy-800" : "text-slate-500"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div>
          <label className="label">Name</label>
          <input
            autoFocus
            className="input"
            placeholder="e.g. Netflix"
            value={f.name}
            onChange={set("name")}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                {currencySymbol(user.currency)}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input !pl-9"
                value={f.amount}
                onChange={set("amount")}
              />
            </div>
          </div>
          <div>
            <label className="label">Frequency</label>
            <select
              className="input"
              value={f.frequency}
              onChange={set("frequency")}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={f.category}
            onChange={set("category")}
          >
            <option value="">Choose...</option>
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start date</label>
            <input
              type="date"
              disabled={edit}
              className="input disabled:opacity-50"
              value={f.startDate}
              onChange={set("startDate")}
            />
          </div>
          <div>
            <label className="label">End date (optional)</label>
            <input
              type="date"
              className="input"
              value={f.endDate}
              onChange={set("endDate")}
            />
          </div>
        </div>
        {err && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {err}
          </p>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Saving..." : edit ? "Save changes" : "Create"}
        </button>
      </form>
    </Modal>
  );
}

const monthlyOf = (r) =>
  r.frequency === "weekly"
    ? (r.amount * 52) / 12
    : r.frequency === "yearly"
      ? r.amount / 12
      : r.amount;
const dueText = (d) => {
  const n = Math.ceil((new Date(d) - new Date()) / 864e5);
  return n <= 0 ? "Due today" : n === 1 ? "Due tomorrow" : `Due in ${n} days`;
};

export default function Recurring() {
  const { refreshKey, refresh } = useUI();
  const toast = useToast();
  const { money, date } = useFmt();
  const [items, setItems] = useState(null);
  const [modal, setModal] = useState(null); // null | {} | item
  const [del, setDel] = useState(null);

  useEffect(() => {
    api
      .get("/recurring")
      .then((r) => setItems(r.data))
      .catch(() => {
        setItems([]);
        toast("Something went wrong. Please try again.", "error");
      });
  }, [refreshKey]);

  const confirmDelete = async () => {
    const r = del;
    setDel(null);
    try {
      await api.delete(`/recurring/${r._id}`);
      toast("Recurring item deleted.");
      refresh();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  if (!items) return <LoadingSkeleton count={3} className="h-20" />;
  const out = items
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + monthlyOf(r), 0);
  const inc = items
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + monthlyOf(r), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Recurring</h1>
          <p className="text-sm text-slate-500">
            Payments and income that repeat
          </p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={16} />
          Add Recurring
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Repeat}
            title="No recurring items yet"
            text="Add rent, subscriptions or salary and FinFlow records them for you."
            action="Add recurring"
            onAction={() => setModal({})}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <p className="text-sm text-slate-500">
                Monthly recurring expenses
              </p>
              <p className="mt-1 text-2xl font-bold text-orange-500">
                {money(Math.round(out * 100) / 100)}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-slate-500">Monthly recurring income</p>
              <p className="mt-1 text-2xl font-bold text-emerald-500">
                {money(Math.round(inc * 100) / 100)}
              </p>
            </div>
          </div>
          <div className="card divide-y divide-slate-100 px-4 dark:divide-white/5">
            <p className="py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Upcoming, soonest first
            </p>
            {items.map((r) => {
              const { icon: I, color } = catMeta(r.category);
              const inc2 = r.type === "income";
              return (
                <div key={r._id} className="flex items-center gap-3 py-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: color + "1a", color }}
                  >
                    <I size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="text-xs capitalize text-slate-400">
                      {r.frequency} · {date(r.nextDate)} · {dueText(r.nextDate)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold ${inc2 ? "text-emerald-500" : ""}`}
                  >
                    {inc2 ? "+" : "-"}
                    {money(r.amount)}
                  </p>
                  <button
                    onClick={() => setModal(r)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-blue-500"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDel(r)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {modal && <RecurringModal data={modal} onClose={() => setModal(null)} />}
      {del && (
        <Modal title="Delete recurring item?" onClose={() => setDel(null)}>
          <p className="text-sm text-slate-500">
            "{del.name}" will stop repeating. Past transactions stay.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => setDel(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={confirmDelete} className="btn-danger">
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
