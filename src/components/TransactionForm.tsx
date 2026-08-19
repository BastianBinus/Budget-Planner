import { useMemo, useState, type FormEvent } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import type { Category } from '../lib/useCategories';
import type { Transaction, TransactionInput } from '../lib/useTransactions';

interface TransactionFormProps {
  transaction: Transaction | null;
  categories: Category[];
  createTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<void>;
  onSaved: () => void;
  onClose: () => void;
  onDelete?: () => void;
}

type Kind = 'income' | 'expense';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Modal form to create or edit a transaction. */
export function TransactionForm({
  transaction,
  categories,
  createTransaction,
  updateTransaction,
  onSaved,
  onClose,
  onDelete,
}: TransactionFormProps) {
  const isEdit = transaction !== null;

  const [kind, setKind] = useState<Kind>(
    (transaction?.kind as Kind | undefined) ?? 'expense',
  );
  const [categoryId, setCategoryId] = useState<string>(transaction?.category_id ?? '');
  const [amount, setAmount] = useState<string>(
    transaction ? String(transaction.amount) : '',
  );
  const [date, setDate] = useState<string>(transaction?.date ?? todayIso());
  const [note, setNote] = useState<string>(transaction?.note ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.kind === kind),
    [categories, kind],
  );

  function selectKind(next: Kind) {
    if (next === kind) return;
    setKind(next);
    // Reset the category since the list changes with the kind.
    setCategoryId('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const amountValue = Number(amount.replace(',', '.'));
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setErrorMessage('Bitte einen Betrag größer als 0 eingeben.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Bitte eine Kategorie wählen.');
      return;
    }

    const input: TransactionInput = {
      amount: amountValue,
      date,
      category_id: categoryId,
      kind,
      note: note.trim() ? note.trim() : null,
    };

    setSubmitting(true);
    setErrorMessage('');
    try {
      if (isEdit && transaction) {
        await updateTransaction(transaction.id, input);
      } else {
        await createTransaction(input);
      }
      onSaved();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.');
      setSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Transaktion bearbeiten' : 'Neue Transaktion'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Kind switch */}
        <div
          role="tablist"
          aria-label="Ausgabe oder Einnahme"
          className="grid grid-cols-2 gap-1 rounded-card border border-border bg-bg p-1"
        >
          {(['expense', 'income'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={kind === value}
              onClick={() => selectKind(value)}
              className={`rounded-[10px] py-2 text-sm font-semibold transition-colors ${
                kind === value ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              {value === 'expense' ? 'Ausgabe' : 'Einnahme'}
            </button>
          ))}
        </div>

        {/* Category */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Kategorie</span>
          <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
            {categoryId && (
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    visibleCategories.find((category) => category.id === categoryId)?.color,
                }}
              />
            )}
            <select
              required
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full bg-transparent py-2.5 text-text outline-none disabled:opacity-60"
            >
              <option value="" disabled>
                Kategorie wählen
              </option>
              {visibleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </label>

        {/* Amount */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Betrag</span>
          <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
              className="w-full bg-transparent py-2.5 text-text outline-none placeholder:text-muted"
            />
            <span className="shrink-0 text-muted">€</span>
          </div>
        </label>

        {/* Date */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Datum</span>
          <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
            <input
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full bg-transparent py-2.5 text-text outline-none"
            />
          </div>
        </label>

        {/* Note */}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Notiz (optional)</span>
          <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="z. B. Wocheneinkauf"
              className="w-full bg-transparent py-2.5 text-text outline-none placeholder:text-muted"
            />
          </div>
        </label>

        {errorMessage && (
          <p className="text-sm text-over" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-card bg-accent px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <LoaderCircle size={18} strokeWidth={2} className="animate-spin" />}
          {isEdit ? 'Speichern' : 'Hinzufügen'}
        </button>

        {isEdit && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center justify-center gap-2 rounded-card px-4 py-2.5 font-semibold text-over transition-colors hover:bg-over/10"
          >
            <Trash2 size={18} strokeWidth={2} />
            Löschen
          </button>
        )}
      </form>
    </Modal>
  );
}
