export default function Button({
  children, onClick, type = 'button', variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '', icon: Icon,
}) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white focus-visible:ring-indigo-500',
    secondary: 'bg-elevated border border-base hover:bg-hover text-main focus-visible:ring-indigo-400',
    danger:    'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white focus-visible:ring-rose-500',
    ghost:     'text-sub hover:text-main hover:bg-elevated focus-visible:ring-indigo-400',
    success:   'bg-emerald-600 hover:bg-emerald-500 text-white focus-visible:ring-emerald-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
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
