import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface SignUpParams {
  displayName: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** Accepts a display name or an email address as the identifier. */
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (identifier: string, password: string) => {
        let email = identifier.trim();
        // If the identifier is not an email, resolve the display name to the
        // account's email via a pre-auth lookup.
        if (!email.includes('@')) {
          const { data, error } = await supabase.rpc('email_for_username', { uname: email });
          if (error) throw error;
          if (!data) throw new Error('Kein Konto mit diesem Anzeigenamen gefunden.');
          email = data;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async ({ displayName, email, password }: SignUpParams) => {
        const uname = displayName.trim();
        const { data: available, error: lookupError } = await supabase.rpc('username_available', {
          uname,
        });
        if (lookupError) throw lookupError;
        if (!available) throw new Error('Dieser Anzeigename ist bereits vergeben.');
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: uname } },
        });
        if (error) throw error;
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
