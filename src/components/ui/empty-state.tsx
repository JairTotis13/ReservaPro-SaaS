import { type ReactNode, type HTMLAttributes } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12',
        className,
      )}
      {...props}
    >
      {Icon && (
        <div className="flex items-center justify-center size-16 rounded-2xl bg-dark-500 border border-dark-400 mb-4">
          <Icon className="size-7 text-dark-200" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-dark-200 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
      {children}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
