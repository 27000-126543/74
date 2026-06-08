import { Router, type Request, type Response } from 'express'
import { getHotelById, getStaffByHotelId, type WeeklyReport, getAllHotels } from '../data/store.js'

const router = Router()

router.get('/:hotelId/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, data: null, error: '酒店不存在' })
      return
    }
    const staff = getStaffByHotelId(hotelId)
    const occupiedRooms = hotel.rooms.filter(r => r.status === 'occupied').length
    const occupancyRate = hotel.rooms.length > 0
      ? Math.round((occupiedRooms / hotel.rooms.length) * 100)
      : 0
    const dashboard = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      rating: hotel.rating,
      totalRevenue: hotel.totalRevenue,
      roomCount: hotel.rooms.length,
      occupiedRooms,
      occupancyRate,
      staffCount: staff.length,
      facilityCount: hotel.facilities.length,
      comfortScore: hotel.comfortScore,
    }
    res.status(200).json({ success: true, data: dashboard, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取仪表盘数据失败' })
  }
})

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

router.get('/:hotelId/revenue', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, data: null, error: '酒店不存在' })
      return
    }
    const revenueData = {
      totalRevenue: hotel.totalRevenue,
      todayRevenue: Math.round(hotel.totalRevenue / 30),
      weekRevenue: Math.round(hotel.totalRevenue / 4.3),
      monthRevenue: hotel.totalRevenue,
      byRoomType: hotel.rooms.reduce((acc: any, room) => {
        acc[room.type] = (acc[room.type] || 0) + (room.price * 0.7)
        return acc
      }, {}),
    }
    res.status(200).json({ success: true, data: revenueData, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取收入数据失败' })
  }
})

router.get('/:hotelId/staff-performance', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const staff = getStaffByHotelId(hotelId)
    const performance = staff.map(s => ({
      staffId: s.id,
      name: s.name,
      position: s.position,
      level: s.level,
      satisfaction: s.satisfaction,
      fatigue: s.fatigue,
      skills: s.skills,
      performanceScore: Math.round(
        (s.satisfaction * 0.3 +
          (100 - s.fatigue) * 0.2 +
          (s.skills.service + s.skills.efficiency + s.skills.friendliness + s.skills.professionalism) / 4 * 0.5)
      ),
    }))
    res.status(200).json({ success: true, data: performance, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取员工绩效失败' })
  }
})

router.get('/:hotelId/comparison', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, data: null, error: '酒店不存在' })
      return
    }
    const allHotels = getAllHotels()
    const avgRating = allHotels.length > 0
      ? allHotels.reduce((sum, h) => sum + h.rating, 0) / allHotels.length
      : 0
    const avgRevenue = allHotels.length > 0
      ? allHotels.reduce((sum, h) => sum + h.totalRevenue, 0) / allHotels.length
      : 0
    const avgRooms = allHotels.length > 0
      ? allHotels.reduce((sum, h) => sum + h.rooms.length, 0) / allHotels.length
      : 0
    const comparison = {
      hotel: {
        rating: hotel.rating,
        totalRevenue: hotel.totalRevenue,
        roomCount: hotel.rooms.length,
      },
      average: {
        rating: Math.round(avgRating * 10) / 10,
        totalRevenue: Math.round(avgRevenue),
        roomCount: Math.round(avgRooms),
      },
      rank: {
        rating: [...allHotels].sort((a, b) => b.rating - a.rating).findIndex(h => h.id === hotelId) + 1,
        revenue: [...allHotels].sort((a, b) => b.totalRevenue - a.totalRevenue).findIndex(h => h.id === hotelId) + 1,
        rooms: [...allHotels].sort((a, b) => b.rooms.length - a.rooms.length).findIndex(h => h.id === hotelId) + 1,
      },
      totalHotels: allHotels.length,
    }
    res.status(200).json({ success: true, data: comparison, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取对比数据失败' })
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
