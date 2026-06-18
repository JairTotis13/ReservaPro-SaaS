import { type ButtonHTMLAttributes, type ReactNode, forwardRef, isValidElement, cloneElement } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantStyles = {
  primary:
    'bg-linear-to-br from-amber-500 to-gold-500 text-dark-900 font-semibold transition-all duration-300 hover:from-gold-500 hover:to-gold-400 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
  secondary:
    'bg-dark-500 border border-dark-400 text-white hover:bg-dark-400 hover:border-dark-300 transition-colors focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
  outline:
    'border border-gold-500 text-gold-500 bg-transparent hover:bg-gold-500/10 hover:border-gold-400 transition-all focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
  ghost:
    'text-dark-100 hover:bg-dark-600 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
  danger:
    'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25 hover:border-danger/50 transition-colors focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
} as const;

const sizeStyles = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-lg gap-2.5',
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      asChild = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const mergedClassName = cn(
      'inline-flex items-center justify-center font-medium whitespace-nowrap select-none disabled:opacity-50 disabled:pointer-events-none',
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    const spinner = loading ? (
      <Loader2
        className={cn('animate-spin shrink-0', size === 'sm' ? 'size-3' : 'size-4')}
        aria-hidden="true"
      />
    ) : null;

    if (asChild && isValidElement(children)) {
      const childProps = children.props as Record<string, unknown>;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return cloneElement(children as any, {
        ...props,
        className: cn(mergedClassName, childProps.className as string | undefined),
        ref,
        children: (
          <>
            {spinner}
            {childProps.children}
          </>
        ),
      } as any);
      /* eslint-enable @typescript-eslint/no-explicit-any */
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={mergedClassName}
        {...props}
      >
        {spinner}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonVariant, ButtonSize };
