import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, LoaderCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

type Mode = 'signin' | 'signup';
type Status = 'idle' | 'submitting' | 'error' | 'confirm';

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        // With email confirmation off the auth listener logs the user straight
        // in; if it is on, no session exists yet, so show a hint.
        setStatus('confirm');
      } else {
        await signIn(email.trim(), password);
        // On success the auth listener swaps this screen for the app.
      }
    } catch (error) {
      setErrorMessage(translateError(error));
      setStatus('error');
    }
  }

  function selectMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setStatus('idle');
    setErrorMessage('');
    setPassword('');
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
            {mode === 'signin'
              ? 'Willkommen zurück – melde dich an.'
              : 'Neu hier? Erstelle dein Konto.'}
          </p>
        </div>

        {/* Segmented control: makes the active mode unmistakable */}
        <div
          role="tablist"
          aria-label="Anmelden oder Registrieren"
          className="mb-6 grid grid-cols-2 gap-1 rounded-card border border-border bg-bg p-1"
        >
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => selectMode(m)}
              className={`rounded-[10px] py-2 text-sm font-semibold transition-colors ${
                mode === m ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              {m === 'signin' ? 'Anmelden' : 'Registrieren'}
            </button>
          ))}
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
              onClick={() => selectMode('signin')}
              className="mt-3 font-semibold text-accent hover:underline"
            >
              Zur Anmeldung
            </button>
          </div>
        ) : (
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === 'signup' ? 'Mindestens 6 Zeichen' : 'Dein Passwort'}
                  disabled={disabled}
                  className="w-full bg-transparent py-2.5 text-text outline-none placeholder:text-muted disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  className="shrink-0 text-muted transition-colors hover:text-text"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2} />
                  ) : (
                    <Eye size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
              {mode === 'signup' && (
                <span className="text-xs text-muted">Wähle ein Passwort mit mindestens 6 Zeichen.</span>
              )}
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
                Supabase ist noch nicht verbunden. Hinterlege die Zugangsdaten in einer .env-Datei,
                um dich anzumelden.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

/** Map common Supabase auth errors to friendly German messages. */
function translateError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/invalid login credentials/i.test(message)) {
    return 'E-Mail oder Passwort ist falsch.';
  }
  if (/user already registered/i.test(message)) {
    return 'Für diese E-Mail existiert bereits ein Konto. Melde dich stattdessen an.';
  }
  if (/password should be at least/i.test(message)) {
    return 'Das Passwort muss mindestens 6 Zeichen haben.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'E-Mail noch nicht bestätigt. Prüfe dein Postfach.';
  }
  return message || 'Etwas ist schiefgelaufen. Bitte erneut versuchen.';
}
