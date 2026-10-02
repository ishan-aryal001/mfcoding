import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import api from "../services/api";
import { useUI } from "../context/UIContext";
import { useFmt } from "../utils/format";
import { catMeta } from "../utils/constants";
import ChartCard from "../components/ChartCard";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton, { Skeleton } from "../components/LoadingSkeleton";

const tip = {
  borderRadius: 12,
  border: "none",
  boxShadow: "0 8px 24px rgba(0,0,0,.15)",
  fontSize: 12,
};
const axis = { fontSize: 12, fill: "#94a3b8" };

export default function Analytics() {
  const { refreshKey } = useUI();
  const { money } = useFmt();
  const [cats, setCats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    api
      .get("/analytics/categories")
      .then((r) => setCats(r.data))
      .catch(() => setCats([]));
  }, [refreshKey]);
  useEffect(() => {
    api
      .get(`/analytics/monthly?months=${months}`)
      .then((r) => setMonthly(r.data))
      .catch(() => {});
  }, [months, refreshKey]);

  if (!cats)
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-60" />
        <LoadingSkeleton count={2} className="h-72" />
      </div>
    );
  const hasData = cats.length > 0 || monthly.some((m) => m.income || m.expense);
  if (!hasData)
    return (
      <div className="card">
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          text="Add a few transactions and your charts will appear here."
        />
      </div>
    );

  const trends = cats.filter((c) => c.previous > 0 && c.change !== 0);
  const maxTotal = cats[0]?.total || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Analytics</h1>
          <p className="text-sm text-slate-500">
            Calculated from your real transactions
          </p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold dark:bg-white/5">
          {[6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`rounded-md px-3 py-1.5 ${months === m ? "bg-white shadow dark:bg-navy-800" : "text-slate-500"}`}
            >
              {m} months
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Spending by category" subtitle="This month">
          {cats.length === 0 ? (
            <p className="py-20 text-center text-sm text-slate-400">
              No expenses this month.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-56 w-full sm:w-1/2">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={cats}
                      dataKey="total"
                      nameKey="category"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {cats.map((c) => (
                        <Cell
                          key={c.category}
                          fill={catMeta(c.category).color}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tip} formatter={(v) => money(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-2 sm:w-1/2">
                {cats.map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: catMeta(c.category).color }}
                    />
                    <span className="flex-1">{c.category}</span>
                    <span className="text-xs text-slate-400">{c.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Income vs expenses"
          subtitle={`Last ${months} months`}
        >
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={monthly} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#94a3b822"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={axis}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={axis}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={tip}
                  formatter={(v) => money(v)}
                  cursor={{ fill: "#94a3b811" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expenses"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Monthly spending" subtitle="Expense trend">
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#94a3b822"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={axis}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={axis}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip contentStyle={tip} formatter={(v) => money(v)} />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expenses"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Highest spending categories"
          subtitle="Ranked, this month"
        >
          <div className="space-y-4">
            {cats.slice(0, 6).map((c, i) => {
              const { icon: I, color } = catMeta(c.category);
              return (
                <div key={c.category}>
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <span className="w-4 text-xs font-bold text-slate-400">
                      {i + 1}
                    </span>
                    <I size={15} style={{ color }} />
                    <span className="flex-1 font-semibold">{c.category}</span>
                    <b>{money(c.total)}</b>
                  </div>
                  <div className="ml-6 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(c.total / maxTotal) * 100}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {cats.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">
                No expenses this month.
              </p>
            )}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Spending trends" subtitle="Compared with last month">
        {trends.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Not enough data to compare yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trends.map((c) => {
              const up = c.change > 0;
              return (
                <div
                  key={c.category}
                  className={`flex items-start gap-3 rounded-xl p-3 text-sm ${up ? "bg-orange-500/10" : "bg-emerald-500/10"}`}
                >
                  {up ? (
                    <TrendingUp size={18} className="mt-0.5 text-orange-500" />
                  ) : (
                    <TrendingDown
                      size={18}
                      className="mt-0.5 text-emerald-500"
                    />
                  )}
                  <p>
                    Your {c.category.toLowerCase()} spending is{" "}
                    <b>
                      {Math.abs(c.change)}% {up ? "higher" : "lower"}
                    </b>{" "}
                    than last month.
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </ChartCard>
    </div>
  );
}
