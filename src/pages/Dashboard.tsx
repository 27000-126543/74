import { useMemo } from 'react';
import {
  LineChart,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Bar,
  Area,
  AreaChart,
  CartesianGrid,
} from 'recharts';
import {
  DollarSign,
  BedDouble,
  Star,
  Users,
  Hotel,
  Settings,
  Bell,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Calendar,
  Wrench,
  PartyPopper,
  Crown,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { HOTEL_STYLES, ROOM_TYPES } from '../../shared/config';
import StatCard from '@/components/StatCard';
import type { GameEvent } from 'shared/types';

const occupancyData = [
  { time: '00:00', rate: 65 },
  { time: '04:00', rate: 62 },
  { time: '08:00', rate: 70 },
  { time: '12:00', rate: 78 },
  { time: '16:00', rate: 85 },
  { time: '20:00', rate: 88 },
  { time: '现在', rate: 82 },
];

const revenueData = [
  { day: '周一', revenue: 45000 },
  { day: '周二', revenue: 52000 },
  { day: '周三', revenue: 48000 },
  { day: '周四', revenue: 61000 },
  { day: '周五', revenue: 78000 },
  { day: '周六', revenue: 92000 },
  { day: '周日', revenue: 85000 },
];

const mockEvents: GameEvent[] = [
  {
    id: '1',
    hotelId: 'h1',
    type: 'complaint',
    title: '噪音投诉',
    description: '302房间客人投诉隔壁噪音过大',
    options: [],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
  },
  {
    id: '2',
    hotelId: 'h1',
    type: 'malfunction',
    title: '空调故障',
    description: '5楼空调停止制冷',
    options: [],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7200000),
  },
  {
    id: '3',
    hotelId: 'h1',
    type: 'vip_arrival',
    title: 'VIP客人入住',
    description: '知名影星将秘密入住',
    options: [],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1800000),
  },
  {
    id: '4',
    hotelId: 'h1',
    type: 'wedding',
    title: '婚礼咨询',
    description: '小型婚礼预订咨询',
    options: [],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 14400000),
  },
];

const eventIcon = (type: GameEvent['type']) => {
  switch (type) {
    case 'complaint':
      return <AlertCircle className="w-5 h-5 text-coral-500" />;
    case 'malfunction':
      return <Wrench className="w-5 h-5 text-wine-500" />;
    case 'vip_arrival':
      return <Crown className="w-5 h-5 text-gold-400" />;
    case 'wedding':
      return <PartyPopper className="w-5 h-5 text-emerald-500" />;
    default:
      return <Bell className="w-5 h-5 text-navy-400" />;
  }
};

const eventBadge = (type: GameEvent['type']) => {
  switch (type) {
    case 'complaint':
      return 'badge-coral';
    case 'malfunction':
      return 'badge-wine';
    case 'vip_arrival':
      return 'badge-gold';
    case 'wedding':
      return 'badge-emerald';
    default:
      return 'badge-gold';
  }
};

export default function Dashboard() {
  const player = useGameStore((s) => s.player);
  const hotel = useGameStore((s) => s.hotel);
  const events = useGameStore((s) => s.events);
  const parties = useGameStore((s) => s.parties);
  const { calculateOccupancyRate, calculateDailyRevenue, calculateHotelComfort } = useGameEngine();

  const displayEvents = events.length > 0 ? events : mockEvents;

  const stats = useMemo(() => {
    if (!hotel) {
      return {
        totalRevenue: 0,
        occupancyRate: 0,
        satisfaction: 0,
        roomCount: 0,
      };
    }
    return {
      totalRevenue: hotel.totalRevenue || 425000,
      occupancyRate: calculateOccupancyRate(hotel.rooms),
      satisfaction: hotel.rating ? hotel.rating * 20 : 86,
      roomCount: hotel.rooms?.length || 24,
    };
  }, [hotel, calculateOccupancyRate]);

  const hotelStyleConfig = hotel ? HOTEL_STYLES[hotel.style] : HOTEL_STYLES.classical;

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-gradient-gold">
            酒店总览
          </h1>
          <p className="text-navy-300 mt-1">
            {hotel?.name || '金沙大酒店'} · 欢迎回来，{player?.name || '酒店经理'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>今日报告</span>
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>酒店管理</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总收入"
          value={`¥${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: 12.5, isUp: true }}
          description="较上周"
        />
        <StatCard
          title="入住率"
          value={`${stats.occupancyRate || 82}%`}
          icon={<BedDouble className="w-6 h-6" />}
          trend={{ value: 5.2, isUp: true }}
          description="实时统计"
        />
        <StatCard
          title="满意度评分"
          value={stats.satisfaction || 4.3}
          icon={<Star className="w-6 h-6" />}
          trend={{ value: 0.1, isUp: true }}
          description="客人平均评分"
        />
        <StatCard
          title="客房数"
          value={stats.roomCount || 24}
          icon={<Users className="w-6 h-6" />}
          description="可接待 128 位客人"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-gold-300">
              实时入住率
            </h2>
            <div className="flex items-center gap-2 text-emerald-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+5.2% 今日增长</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A962" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A962" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201, 169, 98, 0.1)" />
                <XAxis dataKey="time" stroke="#7A91B0" fontSize={12} />
                <YAxis stroke="#7A91B0" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2332',
                    border: '1px solid rgba(201, 169, 98, 0.3)',
                    borderRadius: '8px',
                    color: '#F0F3F7',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#C9A962"
                  strokeWidth={3}
                  fill="url(#occupancyGradient)"
                  name="入住率 %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold font-display text-gold-300 mb-4">
            酒店风格
          </h2>
          <div className="flex flex-col h-full">
            <div
              className="rounded-xl p-4 mb-4 flex-shrink-0"
              style={{ backgroundColor: `${hotelStyleConfig.color}15` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: hotelStyleConfig.color }}
                >
                  <Hotel className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {hotelStyleConfig.name}
                  </p>
                  <p className="text-sm opacity-80 text-navy-300">
                    价格倍率 ×{hotelStyleConfig.priceMultiplier}
                  </p>
                </div>
              </div>
              </div>
            <p className="text-sm text-navy-300 mb-4 flex-1">
              {hotelStyleConfig.description}
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gold-300">特色装饰</p>
              <div className="flex flex-wrap gap-2">
                {hotelStyleConfig.decor.slice(0, 4).map((item, i) => (
                  <span key={i} className="badge-gold">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <button className="btn-secondary w-full mt-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>更换风格</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-gold-300">
              今日待处理事件
            </h2>
            <span className="badge-coral">{displayEvents.length} 项</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {displayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-navy-800/40 border border-gold-500/10 hover:border-gold-500/20 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-navy-700/60 flex items-center justify-center flex-shrink-0">
                  {eventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-white truncate">{event.title}</p>
                  <span className={eventBadge(event.type)}>
                    {event.type === 'complaint' ? '投诉' :
                     event.type === 'malfunction' ? '故障' :
                     event.type === 'vip_arrival' ? 'VIP' : '活动'}
                  </span>
                  </div>
                  <p className="text-sm text-navy-300 truncate">{event.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-navy-400">
                    <Clock className="w-3 h-3" />
                    <span>剩余 2 小时</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-navy-500 group-hover:text-gold-400 transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
          <button className="btn-secondary w-full mt-4">
            查看全部事件
          </button>
        </div>

        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-gold-300">
              近期收入
            </h2>
            <div className="flex items-center gap-2 text-emerald-500 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+18.3% 较上周</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201, 169, 98, 0.1)" />
                <XAxis dataKey="day" stroke="#7A91B0" fontSize={12} />
                <YAxis stroke="#7A91B0" fontSize={12} tickFormatter={(v) => `¥${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2332',
                    border: '1px solid rgba(201, 169, 98, 0.3)',
                    borderRadius: '8px',
                    color: '#F0F3F7',
                  }}
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '收入']}
                />
                <Bar
                  dataKey="revenue"
                  fill="#C9A962"
                  radius={[6, 6, 0, 0]}
                  name="收入"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gold-500/10">
            {Object.entries(ROOM_TYPES).map(([key, room]) => (
              <div key={key} className="text-center">
                <p className="text-2xl font-bold text-gradient-gold font-display">
                  {room.name}
                </p>
                <p className="text-sm text-navy-300">¥{room.basePrice}/晚</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
