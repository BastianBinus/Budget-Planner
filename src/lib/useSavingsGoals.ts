import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Database } from './database.types';

export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'];

/** A savings goal with the total saved so far. */
export interface GoalWithProgress {
  goal: SavingsGoal;
  saved: number;
  /** saved / target_amount, clamped is left to the view. */
  ratio: number;
}

export interface GoalInput {
  name: string;
  target_amount: number;
  target_date: string | null;
}

interface UseSavingsGoalsResult {
  goals: GoalWithProgress[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createGoal: (input: GoalInput) => Promise<void>;
  updateGoal: (id: string, input: GoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, amount: number, date: string) => Promise<void>;
}

/** Loads the user's savings goals with total saved, plus mutations. */
export function useSavingsGoals(): UseSavingsGoalsResult {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [goalsRes, contributionsRes] = await Promise.all([
      supabase.from('savings_goals').select('*').order('created_at'),
      supabase.from('savings_contributions').select('goal_id, amount'),
    ]);

    const firstError = goalsRes.error ?? contributionsRes.error;
    if (firstError) {
      setError(firstError.message);
      setGoals([]);
      setLoading(false);
      return;
    }

    const savedByGoal = new Map<string, number>();
    for (const contribution of contributionsRes.data ?? []) {
      savedByGoal.set(
        contribution.goal_id,
        (savedByGoal.get(contribution.goal_id) ?? 0) + contribution.amount,
      );
    }

    setGoals(
      (goalsRes.data ?? []).map((goal) => {
        const saved = savedByGoal.get(goal.id) ?? 0;
        return { goal, saved, ratio: goal.target_amount > 0 ? saved / goal.target_amount : 0 };
      }),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createGoal = useCallback(
    async (input: GoalInput) => {
      // user_id is set by the database default (auth.uid()).
      const { error: insertError } = await supabase.from('savings_goals').insert(input);
      if (insertError) throw insertError;
      await refetch();
    },
    [refetch],
  );

  const updateGoal = useCallback(
    async (id: string, input: GoalInput) => {
      const { error: updateError } = await supabase
        .from('savings_goals')
        .update(input)
        .eq('id', id);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('savings_goals').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await refetch();
    },
    [refetch],
  );

  const addContribution = useCallback(
    async (goalId: string, amount: number, date: string) => {
      const { error: insertError } = await supabase
        .from('savings_contributions')
        .insert({ goal_id: goalId, amount, date });
      if (insertError) throw insertError;
      await refetch();
    },
    [refetch],
  );

  return {
    goals,
    loading,
    error,
    refetch,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
  };
}
