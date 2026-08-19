import { useState, type FormEvent } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import type { GoalInput, SavingsGoal } from '../lib/useSavingsGoals';

interface GoalFormProps {
  goal: SavingsGoal | null;
  createGoal: (input: GoalInput) => Promise<void>;
  updateGoal: (id: string, input: GoalInput) => Promise<void>;
  onDelete?: () => void;
  onSaved: () => void;
  onClose: () => void;
}

/** Modal to create or edit a savings goal. */
export function GoalForm({
  goal,
  createGoal,
  updateGoal,
  onDelete,
  onSaved,
  onClose,
}: GoalFormProps) {
  const isEdit = goal !== null;
  const [name, setName] = useState(goal?.name ?? '');
  const [target, setTarget] = useState(goal ? String(goal.target_amount) : '');
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const targetValue = Number(target.replace(',', '.'));
    if (!name.trim()) {
      setErrorMessage('Bitte einen Namen eingeben.');
      return;
    }
    if (!Number.isFinite(targetValue) || targetValue <= 0) {
      setErrorMessage('Bitte einen Zielbetrag größer als 0 eingeben.');
      return;
    }

    const input: GoalInput = {
      name: name.trim(),
      target_amount: targetValue,
      target_date: targetDate ? targetDate : null,
    };

    setSubmitting(true);
    setErrorMessage('');
    try {
      if (isEdit && goal) {
        await updateGoal(goal.id, input);
      } else {
        await createGoal(input);
      }
      onSaved();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.');
      setSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Sparziel bearbeiten' : 'Neues Sparziel'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Name</span>
          <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="z. B. Urlaub"
              className="w-full bg-transparent py-2.5 text-text outline-none placeholder:text-muted"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Zielbetrag</span>
          <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="0,00"
              className="w-full bg-transparent py-2.5 text-text outline-none placeholder:text-muted"
            />
            <span className="shrink-0 text-muted">€</span>
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Zieldatum (optional)</span>
          <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
            <input
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
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
          {isEdit ? 'Speichern' : 'Anlegen'}
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
