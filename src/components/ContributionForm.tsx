import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Modal } from './Modal';
import type { SavingsGoal } from '../lib/useSavingsGoals';

interface ContributionFormProps {
  goal: SavingsGoal;
  addContribution: (goalId: string, amount: number, date: string) => Promise<void>;
  onSaved: () => void;
  onClose: () => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Modal to book a deposit towards a savings goal. */
export function ContributionForm({ goal, addContribution, onSaved, onClose }: ContributionFormProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso());
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const amountValue = Number(amount.replace(',', '.'));
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setErrorMessage('Bitte einen Betrag größer als 0 eingeben.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      await addContribution(goal.id, amountValue, date);
      onSaved();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.');
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Einzahlung · ${goal.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Betrag</span>
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
          Einzahlen
        </button>
      </form>
    </Modal>
  );
}
