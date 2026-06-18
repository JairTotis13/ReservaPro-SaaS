import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  danger: 'bg-danger/15 text-danger border border-danger/30',
  info: 'bg-info/15 text-info border border-info/30',
  gold: 'bg-gold-500/15 text-gold-500 border border-gold-500/30',
} as const;

const dotColors = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  gold: 'bg-gold-500',
} as const;

const sizeStyles = {
  sm: 'px-1.5 py-px text-[10px] gap-1',
  md: 'px-2.5 py-0.5 text-xs gap-1.5',
} as const;

type BadgeVariant = keyof typeof variantStyles;
type BadgeSize = keyof typeof sizeStyles;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotColor?: BadgeVariant;
  children: ReactNode;
}

function Badge({
  variant = 'info',
  size = 'md',
  dot = false,
  dotColor,
  className,
  children,
  ...props
}: BadgeProps) {
  const dotVariant = dotColor ?? variant;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium uppercase tracking-wider',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('inline-block rounded-full shrink-0', dotColors[dotVariant], size === 'sm' ? 'size-1.5' : 'size-2')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
