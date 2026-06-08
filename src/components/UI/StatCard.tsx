import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  iconClassName?: string;
}

export default function StatCard({ icon: Icon, label, value, trend, iconClassName }: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconClassName || 'bg-gold-500/20 text-gold-400'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
              isPositive
                ? 'bg-emerald-500/20 text-emerald-500'
                : 'bg-coral-500/20 text-coral-500'
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-navy-300 text-sm">{label}</p>
        <p className="font-display text-3xl font-bold text-gradient-gold mt-1">{value}</p>
      </div>
    </div>
  );
}
