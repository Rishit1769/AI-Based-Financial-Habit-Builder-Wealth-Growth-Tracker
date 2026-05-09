import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Habits from './pages/Habits';
import SavingsGoals from './pages/SavingsGoals';
import Investments from './pages/Investments';
import AIAdvisor from './pages/AIAdvisor';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';
import Layout from './components/layout/Layout';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--lifted-surface)',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: '40px',
                fontSize: '13px',
                padding: '12px 16px',
                boxShadow: 'var(--atmospheric-shadow)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/income" element={<Income />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/savings" element={<SavingsGoals />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/ai-advisor" element={<AIAdvisor />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>

            <Route element={<AdminRoute />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
