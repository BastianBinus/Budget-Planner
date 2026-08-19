import { useState, type FormEvent } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import type { Category } from '../lib/useCategories';

interface BudgetFormProps {
  category: Category;
  currentLimit: number | null;
  monthLabel: string;
  setLimit: (categoryId: string, amount: number) => Promise<void>;
  removeLimit: (categoryId: string) => Promise<void>;
  onSaved: () => void;
  onClose: () => void;
}

/** Modal to set or remove a category's monthly budget limit. */
export function BudgetForm({
  category,
  currentLimit,
  monthLabel,
  setLimit,
  removeLimit,
  onSaved,
  onClose,
}: BudgetFormProps) {
  const [amount, setAmount] = useState(currentLimit !== null ? String(currentLimit) : '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const amountValue = Number(amount.replace(',', '.'));
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setErrorMessage('Bitte ein Limit größer als 0 eingeben.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      await setLimit(category.id, amountValue);
      onSaved();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.');
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage('');
    try {
      await removeLimit(category.id);
      onSaved();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Löschen fehlgeschlagen.');
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`${category.name} · ${monthLabel}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Monatliches Limit</span>
          <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              autoFocus
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
              className="w-full bg-transparent py-2.5 text-text outline-none placeholder:text-muted"
            />
            <span className="shrink-0 text-muted">€</span>
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
          Limit speichern
        </button>

        {currentLimit !== null && (
          <button
            type="button"
            onClick={() => void handleRemove()}
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-card px-4 py-2.5 font-semibold text-over transition-colors hover:bg-over/10 disabled:opacity-60"
          >
            <Trash2 size={18} strokeWidth={2} />
            Limit entfernen
          </button>
        )}
      </form>
    </Modal>
  );
}
