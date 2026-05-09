import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import TopHeader from './TopHeader.jsx';

export default function AppShell({ children, activeTitle, activeTab, navSections, onTabChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const motionKey = useMemo(() => activeTab, [activeTab]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--canvas)', color: 'var(--ink)' }}>
      <Sidebar
        activeTab={activeTab}
        navSections={navSections}
        onTabChange={(tab) => {
          onTabChange(tab);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[18rem]">
        <TopHeader title={activeTitle} onMenuClick={() => setSidebarOpen(true)} />

        <main className="px-5 pb-10 pt-3 md:px-10 md:pb-12 md:pt-5 xl:px-16 xl:pb-14 xl:pt-6">
          <AnimatePresence mode="wait">
            <motion.section
              key={motionKey}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.section>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
