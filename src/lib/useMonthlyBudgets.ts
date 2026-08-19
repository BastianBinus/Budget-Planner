import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { monthRange } from './month';
import type { Category } from './useCategories';

/** One expense category with its monthly limit and actual spending. */
export interface BudgetRow {
  category: Category;
  limit: number | null;
  spent: number;
  /** spent / limit, or null when no limit is set. */
  ratio: number | null;
  /** limit - spent, or null when no limit is set. */
  remaining: number | null;
}

export interface MonthlyBudgetsResult {
  rows: BudgetRow[];
  totalLimit: number;
  totalSpent: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setLimit: (categoryId: string, amount: number) => Promise<void>;
  removeLimit: (categoryId: string) => Promise<void>;
}

/**
 * Loads expense categories for a month together with their budget limit and
 * the sum of expenses booked in that month.
 */
export function useMonthlyBudgets(month: string): MonthlyBudgetsResult {
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { start, end } = monthRange(month);

    const [categoriesRes, budgetsRes, transactionsRes] = await Promise.all([
      supabase.from('categories').select('*').eq('kind', 'expense').order('sort_order'),
      supabase.from('budgets').select('category_id, limit_amount').eq('month', month),
      supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('kind', 'expense')
        .gte('date', start)
        .lt('date', end),
    ]);

    const firstError = categoriesRes.error ?? budgetsRes.error ?? transactionsRes.error;
    if (firstError) {
      setError(firstError.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const limitByCategory = new Map<string, number>();
    for (const budget of budgetsRes.data ?? []) {
      limitByCategory.set(budget.category_id, budget.limit_amount);
    }

    const spentByCategory = new Map<string, number>();
    for (const tx of transactionsRes.data ?? []) {
      if (!tx.category_id) continue;
      spentByCategory.set(tx.category_id, (spentByCategory.get(tx.category_id) ?? 0) + tx.amount);
    }

    const nextRows: BudgetRow[] = (categoriesRes.data ?? []).map((category) => {
      const limit = limitByCategory.has(category.id) ? limitByCategory.get(category.id)! : null;
      const spent = spentByCategory.get(category.id) ?? 0;
      return {
        category,
        limit,
        spent,
        ratio: limit && limit > 0 ? spent / limit : null,
        remaining: limit !== null ? limit - spent : null,
      };
    });

    setRows(nextRows);
    setLoading(false);
  }, [month]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const setLimit = useCallback(
    async (categoryId: string, amount: number) => {
      const { data: existing, error: lookupError } = await supabase
        .from('budgets')
        .select('id')
        .eq('category_id', categoryId)
        .eq('month', month)
        .maybeSingle();
      if (lookupError) throw lookupError;

      if (existing) {
        const { error: updateError } = await supabase
          .from('budgets')
          .update({ limit_amount: amount })
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        // user_id is set by the database default (auth.uid()).
        const { error: insertError } = await supabase
          .from('budgets')
          .insert({ category_id: categoryId, month, limit_amount: amount });
        if (insertError) throw insertError;
      }
      await refetch();
    },
    [month, refetch],
  );

  const removeLimit = useCallback(
    async (categoryId: string) => {
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('category_id', categoryId)
        .eq('month', month);
      if (deleteError) throw deleteError;
      await refetch();
    },
    [month, refetch],
  );

  const totalLimit = rows.reduce((sum, row) => sum + (row.limit ?? 0), 0);
  const totalSpent = rows.reduce((sum, row) => sum + row.spent, 0);

  return { rows, totalLimit, totalSpent, loading, error, refetch, setLimit, removeLimit };
}
