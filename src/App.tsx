import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { ThemeProvider } from './lib/theme';
import { AuthProvider, useAuth } from './lib/auth';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budget } from './pages/Budget';
import { Goals } from './pages/Goals';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'budget', element: <Budget /> },
      { path: 'goals', element: <Goals /> },
    ],
  },
]);

function Splash() {
  return (
    <div className="flex min-h-full items-center justify-center bg-bg text-accent">
      <LoaderCircle size={32} strokeWidth={2} className="animate-spin" />
    </div>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) return <Splash />;
  if (!session) return <Login />;
  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
