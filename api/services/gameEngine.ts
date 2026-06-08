import {
  type Hotel,
  type Room,
  type Staff,
  type Guest,
  HOTEL_STYLES,
  ROOM_TYPES,
  STAFF_POSITIONS,
  getStaffByHotelId,
  getHotelById,
  updateHotel,
  updateStaff,
  updateRoom,
  getAllGuests,
  addGuest,
} from '../data/store.js'

export const calculateComfortScore = (hotel: Hotel): number => {
  const styleConfig = HOTEL_STYLES[hotel.style]
  let baseComfort = styleConfig.baseComfort

  const avgRoomComfort =
    hotel.rooms.length > 0
      ? hotel.rooms.reduce((sum, r) => sum + r.comfort, 0) / hotel.rooms.length
      : 0
  baseComfort += avgRoomComfort * 0.3

  const facilityQuality =
    hotel.facilities.length > 0
      ? hotel.facilities.reduce((sum, f) => sum + f.quality * f.level, 0) / hotel.facilities.length
      : 0
  baseComfort += facilityQuality * 0.2

  const staff = getStaffByHotelId(hotel.id)
  if (staff.length > 0) {
    const avgStaffSkills = staff.reduce((sum, s) => {
      const skillAvg = (s.skills.service + s.skills.efficiency + s.skills.friendliness + s.skills.professionalism) / 4
      return sum + skillAvg
    }, 0) / staff.length
    baseComfort += avgStaffSkills * 0.15
  }

  return Math.min(100, Math.round(baseComfort))
}

export const calculateRoomPricing = (room: Room, hotel: Hotel): number => {
  const roomTypeConfig = ROOM_TYPES[room.type]
  const styleConfig = HOTEL_STYLES[hotel.style]
  let basePrice = roomTypeConfig.basePrice * styleConfig.priceMultiplier

  basePrice *= 1 + (room.comfort - roomTypeConfig.baseComfort) / 100

  const occupiedRooms = hotel.rooms.filter(r => r.status === 'occupied').length
  const occupancyRate = occupiedRooms / hotel.rooms.length
  if (occupancyRate > 0.8) {
    basePrice *= 1.15
  } else if (occupancyRate < 0.3) {
    basePrice *= 0.85
  }

  return Math.round(basePrice)
}

export const autoAssignRoom = (guest: Guest, hotel: Hotel): Room | null => {
  const availableRooms = hotel.rooms.filter(
    r => r.status === 'vacant' && r.price <= guest.budget
  )

  if (availableRooms.length === 0) return null

  let bestMatch = availableRooms[0]
  let bestScore = 0

  for (const room of availableRooms) {
    let score = room.comfort
    if (guest.preferences.includes('安静') && room.floor > 1) score += 10
    if (guest.preferences.includes('泳池') && room.type === 'villa') score += 15
    if (guest.preferences.includes('高速WiFi') && room.type !== 'standard') score += 10
    score -= Math.abs(room.price - guest.budget * 0.7) / 50

    if (score > bestScore) {
      bestScore = score
      bestMatch = room
    }
  }

  return bestMatch
}

export const calculateStaffFatigue = (staff: Staff, hoursWorked: number): number => {
  let fatigue = staff.fatigue
  fatigue += hoursWorked * 3

  if (staff.status === 'working') {
    fatigue += 2
  } else if (staff.status === 'resting') {
    fatigue = Math.max(0, fatigue - 5)
  } else if (staff.status === 'off') {
    fatigue = Math.max(0, fatigue - 15)
  }

  const positionConfig = STAFF_POSITIONS[staff.position]
  if (positionConfig) {
    if (hoursWorked > 8) {
      fatigue += (hoursWorked - 8) * 5
    }
  }

  return Math.min(100, Math.round(fatigue))
}

export const calculateStaffSatisfaction = (staff: Staff): number => {
  let satisfaction = 70

  satisfaction += staff.level * 2

  const positionConfig = STAFF_POSITIONS[staff.position]
  if (positionConfig && staff.salary >= positionConfig.baseSalary) {
    satisfaction += Math.min(15, (staff.salary - positionConfig.baseSalary) / 1000)
  }

  satisfaction -= staff.fatigue * 0.3

  const avgSkills = (staff.skills.service + staff.skills.efficiency + staff.skills.friendliness + staff.skills.professionalism) / 4
  satisfaction += (avgSkills - 60) * 0.2

  return Math.min(100, Math.max(0, Math.round(satisfaction)))
}

export const calculateEnergyConsumption = (hotel: Hotel): { electricity: number; water: number; gas: number } => {
  const occupiedRooms = hotel.rooms.filter(r => r.status === 'occupied').length
  const totalRooms = hotel.rooms.length

  let electricity = 0
  let water = 0
  let gas = 0

  for (const room of hotel.rooms) {
    if (room.status === 'occupied') {
      const roomFactor = room.type === 'villa' ? 3 : room.type === 'suite' ? 2 : 1
      electricity += 50 * roomFactor
      water += 200 * roomFactor
      gas += 10 * roomFactor
    } else if (room.status === 'maintenance') {
      electricity += 10
    }
  }

  for (const facility of hotel.facilities) {
    const facilityFactor = facility.level
    switch (facility.type) {
      case 'pool':
        electricity += 100 * facilityFactor
        water += 500 * facilityFactor
        break
      case 'spa':
        electricity += 80 * facilityFactor
        water += 300 * facilityFactor
        gas += 50 * facilityFactor
        break
      case 'restaurant':
        electricity += 150 * facilityFactor
        gas += 100 * facilityFactor
        break
      case 'gym':
        electricity += 60 * facilityFactor
        break
      case 'lounge':
        electricity += 40 * facilityFactor
        break
    }
  }

  const occupancyRate = totalRooms > 0 ? occupiedRooms / totalRooms : 0
  if (hotel.style === 'modern') {
    electricity *= 0.9
    water *= 0.9
    gas *= 0.9
  } else if (hotel.style === 'tropical') {
    electricity *= 1.1
    water *= 1.2
  }

  return {
    electricity: Math.round(electricity * (0.5 + occupancyRate * 0.5)),
    water: Math.round(water * (0.5 + occupancyRate * 0.5)),
    gas: Math.round(gas * (0.5 + occupancyRate * 0.5)),
  }
}

export const calculateEnergyCost = (consumption: { electricity: number; water: number; gas: number }): number => {
  const ELECTRICITY_RATE = 1.2
  const WATER_RATE = 5
  const GAS_RATE = 3.5
  return Math.round(
    consumption.electricity * ELECTRICITY_RATE +
    consumption.water * WATER_RATE +
    consumption.gas * GAS_RATE
  )
}

export const updateHotelRatings = (hotelId: string): Hotel | undefined => {
  const hotel = getHotelById(hotelId)
  if (!hotel) return undefined

  const comfortScore = calculateComfortScore(hotel)
  let rating = 3 + comfortScore / 40

  const staff = getStaffByHotelId(hotelId)
  if (staff.length > 0) {
    const avgSatisfaction = staff.reduce((sum, s) => sum + s.satisfaction, 0) / staff.length
    rating += (avgSatisfaction - 70) / 50
  }

  const occupiedRooms = hotel.rooms.filter(r => r.status === 'occupied').length
  const occupancyRate = occupiedRooms / hotel.rooms.length
  rating += occupancyRate * 0.5

  rating = Math.min(5, Math.max(1, rating))

  return updateHotel(hotelId, {
    comfortScore,
    rating: Math.round(rating * 10) / 10,
  })
}

export const processDailyTick = (hotelId: string): { revenue: number; expenses: number } => {
  const hotel = getHotelById(hotelId)
  if (!hotel) return { revenue: 0, expenses: 0 }

  let revenue = 0
  let expenses = 0

  for (const room of hotel.rooms) {
    if (room.status === 'occupied') {
      revenue += room.price
    }
  }

  const staff = getStaffByHotelId(hotelId)
  for (const s of staff) {
    expenses += s.salary / 30

    const newFatigue = calculateStaffFatigue(s, 8)
    const newSatisfaction = calculateStaffSatisfaction({ ...s, fatigue: newFatigue })
    updateStaff(s.id, { fatigue: newFatigue, satisfaction: newSatisfaction })
  }

  const energyConsumption = calculateEnergyConsumption(hotel)
  expenses += calculateEnergyCost(energyConsumption)

  const netProfit = revenue - expenses
  if (netProfit > 0) {
    updateHotel(hotelId, { totalRevenue: hotel.totalRevenue + netProfit })
  }

  return { revenue: Math.round(revenue), expenses: Math.round(expenses) }
}

export const checkInGuest = (guestId: string, hotelId: string): { success: boolean; room?: Room; message?: string } => {
  const hotel = getHotelById(hotelId)
  if (!hotel) return { success: false, message: '酒店不存在' }

  const guests = getAllGuests()
  const guest = guests.find(g => g.id === guestId)
  if (!guest) return { success: false, message: '客人不存在' }

  const room = autoAssignRoom(guest, hotel)
  if (!room) return { success: false, message: '没有合适的空房' }

  updateRoom(hotelId, room.id, { status: 'occupied', guestId: guest.id })
  addGuest({
    ...guest,
    checkIn: new Date(),
    roomId: room.id,
  })

  return { success: true, room }
}

export const checkOutGuest = (guestId: string, hotelId: string, roomId: string): { success: boolean; revenue?: number } => {
  const hotel = getHotelById(hotelId)
  if (!hotel) return { success: false }

  const room = hotel.rooms.find(r => r.id === roomId)
  if (!room || room.guestId !== guestId) return { success: false }

  let revenue = 0
  const guests = getAllGuests()
  const guest = guests.find(g => g.id === guestId)
  if (guest && guest.checkIn) {
    const nights = Math.max(1, Math.ceil((Date.now() - guest.checkIn.getTime()) / 86400000))
    revenue = room.price * nights
  }

  updateRoom(hotelId, roomId, { status: 'vacant', guestId: undefined })
  updateHotel(hotelId, { totalRevenue: hotel.totalRevenue + revenue })

  return { success: true, revenue }
}
