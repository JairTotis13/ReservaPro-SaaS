'use client';

import {
  type ReactNode,
  type HTMLAttributes,
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>');
  return ctx;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  defaultValue?: never;
  children: ReactNode;
  className?: string;
}

function Tabs({ value, onChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 border-b border-dark-500',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

function Tab({ value, className, children, ...props }: TabProps) {
  const { value: selectedValue, onChange } = useTabsContext();
  const isSelected = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={() => onChange(value)}
      className={cn(
        'relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
        'focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1 focus-visible:ring-offset-dark-900',
        isSelected ? 'text-gold-500' : 'text-dark-200 hover:text-white',
        className,
      )}
      {...props}
    >
      {children}
      {isSelected && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-amber-500 to-gold-500 rounded-full" />
      )}
    </button>
  );
}

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

function TabPanel({ value, className, children, ...props }: TabPanelProps) {
  const { value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('pt-4 focus-visible:outline-hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface UncontrolledTabsProps {
  defaultValue: string;
  onChange?: (value: string) => void;
  value?: never;
  children: ReactNode;
  className?: string;
}

function UncontrolledTabs({
  defaultValue,
  onChange: onExternalChange,
  children,
  className,
}: UncontrolledTabsProps) {
  const [value, setValue] = useState(defaultValue);

  const onChange = useCallback(
    (v: string) => {
      setValue(v);
      onExternalChange?.(v);
    },
    [onExternalChange],
  );

  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export { Tabs, UncontrolledTabs, TabsList, Tab, TabPanel };
export type { TabsProps, UncontrolledTabsProps, TabsListProps, TabProps, TabPanelProps };
