import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { GUILD_CONFIG } from '../../shared/config';
import {
  Building2,
  Users,
  Crown,
  Trophy,
  TrendingUp,
  Plus,
  LogIn,
  LogOut,
  Coins,
  Sparkles,
  ArrowUp,
  Calendar,
  Star,
  Mountain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Guild() {
  const { guild, player, createGuild, joinGuild, leaveGuild, contributeGuild, upgradeGuildResort } =
    useGameStore();
  const {} = useGameEngine();

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [joinGuildId, setJoinGuildId] = useState('');
  const [contributeAmount, setContributeAmount] = useState(1000);

  const handleCreateGuild = async () => {
    if (!newGuildName.trim()) return;
    const success = await createGuild(newGuildName.trim());
    if (success) {
      setNewGuildName('');
      setShowCreatePanel(false);
    }
  };

  const handleJoinGuild = async () => {
    if (!joinGuildId.trim()) return;
    await joinGuild(joinGuildId.trim());
    setJoinGuildId('');
  };

  const handleContribute = async () => {
    if (contributeAmount <= 0) return;
    await contributeGuild(contributeAmount);
    setContributeAmount(1000);
  };

  const sortedMembers = guild
    ? [...guild.members].sort((a, b) => b.contribution - a.contribution)
    : [];

  const nextLevelContribution = guild
    ? Math.round(
        GUILD_CONFIG.LEVEL_UP_BASE_CONTRIBUTION *
          Math.pow(GUILD_CONFIG.CONTRIBUTION_MULTIPLIER, guild.resortLevel)
      )
    : GUILD_CONFIG.LEVEL_UP_BASE_CONTRIBUTION;

  const currentLevelProgress = guild
    ? Math.min(
        Math.round(
          ((guild.totalContribution % nextLevelContribution) / nextLevelContribution) * 100
        ),
        100
      )
    : 0;

  const canUpgrade =
    guild &&
    guild.resortLevel < GUILD_CONFIG.MAX_LEVEL &&
    guild.totalContribution >= nextLevelContribution;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold">公会系统</h1>
          <p className="mt-1 text-navy-200">与志同道合的酒店经营者共同发展</p>
        </div>
        {guild ? (
          <button onClick={() => leaveGuild()} className="btn-secondary">
            <LogOut className="mr-2 inline h-4 w-4" />
            退出公会
          </button>
        ) : (
          <button onClick={() => setShowCreatePanel(!showCreatePanel)} className="btn-primary">
            <Plus className="mr-2 inline h-4 w-4" />
            创建/加入公会
          </button>
        )}
      </div>

      {!guild && showCreatePanel && (
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
                <Plus className="h-5 w-5 text-gold-400" />
                创建新公会
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-navy-200">公会名称</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="输入公会名称"
                    value={newGuildName}
                    onChange={(e) => setNewGuildName(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-navy-300">
                  <Coins className="h-4 w-4 text-gold-400" />
                  创建费用: ¥{GUILD_CONFIG.CREATE_COST.toLocaleString()}
                </div>
                <button onClick={handleCreateGuild} className="btn-primary w-full">
                  <Crown className="mr-2 inline h-4 w-4" />
                  创建公会
                </button>
              </div>
            </div>

            <div className="border-t border-gold-500/20 pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
                <LogIn className="h-5 w-5 text-emerald-500" />
                加入已有公会
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-navy-200">公会ID</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="输入公会ID"
                    value={joinGuildId}
                    onChange={(e) => setJoinGuildId(e.target.value)}
                  />
                </div>
                <button onClick={handleJoinGuild} className="btn-secondary w-full">
                  <LogIn className="mr-2 inline h-4 w-4" />
                  加入公会
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!guild && !showCreatePanel && (
        <div className="glass-card p-12 text-center">
          <Building2 className="mx-auto mb-4 h-16 w-16 text-navy-400" />
          <h2 className="mb-2 font-display text-2xl font-semibold text-white">尚未加入公会</h2>
          <p className="mb-6 text-navy-300">
            创建或加入公会，享受联合度假村加成，与其他玩家共同发展
          </p>
          <button onClick={() => setShowCreatePanel(true)} className="btn-primary">
            <Plus className="mr-2 inline h-4 w-4" />
            立即开始
          </button>
        </div>
      )}

      {guild && (
        <>
          <div className="glass-card overflow-hidden">
            <div className="relative bg-gradient-to-r from-navy-600 via-navy-700 to-navy-600 p-6">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNDOUE5NjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-gradient shadow-luxury-lg">
                    <Building2 className="h-10 w-10 text-navy-700" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white">{guild.name}</h2>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="badge-gold">
                        <Mountain className="mr-1 inline h-3 w-3" />
                        联合度假村 Lv.{guild.resortLevel}
                      </span>
                      <span className="text-sm text-navy-200">
                        <Users className="mr-1 inline h-3 w-3" />
                        {guild.members.length}/{GUILD_CONFIG.MAX_MEMBERS} 成员
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xs text-navy-300">访客加成</p>
                    <p className="font-display text-xl font-bold text-emerald-500">
                      +{(guild.visitorBonus * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-navy-300">收入加成</p>
                    <p className="font-display text-xl font-bold text-gold-400">
                      +{(guild.revenueBonus * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-navy-200">升级进度</span>
                  <span className="text-sm text-gold-400">
                    {guild.resortLevel >= GUILD_CONFIG.MAX_LEVEL
                      ? '已满级'
                      : `Lv.${guild.resortLevel} → Lv.${guild.resortLevel + 1}`}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-navy-700">
                  <div
                    className="h-full rounded-full bg-gold-gradient transition-all"
                    style={{ width: `${currentLevelProgress}%` }}
                  />
                </div>
                {guild.resortLevel < GUILD_CONFIG.MAX_LEVEL && (
                  <div className="mt-2 flex items-center justify-between text-xs text-navy-300">
                    <span>
                      当前贡献: ¥{guild.totalContribution.toLocaleString()}
                    </span>
                    <span>
                      升级需要: ¥{nextLevelContribution.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {guild.resortLevel < GUILD_CONFIG.MAX_LEVEL && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-gold-500/20 bg-navy-800/40 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-navy-200">下级访客加成</span>
                    </div>
                    <p className="font-display text-lg font-bold text-white">
                      +{((guild.resortLevel + 1) * GUILD_CONFIG.VISITOR_BONUS_PER_LEVEL * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-gold-500/20 bg-navy-800/40 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Coins className="h-4 w-4 text-gold-400" />
                      <span className="text-sm text-navy-200">下级收入加成</span>
                    </div>
                    <p className="font-display text-lg font-bold text-white">
                      +{((guild.resortLevel + 1) * GUILD_CONFIG.REVENUE_BONUS_PER_LEVEL * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => upgradeGuildResort()}
                      disabled={!canUpgrade}
                      className="btn-primary w-full"
                    >
                      <ArrowUp className="mr-2 inline h-4 w-4" />
                      升级度假村
                    </button>
                  </div>
                </div>
              )}

              {guild.resortLevel >= GUILD_CONFIG.MAX_LEVEL && (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 py-4 text-gold-400">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-medium">联合度假村已达到最高等级！</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="glass-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
                <Coins className="h-5 w-5 text-gold-400" />
                贡献公会
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-navy-200">贡献金额</label>
                  <input
                    type="number"
                    className="input-field"
                    min={100}
                    step={100}
                    max={GUILD_CONFIG.DAILY_CONTRIBUTION_LIMIT}
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1 text-sm text-navy-300">
                  <div className="flex justify-between">
                    <span>每日贡献上限</span>
                    <span className="text-gold-400">
                      ¥{GUILD_CONFIG.DAILY_CONTRIBUTION_LIMIT.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>我的金币</span>
                    <span className="text-emerald-500">
                      ¥{player?.coins?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1000, 5000, 10000, 50000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setContributeAmount(amount)}
                      className={cn(
                        'rounded-lg border py-2 text-sm transition-all',
                        contributeAmount === amount
                          ? 'border-gold-400/60 bg-gold-500/10 text-gold-300'
                          : 'border-gold-500/20 text-navy-200 hover:border-gold-500/40'
                      )}
                    >
                      ¥{amount >= 1000 ? `${amount / 1000}k` : amount}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleContribute}
                  disabled={contributeAmount <= 0 || (player?.coins || 0) < contributeAmount}
                  className="btn-primary w-full"
                >
                  <Coins className="mr-2 inline h-4 w-4" />
                  确认贡献
                </button>
              </div>
            </div>

            <div className="glass-card p-6 lg:col-span-2">
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
                <Trophy className="h-5 w-5 text-gold-400" />
                贡献排行榜
              </h2>
              <div className="space-y-2">
                {sortedMembers.slice(0, 5).map((member, index) => (
                  <div
                    key={member.playerId}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3',
                      index === 0
                        ? 'border-gold-400/40 bg-gold-500/10'
                        : index === 1
                        ? 'border-navy-300/30 bg-navy-400/10'
                        : index === 2
                        ? 'border-coral-500/30 bg-coral-500/10'
                        : 'border-gold-500/20 bg-navy-800/40'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg font-bold',
                        index === 0
                          ? 'bg-gold-gradient text-navy-700'
                          : index === 1
                          ? 'bg-navy-300 text-navy-700'
                          : index === 2
                          ? 'bg-coral-500 text-white'
                          : 'bg-navy-700 text-navy-200'
                      )}
                    >
                      {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{member.playerName}</span>
                        {member.playerId === guild.leaderId && (
                          <span className="badge-gold">
                            <Star className="mr-1 inline h-3 w-3" />
                            会长
                          </span>
                        )}
                        {member.playerId === player?.id && (
                          <span className="badge-emerald">我</span>
                        )}
                      </div>
                      <p className="text-xs text-navy-300">
                        <Calendar className="mr-1 inline h-3 w-3" />
                        {new Date(member.joinDate).toLocaleDateString('zh-CN')} 加入
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-gold-400">
                        ¥{member.contribution.toLocaleString()}
                      </p>
                      <p className="text-xs text-navy-300">总贡献</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
              <Users className="h-5 w-5 text-gold-400" />
              成员列表
              <span className="badge-gold">{guild.members.length}人</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-500/20">
                    <th className="pb-3 text-left text-sm font-medium text-navy-200">成员</th>
                    <th className="pb-3 text-left text-sm font-medium text-navy-200">职位</th>
                    <th className="pb-3 text-left text-sm font-medium text-navy-200">贡献值</th>
                    <th className="pb-3 text-left text-sm font-medium text-navy-200">加入日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/10">
                  {sortedMembers.map((member) => (
                    <tr key={member.playerId} className="hover:bg-gold-500/5">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700 text-sm font-medium text-gold-400">
                            {member.playerName.charAt(0)}
                          </div>
                          <span className="font-medium text-white">
                            {member.playerName}
                            {member.playerId === player?.id && (
                              <span className="ml-2 text-xs text-emerald-500">(我)</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        {member.playerId === guild.leaderId ? (
                          <span className="badge-gold">
                            <Crown className="mr-1 inline h-3 w-3" />
                            会长
                          </span>
                        ) : (
                          <span className="text-navy-300">成员</span>
                        )}
                      </td>
                      <td className="py-3 font-medium text-gold-400">
                        ¥{member.contribution.toLocaleString()}
                      </td>
                      <td className="py-3 text-navy-200">
                        {new Date(member.joinDate).toLocaleDateString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
