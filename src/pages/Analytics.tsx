import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Download,
  Calendar,
  UtensilsCrossed,
  Smile,
  BarChart3,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { exportToPDF } from '@/utils/pdfExport';

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export default function Analytics() {
  const { hotel, weeklyReport, fetchWeeklyReport, loading } = useGameStore();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (hotel?.id) {
      fetchWeeklyReport(hotel.id);
    }
  }, [hotel?.id, fetchWeeklyReport]);

  const occupancyData = useMemo(() => {
    if (!weeklyReport?.occupancyRate) {
      return weekDays.map((day) => ({
        day,
        rate: 60 + Math.floor(Math.random() * 30),
      }));
    }
    return weekDays.map((day, i) => ({
      day,
      rate: weeklyReport.occupancyRate[i] || 0,
    }));
  }, [weeklyReport]);

  const foodRevenueData = useMemo(() => {
    if (!weeklyReport?.foodRevenueHeatmap || weeklyReport.foodRevenueHeatmap.length === 0) {
      const data: { day: number; hour: number; value: number }[] = [];
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          let value = 0;
          if (h >= 7 && h <= 9) value = 30 + Math.floor(Math.random() * 40);
          else if (h >= 11 && h <= 14) value = 60 + Math.floor(Math.random() * 40);
          else if (h >= 17 && h <= 21) value = 70 + Math.floor(Math.random() * 30);
          else if (h >= 22 || h <= 6) value = Math.floor(Math.random() * 15);
          else value = 20 + Math.floor(Math.random() * 30);
          data.push({ day: d, hour: h, value });
        }
      }
      return data;
    }
    return weeklyReport.foodRevenueHeatmap;
  }, [weeklyReport]);

  const staffSatisfactionData = useMemo(() => {
    if (!weeklyReport?.staffSatisfactionTrend || weeklyReport.staffSatisfactionTrend.length === 0) {
      return weekDays.map((day) => ({
        day,
        value: 70 + Math.floor(Math.random() * 25),
      }));
    }
    return weeklyReport.staffSatisfactionTrend.map((item, i) => ({
      day: weekDays[i] || `D${i + 1}`,
      value: item.value,
    }));
  }, [weeklyReport]);

  const radarData = useMemo(() => {
    if (!weeklyReport?.radarData) {
      return [
        { subject: '服务', A: 85, fullMark: 100 },
        { subject: '舒适度', A: 78, fullMark: 100 },
        { subject: '餐饮', A: 82, fullMark: 100 },
        { subject: '设施', A: 75, fullMark: 100 },
        { subject: '性价比', A: 88, fullMark: 100 },
        { subject: '位置', A: 90, fullMark: 100 },
      ];
    }
    return [
      { subject: '服务', A: weeklyReport.radarData.service, fullMark: 100 },
      { subject: '舒适度', A: weeklyReport.radarData.comfort, fullMark: 100 },
      { subject: '餐饮', A: weeklyReport.radarData.food, fullMark: 100 },
      { subject: '设施', A: weeklyReport.radarData.facilities, fullMark: 100 },
      { subject: '性价比', A: weeklyReport.radarData.value, fullMark: 100 },
      { subject: '位置', A: weeklyReport.radarData.location, fullMark: 100 },
    ];
  }, [weeklyReport]);

  const summaryStats = useMemo(() => {
    const avgOccupancy = occupancyData.reduce((sum, d) => sum + d.rate, 0) / occupancyData.length;
    const totalRevenue = weeklyReport?.revenueByDay?.reduce((sum, d) => sum + d.amount, 0) || 128500;
    const avgSatisfaction = staffSatisfactionData.reduce((sum, d) => sum + d.value, 0) / staffSatisfactionData.length;
    const overallRating = radarData.reduce((sum, d) => sum + d.A, 0) / radarData.length;
    return [
      {
        icon: TrendingUp,
        label: '平均入住率',
        value: `${avgOccupancy.toFixed(1)}%`,
        change: '+5.2%',
        positive: true,
        color: 'text-emerald-500',
      },
      {
        icon: DollarSign,
        label: '本周总收入',
        value: `¥${totalRevenue.toLocaleString()}`,
        change: '+12.8%',
        positive: true,
        color: 'text-gold-400',
      },
      {
        icon: Smile,
        label: '员工满意度',
        value: `${avgSatisfaction.toFixed(1)}%`,
        change: '+2.1%',
        positive: true,
        color: 'text-coral-500',
      },
      {
        icon: Star,
        label: '综合评分',
        value: overallRating.toFixed(1),
        change: '+0.3',
        positive: true,
        color: 'text-gold-400',
      },
    ];
  }, [occupancyData, staffSatisfactionData, radarData, weeklyReport]);

  const getHeatColor = (value: number) => {
    if (value >= 80) return '#C9A962';
    if (value >= 60) return '#D4AE66';
    if (value >= 40) return '#DEC289';
    if (value >= 20) return '#EBDBB2';
    return '#2D4465';
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportToPDF('analytics-report', `${hotel?.name || '酒店'}-运营报告.pdf`);
    } catch (error) {
      console.error('PDF导出失败:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div id="analytics-report" className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient-gold mb-2">
              数据分析中心
            </h1>
            <p className="text-navy-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {weeklyReport
                ? `${new Date(weeklyReport.weekStart).toLocaleDateString()} - ${new Date(weeklyReport.weekEnd).toLocaleDateString()}`
                : '本周运营报告'}
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting || loading.weeklyReport}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <Download className="w-5 h-5" />
            {exporting ? '导出中...' : '导出PDF'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-navy-300 text-sm mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-2 rounded-xl bg-navy-600/50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span
                  className={`text-sm font-medium ${
                    stat.positive ? 'text-emerald-500' : 'text-coral-500'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-navy-400 text-sm ml-1">较上周</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gold-400" />
              <h3 className="text-lg font-semibold text-white">入住率趋势</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={occupancyData}>
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A962" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C9A962" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D4465" />
                  <XAxis dataKey="day" stroke="#7A91B0" fontSize={12} />
                  <YAxis stroke="#7A91B0" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A2332',
                      border: '1px solid #C9A96233',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [`${value}%`, '入住率']}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#C9A962"
                    strokeWidth={3}
                    fill="url(#occupancyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smile className="w-5 h-5 text-coral-500" />
              <h3 className="text-lg font-semibold text-white">员工满意度趋势</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={staffSatisfactionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D4465" />
                  <XAxis dataKey="day" stroke="#7A91B0" fontSize={12} />
                  <YAxis stroke="#7A91B0" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A2332',
                      border: '1px solid #FF6B4A33',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [`${value}%`, '满意度']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FF6B4A"
                    strokeWidth={3}
                    dot={{ fill: '#FF6B4A', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="w-5 h-5 text-gold-400" />
            <h3 className="text-lg font-semibold text-white">餐饮收入热力图</h3>
            <span className="text-navy-400 text-sm ml-2">7天 × 24小时</span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="flex mb-2">
                <div className="w-12 flex-shrink-0" />
                {hours.filter((_, i) => i % 3 === 0).map((h) => (
                  <div key={h} className="w-6 text-center text-xs text-navy-400">
                    {h.split(':')[0]}
                  </div>
                ))}
              </div>
              {weekDays.map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-12 flex-shrink-0 text-xs text-navy-300">{day}</div>
                  <div className="flex gap-0.5">
                    {hours
                      .filter((_, i) => i % 3 === 0)
                      .map((_, hourGroupIndex) => {
                        const hourIndex = hourGroupIndex * 3;
                        const cell = foodRevenueData.find(
                          (d) => d.day === dayIndex && d.hour === hourIndex
                        );
                        const value = cell?.value || 0;
                        return (
                          <div
                            key={`${dayIndex}-${hourIndex}`}
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: getHeatColor(value) }}
                            title={`${day} ${hours[hourIndex]}: ¥${value * 10}`}
                          />
                        );
                      })}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 mt-4 ml-12">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2D4465' }} />
                  <span className="text-xs text-navy-400">低</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EBDBB2' }} />
                  <span className="text-xs text-navy-400">较低</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DEC289' }} />
                  <span className="text-xs text-navy-400">中</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D4AE66' }} />
                  <span className="text-xs text-navy-400">较高</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#C9A962' }} />
                  <span className="text-xs text-navy-400">高</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gold-400" />
            <h3 className="text-lg font-semibold text-white">酒店综合评分雷达图</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2D4465" />
                <PolarAngleAxis dataKey="subject" stroke="#7A91B0" fontSize={14} />
                <PolarRadiusAxis stroke="#2D4465" domain={[0, 100]} />
                <Radar
                  name="评分"
                  dataKey="A"
                  stroke="#C9A962"
                  fill="#C9A962"
                  fillOpacity={0.3}
                  strokeWidth={2}
                >
                  {radarData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#C9A962" fillOpacity={0.3} />
                  ))}
                </Radar>
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2332',
                    border: '1px solid #C9A96233',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`${value}/100`, '评分']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
