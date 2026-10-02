import { useEffect, useState } from "react";
import { Plus, PiggyBank } from "lucide-react";
import api, { errMsg } from "../services/api";
import { useUI } from "../context/UIContext";
import { useToast } from "../components/Toast";
import { useFmt } from "../utils/format";
import BudgetCard from "../components/BudgetCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function Budgets() {
  const { openModal, refreshKey, refresh } = useUI();
  const toast = useToast();
  const { money } = useFmt();
  const [items, setItems] = useState(null);
  const [del, setDel] = useState(null);

  useEffect(() => {
    api
      .get("/budgets")
      .then((r) => setItems(r.data))
      .catch(() => {
        setItems([]);
        toast("Something went wrong. Please try again.", "error");
      });
  }, [refreshKey]);

  const confirmDelete = async () => {
    const b = del;
    setDel(null);
    try {
      await api.delete(`/budgets/${b._id}`);
      toast("Budget deleted.");
      refresh();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  if (!items) return <LoadingSkeleton count={3} className="h-44" />;
  const budget = items.reduce((s, b) => s + b.amount, 0);
  const spent = items.reduce((s, b) => s + b.spent, 0);
  const over = items.filter((b) => b.percent > 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Budgets</h1>
          <p className="text-sm text-slate-500">Monthly spending limits</p>
        </div>
        <button onClick={() => openModal("budget")} className="btn-primary">
          <Plus size={16} />
          Add Budget
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={PiggyBank}
            title="Your budget hasn't been created"
            text="Set monthly limits for your categories and stay in control."
            action="Set budget"
            onAction={() => openModal("budget")}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Total budget", money(budget), ""],
              ["Spent", money(spent), ""],
              [
                "Remaining",
                money(budget - spent),
                budget - spent < 0 ? "text-red-500" : "text-emerald-500",
              ],
            ].map(([l, v, c]) => (
              <div key={l} className="card p-5">
                <p className="text-sm text-slate-500">{l}</p>
                <p className={`mt-1 text-2xl font-bold ${c}`}>{v}</p>
              </div>
            ))}
          </div>
          {over.length > 0 && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
              ⚠️ Over budget:{" "}
              {over
                .map((b) => `${b.category} (+${money(b.spent - b.amount)})`)
                .join(", ")}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((b) => (
              <BudgetCard
                key={b._id}
                b={b}
                onEdit={(x) => openModal("budget", x)}
                onDelete={setDel}
              />
            ))}
          </div>
        </>
      )}

      {del && (
        <Modal title="Delete budget?" onClose={() => setDel(null)}>
          <p className="text-sm text-slate-500">
            The {del.category} budget will be removed. Your transactions are not
            affected.
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
