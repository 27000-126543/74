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
  UserPlus,
  Users,
  Calendar,
  TrendingUp,
  Briefcase,
  Star,
  Battery,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  ChefHat,
  Sparkles,
  Crown,
  Coffee,
  Sun,
  Moon,
  Ban,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { STAFF_POSITIONS, GAME_CONSTANTS } from '../../shared/config';
import type { Staff, StaffPosition, ShiftType } from 'shared/types';

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const SHIFT_OPTIONS: { value: ShiftType; label: string; icon: typeof Sun }[] = [
  { value: 'morning', label: '早班', icon: Sun },
  { value: 'afternoon', label: '午班', icon: Coffee },
  { value: 'night', label: '晚班', icon: Moon },
  { value: 'off', label: '休息', icon: Ban },
];

const POSITION_ICON: Record<StaffPosition, typeof User> = {
  receptionist: Sparkles,
  chef: ChefHat,
  cleaner: User,
  manager: Crown,
};

const SKILL_LABELS: Record<string, string> = {
  service: '服务',
  efficiency: '效率',
  friendliness: '亲和',
  professionalism: '专业',
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  working: { label: '工作中', className: 'badge-emerald' },
  resting: { label: '休息中', className: 'badge-gold' },
  off: { label: '休假', className: 'badge-coral' },
};

export default function Staff() {
  const { staffs, hotel, hireStaff, updateStaffSchedule, promoteStaff } = useGameStore();
  const { calculateStaffEfficiency } = useGameEngine();
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [hireLoading, setHireLoading] = useState<StaffPosition | null>(null);

  const staffsByPosition = useMemo(() => {
    const grouped: Record<StaffPosition, Staff[]> = {
      receptionist: [],
      chef: [],
      cleaner: [],
      manager: [],
    };
    staffs.forEach((s) => grouped[s.position].push(s));
    return grouped;
  }, [staffs]);

  const pendingPromotions = useMemo(
    () => staffs.filter((s) => s.level >= 2 && s.satisfaction >= 80 && s.fatigue <= 30),
    [staffs]
  );

  const avgFatigue = useMemo(() => {
    if (staffs.length === 0) return 0;
    return Math.round(staffs.reduce((sum, s) => sum + s.fatigue, 0) / staffs.length);
  }, [staffs]);

  const avgSatisfaction = useMemo(() => {
    if (staffs.length === 0) return 0;
    return Math.round(staffs.reduce((sum, s) => sum + s.satisfaction, 0) / staffs.length);
  }, [staffs]);

  const handleHire = async (position: StaffPosition) => {
    if (!hotel) return;
    setHireLoading(position);
    const names = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨帆', '赵磊', '周婷'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    await hireStaff({ name: randomName, position });
    setHireLoading(null);
  };

  const handleShiftChange = async (staffId: string, day: number, shift: ShiftType) => {
    const staff = staffs.find((s) => s.id === staffId);
    if (!staff) return;
    const newSchedule = staff.schedule.map((item) =>
      item.day === day ? { ...item, shift } : item
    );
    await updateStaffSchedule(staffId, newSchedule);
  };

  const handlePromote = async (staffId: string) => {
    await promoteStaff(staffId);
  };

  const getSkillRadarData = (staff: Staff) => {
    return Object.entries(staff.skills).map(([key, value]) => ({
      skill: SKILL_LABELS[key] || key,
      value,
      fullMark: 100,
    }));
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-gradient-gold">员工管理</h1>
          <p className="text-navy-200 mt-1">管理团队、排班与晋升</p>
        </div>
        <div className="flex gap-4">
          <div className="stat-card flex items-center gap-3 px-5 py-3">
            <Users className="w-5 h-5 text-gold-400" />
            <div>
              <p className="text-xs text-navy-300">总人数</p>
              <p className="text-lg font-semibold text-white">{staffs.length}</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3 px-5 py-3">
            <Battery className="w-5 h-5 text-coral-500" />
            <div>
              <p className="text-xs text-navy-300">平均疲劳度</p>
              <p className="text-lg font-semibold text-white">{avgFatigue}%</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3 px-5 py-3">
            <Star className="w-5 h-5 text-gold-400" />
            <div>
              <p className="text-xs text-navy-300">平均满意度</p>
              <p className="text-lg font-semibold text-white">{avgSatisfaction}%</p>
            </div>
          </div>
        </div>
      </div>

      <section className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <UserPlus className="w-5 h-5 text-gold-400" />
          <h2 className="text-xl font-semibold text-white">招聘中心</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(STAFF_POSITIONS) as [StaffPosition, typeof STAFF_POSITIONS[StaffPosition]][]).map(
            ([key, config]) => {
              const IconComp = POSITION_ICON[key];
              const count = staffsByPosition[key].length;
              const canHire = count < config.maxStaffPerHotel;
              return (
                <div
                  key={key}
                  className="bg-navy-800/40 rounded-xl p-5 border border-gold-500/10 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gold-gradient/20 flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-gold-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{config.name}</h3>
                        <p className="text-xs text-navy-300">
                          {count}/{config.maxStaffPerHotel} 人
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-navy-200 mb-3 leading-relaxed">{config.description}</p>
                  <div className="mb-3">
                    <p className="text-xs text-navy-300 mb-1">核心技能</p>
                    <div className="flex flex-wrap gap-1">
                      {config.skills.map((skill) => (
                        <span key={skill} className="badge-gold text-[10px]">
                          {SKILL_LABELS[skill] || skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-navy-300">基础薪资</span>
                    <span className="text-gold-400 font-semibold">¥{config.baseSalary.toLocaleString()}/月</span>
                  </div>
                  <button
                    onClick={() => handleHire(key)}
                    disabled={!canHire || hireLoading === key}
                    className={canHire ? 'btn-primary w-full py-2 text-sm' : 'btn-secondary w-full py-2 text-sm opacity-50 cursor-not-allowed'}
                  >
                    {hireLoading === key ? '招聘中...' : canHire ? '招聘' : '已满员'}
                  </button>
                </div>
              );
            }
          )}
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Briefcase className="w-5 h-5 text-gold-400" />
          <h2 className="text-xl font-semibold text-white">员工列表</h2>
        </div>
        {staffs.length === 0 ? (
          <div className="text-center py-12 text-navy-300">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无员工，请先在招聘中心招聘</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffs.map((staff) => {
              const PositionIcon = POSITION_ICON[staff.position];
              const statusInfo = STATUS_LABEL[staff.status];
              const isExpanded = expandedStaffId === staff.id;
              const radarData = getSkillRadarData(staff);
              const efficiency = calculateStaffEfficiency(staff);
              return (
                <div
                  key={staff.id}
                  className="bg-navy-800/40 rounded-xl border border-gold-500/10 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-navy-gradient flex items-center justify-center text-2xl">
                          {staff.avatar || staff.name[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{staff.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <PositionIcon className="w-4 h-4 text-gold-400" />
                            <span className="text-sm text-gold-300">
                              {STAFF_POSITIONS[staff.position].name}
                            </span>
                            <span className="badge-gold text-[10px]">Lv.{staff.level}</span>
                          </div>
                        </div>
                      </div>
                      <span className={statusInfo.className}>{statusInfo.label}</span>
                    </div>

                    <div className="h-36 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                          <PolarGrid stroke="#C9A962" strokeOpacity={0.2} />
                          <PolarAngleAxis
                            dataKey="skill"
                            tick={{ fill: '#D7DEE8', fontSize: 11 }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={{ fill: '#7A91B0', fontSize: 9 }}
                            axisLine={false}
                          />
                          <Radar
                            name="技能"
                            dataKey="value"
                            stroke="#C9A962"
                            fill="#C9A962"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-navy-300 flex items-center gap-1">
                            <Star className="w-3 h-3" /> 满意度
                          </span>
                          <span className="text-white font-medium">{staff.satisfaction}%</span>
                        </div>
                        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all"
                            style={{ width: `${staff.satisfaction}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-navy-300 flex items-center gap-1">
                            <Battery className="w-3 h-3" /> 疲劳度
                          </span>
                          <span className="text-white font-medium">{staff.fatigue}%</span>
                        </div>
                        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              staff.fatigue > 70
                                ? 'bg-gradient-to-r from-coral-600 to-coral-500'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                            }`}
                            style={{ width: `${staff.fatigue}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gold-500/10">
                        <span className="text-xs text-navy-300">效率评分</span>
                        <span className="text-gold-400 font-semibold">{efficiency}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedStaffId(isExpanded ? null : staff.id)}
                      className="w-full mt-4 py-2 text-sm text-gold-300 hover:text-gold-400 flex items-center justify-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> 收起排班
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> 查看排班
                        </>
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gold-500/10 p-4 bg-navy-900/40">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-gold-400" />
                        <span className="text-sm font-medium text-white">本周排班</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {WEEKDAYS.map((day, idx) => {
                          const scheduleItem = staff.schedule.find((s) => s.day === idx);
                          const currentShift = scheduleItem?.shift || 'off';
                          return (
                            <div key={day} className="text-center">
                              <p className="text-[10px] text-navy-300 mb-1">{day}</p>
                              <div className="flex flex-col gap-1">
                                {SHIFT_OPTIONS.map((opt) => {
                                  const ShiftIcon = opt.icon;
                                  const isActive = currentShift === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      onClick={() => handleShiftChange(staff.id, idx, opt.value)}
                                      className={`p-1.5 rounded text-[9px] flex flex-col items-center gap-0.5 transition-all ${
                                        isActive
                                          ? opt.value === 'off'
                                            ? 'bg-navy-600 text-navy-200'
                                            : 'bg-gold-gradient text-navy-700 font-semibold'
                                          : 'bg-navy-800 text-navy-400 hover:bg-navy-700'
                                      }`}
                                      title={opt.label}
                                    >
                                      <ShiftIcon className="w-3 h-3" />
                                      <span>{opt.label[0]}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-gold-400" />
          <h2 className="text-xl font-semibold text-white">晋升审批</h2>
          {pendingPromotions.length > 0 && (
            <span className="badge-coral ml-2">{pendingPromotions.length} 待审批</span>
          )}
        </div>
        {pendingPromotions.length === 0 ? (
          <div className="text-center py-8 text-navy-300">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无符合晋升条件的员工</p>
            <p className="text-xs text-navy-400 mt-1">晋升条件：等级≥2、满意度≥80%、疲劳度≤30%</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingPromotions.map((staff) => {
              const PositionIcon = POSITION_ICON[staff.position];
              return (
                <div
                  key={staff.id}
                  className="flex items-center justify-between bg-navy-800/40 rounded-xl p-4 border border-gold-500/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-navy-gradient flex items-center justify-center text-xl">
                      {staff.avatar || staff.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{staff.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <PositionIcon className="w-4 h-4 text-gold-400" />
                        <span className="text-sm text-gold-300">
                          {STAFF_POSITIONS[staff.position].name}
                        </span>
                        <span className="badge-gold text-[10px]">Lv.{staff.level} → Lv.{staff.level + 1}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs">
                      <p className="text-navy-300">满意度 <span className="text-emerald-500 font-medium">{staff.satisfaction}%</span></p>
                      <p className="text-navy-300 mt-1">疲劳度 <span className="text-emerald-500 font-medium">{staff.fatigue}%</span></p>
                      <p className="text-navy-300 mt-1">新薪资 <span className="text-gold-400 font-semibold">¥{Math.round(staff.salary * 1.3).toLocaleString()}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePromote(staff.id)}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" /> 通过
                      </button>
                      <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> 驳回
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
