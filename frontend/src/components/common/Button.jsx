export default function Button({
  children, onClick, type = 'button', variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '', icon: Icon,
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-40 disabled:cursor-not-allowed select-none tracking-tight';

  const variants = {
    primary:   'text-white hover:opacity-90 active:scale-[0.98]',
    secondary: 'border text-main hover:bg-[var(--elevated)]',
    danger:    'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white',
    ghost:     'text-sub hover:text-main hover:bg-[var(--elevated)]',
    success:   'bg-emerald-600 hover:bg-emerald-500 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm',
  };

  const primaryStyle = variant === 'primary'
    ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }
    : variant === 'secondary'
    ? { backgroundColor: 'var(--elevated)', borderColor: 'var(--border-2)' }
    : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={primaryStyle}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5" />
      ) : null}
      {children}
    </button>
  );
}
