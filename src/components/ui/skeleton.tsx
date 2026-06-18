import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'shimmer',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded-md h-4',
        variant === 'rectangular' && 'rounded-lg',
        className,
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
