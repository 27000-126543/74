import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Hotel,
  Users,
  Settings,
  PartyPopper,
  ShoppingBag,
  Shield,
  BarChart3,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Hotel, label: '酒店', path: '/hotel' },
  { icon: Users, label: '员工', path: '/staff' },
  { icon: Settings, label: '运营中心', path: '/operations' },
  { icon: PartyPopper, label: '活动宴会', path: '/events' },
  { icon: ShoppingBag, label: '交易市场', path: '/market' },
  { icon: Shield, label: '公会', path: '/guild' },
  { icon: BarChart3, label: '数据分析', path: '/analytics' },
  { icon: Trophy, label: '排行榜', path: '/leaderboard' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'glass-card flex flex-col h-screen sticky top-4 left-4 my-4 transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gold-500/20">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
              <Trophy className="w-5 h-5 text-navy-700" />
            </div>
            <h1 className="font-display text-xl font-bold text-gradient-gold">豪华酒店</h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-gold-400 hover:bg-gold-500/10 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-gold-gradient text-navy-700 font-semibold shadow-luxury'
                    : 'text-navy-200 hover:bg-gold-500/10 hover:text-gold-300'
                )
              }
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0')} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gold-500/20">
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-navy-300 mb-2">当前赛季</p>
            <p className="font-display text-lg font-bold text-gradient-gold">Season 3</p>
            <div className="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gold-gradient rounded-full" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
