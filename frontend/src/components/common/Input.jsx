import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-sub text-xs font-medium">{label}</label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon className="w-3.5 h-3.5 text-muted" />
        </div>
      )}
      <input
        ref={ref}
        className={`field ${error ? '!border-rose-500 focus:!shadow-rose-500/20' : ''} ${Icon ? 'pl-9' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
