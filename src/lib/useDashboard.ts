import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { addMonths } from './month';
import type { Category } from './useCategories';
import type { Database } from './database.types';

type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'];

export interface CategorySpend {
  id: string;
  name: string;
  color: string;
  amount: number;
}

export interface MonthlySpend {
  month: string;
  label: string;
  total: number;
}

export interface BudgetBar {
  category: Category;
  limit: number;
  spent: number;
  ratio: number;
}

export interface GoalProgress {
  goal: SavingsGoal;
  saved: number;
  ratio: number;
}

export interface DashboardData {
  incomeTotal: number;
  expenseTotal: number;
  remaining: number;
  byCategory: CategorySpend[];
  trend: MonthlySpend[];
  budgetBars: BudgetBar[];
  goals: GoalProgress[];
}

interface UseDashboardResult extends DashboardData {
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const shortMonthFormatter = new Intl.DateTimeFormat('de-DE', { month: 'short' });

function monthLabel(monthIso: string): string {
  const [year, month] = monthIso.split('-').map(Number);
  return shortMonthFormatter.format(new Date(year, month - 1, 1));
}

const EMPTY: DashboardData = {
  incomeTotal: 0,
  expenseTotal: 0,
  remaining: 0,
  byCategory: [],
  trend: [],
  budgetBars: [],
  goals: [],
};

/** Aggregates everything the dashboard shows for a given month. */
export function useDashboard(month: string): UseDashboardResult {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const monthStart = month;
    const monthEnd = addMonths(month, 1);
    const windowStart = addMonths(month, -5);

    const [categoriesRes, budgetsRes, transactionsRes, goalsRes, contributionsRes] =
      await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('budgets').select('category_id, limit_amount').eq('month', month),
        supabase
          .from('transactions')
          .select('date, amount, kind, category_id')
          .gte('date', windowStart)
          .lt('date', monthEnd),
        supabase.from('savings_goals').select('*').order('created_at'),
        supabase.from('savings_contributions').select('goal_id, amount'),
      ]);

    const firstError =
      categoriesRes.error ??
      budgetsRes.error ??
      transactionsRes.error ??
      goalsRes.error ??
      contributionsRes.error;
    if (firstError) {
      setError(firstError.message);
      setData(EMPTY);
      setLoading(false);
      return;
    }

    const categories = categoriesRes.data ?? [];
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const transactions = transactionsRes.data ?? [];

    // Current-month totals and expense breakdown by category.
    let incomeTotal = 0;
    let expenseTotal = 0;
    const spentByCategory = new Map<string, number>();
    let uncategorized = 0;

    for (const tx of transactions) {
      if (tx.date < monthStart || tx.date >= monthEnd) continue;
      if (tx.kind === 'income') {
        incomeTotal += tx.amount;
      } else {
        expenseTotal += tx.amount;
        if (tx.category_id) {
          spentByCategory.set(tx.category_id, (spentByCategory.get(tx.category_id) ?? 0) + tx.amount);
        } else {
          uncategorized += tx.amount;
        }
      }
    }

    const byCategory: CategorySpend[] = [];
    for (const [categoryId, amount] of spentByCategory) {
      const category = categoryById.get(categoryId);
      if (!category) continue;
      byCategory.push({ id: category.id, name: category.name, color: category.color, amount });
    }
    if (uncategorized > 0) {
      byCategory.push({ id: 'none', name: 'Ohne Kategorie', color: '#94a3b8', amount: uncategorized });
    }
    byCategory.sort((a, b) => b.amount - a.amount);

    // Six-month expense trend (oldest to current).
    const trend: MonthlySpend[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const bucketStart = addMonths(month, -i);
      const bucketEnd = addMonths(bucketStart, 1);
      let total = 0;
      for (const tx of transactions) {
        if (tx.kind === 'expense' && tx.date >= bucketStart && tx.date < bucketEnd) {
          total += tx.amount;
        }
      }
      trend.push({ month: bucketStart, label: monthLabel(bucketStart), total });
    }

    // Budget bars for categories that have a limit this month.
    const budgetBars: BudgetBar[] = [];
    for (const budget of budgetsRes.data ?? []) {
      const category = categoryById.get(budget.category_id);
      if (!category) continue;
      const spent = spentByCategory.get(budget.category_id) ?? 0;
      const limit = budget.limit_amount;
      budgetBars.push({ category, limit, spent, ratio: limit > 0 ? spent / limit : 0 });
    }
    budgetBars.sort((a, b) => a.category.sort_order - b.category.sort_order);

    // Savings goals with total saved so far.
    const savedByGoal = new Map<string, number>();
    for (const contribution of contributionsRes.data ?? []) {
      savedByGoal.set(
        contribution.goal_id,
        (savedByGoal.get(contribution.goal_id) ?? 0) + contribution.amount,
      );
    }
    const goals: GoalProgress[] = (goalsRes.data ?? []).map((goal) => {
      const saved = savedByGoal.get(goal.id) ?? 0;
      return { goal, saved, ratio: goal.target_amount > 0 ? saved / goal.target_amount : 0 };
    });

    setData({
      incomeTotal,
      expenseTotal,
      remaining: incomeTotal - expenseTotal,
      byCategory,
      trend,
      budgetBars,
      goals,
    });
    setLoading(false);
  }, [month]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { ...data, loading, error, refetch };
}
