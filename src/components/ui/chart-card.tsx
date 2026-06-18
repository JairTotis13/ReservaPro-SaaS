import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface ChartCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  loading?: boolean;
  children: ReactNode;
  action?: ReactNode;
}

function ChartCard({
  title,
  subtitle,
  loading = false,
  children,
  action,
  className,
  ...props
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'bg-dark-600 border border-dark-500 rounded-xl hover:border-dark-400 transition-colors p-5',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-dark-200">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton variant="rectangular" height={180} className="w-full" />
          <div className="flex justify-center gap-6">
            <Skeleton variant="text" width={80} height={14} />
            <Skeleton variant="text" width={80} height={14} />
            <Skeleton variant="text" width={80} height={14} />
          </div>
        </div>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  );
}

export { ChartCard };
export type { ChartCardProps };
