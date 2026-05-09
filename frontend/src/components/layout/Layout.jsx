import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const PAGE_TITLES = [
  { path: '/dashboard', title: 'Overview' },
  { path: '/habits', title: 'Habit Builder' },
  { path: '/ai-advisor', title: 'AI Intelligence' },
  { path: '/investments', title: 'Asset Allocation' },
  { path: '/expenses', title: 'Transactions' },
  { path: '/profile', title: 'Settings' },
  { path: '/settings', title: 'Settings' },
  { path: '/income', title: 'Income' },
  { path: '/reports', title: 'Reports' },
  { path: '/notifications', title: 'Notifications' },
  { path: '/savings', title: 'Savings Goals' },
  { path: '/admin', title: 'Administration' },
];

function resolvePageTitle(pathname) {
  const found = PAGE_TITLES.find((entry) => pathname.startsWith(entry.path));
  return found?.title || 'Overview';
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = resolvePageTitle(location.pathname);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--canvas)', color: 'var(--ink)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen lg:pl-[15.5rem]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={pageTitle} />
        <main className="px-5 pb-10 pt-0 md:px-10 md:pt-0">
          <AnimatePresence mode="wait">
            <motion.section
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.section>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
