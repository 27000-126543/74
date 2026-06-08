import { Bell, Coins, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Topbar() {
  return (
    <header className="glass-card flex items-center justify-between px-6 py-4 my-4 ml-4 mr-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
          <Crown className="w-5 h-5 text-navy-700" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-gradient-gold">皇家酒店管理系统</h2>
          <p className="text-xs text-navy-300">欢迎回来，老板</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl">
          <Coins className="w-5 h-5 text-gold-400" />
          <span className="font-semibold text-gold-300">1,250,890</span>
          <span className="text-xs text-navy-300">金币</span>
        </div>

        <button className="relative w-10 h-10 rounded-xl bg-navy-600/80 border border-gold-500/20 flex items-center justify-center text-gold-400 hover:bg-gold-500/10 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-white text-sm">酒店大亨</p>
            <p className="text-xs text-gold-400">VIP · 钻石会员</p>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gold-gradient p-0.5">
              <div className="w-full h-full rounded-[10px] bg-navy-700 flex items-center justify-center">
                <span className="font-display font-bold text-gradient-gold text-lg">HT</span>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-navy-700" />
          </div>
        </div>
      </div>
    </header>
  );
}
