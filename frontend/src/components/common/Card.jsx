export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-main text-sm font-semibold">{title}</h3>
          {action && <div className="text-sub">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
