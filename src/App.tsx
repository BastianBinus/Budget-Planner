import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import { AppLayout } from './components/AppLayout';
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

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
