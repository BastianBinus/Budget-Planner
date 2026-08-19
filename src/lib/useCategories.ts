import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Database } from './database.types';

export type Category = Database['public']['Tables']['categories']['Row'];

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** Loads the current user's categories, ordered by kind then sort_order. */
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('categories')
      .select('*')
      .order('kind', { ascending: true })
      .order('sort_order', { ascending: true });

    if (queryError) {
      setError(queryError.message);
      setCategories([]);
    } else {
      setCategories(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { categories, loading, error, refetch };
}
