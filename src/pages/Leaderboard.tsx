import { useEffect, useMemo, useState } from 'react';
import {
  Star,
  DollarSign,
  BedDouble,
  Trophy,
  Eye,
  X,
  User,
  Building2,
  Users,
  TrendingUp,
  Crown,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry, Hotel, Staff } from 'shared/types';

type TabType = 'rating' | 'revenue' | 'rooms';

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, playerId: '1', playerName: '酒店管理大师', hotelName: '黄金海岸大酒店', rating: 4.9, totalRevenue: 2580000, roomCount: 120 },
  { rank: 2, playerId: '2', playerName: '奢华体验官', hotelName: '云端精品酒店', rating: 4.8, totalRevenue: 2340000, roomCount: 98 },
  { rank: 3, playerId: '3', playerName: '商务精英', hotelName: '城市中心万豪', rating: 4.7, totalRevenue: 2100000, roomCount: 150 },
  { rank: 4, playerId: '4', playerName: '度假专家', hotelName: '海岛度假胜地', rating: 4.6, totalRevenue: 1890000, roomCount: 85 },
  { rank: 5, playerId: '5', playerName: '设计先锋', hotelName: '艺术主题酒店', rating: 4.5, totalRevenue: 1750000, roomCount: 65 },
  { rank: 6, playerId: '6', playerName: '绿色环保者', hotelName: '生态度假村', rating: 4.4, totalRevenue: 1620000, roomCount: 72 },
  { rank: 7, playerId: '7', playerName: '历史爱好者', hotelName: '古城文化客栈', rating: 4.3, totalRevenue: 1480000, roomCount: 45 },
  { rank: 8, playerId: '8', playerName: '科技达人', hotelName: '未来智能酒店', rating: 4.2, totalRevenue: 1350000, roomCount: 88 },
];

const mockHotelDetail: { hotel: Hotel; staffs: Staff[] } = {
  hotel: {
    id: '1',
    playerId: '1',
    name: '黄金海岸大酒店',
    style: 'classical',
    comfortScore: 92,
    rating: 4.9,
    totalRevenue: 2580000,
    rooms: [
      { id: 'r1', type: 'villa', number: 'V101', floor: 1, price: 2888, comfort: 95, status: 'occupied' },
      { id: 'r2', type: 'suite', number: 'S201', floor: 2, price: 1688, comfort: 90, status: 'occupied' },
      { id: 'r3', type: 'standard', number: '301', floor: 3, price: 688, comfort: 82, status: 'vacant' },
    ],
    facilities: [
      { id: 'f1', type: 'pool', level: 5, quality: 95 },
      { id: 'f2', type: 'spa', level: 4, quality: 90 },
      { id: 'f3', type: 'restaurant', level: 5, quality: 92 },
      { id: 'f4', type: 'gym', level: 3, quality: 85 },
    ],
  },
  staffs: [
    { id: 's1', hotelId: '1', name: '张经理', avatar: '', position: 'manager', skills: { service: 95, efficiency: 90, friendliness: 92, professionalism: 96 }, satisfaction: 92, fatigue: 25, salary: 25000, level: 8, status: 'working', schedule: [] },
    { id: 's2', hotelId: '1', name: '李大厨', avatar: '', position: 'chef', skills: { service: 88, efficiency: 95, friendliness: 85, professionalism: 94 }, satisfaction: 88, fatigue: 35, salary: 20000, level: 7, status: 'working', schedule: [] },
    { id: 's3', hotelId: '1', name: '王接待', avatar: '', position: 'receptionist', skills: { service: 96, efficiency: 88, friendliness: 98, professionalism: 90 }, satisfaction: 95, fatigue: 20, salary: 12000, level: 5, status: 'working', schedule: [] },
  ],
};

export default function Leaderboard() {
  const { leaderboard, player, hotel, fetchLeaderboard, loading, selectedHotelDetail, fetchHotelDetailByPlayerId, clearHotelDetail } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('rating');
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (selectedEntry) {
      fetchHotelDetailByPlayerId(selectedEntry.playerId);
    } else {
      clearHotelDetail();
    }
  }, [selectedEntry, fetchHotelDetailByPlayerId, clearHotelDetail]);

  const tabs = [
    { key: 'rating' as TabType, label: '酒店评分', icon: Star, dataKey: 'rating', suffix: '', format: (v: number) => v.toFixed(1) },
    { key: 'revenue' as TabType, label: '总收入', icon: DollarSign, dataKey: 'totalRevenue', suffix: '¥', format: (v: number) => v.toLocaleString() },
    { key: 'rooms' as TabType, label: '客房数', icon: BedDouble, dataKey: 'roomCount', suffix: '', format: (v: number) => v.toString() },
  ];

  const currentData = useMemo(() => {
    if (!leaderboard) {
      return mockLeaderboard.map((entry) => ({
        ...entry,
        playerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.playerName}`,
      }));
    }
    const data = activeTab === 'rating'
      ? leaderboard.byRating
      : activeTab === 'revenue'
      ? leaderboard.byRevenue
      : leaderboard.byRooms;
    return data.map((entry) => ({
      ...entry,
      playerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.playerName}`,
    }));
  }, [leaderboard, activeTab]);

  const myRank = useMemo(() => {
    if (!player || !hotel) {
      return {
        rank: mockLeaderboard.length + 1,
        playerId: 'me',
        playerName: player?.name || '我的酒店',
        hotelName: hotel?.name || '我的酒店',
        rating: hotel?.rating || 4.2,
        totalRevenue: hotel?.totalRevenue || 580000,
        roomCount: hotel?.rooms?.length || 30,
        playerAvatar: player?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=me`,
      };
    }
    const entry = currentData.find((e) => e.playerId === player.id);
    return {
      rank: entry?.rank || currentData.length + 1,
      playerId: player.id,
      playerName: player.name,
      hotelName: hotel.name,
      rating: hotel.rating,
      totalRevenue: hotel.totalRevenue,
      roomCount: hotel.rooms.length,
      playerAvatar: player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`,
    };
  }, [player, hotel, currentData]);

  const currentTab = tabs.find((t) => t.key === activeTab)!;

  const getRankStyles = (rank: number) => {
    if (rank === 1) {
      return {
        border: 'border-yellow-400/60',
        bg: 'bg-gradient-to-r from-yellow-900/30 via-yellow-700/20 to-yellow-900/30',
        text: 'text-yellow-400',
        rankBg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      };
    }
    if (rank === 2) {
      return {
        border: 'border-slate-400/60',
        bg: 'bg-gradient-to-r from-slate-700/30 via-slate-500/20 to-slate-700/30',
        text: 'text-slate-300',
        rankBg: 'bg-gradient-to-br from-slate-300 to-slate-500',
      };
    }
    if (rank === 3) {
      return {
        border: 'border-orange-600/60',
        bg: 'bg-gradient-to-r from-orange-900/30 via-orange-700/20 to-orange-900/30',
        text: 'text-orange-400',
        rankBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
      };
    }
    return {
      border: 'border-gold-500/20',
      bg: 'bg-navy-700/40',
      text: 'text-white',
      rankBg: 'bg-navy-600',
    };
  };

  const getValue = (entry: LeaderboardEntry) => {
    return currentTab.format(entry[currentTab.dataKey as keyof LeaderboardEntry] as number);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-gold-400" />
            <h1 className="text-3xl font-display font-bold text-gradient-gold">
              全服排行榜
            </h1>
          </div>
          <p className="text-navy-300">与全服玩家一较高下</p>
        </div>

        <div className="glass-card p-2">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200',
                  activeTab === tab.key
                    ? 'bg-gold-gradient text-navy-700 font-semibold shadow-luxury'
                    : 'text-navy-300 hover:text-gold-300 hover:bg-navy-600/40'
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {loading.leaderboard ? (
            <div className="glass-card p-8 text-center text-navy-300">
              加载中...
            </div>
          ) : (
            currentData.map((entry) => {
              const styles = getRankStyles(entry.rank);
              return (
                <div
                  key={entry.rank}
                  className={cn(
                    'glass-card p-4 border-2 transition-all duration-200 hover:shadow-luxury',
                    styles.border,
                    styles.bg
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-navy-800 shadow-lg flex-shrink-0',
                        styles.rankBg
                      )}
                    >
                      {entry.rank <= 3 ? (
                        <Crown className={cn('w-6 h-6', styles.text)} />
                      ) : (
                        entry.rank
                      )}
                    </div>

                    <div className="w-12 h-12 rounded-full bg-navy-600 overflow-hidden flex-shrink-0">
                      <img
                        src={entry.playerAvatar}
                        alt={entry.playerName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('font-semibold truncate', styles.text)}>
                          {entry.hotelName}
                        </p>
                      </div>
                      <p className="text-sm text-navy-400 truncate">
                        {entry.playerName}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={cn('text-xl font-bold', styles.text)}>
                        {currentTab.suffix}
                        {getValue(entry)}
                      </p>
                      <p className="text-xs text-navy-400">{currentTab.label}</p>
                    </div>

                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="btn-secondary py-2 px-3 flex items-center gap-1 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">详情</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="sticky bottom-4 z-10">
          <div className="glass-card p-4 border-2 border-gold-400/50 shadow-luxury-lg">
            <div className="flex items-center gap-4">
              <div className="px-2">
                <p className="text-xs text-gold-400 font-medium mb-1">我的排名</p>
                <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center font-bold text-xl text-navy-800 shadow-lg">
                  {myRank.rank}
                </div>
              </div>

              <div className="w-12 h-12 rounded-full bg-navy-600 overflow-hidden flex-shrink-0">
                <img
                  src={myRank.playerAvatar}
                  alt={myRank.playerName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gradient-gold truncate">
                  {myRank.hotelName}
                </p>
                <p className="text-sm text-navy-300 truncate">{myRank.playerName}</p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-gold-400">
                  {currentTab.suffix}
                  {currentTab.format(myRank[currentTab.dataKey as keyof typeof myRank] as number)}
                </p>
                <p className="text-xs text-navy-400">{currentTab.label}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-navy-700/90 backdrop-blur-xl border-b border-gold-500/20 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gradient-gold">
                  {selectedEntry.hotelName}
                </h3>
                <p className="text-sm text-navy-400">{selectedEntry.playerName}</p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-2 rounded-lg hover:bg-navy-600/60 text-navy-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {loading.hotelDetail ? (
                <div className="py-16 text-center text-navy-300">
                  加载酒店详情中...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="stat-card text-center py-4">
                      <Star className="w-6 h-6 text-gold-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gold-400">
                        {selectedEntry.rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-navy-400 mt-1">综合评分</p>
                    </div>
                    <div className="stat-card text-center py-4">
                      <DollarSign className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-emerald-500">
                        ¥{(selectedEntry.totalRevenue / 10000).toFixed(1)}万
                      </p>
                      <p className="text-xs text-navy-400 mt-1">总收入</p>
                    </div>
                    <div className="stat-card text-center py-4">
                      <BedDouble className="w-6 h-6 text-coral-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-coral-500">
                        {selectedEntry.roomCount}
                      </p>
                      <p className="text-xs text-navy-400 mt-1">客房数</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-gold-400" />
                      酒店布局
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {(selectedHotelDetail?.hotel?.rooms || mockHotelDetail.hotel.rooms).map((room) => (
                        <div
                          key={room.id}
                          className={cn(
                            'p-3 rounded-xl border text-center',
                            room.status === 'occupied'
                              ? 'bg-wine-500/20 border-wine-500/30'
                              : room.status === 'maintenance'
                              ? 'bg-coral-500/20 border-coral-500/30'
                              : 'bg-emerald-500/20 border-emerald-500/30'
                          )}
                        >
                          <p className="font-semibold text-white">{room.number}</p>
                          <p className="text-xs text-navy-300 capitalize">{room.type}</p>
                          <p className="text-xs mt-1 text-navy-400">
                            {room.status === 'occupied' ? '已入住' : room.status === 'maintenance' ? '维护中' : '空房'}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(selectedHotelDetail?.hotel?.facilities || mockHotelDetail.hotel.facilities).map((facility) => (
                        <div
                          key={facility.id}
                          className="badge-gold flex items-center gap-1 py-1.5"
                        >
                          <span className="capitalize">{facility.type}</span>
                          <span className="text-gold-400">Lv.{facility.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-gold-400" />
                      员工阵容
                    </h4>
                    <div className="space-y-3">
                      {(selectedHotelDetail?.staffs?.length ? selectedHotelDetail.staffs : mockHotelDetail.staffs).map((staff) => (
                        <div
                          key={staff.id}
                          className="glass-card p-3 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-navy-600 flex items-center justify-center overflow-hidden">
                            {staff.avatar ? (
                              <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-gold-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{staff.name}</p>
                            <p className="text-xs text-navy-400 capitalize">
                              {staff.position} · Lv.{staff.level}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gold-400 font-medium">
                              {Math.round(
                                (staff.skills.service +
                                  staff.skills.efficiency +
                                  staff.skills.friendliness +
                                  staff.skills.professionalism) /
                                  4
                              )}
                              分
                            </p>
                            <p className="text-xs text-navy-400">综合能力</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-gold-400" />
                      经营数据
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-4">
                        <p className="text-navy-400 text-sm mb-1">舒适度评分</p>
                        <p className="text-2xl font-bold text-gold-400">
                          {selectedHotelDetail?.hotel?.comfortScore ?? mockHotelDetail.hotel.comfortScore}
                        </p>
                      </div>
                      <div className="glass-card p-4">
                        <p className="text-navy-400 text-sm mb-1">设施数量</p>
                        <p className="text-2xl font-bold text-emerald-500">
                          {(selectedHotelDetail?.hotel?.facilities || mockHotelDetail.hotel.facilities).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
