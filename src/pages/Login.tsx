import { useState, type FormEvent } from 'react';
import { LoaderCircle, Mail } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function Login() {
  const { signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const disabled = !isSupabaseConfigured || status === 'sending';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    setStatus('sending');
    setErrorMessage('');
    try {
      await signInWithOtp(email.trim());
      setStatus('sent');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Senden fehlgeschlagen. Bitte erneut versuchen.',
      );
      setStatus('error');
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg text-accent">
            <Mail size={24} strokeWidth={2} />
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-text">BudgetPlanner</h1>
          <p className="mt-1 text-sm text-muted">
            Melde dich passwortlos per Magic-Link an.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="rounded-card border border-border bg-bg p-4 text-center text-sm text-text">
            <p className="font-semibold text-accent">Prüfe dein Postfach</p>
            <p className="mt-1 text-muted">
              Wir haben dir einen Anmelde-Link an <span className="text-text">{email}</span> gesendet.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-text">E-Mail-Adresse</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="du@beispiel.de"
                disabled={disabled}
                className="rounded-card border border-border bg-bg px-3 py-2.5 text-text outline-none transition-colors placeholder:text-muted focus:border-accent disabled:opacity-60"
              />
            </label>

            {status === 'error' && (
              <p className="text-sm text-over" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={disabled}
              className="flex items-center justify-center gap-2 rounded-card bg-accent px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'sending' ? (
                <>
                  <LoaderCircle size={18} strokeWidth={2} className="animate-spin" />
                  Wird gesendet…
                </>
              ) : (
                <>
                  <Mail size={18} strokeWidth={2} />
                  Magic-Link senden
                </>
              )}
            </button>

            {!isSupabaseConfigured && (
              <p className="text-center text-xs text-muted">
                Supabase ist noch nicht verbunden. Hinterlege die Zugangsdaten in einer
                .env-Datei, um dich anzumelden.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
