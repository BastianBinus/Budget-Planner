import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Database } from './database.types';

export type Transaction = Database['public']['Tables']['transactions']['Row'];

/** Fields the form provides when creating or updating a transaction. */
export interface TransactionInput {
  amount: number;
  date: string;
  category_id: string | null;
  kind: 'income' | 'expense';
  note: string | null;
}

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

/** Loads and mutates the current user's transactions, newest first. */
export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setTransactions([]);
    } else {
      setTransactions(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createTransaction = useCallback(
    async (input: TransactionInput) => {
      // user_id is set by the database default (auth.uid()).
      const { error: insertError } = await supabase.from('transactions').insert(input);
      if (insertError) throw insertError;
      await refetch();
    },
    [refetch],
  );

  const updateTransaction = useCallback(
    async (id: string, input: TransactionInput) => {
      const { error: updateError } = await supabase
        .from('transactions')
        .update(input)
        .eq('id', id);
      if (updateError) throw updateError;
      await refetch();
    },
    [refetch],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('transactions').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await refetch();
    },
    [refetch],
  );

  return {
    transactions,
    loading,
    error,
    refetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
