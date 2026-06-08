import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import {
  PartyPopper,
  Calendar,
  Users,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  Plus,
  Play,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import type { PartyType } from 'shared/types';
import { cn } from '@/lib/utils';

const PARTY_TYPES: { type: PartyType; label: string; icon: typeof PartyPopper; color: string }[] = [
  { type: 'party', label: '派对', icon: PartyPopper, color: 'text-coral-500' },
  { type: 'banquet', label: '宴会', icon: Calendar, color: 'text-gold-400' },
  { type: 'wedding_reception', label: '婚礼', icon: Star, color: 'text-emerald-500' },
];

export default function Events() {
  const { parties, createParty, startParty, completeParty, staffs } = useGameStore();
  const { calculatePartyServiceScore, calculatePartyRevenue } = useGameEngine();

  const [selectedType, setSelectedType] = useState<PartyType>('party');
  const [formData, setFormData] = useState({
    name: '',
    budget: 10000,
    maxAttendees: 50,
    startTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startTime) return;

    await createParty({
      type: selectedType,
      name: formData.name,
      budget: formData.budget,
      maxAttendees: formData.maxAttendees,
      startTime: new Date(formData.startTime),
    });

    setFormData({ name: '', budget: 10000, maxAttendees: 50, startTime: '' });
  };

  const liveParties = parties.filter((p) => p.status === 'ongoing');
  const plannedParties = parties.filter((p) => p.status === 'planning');
  const completedParties = parties.filter((p) => p.status === 'completed');

  const totalAttendees = completedParties.reduce((sum, p) => sum + p.attendees, 0);
  const totalRevenue = completedParties.reduce((sum, p) => sum + p.revenue, 0);
  const avgServiceScore =
    completedParties.length > 0
      ? Math.round(
          completedParties.reduce((sum, p) => sum + p.serviceScore, 0) / completedParties.length
        )
      : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold">活动与宴会</h1>
          <p className="mt-1 text-navy-200">管理您的派对、宴会和婚礼活动</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral-500/20">
              <Users className="h-6 w-6 text-coral-500" />
            </div>
            <div>
              <p className="text-sm text-navy-200">总参加人数</p>
              <p className="font-display text-2xl font-bold text-white">{totalAttendees}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-navy-200">活动总收入</p>
              <p className="font-display text-2xl font-bold text-white">¥{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/20">
              <Star className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <p className="text-sm text-navy-200">平均服务评分</p>
              <p className="font-display text-2xl font-bold text-white">{avgServiceScore}/100</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
            <Plus className="h-5 w-5 text-gold-400" />
            创建新活动
          </h2>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-navy-200">活动类型</label>
            <div className="grid grid-cols-3 gap-3">
              {PARTY_TYPES.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all',
                    selectedType === type
                      ? 'border-gold-400/60 bg-gold-500/10'
                      : 'border-gold-500/20 bg-navy-800/40 hover:border-gold-500/40'
                  )}
                >
                  <Icon className={cn('h-6 w-6', color)} />
                  <span className="text-sm font-medium text-white">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-200">活动名称</label>
              <input
                type="text"
                className="input-field"
                placeholder="输入活动名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-navy-200">预算 (¥)</label>
                <input
                  type="number"
                  className="input-field"
                  min={1000}
                  step={1000}
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-navy-200">预计人数</label>
                <input
                  type="number"
                  className="input-field"
                  min={1}
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-navy-200">开始时间</label>
              <input
                type="datetime-local"
                className="input-field"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              <Plus className="mr-2 inline h-4 w-4" />
              创建活动
            </button>
          </form>
        </div>

        <div className="space-y-6">
          {liveParties.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
                <Play className="h-5 w-5 text-coral-500" />
                进行中的活动
              </h2>
              <div className="space-y-4">
                {liveParties.map((party) => {
                  const estimatedRevenue = calculatePartyRevenue(party);
                  return (
                    <div
                      key={party.id}
                      className="rounded-xl border border-gold-500/20 bg-navy-800/40 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{party.name}</h3>
                          <p className="text-sm text-navy-200">
                            {PARTY_TYPES.find((t) => t.type === party.type)?.label}
                          </p>
                        </div>
                        <button
                          onClick={() => completeParty(party.id)}
                          className="btn-secondary !px-4 !py-2 text-sm"
                        >
                          <CheckCircle className="mr-1 inline h-4 w-4" />
                          完成
                        </button>
                      </div>

                      <div className="mb-3">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-navy-200">筹备进度</span>
                          <span className="text-gold-400">{party.preparationProgress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-navy-700">
                          <div
                            className="h-full rounded-full bg-gold-gradient transition-all"
                            style={{ width: `${party.preparationProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-navy-300">参加人数</p>
                          <p className="font-medium text-white">
                            {party.attendees}/{party.maxAttendees}
                          </p>
                        </div>
                        <div>
                          <p className="text-navy-300">预计收入</p>
                          <p className="font-medium text-emerald-500">¥{estimatedRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-navy-300">服务评分</p>
                          <p className="font-medium text-gold-400">
                            {calculatePartyServiceScore(party, staffs)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {plannedParties.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
                <Clock className="h-5 w-5 text-gold-400" />
                筹备中
              </h2>
              <div className="space-y-4">
                {plannedParties.map((party) => (
                  <div
                    key={party.id}
                    className="rounded-xl border border-gold-500/20 bg-navy-800/40 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{party.name}</h3>
                        <p className="text-sm text-navy-200">
                          {PARTY_TYPES.find((t) => t.type === party.type)?.label} · 预算 ¥
                          {party.budget.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => startParty(party.id)}
                        className="btn-primary !px-4 !py-2 text-sm"
                      >
                        <Play className="mr-1 inline h-4 w-4" />
                        开始
                      </button>
                    </div>

                    <div>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-navy-200">筹备进度</span>
                        <span className="text-gold-400">{party.preparationProgress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-navy-700">
                        <div
                          className="h-full rounded-full bg-gold-gradient transition-all"
                          style={{ width: `${party.preparationProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {completedParties.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
            <Trophy className="h-5 w-5 text-gold-400" />
            历史活动
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-500/20">
                  <th className="pb-3 text-left text-sm font-medium text-navy-200">活动名称</th>
                  <th className="pb-3 text-left text-sm font-medium text-navy-200">类型</th>
                  <th className="pb-3 text-left text-sm font-medium text-navy-200">参加人数</th>
                  <th className="pb-3 text-left text-sm font-medium text-navy-200">收入</th>
                  <th className="pb-3 text-left text-sm font-medium text-navy-200">评分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/10">
                {completedParties.map((party) => (
                  <tr key={party.id} className="hover:bg-gold-500/5">
                    <td className="py-3 font-medium text-white">{party.name}</td>
                    <td className="py-3 text-navy-200">
                      {PARTY_TYPES.find((t) => t.type === party.type)?.label}
                    </td>
                    <td className="py-3 text-navy-200">{party.attendees}人</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1 text-emerald-500">
                        <TrendingUp className="h-4 w-4" />
                        ¥{party.revenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="badge-gold">{party.serviceScore}分</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
