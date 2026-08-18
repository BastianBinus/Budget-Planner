import { useState, type FormEvent } from 'react';
import { KeyRound, LoaderCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

type Mode = 'signin' | 'signup';
type Status = 'idle' | 'submitting' | 'error' | 'confirm';

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const busy = status === 'submitting';
  const disabled = !isSupabaseConfigured || busy;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    setStatus('submitting');
    setErrorMessage('');
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password);
        // If email confirmation is enabled no session is created yet; the
        // auth listener switches into the app automatically once a session
        // exists. Show a hint in case confirmation is still required.
        setStatus('confirm');
      } else {
        await signIn(email.trim(), password);
        // On success the auth listener replaces this screen with the app.
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
      );
      setStatus('error');
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStatus('idle');
    setErrorMessage('');
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg text-accent">
            <KeyRound size={24} strokeWidth={2} />
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-text">BudgetPlanner</h1>
          <p className="mt-1 text-sm text-muted">
            {mode === 'signin' ? 'Melde dich mit deinem Konto an.' : 'Erstelle ein neues Konto.'}
          </p>
        </div>

        {status === 'confirm' ? (
          <div className="rounded-card border border-border bg-bg p-4 text-center text-sm text-text">
            <p className="font-semibold text-accent">Konto erstellt</p>
            <p className="mt-1 text-muted">
              Falls die E-Mail-Bestätigung aktiv ist, bestätige den Link in deinem Postfach. Danach
              kannst du dich anmelden.
            </p>
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="mt-3 font-semibold text-accent hover:underline"
            >
              Zur Anmeldung
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-text">E-Mail-Adresse</span>
                <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
                  <Mail size={18} strokeWidth={2} className="shrink-0 text-muted" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="du@beispiel.de"
                    disabled={disabled}
                    className="w-full bg-transparent py-2.5 text-text outline-none placeholder:text-muted disabled:opacity-60"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-text">Passwort</span>
                <div className="flex items-center gap-2 rounded-card border border-border bg-bg px-3 focus-within:border-accent">
                  <Lock size={18} strokeWidth={2} className="shrink-0 text-muted" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    disabled={disabled}
                    className="w-full bg-transparent py-2.5 text-text outline-none placeholder:text-muted disabled:opacity-60"
                  />
                </div>
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
                {busy && <LoaderCircle size={18} strokeWidth={2} className="animate-spin" />}
                {mode === 'signin' ? 'Anmelden' : 'Konto erstellen'}
              </button>

              {!isSupabaseConfigured && (
                <p className="text-center text-xs text-muted">
                  Supabase ist noch nicht verbunden. Hinterlege die Zugangsdaten in einer
                  .env-Datei, um dich anzumelden.
                </p>
              )}
            </form>

            <p className="mt-5 text-center text-sm text-muted">
              {mode === 'signin' ? (
                <>
                  Noch kein Konto?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-semibold text-accent hover:underline"
                  >
                    Registrieren
                  </button>
                </>
              ) : (
                <>
                  Schon ein Konto?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="font-semibold text-accent hover:underline"
                  >
                    Anmelden
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
