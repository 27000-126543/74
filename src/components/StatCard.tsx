import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
  className?: string;
}

export default function StatCard({ title, value, icon, trend, description, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-navy-300 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gradient-gold mt-2 font-display">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-xs font-semibold',
                  trend.isUp ? 'text-emerald-500' : 'text-coral-500'
                )}
              >
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              {description && (
                <span className="text-navy-400 text-xs ml-2">{description}</span>
              )}
            </div>
          )}
          {!trend && description && (
            <p className="text-navy-400 text-xs mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
