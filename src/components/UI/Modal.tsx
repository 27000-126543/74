import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative glass-card w-full max-w-lg animate-slide-in',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gold-500/20">
            <h3 className="font-display text-xl font-bold text-gradient-gold">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-300 hover:bg-gold-500/10 hover:text-gold-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gold-500/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
