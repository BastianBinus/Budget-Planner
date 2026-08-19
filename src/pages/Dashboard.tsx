import { useState } from 'react';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useDashboard } from '../lib/useDashboard';
import { addMonths, currentMonthStart, formatMonth } from '../lib/month';
import { formatCurrency } from '../lib/format';
import { ampelBarClass } from '../lib/ampel';

const tooltipStyle = {
  background: 'rgb(var(--c-card))',
  border: '1px solid rgb(var(--c-border))',
  borderRadius: 12,
  color: 'rgb(var(--c-text))',
  fontSize: 12,
} as const;

const euroTooltipFormatter = (value: number | string) => formatCurrency(Number(value));

export function Dashboard() {
  const [month, setMonth] = useState(currentMonthStart);
  const {
    incomeTotal,
    expenseTotal,
    remaining,
    byCategory,
    trend,
    budgetBars,
    goals,
    loading,
    error,
  } = useDashboard(month);

  return (
    <section className="pt-2">
      {/* Month switcher */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="Vorheriger Monat"
          className="rounded-full p-2 text-muted transition-colors hover:text-accent"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold">{formatMonth(month)}</h1>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Nächster Monat"
          className="rounded-full p-2 text-muted transition-colors hover:text-accent"
        >
          <ChevronRight size={22} strokeWidth={2} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-muted">
          <LoaderCircle size={28} strokeWidth={2} className="animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-card border border-border bg-card p-5 text-sm text-over shadow-sm">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Balance hero */}
          <div className="rounded-card border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted">Übrig diesen Monat</p>
            <p
              className={`mt-1 text-3xl font-extrabold tracking-tight ${
                remaining < 0 ? 'text-over' : 'text-accent'
              }`}
            >
              {formatCurrency(remaining)}
            </p>
            <div className="mt-3 flex gap-3">
              <div className="flex-1 rounded-xl bg-bg p-3">
                <p className="text-xs text-muted">Einnahmen</p>
                <p className="text-base font-bold text-text">{formatCurrency(incomeTotal)}</p>
              </div>
              <div className="flex-1 rounded-xl bg-bg p-3">
                <p className="text-xs text-muted">Ausgaben</p>
                <p className="text-base font-bold text-text">{formatCurrency(expenseTotal)}</p>
              </div>
            </div>
          </div>

          {/* Expense trend */}
          <div className="rounded-card border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Ausgaben · letzte 6 Monate
            </p>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'rgb(var(--c-muted))' }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: 'rgb(var(--c-muted))' }}
                  formatter={euroTooltipFormatter}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  fill="url(#expenseArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Expenses by category */}
          {byCategory.length > 0 && (
            <div className="rounded-card border border-border bg-card p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Ausgaben nach Kategorie
              </p>
              <div className="flex items-center gap-4">
                <div className="relative h-[120px] w-[120px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byCategory}
                        dataKey="amount"
                        nameKey="name"
                        innerRadius={42}
                        outerRadius={58}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {byCategory.map((entry) => (
                          <Cell key={entry.id} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={euroTooltipFormatter} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-text">
                      {formatCurrency(expenseTotal)}
                    </span>
                    <span className="text-[10px] text-muted">gesamt</span>
                  </div>
                </div>
                <ul className="flex min-w-0 flex-1 flex-col gap-2">
                  {byCategory.map((entry) => (
                    <li key={entry.id} className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-text">{entry.name}</span>
                      <span className="shrink-0 text-muted tabular-nums">
                        {formatCurrency(entry.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Budget bars */}
          {budgetBars.length > 0 && (
            <div className="rounded-card border border-border bg-card p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Budget</p>
              <ul className="flex flex-col gap-3">
                {budgetBars.map((bar) => (
                  <li key={bar.category.id}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="font-medium text-text">{bar.category.name}</span>
                      <span className="tabular-nums text-muted">
                        {formatCurrency(bar.spent)} / {formatCurrency(bar.limit)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <span
                        className={`block h-full rounded-full ${ampelBarClass(bar.ratio)}`}
                        style={{ width: `${Math.min(bar.ratio, 1) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Savings goals */}
          {goals.length > 0 && (
            <div className="rounded-card border border-border bg-card p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Sparziele
              </p>
              <ul className="flex flex-col gap-3">
                {goals.map(({ goal, saved, ratio }) => (
                  <li key={goal.id}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="font-medium text-text">{goal.name}</span>
                      <span className="tabular-nums text-muted">
                        {formatCurrency(saved)} / {formatCurrency(goal.target_amount)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <span
                        className="block h-full rounded-full bg-ok"
                        style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
