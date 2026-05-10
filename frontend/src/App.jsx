import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaArrowRightArrowLeft,
  FaChartLine,
  FaChartPie,
  FaFileLines,
  FaGear,
  FaListCheck,
  FaRobot,
} from 'react-icons/fa6';
import AppShell from './components/layout/AppShell.jsx';
import { apiRequest } from './services/api.js';
import AllocationView from './views/AllocationView.jsx';
import AdvisorView from './views/AdvisorView.jsx';
import HabitsView from './views/HabitsView.jsx';
import OverviewView from './views/OverviewView.jsx';
import ReportsView from './views/ReportsView.jsx';
import SettingsView from './views/SettingsView.jsx';
import TransactionsView from './views/TransactionsView.jsx';
import LoginView from './views/auth/LoginView.jsx';
import RegisterView from './views/auth/RegisterView.jsx';
import VerifyOtpView from './views/auth/VerifyOtpView.jsx';

const AUTH_STORAGE_KEY = 'wealthgrow.auth';
const PENDING_REGISTRATION_KEY = 'wealthgrow.pending-registration';

const readJsonStorage = (key, fallback) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
};

const writeJsonStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const removeStorage = (key) => {
  localStorage.removeItem(key);
};

const navSections = [
  {
    label: 'Core Portfolio',
    items: [
      { id: 'overview', label: 'Overview', icon: FaChartLine },
      { id: 'habits', label: 'Habit Builder', icon: FaListCheck },
      { id: 'advisor', label: 'AI Advisor', icon: FaRobot },
      { id: 'allocation', label: 'Asset Allocation', icon: FaChartPie },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'transactions', label: 'Transactions', icon: FaArrowRightArrowLeft },
      { id: 'reports', label: 'Reports', icon: FaFileLines },
      { id: 'settings', label: 'Settings', icon: FaGear },
    ],
  },
];

export default function App() {
  const [auth, setAuth] = useState(() => readJsonStorage(AUTH_STORAGE_KEY, null));
  const [pendingRegistration, setPendingRegistration] = useState(() =>
    readJsonStorage(PENDING_REGISTRATION_KEY, null)
  );
  const [authScreen, setAuthScreen] = useState(() => {
    if (readJsonStorage(AUTH_STORAGE_KEY, null)?.accessToken) {
      return 'authenticated';
    }
    if (readJsonStorage(PENDING_REGISTRATION_KEY, null)) {
      return 'otp';
    }
    return 'login';
  });

  const [user, setUser] = useState(() => readJsonStorage(AUTH_STORAGE_KEY, null)?.user || null);
  const [isRestoringSession, setIsRestoringSession] = useState(Boolean(auth?.accessToken));

  const [activeTab, setActiveTab] = useState('overview');

  const persistAuth = useCallback((nextAuth) => {
    setAuth(nextAuth);
    setUser(nextAuth?.user || null);
    if (nextAuth) {
      writeJsonStorage(AUTH_STORAGE_KEY, nextAuth);
      setAuthScreen('authenticated');
      return;
    }
    removeStorage(AUTH_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!auth?.accessToken) {
      setIsRestoringSession(false);
      return;
    }

    let mounted = true;
    const loadProfile = async () => {
      try {
        const result = await apiRequest('/users/profile', {
          token: auth.accessToken,
        });
        if (!mounted) {
          return;
        }
        const nextAuth = {
          ...auth,
          user: result.data,
        };
        setAuth(nextAuth);
        setUser(result.data);
        writeJsonStorage(AUTH_STORAGE_KEY, nextAuth);
        setAuthScreen('authenticated');
      } catch {
        if (!mounted) {
          return;
        }
        persistAuth(null);
        setAuthScreen('login');
      } finally {
        if (mounted) {
          setIsRestoringSession(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [auth?.accessToken, persistAuth]);

  const handleLogout = useCallback(async () => {
    try {
      if (auth?.refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: { refreshToken: auth.refreshToken },
        });
      }
    } catch {
      // Logout should always clear local session even if API call fails.
    } finally {
      persistAuth(null);
      setPendingRegistration(null);
      removeStorage(PENDING_REGISTRATION_KEY);
      setAuthScreen('login');
    }
  }, [auth?.refreshToken, persistAuth]);

  const handleLogin = useCallback(
    async (credentials) => {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: credentials,
      });

      const session = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      };
      persistAuth(session);
      removeStorage(PENDING_REGISTRATION_KEY);
      setPendingRegistration(null);
      return response.message;
    },
    [persistAuth]
  );

  const handleRequestOtp = useCallback(async (registrationData) => {
    await apiRequest('/auth/send-otp', {
      method: 'POST',
      body: {
        name: registrationData.name,
        email: registrationData.email,
      },
    });

    setPendingRegistration(registrationData);
    writeJsonStorage(PENDING_REGISTRATION_KEY, registrationData);
    setAuthScreen('otp');
  }, []);

  const handleVerifyOtp = useCallback(
    async (otp) => {
      if (!pendingRegistration) {
        throw new Error('Registration session expired. Please start again.');
      }

      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: {
          ...pendingRegistration,
          otp,
        },
      });

      const session = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      };
      persistAuth(session);
      setPendingRegistration(null);
      removeStorage(PENDING_REGISTRATION_KEY);
      return response.message;
    },
    [pendingRegistration, persistAuth]
  );

  const handleResendOtp = useCallback(async () => {
    if (!pendingRegistration) {
      throw new Error('Registration session expired. Please start again.');
    }
    await apiRequest('/auth/send-otp', {
      method: 'POST',
      body: {
        name: pendingRegistration.name,
        email: pendingRegistration.email,
      },
    });
    return 'OTP sent again successfully';
  }, [pendingRegistration]);

  const handleUserUpdated = useCallback((nextUserProfile) => {
    setUser(nextUserProfile);
    setAuth((current) => {
      if (!current) {
        return current;
      }
      const nextAuth = {
        ...current,
        user: {
          ...current.user,
          ...nextUserProfile,
        },
      };
      writeJsonStorage(AUTH_STORAGE_KEY, nextAuth);
      return nextAuth;
    });
  }, []);

  const activeLabel = useMemo(() => {
    for (const section of navSections) {
      const found = section.items.find((item) => item.id === activeTab);
      if (found) {
        return found.label;
      }
    }
    return 'Overview';
  }, [activeTab]);

  if (isRestoringSession) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6" style={{ color: 'var(--muted-ink)' }}>
        Restoring your secure session...
      </div>
    );
  }

  if (!auth?.accessToken || authScreen !== 'authenticated') {
    if (authScreen === 'register') {
      return (
        <RegisterView
          onRequestOtp={handleRequestOtp}
          onSwitchToLogin={() => setAuthScreen('login')}
        />
      );
    }

    if (authScreen === 'otp') {
      return (
        <VerifyOtpView
          pendingRegistration={pendingRegistration}
          onVerifyOtp={handleVerifyOtp}
          onResendOtp={handleResendOtp}
          onBackToRegister={() => {
            setAuthScreen('register');
          }}
        />
      );
    }

    return (
      <LoginView
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthScreen('register')}
      />
    );
  }

  return (
    <AppShell
      activeTab={activeTab}
      activeTitle={activeLabel}
      navSections={navSections}
      onTabChange={setActiveTab}
      user={user}
      onLogout={handleLogout}
      accessToken={auth.accessToken}
    >
      {activeTab === 'overview' && (
        <OverviewView
          accessToken={auth.accessToken}
          user={user}
          onGenerateReport={() => setActiveTab('reports')}
        />
      )}
      {activeTab === 'habits' && <HabitsView accessToken={auth.accessToken} />}
      {activeTab === 'advisor' && <AdvisorView accessToken={auth.accessToken} />}
      {activeTab === 'transactions' && <TransactionsView accessToken={auth.accessToken} />}
      {activeTab === 'reports' && <ReportsView accessToken={auth.accessToken} />}
      {activeTab === 'settings' && (
        <SettingsView accessToken={auth.accessToken} onUserUpdated={handleUserUpdated} />
      )}
      {activeTab === 'allocation' && <AllocationView accessToken={auth.accessToken} />}
      {!['overview', 'habits', 'advisor', 'transactions', 'reports', 'settings', 'allocation'].includes(activeTab) && (
        <section className="card-stadium px-8 py-14 md:px-12 md:py-16">
          <p className="eyebrow">Editorial Wealth</p>
          <h2 className="wealth-display mt-3 text-5xl font-extrabold">{activeLabel}</h2>
          <p className="mt-5 max-w-xl text-base" style={{ color: 'var(--muted-ink)' }}>
            This section will be connected to your live platform data while preserving the same institutional
            visual language.
          </p>
        </section>
      )}
    </AppShell>
  );
}
