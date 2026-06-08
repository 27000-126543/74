import { Router, type Request, type Response } from 'express'
import {
  getHotelById,
  getStaffByHotelId,
  type WeeklyReport,
} from '../data/store.js'

const router = Router()

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const randomInRange = (min: number, max: number): number => Math.round(min + Math.random() * (max - min))

router.get('/:hotelId/weekly-report', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)

    if (!hotel) {
      res.status(404).json({ success: false, data: null, error: '酒店不存在' })
      return
    }

    const weekEnd = new Date()
    const weekStart = new Date(weekEnd.getTime() - 6 * 86400000)

    const occupancyRate: number[] = []
    const revenueByDay: { date: string; amount: number }[] = []
    const staffSatisfactionTrend: { date: string; value: number }[] = []

    const staff = getStaffByHotelId(hotelId)
    const baseSatisfaction = staff.length > 0
      ? staff.reduce((sum, s) => sum + s.satisfaction, 0) / staff.length
      : 75

    for (let i = 6; i >= 0; i--) {
      const date = new Date(weekEnd.getTime() - i * 86400000)
      const dateStr = formatDate(date)

      const occupancy = randomInRange(55, 92)
      occupancyRate.push(occupancy)

      const occupiedRooms = Math.round(hotel.rooms.length * occupancy / 100)
      let dayRevenue = 0
      for (let j = 0; j < occupiedRooms; j++) {
        const roomIndex = j % hotel.rooms.length
        dayRevenue += hotel.rooms[roomIndex].price
      }
      dayRevenue += randomInRange(2000, 8000)
      revenueByDay.push({ date: dateStr, amount: dayRevenue })

      const satisfactionVariation = randomInRange(-5, 5)
      staffSatisfactionTrend.push({
        date: dateStr,
        value: Math.min(100, Math.max(50, Math.round(baseSatisfaction + satisfactionVariation))),
      })
    }

    const foodRevenueHeatmap: { day: number; hour: number; value: number }[] = []
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        let value = 0
        if (hour >= 6 && hour <= 9) {
          value = randomInRange(50, 200)
        } else if (hour >= 11 && hour <= 14) {
          value = randomInRange(200, 500)
        } else if (hour >= 17 && hour <= 21) {
          value = randomInRange(300, 700)
        } else {
          value = randomInRange(0, 50)
        }
        foodRevenueHeatmap.push({ day, hour, value })
      }
    }

    const comfortScore = hotel.comfortScore
    const staffScore = staff.length > 0
      ? Math.round(staff.reduce((sum, s) => sum + (s.skills.service + s.skills.professionalism) / 2, 0) / staff.length)
      : 70

    const hasRestaurant = hotel.facilities.some(f => f.type === 'restaurant')
    const foodScore = hasRestaurant
      ? Math.round(hotel.facilities.find(f => f.type === 'restaurant')!.quality * 0.8 + randomInRange(10, 20))
      : randomInRange(40, 60)

    const facilitiesScore = hotel.facilities.length > 0
      ? Math.round(hotel.facilities.reduce((sum, f) => sum + f.quality * f.level, 0) / hotel.facilities.length)
      : 60

    const avgRoomPrice = hotel.rooms.reduce((sum, r) => sum + r.price, 0) / hotel.rooms.length
    const baseValue = 100 - (avgRoomPrice / 100)
    const valueScore = Math.min(100, Math.max(30, Math.round(baseValue + randomInRange(-10, 10))))

    const locationScore = randomInRange(65, 90)

    const report: WeeklyReport = {
      weekStart,
      weekEnd,
      occupancyRate,
      revenueByDay,
      foodRevenueHeatmap,
      staffSatisfactionTrend,
      radarData: {
        service: staffScore,
        comfort: comfortScore,
        food: foodScore,
        facilities: facilitiesScore,
        value: valueScore,
        location: locationScore,
      },
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
