import { useState } from 'react';
import { LoaderCircle, Plus, PiggyBank } from 'lucide-react';
import { GoalForm } from '../components/GoalForm';
import { ContributionForm } from '../components/ContributionForm';
import { useSavingsGoals, type SavingsGoal } from '../lib/useSavingsGoals';
import { formatCurrency, formatDate } from '../lib/format';

type GoalFormState = { open: false } | { open: true; goal: SavingsGoal | null };

export function Goals() {
  const {
    goals,
    loading,
    error,
    refetch,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
  } = useSavingsGoals();
  const [goalForm, setGoalForm] = useState<GoalFormState>({ open: false });
  const [contributionGoal, setContributionGoal] = useState<SavingsGoal | null>(null);

  async function handleDelete() {
    if (!goalForm.open || !goalForm.goal) return;
    await deleteGoal(goalForm.goal.id);
    setGoalForm({ open: false });
  }

  return (
    <section className="pt-2">
      <h1 className="mb-4 text-2xl font-bold">Sparziele</h1>

      {loading ? (
        <div className="flex justify-center py-16 text-muted">
          <LoaderCircle size={28} strokeWidth={2} className="animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-card border border-border bg-card p-5 text-sm text-over shadow-sm">
          {error}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-card p-8 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg text-muted">
            <PiggyBank size={24} strokeWidth={2} />
          </span>
          <p className="text-sm text-muted">
            Noch keine Sparziele. Tippe auf das Plus, um dein erstes anzulegen.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {goals.map(({ goal, saved, ratio }) => {
            const remaining = goal.target_amount - saved;
            return (
              <li
                key={goal.id}
                className="flex flex-col gap-2 rounded-card border border-border bg-card p-3 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setGoalForm({ open: true, goal })}
                  className="flex items-baseline justify-between text-left"
                >
                  <span className="font-medium text-text">{goal.name}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-text">
                    {formatCurrency(saved)}
                    <span className="text-muted"> / {formatCurrency(goal.target_amount)}</span>
                  </span>
                </button>

                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <span
                    className="block h-full rounded-full bg-ok"
                    style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {remaining > 0
                      ? `Noch ${formatCurrency(remaining)}`
                      : 'Ziel erreicht 🎉'}
                    {goal.target_date ? ` · bis ${formatDate(goal.target_date)}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setContributionGoal(goal)}
                    className="rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
                  >
                    Einzahlen
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setGoalForm({ open: true, goal: null })}
        aria-label="Neues Sparziel"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+72px)] right-[calc(50%-min(50%,14rem)+16px)] z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-opacity hover:opacity-90"
      >
        <Plus size={26} strokeWidth={2} />
      </button>

      {goalForm.open && (
        <GoalForm
          goal={goalForm.goal}
          createGoal={createGoal}
          updateGoal={updateGoal}
          onDelete={goalForm.goal ? () => void handleDelete() : undefined}
          onSaved={() => {
            void refetch();
            setGoalForm({ open: false });
          }}
          onClose={() => setGoalForm({ open: false })}
        />
      )}

      {contributionGoal && (
        <ContributionForm
          goal={contributionGoal}
          addContribution={addContribution}
          onSaved={() => {
            void refetch();
            setContributionGoal(null);
          }}
          onClose={() => setContributionGoal(null)}
        />
      )}
    </section>
  );
}
