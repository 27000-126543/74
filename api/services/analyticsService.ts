import {
  type WeeklyReport,
  type Hotel,
  getHotelById,
  getStaffByHotelId,
  getEventsByHotelId,
  getPartyEventsByHotelId,
} from '../data/store.js'
import { calculateComfortScore, calculateEnergyConsumption, calculateEnergyCost } from './gameEngine.js'

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const randomInRange = (min: number, max: number): number => Math.round(min + Math.random() * (max - min))

export const generateWeeklyReport = (hotelId: string): WeeklyReport | null => {
  const hotel = getHotelById(hotelId)
  if (!hotel) return null

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
    for (let hour = 6; hour <= 22; hour++) {
      let value = 0
      if (hour >= 6 && hour <= 9) {
        value = randomInRange(50, 200)
      } else if (hour >= 11 && hour <= 14) {
        value = randomInRange(200, 500)
      } else if (hour >= 17 && hour <= 21) {
        value = randomInRange(300, 700)
      } else {
        value = randomInRange(10, 80)
      }
      foodRevenueHeatmap.push({ day, hour, value })
    }
  }

  const comfortScore = calculateComfortScore(hotel)
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

  return {
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
}

export interface DashboardSummary {
  totalRevenue: number
  weeklyRevenue: number
  occupancyRate: number
  activeGuests: number
  pendingEvents: number
  staffCount: number
  averageRating: number
  energyCost: number
}

export const getDashboardSummary = (hotelId: string): DashboardSummary | null => {
  const hotel = getHotelById(hotelId)
  if (!hotel) return null

  const staff = getStaffByHotelId(hotelId)
  const events = getEventsByHotelId(hotelId)
  const partyEvents = getPartyEventsByHotelId(hotelId)

  const occupiedRooms = hotel.rooms.filter(r => r.status === 'occupied').length
  const occupancyRate = hotel.rooms.length > 0
    ? Math.round((occupiedRooms / hotel.rooms.length) * 100)
    : 0

  const energyConsumption = calculateEnergyConsumption(hotel)
  const energyCost = calculateEnergyCost(energyConsumption)

  const weeklyRevenue = randomInRange(80000, 200000)

  return {
    totalRevenue: hotel.totalRevenue,
    weeklyRevenue,
    occupancyRate,
    activeGuests: occupiedRooms,
    pendingEvents: events.filter(e => !e.resolved).length + partyEvents.filter(p => p.status !== 'completed').length,
    staffCount: staff.length,
    averageRating: hotel.rating,
    energyCost,
  }
}

export interface RevenueBreakdown {
  roomRevenue: number
  foodRevenue: number
  eventRevenue: number
  otherRevenue: number
}

export const getRevenueBreakdown = (hotelId: string): RevenueBreakdown | null => {
  const hotel = getHotelById(hotelId)
  if (!hotel) return null

  const partyEvents = getPartyEventsByHotelId(hotelId)
  const eventRevenue = partyEvents.reduce((sum, p) => sum + p.revenue, 0)

  const occupiedRooms = hotel.rooms.filter(r => r.status === 'occupied').length
  const roomRevenue = occupiedRooms * hotel.rooms.reduce((sum, r) => sum + r.price, 0) / hotel.rooms.length

  const foodRevenue = randomInRange(15000, 45000)
  const otherRevenue = randomInRange(5000, 20000)

  return {
    roomRevenue: Math.round(roomRevenue),
    foodRevenue,
    eventRevenue,
    otherRevenue,
  }
}

export interface StaffPerformance {
  staffId: string
  name: string
  position: string
  efficiency: number
  satisfaction: number
  fatigue: number
  overall: number
}

export const getStaffPerformance = (hotelId: string): StaffPerformance[] => {
  const staff = getStaffByHotelId(hotelId)

  return staff.map(s => {
    const avgSkills = (s.skills.service + s.skills.efficiency + s.skills.friendliness + s.skills.professionalism) / 4
    const fatiguePenalty = s.fatigue * 0.3
    const overall = Math.max(0, Math.min(100, Math.round(avgSkills + s.satisfaction * 0.2 - fatiguePenalty)))

    return {
      staffId: s.id,
      name: s.name,
      position: s.position,
      efficiency: s.skills.efficiency,
      satisfaction: s.satisfaction,
      fatigue: s.fatigue,
      overall,
    }
  }).sort((a, b) => b.overall - a.overall)
}

export const getHotelComparison = (hotel: Hotel): {
  currentHotel: { rating: number; revenue: number; rooms: number }
  average: { rating: number; revenue: number; rooms: number }
  top: { rating: number; revenue: number; rooms: number }
} => {
  return {
    currentHotel: {
      rating: hotel.rating,
      revenue: hotel.totalRevenue,
      rooms: hotel.rooms.length,
    },
    average: {
      rating: 4.2,
      revenue: 2000000,
      rooms: 8,
    },
    top: {
      rating: 4.9,
      revenue: 8000000,
      rooms: 20,
    },
  }
}
