import { useState, useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import {
  Castle,
  Building2,
  Palmtree,
  BedDouble,
  Crown,
  Home,
  Waves,
  Sparkles,
  UtensilsCrossed,
  Dumbbell,
  Wine,
  Plus,
  Minus,
  ArrowUp,
  Check,
  Star,
  DollarSign,
  TrendingUp,
  Info,
  Zap,
  Pencil,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { HOTEL_STYLES, ROOM_TYPES, FACILITY_CONFIG } from '../../shared/config';
import ProgressRing from '@/components/ProgressRing';
import type { HotelStyle, RoomType, FacilityType } from 'shared/types';

const styleIcons: Record<HotelStyle, React.ReactNode> = {
  classical: <Castle className="w-8 h-8" />,
  modern: <Building2 className="w-8 h-8" />,
  tropical: <Palmtree className="w-8 h-8" />,
};

const facilityIcons: Record<FacilityType, React.ReactNode> = {
  pool: <Waves className="w-6 h-6" />,
  spa: <Sparkles className="w-6 h-6" />,
  restaurant: <UtensilsCrossed className="w-6 h-6" />,
  gym: <Dumbbell className="w-6 h-6" />,
  lounge: <Wine className="w-6 h-6" />,
};

const roomIcons: Record<RoomType, React.ReactNode> = {
  standard: <BedDouble className="w-6 h-6" />,
  suite: <Crown className="w-6 h-6" />,
  villa: <Home className="w-6 h-6" />,
};

export default function Hotel() {
  const hotel = useGameStore((s) => s.hotel);
  const staffs = useGameStore((s) => s.staffs);
  const updateHotelStyle = useGameStore((s) => s.updateHotelStyle);
  const updateHotelName = useGameStore((s) => s.updateHotelName);
  const addRoom = useGameStore((s) => s.addRoom);
  const updateRoomPrice = useGameStore((s) => s.updateRoomPrice);
  const upgradeFacility = useGameStore((s) => s.upgradeFacility);
  const addFacility = useGameStore((s) => s.addFacility);

  const [selectedStyle, setSelectedStyle] = useState<HotelStyle>(
    hotel?.style || 'classical'
  );
  const [roomCounts, setRoomCounts] = useState<Record<RoomType, number>>({
    standard: hotel?.rooms?.filter((r) => r.type === 'standard').length || 12,
    suite: hotel?.rooms?.filter((r) => r.type === 'suite').length || 8,
    villa: hotel?.rooms?.filter((r) => r.type === 'villa').length || 4,
  });
  const [editingName, setEditingName] = useState(false);
  const [tempHotelName, setTempHotelName] = useState(hotel?.name || '');
  const [roomPrices, setRoomPrices] = useState<Record<RoomType, number>>(() => {
    const prices: Record<RoomType, number> = {
      standard: 620,
      suite: 1850,
      villa: 6200,
    };
    if (hotel?.rooms) {
      (Object.keys(prices) as RoomType[]).forEach((type) => {
        const room = hotel.rooms.find((r) => r.type === type);
        if (room) prices[type] = room.price;
      });
    }
    return prices;
  });

  const { calculateHotelComfort, calculateOptimalPricing } = useGameEngine();

  const comfortScore = hotel
    ? calculateHotelComfort(hotel, staffs)
    : 78.5;

  const optimalPrices = useMemo(() => {
    if (hotel && staffs.length > 0) {
      return calculateOptimalPricing(hotel, staffs, 1);
    }
    return {
      standard: 620,
      suite: 1850,
      villa: 6200,
    };
  }, [hotel, staffs, calculateOptimalPricing]);

  const facilityLevels = useMemo(() => {
    if (hotel?.facilities && hotel.facilities.length > 0) {
      const levels: Partial<Record<FacilityType, number>> = {};
      hotel.facilities.forEach((f) => {
        levels[f.type] = f.level;
      });
      return levels;
    }
    return {
      pool: 3,
      spa: 2,
      restaurant: 4,
      gym: 2,
      lounge: 3,
    };
  }, [hotel]);

  const radarData = [
    { subject: '服务', value: 85, fullMark: 100 },
    { subject: '舒适度', value: comfortScore, fullMark: 100 },
    { subject: '餐饮', value: 78, fullMark: 100 },
    { subject: '设施', value: 82, fullMark: 100 },
    { subject: '性价比', value: 72, fullMark: 100 },
    { subject: '位置', value: 90, fullMark: 100 },
  ];

  const handleStyleSelect = async (style: HotelStyle) => {
    setSelectedStyle(style);
    if (hotel && hotel.style !== style) {
      try {
        await updateHotelStyle(style);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRoomChange = async (type: RoomType, delta: number) => {
    if (delta > 0) {
      try {
        const success = await addRoom(type);
        if (success) {
          setRoomCounts((prev) => ({
            ...prev,
            [type]: prev[type] + delta,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setRoomCounts((prev) => ({
        ...prev,
        [type]: Math.max(0, prev[type] + delta),
      }));
    }
  };

  const handleSaveHotelName = async () => {
    if (!tempHotelName.trim()) return;
    try {
      await updateHotelName(tempHotelName.trim());
      setEditingName(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRoomPrice = async (type: RoomType) => {
    if (!hotel?.rooms) return;
    const room = hotel.rooms.find((r) => r.type === type);
    if (!room) return;
    try {
      await updateRoomPrice(room.id, roomPrices[type]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpgradeFacility = async (type: FacilityType) => {
    if (!hotel?.facilities) return;
    const facility = hotel.facilities.find((f) => f.type === type);
    try {
      if (facility) {
        await upgradeFacility(facility.id);
      } else {
        await addFacility(type);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-gradient-gold">
            酒店管理
          </h1>
          {editingName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={tempHotelName}
                onChange={(e) => setTempHotelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveHotelName();
                }}
                autoFocus
                className="px-3 py-1.5 rounded-lg bg-navy-700/80 border border-gold-500/30 text-white text-sm focus:outline-none focus:border-gold-400/60"
              />
              <button
                onClick={handleSaveHotelName}
                className="px-3 py-1.5 rounded-lg bg-gold-gradient text-navy-700 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                确认
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setTempHotelName(hotel?.name || '');
                }}
                className="px-3 py-1.5 rounded-lg bg-navy-600/80 text-navy-200 text-sm hover:bg-navy-500/80 transition-colors"
              >
                取消
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-navy-300">
                {hotel?.name || '金沙大酒店'} · 自定义你的奢华酒店
              </p>
              <button
                onClick={() => {
                  setTempHotelName(hotel?.name || '');
                  setEditingName(true);
                }}
                className="p-1 rounded-md text-navy-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold font-display text-gold-300 mb-6">
          酒店风格
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(HOTEL_STYLES) as HotelStyle[]).map((styleKey) => {
            const style = HOTEL_STYLES[styleKey];
            const isSelected = selectedStyle === styleKey;
            return (
              <div
                key={styleKey}
                onClick={() => handleStyleSelect(styleKey)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-gold-400 shadow-luxury-lg'
                    : 'hover:shadow-luxury border border-gold-500/20'
                }`}
              >
                <div
                  className="h-40 flex items-center justify-center"
                  style={{ backgroundColor: `${style.color}25` }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white transition-transform duration-300"
                    style={{ backgroundColor: style.color }}
                  >
                    {styleIcons[styleKey]}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center">
                    <Check className="w-4 h-4 text-navy-700" />
                  </div>
                )}
                <div className="p-4 bg-navy-700/80">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{style.name}</h3>
                    <span className="badge-gold">
                      ×{style.priceMultiplier}
                    </span>
                  </div>
                  <p className="text-sm text-navy-300 mb-3 min-h-[40px]">
                    {style.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {style.decor.slice(0, 3).map((item, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-md bg-navy-600/60 text-navy-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold-500/10">
                    <span className="text-sm text-navy-400">基础舒适度</span>
                    <span className="text-sm font-semibold text-gold-300">
                      {style.baseComfort}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-navy-400">建造成本</span>
                    <span className="text-sm font-semibold text-gold-300">
                      ¥{style.buildCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold font-display text-gold-300 mb-6">
            房间管理
          </h2>
          <div className="space-y-4">
            {(Object.keys(ROOM_TYPES) as RoomType[]).map((typeKey) => {
              const room = ROOM_TYPES[typeKey];
              const count = roomCounts[typeKey];
              const optimal = optimalPrices[typeKey];
              return (
                <div
                  key={typeKey}
                  className="p-4 rounded-xl bg-navy-800/40 border border-gold-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                        {roomIcons[typeKey]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{room.name}</h3>
                          <span className="badge-gold">
                            {room.size}㎡
                          </span>
                        </div>
                        <p className="text-sm text-navy-300 mt-1">
                          {room.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-navy-400">
                            容纳 {room.capacity} 人
                          </span>
                          <span className="text-sm text-navy-400">
                            维护 ¥{room.dailyMaintenance}/天
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRoomChange(typeKey, -1)}
                        className="w-9 h-9 rounded-lg bg-navy-600/80 border border-gold-500/20 text-gold-300 hover:border-gold-400/60 hover:bg-navy-500/80 transition-all flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xl font-bold text-gradient-gold w-12 text-center font-display">
                        {count}
                      </span>
                      <button
                        onClick={() => handleRoomChange(typeKey, 1)}
                        className="w-9 h-9 rounded-lg bg-navy-600/80 border border-gold-500/20 text-gold-300 hover:border-gold-400/60 hover:bg-navy-500/80 transition-all flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gold-500/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-navy-400 mb-1">建议定价</p>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gold-400" />
                          <span className="text-lg font-bold text-gradient-gold font-display">
                            ¥{optimal.toLocaleString()}
                          </span>
                          <span className="text-xs text-emerald-500 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            最优
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-navy-400 mb-1 text-right">每日收入</p>
                        <p className="text-lg font-bold text-white font-display text-right">
                          ¥{(roomPrices[typeKey] * count).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-navy-400 flex-shrink-0">实际价格</p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setRoomPrices((prev) => ({
                              ...prev,
                              [typeKey]: Math.max(0, prev[typeKey] - 50),
                            }))
                          }
                          className="w-7 h-7 rounded-md bg-navy-600/80 border border-gold-500/20 text-gold-300 hover:border-gold-400/60 hover:bg-navy-500/80 transition-all flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={roomPrices[typeKey]}
                          onChange={(e) =>
                            setRoomPrices((prev) => ({
                              ...prev,
                              [typeKey]: Math.max(0, parseInt(e.target.value) || 0),
                            }))
                          }
                          className="w-24 px-2 py-1 rounded-md bg-navy-700/80 border border-gold-500/20 text-white text-sm text-center focus:outline-none focus:border-gold-400/60"
                        />
                        <button
                          onClick={() =>
                            setRoomPrices((prev) => ({
                              ...prev,
                              [typeKey]: prev[typeKey] + 50,
                            }))
                          }
                          className="w-7 h-7 rounded-md bg-navy-600/80 border border-gold-500/20 text-gold-300 hover:border-gold-400/60 hover:bg-navy-500/80 transition-all flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleSaveRoomPrice(typeKey)}
                        className="ml-auto px-3 py-1.5 rounded-md bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-medium hover:bg-gold-500/20 hover:border-gold-400/50 transition-all"
                      >
                        保存价格
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold font-display text-gold-300 mb-6">
            舒适度评分
          </h2>
          <div className="flex flex-col items-center">
            <ProgressRing
              value={comfortScore}
              size={200}
              strokeWidth={16}
              label="综合舒适度"
              sublabel="基于设施、服务、员工计算"
            />

            <div className="w-full h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(201, 169, 98, 0.2)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="#D4AE66"
                    fontSize={12}
                  />
                  <PolarRadiusAxis
                    stroke="#7A91B0"
                    fontSize={10}
                    axisLine={false}
                  />
                  <Radar
                    name="评分"
                    dataKey="value"
                    stroke="#C9A962"
                    fill="#C9A962"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full mt-4 p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-gold-300 mb-1">定价策略建议</p>
                  <ul className="text-sm text-navy-300 space-y-1">
                    <li className="flex items-start gap-2">
                      <ArrowUp className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      标准间可上浮 5%，当前需求旺盛
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="w-3 h-3 text-gold-400 mt-0.5 flex-shrink-0" />
                      豪华套房保持当前价位，市场竞争激烈
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowUp className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      别墅建议上调 10%，高净值客户需求增加
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold font-display text-gold-300 mb-6">
          设施列表
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {(Object.keys(FACILITY_CONFIG) as FacilityType[]).map((typeKey) => {
            const facility = FACILITY_CONFIG[typeKey];
            const level = facilityLevels[typeKey] || 1;
            const maxLevel = facility.maxLevel;
            return (
              <div
                key={typeKey}
                className="p-4 rounded-xl bg-navy-800/40 border border-gold-500/10 hover:border-gold-500/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                    {facilityIcons[typeKey]}
                  </div>
                  <span className="badge-gold">Lv.{level}</span>
                </div>
                <h3 className="font-bold text-white mb-1">{facility.name}</h3>
                <p className="text-xs text-navy-300 mb-3 min-h-[32px]">
                  {facility.description}
                </p>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < level ? 'bg-gold-gradient' : 'bg-navy-600/60'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-navy-400">
                    舒适度 +{facility.comfortPerLevel * level}
                  </span>
                  <button
                    onClick={() => handleUpgradeFacility(typeKey)}
                    disabled={level >= maxLevel}
                    className="flex items-center gap-1 text-gold-400 hover:text-gold-300 disabled:text-navy-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>升级</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
