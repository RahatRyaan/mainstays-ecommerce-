import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-textPrimary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`h-11 w-full rounded-lg border border-border bg-surface px-4 py-2 text-base text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow disabled:opacity-50 disabled:bg-gray-50 ${
            error ? 'border-danger focus:ring-danger' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-sm text-danger mt-1">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
