import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-dark-600 border border-dark-500 rounded-xl hover:border-dark-400 transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

function CardHeader({ title, description, action, className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col gap-1 px-6 pt-6 pb-0', className)}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-2">
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {description && (
        <p className="text-sm text-dark-200">{description}</p>
      )}
      {children}
    </div>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-6 pb-6 pt-0 border-t border-dark-500 mt-auto',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps };
