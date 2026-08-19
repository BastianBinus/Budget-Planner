import { useState } from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle, Wallet } from 'lucide-react';
import { BudgetForm } from '../components/BudgetForm';
import { useMonthlyBudgets, type BudgetRow } from '../lib/useMonthlyBudgets';
import { addMonths, currentMonthStart, formatMonth } from '../lib/month';
import { formatCurrency } from '../lib/format';

function barClass(ratio: number | null): string {
  if (ratio === null) return 'bg-border';
  if (ratio < 0.8) return 'bg-ok';
  if (ratio < 1) return 'bg-warn';
  return 'bg-over';
}

export function Budget() {
  const [month, setMonth] = useState(currentMonthStart);
  const { rows, totalLimit, totalSpent, loading, error, refetch, setLimit, removeLimit } =
    useMonthlyBudgets(month);
  const [selected, setSelected] = useState<BudgetRow | null>(null);

  const monthLabel = formatMonth(month);
  const totalRemaining = totalLimit - totalSpent;

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
        <h1 className="text-lg font-bold">{monthLabel}</h1>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Nächster Monat"
          className="rounded-full p-2 text-muted transition-colors hover:text-accent"
        >
          <ChevronRight size={22} strokeWidth={2} />
        </button>
      </div>

      {/* Month summary (inspired by Actual's budgeted / spent / remaining) */}
      <div className="mb-4 rounded-card border border-border bg-card p-4 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Budget gesamt</span>
          <span className="font-semibold text-text">{formatCurrency(totalLimit)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-muted">Ausgegeben</span>
          <span className="font-semibold text-text">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm">
          <span className="text-muted">Übrig</span>
          <span className={`font-bold ${totalRemaining < 0 ? 'text-over' : 'text-ok'}`}>
            {formatCurrency(totalRemaining)}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-muted">
          <LoaderCircle size={28} strokeWidth={2} className="animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-card border border-border bg-card p-5 text-sm text-over shadow-sm">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-card p-8 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg text-muted">
            <Wallet size={24} strokeWidth={2} />
          </span>
          <p className="text-sm text-muted">Keine Ausgaben-Kategorien vorhanden.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.category.id}>
              <button
                type="button"
                onClick={() => setSelected(row)}
                className="flex w-full flex-col gap-2 rounded-card border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-accent"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: row.category.color }}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-text">
                    {row.category.name}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-text">
                    {row.limit !== null ? (
                      <>
                        {formatCurrency(row.spent)}
                        <span className="text-muted"> / {formatCurrency(row.limit)}</span>
                      </>
                    ) : (
                      <span className="text-muted">Kein Limit</span>
                    )}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <span
                    className={`block h-full rounded-full ${barClass(row.ratio)}`}
                    style={{ width: row.ratio !== null ? `${Math.min(row.ratio, 1) * 100}%` : '0%' }}
                  />
                </div>

                {row.remaining !== null && (
                  <span className="text-xs text-muted">
                    {row.remaining >= 0
                      ? `Noch ${formatCurrency(row.remaining)} übrig`
                      : `${formatCurrency(Math.abs(row.remaining))} über dem Limit`}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <BudgetForm
          category={selected.category}
          currentLimit={selected.limit}
          monthLabel={monthLabel}
          setLimit={setLimit}
          removeLimit={removeLimit}
          onSaved={() => {
            void refetch();
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
