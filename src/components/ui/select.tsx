import { type SelectHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      leftIcon,
      className,
      id: externalId,
      ...props
    },
    ref,
  ) => {
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
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-200 pointer-events-none z-10">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'bg-dark-700 border border-dark-400 text-white rounded-lg px-3.5 py-2.5 text-sm w-full transition-colors duration-200 appearance-none cursor-pointer',
              'focus:border-gold-500 focus:outline-hidden focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]',
              'disabled:opacity-50 disabled:pointer-events-none',
              leftIcon && 'pl-10',
              'pr-10',
              error && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-dark-700 text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-dark-200 pointer-events-none">
            <ChevronDown className="size-4" />
          </span>
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

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
