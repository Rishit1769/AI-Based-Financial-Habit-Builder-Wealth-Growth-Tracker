import { FaShieldHalved, FaXmark } from 'react-icons/fa6';

function SidebarLink({ item, active, onSelect }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      className="radius-pill flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all"
      style={{
        background: active ? 'var(--nav-active-bg)' : 'transparent',
        color: active ? 'var(--nav-active-text)' : 'var(--muted-ink)',
        fontWeight: active ? 700 : 500,
      }}
      onClick={() => onSelect(item.id)}
    >
      <Icon className="text-[0.92rem]" />
      <span>{item.label}</span>
    </button>
  );
}

export default function Sidebar({ navSections, activeTab, onTabChange, open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col border-r transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          borderColor: 'var(--border)',
          background: 'color-mix(in srgb, var(--lifted-surface) 74%, transparent)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
        }}
      >
        <div className="flex h-24 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-10" aria-hidden="true">
              <span
                className="radius-circle absolute left-0 top-0 h-6 w-6"
                style={{ background: '#eb001b', opacity: 0.9 }}
              />
              <span
                className="radius-circle absolute left-[14px] top-0 h-6 w-6"
                style={{ background: '#f79e1b', opacity: 0.9 }}
              />
            </div>
            <span className="wealth-display text-[1.58rem] font-extrabold">WealthGrow</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="radius-circle flex h-9 w-9 items-center justify-center lg:hidden"
            style={{ border: '1px solid var(--border)', color: 'var(--muted-ink)' }}
            aria-label="Close sidebar"
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        <nav className="flex-1 space-y-9 overflow-y-auto px-5 pb-7 pt-6">
          {navSections.map((section) => (
            <section key={section.label} className="space-y-3">
              <p className="eyebrow flex items-center gap-2 px-1" style={{ color: 'var(--muted-ink)' }}>
                <span
                  className="radius-circle h-2 w-2"
                  style={{ background: section.label === 'Core Portfolio' ? 'var(--signal)' : 'var(--growth)' }}
                />
                {section.label}
              </p>

              <div className="space-y-2">
                {section.items.map((item) => (
                  <SidebarLink
                    key={item.id}
                    item={item}
                    active={item.id === activeTab}
                    onSelect={onTabChange}
                  />
                ))}
              </div>
            </section>
          ))}
        </nav>

        <div className="px-5 pb-6">
          <div
            className="card-stadium flex items-center gap-3 px-4 py-3"
            style={{ boxShadow: 'none', borderColor: 'var(--border)' }}
          >
            <span
              className="radius-circle flex h-8 w-8 items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--growth) 16%, transparent)', color: 'var(--growth)' }}
            >
              <FaShieldHalved className="text-sm" />
            </span>
            <div>
              <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
                Status
              </p>
              <p className="text-sm font-semibold">Institutional Grade</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
