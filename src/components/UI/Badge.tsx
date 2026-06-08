import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'gold' | 'emerald' | 'wine' | 'coral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'badge-gold',
  emerald: 'badge-emerald',
  wine: 'badge-wine',
  coral: 'badge-coral',
};

export default function Badge({ variant = 'gold', children, className }: BadgeProps) {
  return (
    <span className={cn(variantStyles[variant], className)}>
      {children}
    </span>
  );
}
