import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-dark-100 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-200 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'bg-dark-700 border border-dark-400 text-white rounded-lg px-3.5 py-2.5 text-sm w-full transition-colors duration-200 placeholder:text-dark-200',
              'focus:border-gold-500 focus:outline-hidden focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]',
              'disabled:opacity-50 disabled:pointer-events-none',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-200">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-xs text-dark-200">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
