import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const sizeStyles = {
  sm: 'size-4 border-2',
  md: 'size-6 border-[2.5px]',
  lg: 'size-10 border-[3px]',
} as const;

const labelSizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

type SpinnerSize = keyof typeof sizeStyles;

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  label?: string;
}

function Spinner({ size = 'md', label, className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      role="status"
      aria-label={label ?? 'Loading'}
      {...props}
    >
      <div
        className={cn(
          'rounded-full border-dark-400 border-t-gold-500 animate-spin',
          sizeStyles[size],
        )}
        aria-hidden="true"
      />
      {label && (
        <span className={cn('text-dark-200', labelSizeStyles[size])}>
          {label}
        </span>
      )}
    </div>
  );
}

export { Spinner };
export type { SpinnerProps, SpinnerSize };
