import { useMemo, useState } from 'react';
import {
  FaArrowRightArrowLeft,
  FaChartLine,
  FaChartPie,
  FaGear,
  FaListCheck,
  FaRobot,
} from 'react-icons/fa6';
import AppShell from './components/layout/AppShell.jsx';
import AdvisorView from './views/AdvisorView.jsx';
import HabitsView from './views/HabitsView.jsx';
import OverviewView from './views/OverviewView.jsx';

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
      { id: 'settings', label: 'Settings', icon: FaGear },
    ],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const activeLabel = useMemo(() => {
    for (const section of navSections) {
      const found = section.items.find((item) => item.id === activeTab);
      if (found) {
        return found.label;
      }
    }
    return 'Overview';
  }, [activeTab]);

  return (
    <AppShell
      activeTab={activeTab}
      activeTitle={activeLabel}
      navSections={navSections}
      onTabChange={setActiveTab}
    >
      {activeTab === 'overview' && <OverviewView />}
      {activeTab === 'habits' && <HabitsView />}
      {activeTab === 'advisor' && <AdvisorView />}
      {!['overview', 'habits', 'advisor'].includes(activeTab) && (
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
