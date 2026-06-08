import { useState } from 'react';
import { Crown, Sparkles, User, Hotel, ArrowRight } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export default function Login() {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useGameStore((s) => s.login);

  const handleLogin = async () => {
    if (!nickname.trim()) return;
    setLoading(true);
    try {
      await login(nickname.trim());
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-700 to-navy-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-gold-500/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse-gold" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse-gold" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8 md:p-10 animate-slide-in">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-luxury animate-float">
                <Hotel className="w-10 h-10 text-navy-700" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-navy-700 border-2 border-gold-400 flex items-center justify-center">
                <Crown className="w-4 h-4 text-gold-400" />
              </div>
              <Sparkles className="absolute -top-2 -left-2 w-5 h-5 text-gold-400 animate-float" style={{ animationDelay: '0.5s' }} />
            </div>

            <h1 className="text-4xl font-bold font-display text-gradient-gold mb-2">
              酒店管理大亨
            </h1>
            <p className="text-navy-300 text-sm">打造你的奢华酒店帝国</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gold-300 mb-2">
                玩家昵称
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的昵称..."
                  className="input-field pl-12"
                  maxLength={20}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={!nickname.trim() || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-navy-700/30 border-t-navy-700 rounded-full animate-spin" />
              ) : (
                <>
                  <span>进入游戏</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gold-500/10">
            <div className="flex items-center justify-center gap-6 text-navy-400 text-xs">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-500" />
                <span>奢华体验</span>
              </div>
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-gold-500" />
                <span>尊贵服务</span>
              </div>
              <div className="flex items-center gap-1">
                <Hotel className="w-3 h-3 text-gold-500" />
                <span>帝国梦想</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-navy-500 text-xs mt-6">
          © 2024 酒店管理大亨 · 开启你的奢华之旅
        </p>
      </div>
    </div>
  );
}
