import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-2)', letterSpacing: '0.02em' }}>{label}</label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
        </div>
      )}
      <input
        ref={ref}
        className={`field ${error ? '!border-rose-500 focus:!shadow-rose-500/20' : ''} ${Icon ? 'pl-9' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--danger)' }}>{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
