'use client';

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
  createdAt: number;
}

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  success: (opts: ToastOptions) => void;
  error: (opts: ToastOptions) => void;
  warning: (opts: ToastOptions) => void;
  info: (opts: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 text-success shrink-0" />,
  error: <AlertCircle className="size-4 text-danger shrink-0" />,
  warning: <AlertTriangle className="size-4 text-warning shrink-0" />,
  info: <Info className="size-4 text-info shrink-0" />,
};

const colorMap: Record<ToastVariant, string> = {
  success: 'border-l-success',
  error: 'border-l-danger',
  warning: 'border-l-warning',
  info: 'border-l-info',
};

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback(
    (variant: ToastVariant, opts: ToastOptions) => {
      const id = `toast-${++counterRef.current}-${Date.now()}`;
      const toast: Toast = {
        id,
        title: opts.title,
        description: opts.description,
        variant,
        duration: opts.duration ?? 5000,
        createdAt: Date.now(),
      };
      setToasts((prev) => [...prev, toast]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((opts: ToastOptions) => addToast('success', opts), [addToast]);
  const error = useCallback((opts: ToastOptions) => addToast('error', opts), [addToast]);
  const warning = useCallback((opts: ToastOptions) => addToast('warning', opts), [addToast]);
  const info = useCallback((opts: ToastOptions) => addToast('info', opts), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, dismiss } = useContext(ToastContext)!;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-100 flex flex-col-reverse gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));

    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
      }, toast.duration);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.duration, toast.id, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={cn(
        'pointer-events-auto bg-dark-600 border border-dark-500 border-l-4 rounded-lg shadow-lg px-4 py-3',
        'transition-all duration-300 ease-out',
        colorMap[toast.variant],
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{iconMap[toast.variant]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-dark-200">{toast.description}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded text-dark-200 hover:text-white hover:bg-dark-500 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export { ToastProvider, useToast };
export type { Toast, ToastVariant, ToastOptions };
