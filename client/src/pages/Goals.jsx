import { useEffect, useState } from "react";
import { Plus, Target } from "lucide-react";
import api, { errMsg } from "../services/api";
import { useUI } from "../context/UIContext";
import { useToast } from "../components/Toast";
import GoalCard from "../components/GoalCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import LoadingSkeleton from "../components/LoadingSkeleton";

function FundsModal({ goal, action, onClose }) {
  const toast = useToast();
  const { refresh } = useUI();
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const add = action === "add";

  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(amount) > 0)) return setErr("Enter a valid amount.");
    setBusy(true);
    try {
      await api.post(`/goals/${goal._id}/funds`, {
        amount: Number(amount),
        action,
      });
      toast(add ? "Money added to your goal." : "Money withdrawn.");
      refresh();
      onClose();
    } catch (e2) {
      setErr(errMsg(e2));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={`${add ? "Add money to" : "Withdraw from"} ${goal.name}`}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Amount</label>
          <input
            autoFocus
            type="number"
            step="0.01"
            min="0"
            className="input text-lg font-bold"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {err && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {err}
          </p>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Saving..." : add ? "Add money" : "Withdraw"}
        </button>
      </form>
    </Modal>
  );
}

export default function Goals() {
  const { openModal, refreshKey, refresh } = useUI();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [funds, setFunds] = useState(null);
  const [del, setDel] = useState(null);

  useEffect(() => {
    api
      .get("/goals")
      .then((r) => setItems(r.data))
      .catch(() => {
        setItems([]);
        toast("Something went wrong. Please try again.", "error");
      });
  }, [refreshKey]);

  const confirmDelete = async () => {
    const g = del;
    setDel(null);
    try {
      await api.delete(`/goals/${g._id}`);
      toast("Goal deleted.");
      refresh();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  if (!items) return <LoadingSkeleton count={3} className="h-56" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Goals</h1>
          <p className="text-sm text-slate-500">Save for what matters</p>
        </div>
        <button onClick={() => openModal("goal")} className="btn-primary">
          <Plus size={16} />
          Create Goal
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="No savings goals yet"
            text="Create your first goal and start making progress."
            action="Create your first goal"
            onAction={() => openModal("goal")}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <GoalCard
              key={g._id}
              g={g}
              onFunds={(goal, action) => setFunds({ goal, action })}
              onEdit={(x) => openModal("goal", x)}
              onDelete={setDel}
            />
          ))}
        </div>
      )}

      {funds && (
        <FundsModal
          goal={funds.goal}
          action={funds.action}
          onClose={() => setFunds(null)}
        />
      )}
      {del && (
        <Modal title="Delete goal?" onClose={() => setDel(null)}>
          <p className="text-sm text-slate-500">
            "{del.name}" will be permanently removed.
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
