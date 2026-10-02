import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  AlertTriangle,
  Gauge,
  PiggyBank,
  Lightbulb,
} from "lucide-react";
import api from "../services/api";
import { useUI } from "../context/UIContext";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";

const ICONS = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "pie-chart": PieChart,
  "alert-triangle": AlertTriangle,
  gauge: Gauge,
  "piggy-bank": PiggyBank,
};
const TONES = {
  good: "bg-emerald-500/10 text-emerald-500",
  warn: "bg-orange-500/10 text-orange-500",
  info: "bg-blue-500/10 text-blue-500",
};

export default function Insights() {
  const { openModal, refreshKey } = useUI();
  const [items, setItems] = useState(null);

  useEffect(() => {
    api
      .get("/analytics/insights")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));
  }, [refreshKey]);

  if (!items) return <LoadingSkeleton count={4} className="h-24" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Insights</h1>
        <p className="text-sm text-slate-500">
          Plain-English tips based on your own spending
        </p>
      </div>
      {items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Lightbulb}
            title="No insights yet"
            text="Add some income and expenses and FinFlow will start spotting patterns."
            action="Add expense"
            onAction={() => openModal("transaction", { type: "expense" })}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => {
            const Icon = ICONS[it.icon] || Lightbulb;
            return (
              <div
                key={i}
                className="card flex animate-fade items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${TONES[it.type] || TONES.info}`}
                >
                  <Icon size={20} />
                </div>
                <p className="pt-1 text-sm font-medium">{it.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
