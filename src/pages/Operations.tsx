import { useState, useMemo } from 'react';
import {
  Users,
  Bed,
  Zap,
  Battery,
  AlertTriangle,
  Wrench,
  Heart,
  Sparkles,
  CheckCircle2,
  X,
  DoorOpen,
  UserCheck,
  Building2,
  Gauge,
  Activity,
  DollarSign,
  Calendar,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import type { Guest, Room, GameEvent, EventType, RoomStatus } from 'shared/types';

const ROOM_STATUS_STYLE: Record<RoomStatus, { label: string; bg: string; border: string; text: string }> = {
  vacant: { label: '空房', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  occupied: { label: '占用', bg: 'bg-gold-500/20', border: 'border-gold-500/40', text: 'text-gold-400' },
  maintenance: { label: '维护', bg: 'bg-coral-500/20', border: 'border-coral-500/40', text: 'text-coral-500' },
};

const EVENT_TYPE_STYLE: Record<EventType, { icon: typeof AlertTriangle; color: string; label: string }> = {
  complaint: { icon: AlertTriangle, color: 'text-coral-500', label: '投诉' },
  malfunction: { icon: Wrench, color: 'text-wine-500', label: '设备故障' },
  wedding: { icon: Heart, color: 'text-gold-400', label: '婚礼活动' },
  vip_arrival: { icon: Sparkles, color: 'text-emerald-500', label: 'VIP抵达' },
};

export default function Operations() {
  const {
    guests,
    hotel,
    staffs,
    events,
    autoAssignGuests,
    checkInGuest,
    checkOutGuest,
    resolveEvent,
    dailyTick,
    fetchHotel,
  } = useGameStore();
  const { calculateOccupancyRate, autoAssignRooms, calculateStaffImpact } = useGameEngine();

  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<Array<{ guestId: string; roomId: string }> | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [dailyTickLoading, setDailyTickLoading] = useState(false);
  const [selectedGuestForCheckIn, setSelectedGuestForCheckIn] = useState<Guest | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState<string | null>(null);

  const waitingGuests = useMemo(() => guests.filter((g) => !g.roomId && !g.checkOut), [guests]);
  const checkedInGuests = useMemo(() => guests.filter((g) => g.roomId && !g.checkOut), [guests]);
  const unresolvedEvents = useMemo(() => events.filter((e) => !e.resolved), [events]);

  const occupancyRate = useMemo(() => {
    if (!hotel) return 0;
    return calculateOccupancyRate(hotel.rooms);
  }, [hotel, calculateOccupancyRate]);

  const energyConsumption = useMemo(() => {
    if (!hotel) return 0;
    const base = hotel.rooms.length * 15;
    const occupiedBonus = hotel.rooms.filter((r) => r.status === 'occupied').length * 8;
    const facilityBonus = hotel.facilities.length * 20;
    return Math.round(base + occupiedBonus + facilityBonus);
  }, [hotel]);

  const avgStaffFatigue = useMemo(() => {
    if (staffs.length === 0) return 0;
    return Math.round(staffs.reduce((sum, s) => sum + s.fatigue, 0) / staffs.length);
  }, [staffs]);

  const roomsByFloor = useMemo(() => {
    if (!hotel) return {} as Record<number, Room[]>;
    const grouped: Record<number, Room[]> = {};
    hotel.rooms.forEach((room) => {
      if (!grouped[room.floor]) grouped[room.floor] = [];
      grouped[room.floor].push(room);
    });
    Object.keys(grouped).forEach((key) => {
      grouped[Number(key)].sort((a, b) => a.number.localeCompare(b.number));
    });
    return grouped;
  }, [hotel]);

  const handleAutoAssign = async () => {
    if (!hotel) return;
    setAssigning(true);
    const assignments = autoAssignRooms(waitingGuests, hotel.rooms);
    setAssignResult(assignments);
    await autoAssignGuests();
    setTimeout(() => {
      setAssigning(false);
      setTimeout(() => setAssignResult(null), 3000);
    }, 500);
  };

  const getGuestName = (guestId: string) => {
    const guest = guests.find((g) => g.id === guestId);
    return guest?.name || '未知';
  };

  const handleResolveEvent = async (eventId: string, optionId: string) => {
    await resolveEvent(eventId, optionId);
    setSelectedEvent(null);
  };

  const handleDailyTick = async () => {
    setDailyTickLoading(true);
    await dailyTick();
    setDailyTickLoading(false);
  };

  const handleOpenRoomModal = (guest: Guest) => {
    setSelectedGuestForCheckIn(guest);
    setSelectedRoomId(null);
    setShowRoomModal(true);
  };

  const handleConfirmCheckIn = async () => {
    if (!selectedGuestForCheckIn || !selectedRoomId) return;
    setCheckInLoading(true);
    const success = await checkInGuest(selectedGuestForCheckIn.id, selectedRoomId);
    if (success) {
      await fetchHotel();
      setShowRoomModal(false);
      setSelectedGuestForCheckIn(null);
      setSelectedRoomId(null);
    }
    setCheckInLoading(false);
  };

  const handleCheckOut = async (guestId: string) => {
    try {
      setCheckOutLoading(guestId);
      const success = await checkOutGuest(guestId);
      if (success) {
        await fetchHotel();
      } else {
        console.error('[handleCheckOut] 退房失败');
      }
      setCheckOutLoading(null);
    } catch (error) {
      console.error('[handleCheckOut] 退房异常:', error);
      setCheckOutLoading(null);
    }
  };

  const vacantRooms = useMemo(() => {
    if (!hotel) return [];
    return hotel.rooms.filter((r) => r.status === 'vacant');
  }, [hotel]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-gradient-gold">运营中心</h1>
          <p className="text-navy-200 mt-1">实时监控与酒店管理</p>
        </div>
        <div className="flex gap-4">
          <div className="stat-card flex items-center gap-3 px-5 py-3">
            <Gauge className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs text-navy-300">客房占用率</p>
              <p className="text-lg font-semibold text-white">{occupancyRate}%</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3 px-5 py-3">
            <Zap className="w-5 h-5 text-gold-400" />
            <div>
              <p className="text-xs text-navy-300">能耗指数</p>
              <p className="text-lg font-semibold text-white">{energyConsumption}</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3 px-5 py-3">
            <Battery className="w-5 h-5 text-coral-500" />
            <div>
              <p className="text-xs text-navy-300">员工平均疲劳</p>
              <p className="text-lg font-semibold text-white">{avgStaffFatigue}%</p>
            </div>
          </div>
        </div>
      </div>

      {unresolvedEvents.length > 0 && (
        <div className="glass-card p-4 border-coral-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-coral-500" />
            <h2 className="text-lg font-semibold text-white">待处理事件</h2>
            <span className="badge-coral ml-2">{unresolvedEvents.length} 条</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unresolvedEvents.map((event) => {
              const EventIcon = EVENT_TYPE_STYLE[event.type].icon;
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-800/60 rounded-xl border border-gold-500/20 hover:border-gold-500/50 transition-all animate-pulse-gold"
                >
                  <EventIcon className={`w-4 h-4 ${EVENT_TYPE_STYLE[event.type].color}`} />
                  <span className="text-sm text-white">{event.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-400" />
              <h2 className="text-xl font-semibold text-white">等待入住客人</h2>
              <span className="badge-gold ml-1">{waitingGuests.length} 人</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDailyTick}
                disabled={dailyTickLoading}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {dailyTickLoading ? '结算中...' : '每日结算'}
              </button>
              <button
                onClick={handleAutoAssign}
                disabled={assigning || waitingGuests.length === 0}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {assigning ? '分房中...' : '自动分房'}
              </button>
            </div>
          </div>

          {assignResult && (
            <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-slide-in">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">分房完成！已分配 {assignResult.length} 位客人</span>
              </div>
              <div className="space-y-1">
                {assignResult.map((r) => {
                  const room = hotel?.rooms.find((rm) => rm.id === r.roomId);
                  return (
                    <p key={r.guestId} className="text-sm text-navy-200">
                      {getGuestName(r.guestId)} → {room?.number || '未知房间'}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {waitingGuests.length === 0 ? (
            <div className="text-center py-12 text-navy-300">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无等待入住的客人</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {waitingGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="bg-navy-800/40 rounded-xl p-4 border border-gold-500/10 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-navy-gradient flex items-center justify-center text-xl">
                        {guest.avatar || guest.name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{guest.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <DollarSign className="w-3 h-3 text-gold-400" />
                          <span className="text-sm text-gold-400 font-medium">
                            预算 ¥{guest.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-navy-300">满意度</p>
                      <p className="text-lg font-semibold text-white">{guest.satisfaction}%</p>
                    </div>
                  </div>
                  {guest.preferences.length > 0 && (
                    <div>
                      <p className="text-xs text-navy-300 mb-1.5">偏好</p>
                      <div className="flex flex-wrap gap-1">
                        {guest.preferences.slice(0, 4).map((pref) => (
                          <span key={pref} className="badge-gold text-[10px]">
                            {pref}
                          </span>
                        ))}
                        {guest.preferences.length > 4 && (
                          <span className="badge-gold text-[10px]">+{guest.preferences.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-gold-500/10">
                    <button
                      onClick={() => handleOpenRoomModal(guest)}
                      className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      办理入住
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-white">已入住客人</h2>
            <span className="badge-emerald ml-1">{checkedInGuests.length} 人</span>
          </div>

          {checkedInGuests.length === 0 ? (
            <div className="text-center py-12 text-navy-300">
              <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无已入住客人</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {checkedInGuests.map((guest) => {
                const room = hotel?.rooms.find((r) => r.id === guest.roomId || r.number === guest.roomId);
                return (
                  <div
                    key={guest.id}
                    className="bg-navy-800/40 rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-navy-gradient flex items-center justify-center text-lg">
                          {guest.avatar || guest.name[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{guest.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge-emerald text-[10px]">房间 {guest.roomId}</span>
                            <span className="text-xs text-navy-300">{room?.type || ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-navy-300">满意度</p>
                        <p className="text-base font-semibold text-white">{guest.satisfaction}%</p>
                      </div>
                    </div>
                    {guest.checkIn && (
                      <div className="flex items-center gap-1.5 mb-3 text-xs text-navy-300">
                        <Calendar className="w-3 h-3" />
                        <span>入住时间: {new Date(guest.checkIn).toLocaleDateString('zh-CN')}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleCheckOut(guest.id)}
                      disabled={checkOutLoading === guest.id}
                      className="w-full btn-secondary py-2 text-sm flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {checkOutLoading === guest.id ? '退房中...' : '办理退房'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-gold-400" />
            <h2 className="text-xl font-semibold text-white">实时监控</h2>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-navy-300 flex items-center gap-1">
                  <Bed className="w-4 h-4" /> 客房占用率
                </span>
                <span className="text-white font-medium">{occupancyRate}%</span>
              </div>
              <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-navy-400 mt-1">
                <span>空房 {hotel?.rooms.filter((r) => r.status === 'vacant').length || 0}</span>
                <span>占用 {hotel?.rooms.filter((r) => r.status === 'occupied').length || 0}</span>
                <span>维护 {hotel?.rooms.filter((r) => r.status === 'maintenance').length || 0}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-navy-300 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> 能耗指数
                </span>
                <span className={`font-medium ${energyConsumption > 500 ? 'text-coral-500' : 'text-white'}`}>
                  {energyConsumption} kWh
                </span>
              </div>
              <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    energyConsumption > 500
                      ? 'bg-gradient-to-r from-coral-600 to-coral-500'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min((energyConsumption / 1000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-navy-400 mt-1">
                {energyConsumption > 500 ? '⚠ 能耗偏高，建议检查设施' : '✓ 能耗处于正常水平'}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-navy-300 flex items-center gap-1">
                  <Battery className="w-4 h-4" /> 员工平均疲劳度
                </span>
                <span className={`font-medium ${avgStaffFatigue > 70 ? 'text-coral-500' : 'text-white'}`}>
                  {avgStaffFatigue}%
                </span>
              </div>
              <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    avgStaffFatigue > 70
                      ? 'bg-gradient-to-r from-coral-600 to-coral-500'
                      : avgStaffFatigue > 40
                      ? 'bg-gradient-to-r from-gold-600 to-gold-400'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                  }`}
                  style={{ width: `${avgStaffFatigue}%` }}
                />
              </div>
              <p className="text-[10px] text-navy-400 mt-1">
                {avgStaffFatigue > 70
                  ? '⚠ 员工疲劳度过高，建议安排休息'
                  : avgStaffFatigue > 40
                  ? '员工状态一般，注意排班'
                  : '✓ 员工状态良好'}
              </p>
            </div>

            <div className="pt-4 border-t border-gold-500/10">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-navy-800/40 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">{checkedInGuests.length}</p>
                  <p className="text-xs text-navy-300">已入住客人</p>
                </div>
                <div className="bg-navy-800/40 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {Math.round(calculateStaffImpact(staffs))}
                  </p>
                  <p className="text-xs text-navy-300">服务品质分</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-gold-400" />
            <h2 className="text-xl font-semibold text-white">客房状态</h2>
          </div>
          <div className="flex items-center gap-4">
            {(Object.entries(ROOM_STATUS_STYLE) as [RoomStatus, typeof ROOM_STATUS_STYLE[RoomStatus]][]).map(
              ([status, style]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${style.bg} ${style.border} border`} />
                  <span className={`text-xs ${style.text}`}>{style.label}</span>
                </div>
              )
            )}
          </div>
        </div>

        {!hotel || hotel.rooms.length === 0 ? (
          <div className="text-center py-12 text-navy-300">
            <DoorOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无客房</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(roomsByFloor)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([floor, rooms]) => (
                <div key={floor}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gold-400">{floor}F</span>
                    <div className="flex-1 h-px bg-gold-500/20" />
                    <span className="text-xs text-navy-400">{rooms.length} 间</span>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                    {rooms.map((room) => {
                      const style = ROOM_STATUS_STYLE[room.status];
                      const occupant = room.guestId ? guests.find((g) => g.id === room.guestId) : null;
                      return (
                        <div
                          key={room.id}
                          className={`${style.bg} ${style.border} border rounded-lg p-2 text-center hover:scale-105 transition-transform cursor-pointer`}
                          title={occupant ? `入住：${occupant.name}` : style.label}
                        >
                          <p className={`text-sm font-bold ${style.text}`}>{room.number}</p>
                          <p className={`text-[10px] ${style.text} opacity-70`}>{style.label}</p>
                          {occupant && (
                            <div className="mt-1 w-5 h-5 mx-auto rounded-full bg-navy-gradient flex items-center justify-center text-[10px] text-white">
                              {occupant.name[0]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {showRoomModal && selectedGuestForCheckIn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6 animate-slide-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-navy-gradient flex items-center justify-center text-xl">
                  {selectedGuestForCheckIn.avatar || selectedGuestForCheckIn.name[0]}
                </div>
                <div>
                  <span className="text-xs text-gold-400 font-medium">办理入住</span>
                  <h3 className="text-lg font-semibold text-white">{selectedGuestForCheckIn.name}</h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRoomModal(false);
                  setSelectedGuestForCheckIn(null);
                  setSelectedRoomId(null);
                }}
                className="text-navy-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5">
              <label className="text-sm text-navy-300 mb-2 block">选择空房</label>
              {vacantRooms.length === 0 ? (
                <div className="p-4 bg-coral-500/10 border border-coral-500/30 rounded-xl text-center">
                  <AlertTriangle className="w-8 h-8 text-coral-500 mx-auto mb-2" />
                  <p className="text-coral-500 text-sm">暂无可分配的空房</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {vacantRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        selectedRoomId === room.id
                          ? 'bg-gold-500/20 border-gold-500/50'
                          : 'bg-navy-800/60 border-gold-500/20 hover:border-gold-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DoorOpen className={`w-5 h-5 ${selectedRoomId === room.id ? 'text-gold-400' : 'text-navy-300'}`} />
                        <div>
                          <p className={`font-medium ${selectedRoomId === room.id ? 'text-gold-400' : 'text-white'}`}>
                            {room.number}
                          </p>
                          <p className="text-xs text-navy-300">{room.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gold-400 font-medium">¥{room.price}/晚</p>
                      </div>
                      {selectedRoomId === room.id && (
                        <CheckCircle2 className="w-5 h-5 text-gold-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRoomModal(false);
                  setSelectedGuestForCheckIn(null);
                  setSelectedRoomId(null);
                }}
                className="btn-secondary flex-1 py-2.5 text-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCheckIn}
                disabled={!selectedRoomId || checkInLoading || vacantRooms.length === 0}
                className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {checkInLoading ? '办理中...' : '确认入住'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-lg w-full p-6 animate-slide-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedEvent.type === 'complaint'
                      ? 'bg-coral-500/20'
                      : selectedEvent.type === 'malfunction'
                      ? 'bg-wine-500/20'
                      : selectedEvent.type === 'wedding'
                      ? 'bg-gold-500/20'
                      : 'bg-emerald-500/20'
                  }`}
                >
                  {(() => {
                    const IconComp = EVENT_TYPE_STYLE[selectedEvent.type].icon;
                    return (
                      <IconComp
                        className={`w-6 h-6 ${EVENT_TYPE_STYLE[selectedEvent.type].color}`}
                      />
                    );
                  })()}
                </div>
                <div>
                  <span className={`text-xs ${EVENT_TYPE_STYLE[selectedEvent.type].color} font-medium`}>
                    {EVENT_TYPE_STYLE[selectedEvent.type].label}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-navy-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-navy-200 mb-6 leading-relaxed">{selectedEvent.description}</p>

            <div className="space-y-2">
              <p className="text-sm text-navy-300 mb-3">选择处理方式：</p>
              {selectedEvent.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleResolveEvent(selectedEvent.id, option.id)}
                  className="w-full text-left p-4 bg-navy-800/60 rounded-xl border border-gold-500/20 hover:border-gold-500/50 hover:bg-navy-700/60 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-white font-medium group-hover:text-gold-300 transition-colors">
                      {option.label}
                    </span>
                    {option.cost && option.cost > 0 && (
                      <span className="text-coral-500 text-sm font-medium">-¥{option.cost.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {option.effect.rating !== undefined && option.effect.rating !== 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          option.effect.rating > 0
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-coral-500/20 text-coral-500'
                        }`}
                      >
                        评分 {option.effect.rating > 0 ? '+' : ''}
                        {option.effect.rating}
                      </span>
                    )}
                    {option.effect.satisfaction !== undefined && option.effect.satisfaction !== 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          option.effect.satisfaction > 0
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-coral-500/20 text-coral-500'
                        }`}
                      >
                        满意度 {option.effect.satisfaction > 0 ? '+' : ''}
                        {option.effect.satisfaction}
                      </span>
                    )}
                    {option.effect.coins !== undefined && option.effect.coins !== 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          option.effect.coins > 0
                            ? 'bg-gold-500/20 text-gold-400'
                            : 'bg-coral-500/20 text-coral-500'
                        }`}
                      >
                        {option.effect.coins > 0 ? '+' : ''}
                        ¥{option.effect.coins.toLocaleString()}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
