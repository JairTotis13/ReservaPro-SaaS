'use client';

import {
  type ReactNode,
  useEffect,
  useRef,
  useCallback,
  useState,
  createContext,
  useContext,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalContextValue {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('Modal compound components must be used within <Modal>');
  return ctx;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

function Modal({ open, onClose, children, className }: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const raf = requestAnimationFrame(() => setAnimating(true));
      document.body.style.overflow = 'hidden';
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = '';
      }, 200);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  if (!visible) return null;

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200',
          animating ? 'bg-black/70 backdrop-blur-xs' : 'bg-black/0',
        )}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={cn(
            'bg-dark-600 border border-dark-500 rounded-xl shadow-2xl w-full max-w-lg mx-auto transition-all duration-200',
            animating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

interface ModalHeaderProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

function ModalHeader({ title, description, children, className }: ModalHeaderProps) {
  const { onClose } = useModalContext();

  return (
    <div className={cn('flex items-start justify-between gap-4 px-6 pt-6 pb-2', className)}>
      <div className="flex-1 min-w-0">
        {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
        {description && <p className="mt-1 text-sm text-dark-200">{description}</p>}
        {children}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 p-1.5 rounded-lg text-dark-200 hover:text-white hover:bg-dark-500 transition-colors"
        aria-label="Close modal"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

function ModalContent({ children, className }: ModalContentProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-6 pb-6 pt-2 border-t border-dark-500',
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Modal, ModalHeader, ModalContent, ModalFooter };
export type { ModalProps, ModalHeaderProps, ModalContentProps, ModalFooterProps };
