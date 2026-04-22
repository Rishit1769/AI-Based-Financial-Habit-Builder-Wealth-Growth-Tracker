export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-ink)' }}>
          <h3 className="text-[var(--color-ink)] text-sm font-semibold tracking-tight">{title}</h3>
          {action && <div className="text-sub">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
