import { useMemo, useState } from 'react';
import { LoaderCircle, Plus, Receipt } from 'lucide-react';
import { TransactionForm } from '../components/TransactionForm';
import { useCategories, type Category } from '../lib/useCategories';
import { useTransactions, type Transaction } from '../lib/useTransactions';
import { formatCurrency, formatDate } from '../lib/format';

type FormState = { open: false } | { open: true; transaction: Transaction | null };

export function Transactions() {
  const {
    transactions,
    loading,
    error,
    refetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();
  const { categories } = useCategories();
  const [form, setForm] = useState<FormState>({ open: false });

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const category of categories) map.set(category.id, category);
    return map;
  }, [categories]);

  async function handleDelete() {
    if (!form.open || !form.transaction) return;
    await deleteTransaction(form.transaction.id);
    setForm({ open: false });
  }

  return (
    <section className="pt-2">
      <h1 className="mb-4 text-2xl font-bold">Transaktionen</h1>

      {loading ? (
        <div className="flex justify-center py-16 text-muted">
          <LoaderCircle size={28} strokeWidth={2} className="animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-card border border-border bg-card p-5 text-sm text-over shadow-sm">
          {error}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-card p-8 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg text-muted">
            <Receipt size={24} strokeWidth={2} />
          </span>
          <p className="text-sm text-muted">
            Noch keine Transaktionen. Tippe auf das Plus, um deine erste zu erfassen.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {transactions.map((transaction) => {
            const category = transaction.category_id
              ? categoryById.get(transaction.category_id)
              : undefined;
            const isIncome = transaction.kind === 'income';
            return (
              <li key={transaction.id}>
                <button
                  type="button"
                  onClick={() => setForm({ open: true, transaction })}
                  className="flex w-full items-center gap-3 rounded-card border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-accent"
                >
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: category?.color ?? 'rgb(var(--c-muted))' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">
                      {category?.name ?? 'Ohne Kategorie'}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {transaction.note ? `${transaction.note} · ` : ''}
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-semibold tabular-nums ${
                      isIncome ? 'text-ok' : 'text-text'
                    }`}
                  >
                    {isIncome ? '+' : '−'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setForm({ open: true, transaction: null })}
        aria-label="Neue Transaktion"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+72px)] right-[calc(50%-min(50%,14rem)+16px)] z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-opacity hover:opacity-90"
      >
        <Plus size={26} strokeWidth={2} />
      </button>

      {form.open && (
        <TransactionForm
          transaction={form.transaction}
          categories={categories}
          createTransaction={createTransaction}
          updateTransaction={updateTransaction}
          onSaved={() => {
            void refetch();
            setForm({ open: false });
          }}
          onClose={() => setForm({ open: false })}
          onDelete={form.transaction ? () => void handleDelete() : undefined}
        />
      )}
    </section>
  );
}
