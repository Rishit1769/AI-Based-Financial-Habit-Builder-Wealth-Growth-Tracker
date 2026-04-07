export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-main text-sm font-bold tracking-tight">{title}</h3>
          {action && <div className="text-sub">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
