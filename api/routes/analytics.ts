import { Router, type Request, type Response } from 'express'
import { getHotelById, getStaffByHotelId, type WeeklyReport } from '../data/store.js'

const router = Router()

router.get('/:hotelId/weekly-report', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, data: null, error: '酒店不存在' })
      return
    }

    const staff = getStaffByHotelId(hotelId)

    const occupancyRate: number[] = []
    for (let i = 0; i < 7; i++) {
      const baseRate = hotel.rooms.length > 0
        ? hotel.rooms.filter(r => r.status === 'occupied').length / hotel.rooms.length * 100
        : 60
      const variation = (Math.random() - 0.5) * 20
      occupancyRate.push(Math.round(Math.min(100, Math.max(0, baseRate + variation))))
    }

    const revenueByDay: { date: string; amount: number }[] = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const baseRevenue = hotel.totalRevenue / 30
      const variation = (Math.random() - 0.5) * baseRevenue * 0.4
      revenueByDay.push({ date: dateStr, amount: Math.round(baseRevenue + variation) })
    }

    const foodRevenueHeatmap: { day: number; hour: number; value: number }[] = []
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        let baseValue = 50
        if (hour >= 6 && hour <= 9) baseValue = 200 + Math.random() * 100
        else if (hour >= 11 && hour <= 14) baseValue = 350 + Math.random() * 150
        else if (hour >= 17 && hour <= 21) baseValue = 400 + Math.random() * 200
        else if (hour >= 22 || hour <= 5) baseValue = 20 + Math.random() * 30
        else baseValue = 80 + Math.random() * 60
        foodRevenueHeatmap.push({ day, hour, value: Math.round(baseValue) })
      }
    }

    const staffSatisfactionTrend: { date: string; value: number }[] = []
    const avgSatisfaction = staff.length > 0
      ? staff.reduce((sum, s) => sum + s.satisfaction, 0) / staff.length
      : 75
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const variation = (Math.random() - 0.5) * 10
      staffSatisfactionTrend.push({
        date: dateStr,
        value: Math.round(Math.min(100, Math.max(0, avgSatisfaction + variation))),
      })
    }

    const staffSkillAvg = staff.length > 0
      ? {
          service: Math.round(staff.reduce((sum, s) => sum + s.skills.service, 0) / staff.length),
          efficiency: Math.round(staff.reduce((sum, s) => sum + s.skills.efficiency, 0) / staff.length),
          friendliness: Math.round(staff.reduce((sum, s) => sum + s.skills.friendliness, 0) / staff.length),
          professionalism: Math.round(staff.reduce((sum, s) => sum + s.skills.professionalism, 0) / staff.length),
        }
      : { service: 70, efficiency: 70, friendliness: 70, professionalism: 70 }

    const facilityAvg = hotel.facilities.length > 0
      ? Math.round(hotel.facilities.reduce((sum, f) => sum + f.quality, 0) / hotel.facilities.length)
      : 65

    const radarData = {
      service: staffSkillAvg.service,
      comfort: hotel.comfortScore,
      food: Math.round((staffSkillAvg.efficiency + staffSkillAvg.professionalism) / 2),
      facilities: facilityAvg,
      value: Math.round(hotel.rating * 20),
      location: 70 + Math.round(Math.random() * 20),
    }

    const report: WeeklyReport = {
      weekStart: new Date(today.getTime() - 6 * 86400000),
      weekEnd: today,
      occupancyRate,
      revenueByDay,
      foodRevenueHeatmap,
      staffSatisfactionTrend,
      radarData,
    }

    res.status(200).json({ success: true, data: report, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '生成周报失败' })
  }
})

router.get('/:hotelId/export-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, data: null, error: '酒店不存在' })
      return
    }
    res.status(200).json({ success: true, data: { url: 'download' }, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '导出PDF失败' })
  }
})

export default router
