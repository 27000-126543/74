import { Router, type Request, type Response } from 'express'
import {
  getGuestsByHotelId,
  getAllGuests,
  getHotelById,
  addGuest,
  updateRoom,
  getGuestById,
  updateGuest,
  getStaffByHotelId,
  updateHotel,
  updateStaff,
  getRoomByHotelAndIdOrNumber,
  getHotelIdByRoomIdOrNumber,
  findGuestOccupiedRoom,
  type Guest,
  type Hotel,
  type Staff,
  type Room,
} from '../data/store.js'
import {
  autoAssignRoom,
} from '../services/gameEngine.js'

const router = Router()

router.get('/hotel/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const guests = getGuestsByHotelId(hotelId)
    res.status(200).json({ success: true, data: guests })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取客人列表失败' })
  }
})

router.get('/hotel/:hotelId/energy', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const staffList = getStaffByHotelId(hotelId)
    const energy = Math.max(0, 100 - (staffList.length || 0) * 5)
    res.status(200).json({ success: true, data: { energy, maxEnergy: 100 } })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取酒店能量失败' })
  }
})

router.get('/waiting', async (_req: Request, res: Response): Promise<void> => {
  try {
    const allGuests = getAllGuests()
    const waitingGuests = allGuests.filter(g => !g.roomId)
    res.status(200).json({ success: true, data: waitingGuests })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取等待客人失败' })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const guestData = req.body
    const newGuest = addGuest(guestData)
    res.status(201).json({ success: true, data: newGuest })
  } catch (error) {
    res.status(500).json({ success: false, error: '添加客人失败' })
  }
})

router.post('/checkin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestId, roomId, hotelId } = req.body
    const guest = getGuestById(guestId)
    if (!guest) {
      res.status(404).json({ success: false, error: '客人不存在' })
      return
    }
    const hid = hotelId || getHotelIdByRoomIdOrNumber(roomId)
    if (!hid) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const hotel = getHotelById(hid)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const room = getRoomByHotelAndIdOrNumber(hotel, roomId)
    if (!room) {
      res.status(404).json({ success: false, error: '房间不存在' })
      return
    }
    if (room.status === 'occupied') {
      res.status(400).json({ success: false, error: '房间已被占用' })
      return
    }
    updateRoom(hid, room.id, { status: 'occupied', guestId })
    const updatedGuest = updateGuest(guestId, { roomId: room.id, checkIn: new Date(), hotelId: hid })
    const updatedHotel = getHotelById(hid)
    res.status(200).json({ success: true, data: { guest: updatedGuest, hotel: updatedHotel } })
  } catch (error) {
    res.status(500).json({ success: false, error: '办理入住失败' })
  }
})

router.post('/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestId } = req.body
    const guest = getGuestById(guestId)
    if (!guest) {
      res.status(404).json({ success: false, error: '客人不存在' })
      return
    }
    if (!guest.roomId) {
      res.status(400).json({ success: false, error: '客人未入住' })
      return
    }
    let occupied = findGuestOccupiedRoom(guestId)
    let hotelId: string | undefined
    let room: Room | undefined
    if (occupied) {
      hotelId = occupied.hotelId
      room = occupied.room
    } else {
      hotelId = getHotelIdByRoomIdOrNumber(guest.roomId)
      if (hotelId) {
        const hotel = getHotelById(hotelId)
        if (hotel) room = getRoomByHotelAndIdOrNumber(hotel, guest.roomId)
      }
    }
    if (!hotelId) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    if (!room) {
      res.status(404).json({ success: false, error: '房间不存在' })
      return
    }
    let days = 1
    if (guest.checkIn) {
      const diffMs = Date.now() - guest.checkIn.getTime()
      days = Math.max(1, Math.ceil(diffMs / 86400000))
    }
    const roomCharge = room.price * days
    updateRoom(hotelId, room.id, { status: 'vacant', guestId: undefined })
    const updatedGuest = updateGuest(guestId, { roomId: undefined, checkOut: new Date() })
    const updatedHotel = updateHotel(hotelId, { totalRevenue: hotel.totalRevenue + roomCharge })
    res.status(200).json({ success: true, data: { guest: updatedGuest, hotel: updatedHotel, roomCharge } })
  } catch (error) {
    res.status(500).json({ success: false, error: '办理退房失败' })
  }
})

router.post('/hotel/:hotelId/daily-tick', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }

    let revenueGain = 0
    const occupiedRooms = hotel.rooms.filter(r => r.status === 'occupied')

    for (const room of occupiedRooms) {
      revenueGain += room.price
      if (room.guestId) {
        const guest = getGuestById(room.guestId)
        if (guest) {
          const fluctuation = Math.floor(Math.random() * 11) + 5
          updateGuest(room.guestId, { satisfaction: Math.max(0, guest.satisfaction - fluctuation) })
        }
      }
    }

    const energyCost = hotel.rooms.length * 15 + occupiedRooms.length * 8 + hotel.facilities.length * 20

    const newTotalRevenue = Math.max(0, hotel.totalRevenue + revenueGain - energyCost)
    const updatedHotel = updateHotel(hotelId, { totalRevenue: newTotalRevenue })

    const staffList = getStaffByHotelId(hotelId)
    const updatedStaffs: Staff[] = []
    for (const staff of staffList) {
      let newFatigue = staff.fatigue
      if (staff.status === 'working') {
        newFatigue += Math.floor(Math.random() * 11) + 10
      }
      let newSatisfaction = staff.satisfaction
      if (newFatigue > 90) {
        newSatisfaction -= 5
      }
      newSatisfaction += Math.floor(Math.random() * 6) - 2
      newSatisfaction = Math.min(100, Math.max(0, newSatisfaction))
      newFatigue = Math.min(100, Math.max(0, newFatigue))
      const updated = updateStaff(staff.id, { fatigue: newFatigue, satisfaction: newSatisfaction })
      if (updated) {
        updatedStaffs.push(updated)
      }
    }

    const newGuestsCount = Math.floor(Math.random() * 3)
    const guestAvatars = ['🧑', '👔', '🧳', '👨', '👩', '🧑‍🤝‍🧑', '👨‍💼', '👩‍💼']
    const guestNames = ['旅客', '商务客', '游客', '先生', '女士', '家庭', 'VIP客', '背包客']
    const preferences = ['安静', '早餐', '泳池', 'SPA', '高速WiFi', '会议室', '景观房', '健身房']
    for (let i = 0; i < newGuestsCount; i++) {
      const randomPrefs: string[] = []
      const prefCount = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < prefCount; j++) {
        const pref = preferences[Math.floor(Math.random() * preferences.length)]
        if (!randomPrefs.includes(pref)) {
          randomPrefs.push(pref)
        }
      }
      addGuest({
        name: guestNames[Math.floor(Math.random() * guestNames.length)] + String.fromCharCode(65 + i),
        avatar: guestAvatars[Math.floor(Math.random() * guestAvatars.length)],
        preferences: randomPrefs,
        budget: Math.floor(Math.random() * 4500) + 500,
        satisfaction: Math.floor(Math.random() * 30) + 50,
      })
    }

    const allGuests = getGuestsByHotelId(hotelId)
    const checkedIn = hotel.rooms.filter(r => r.status === 'occupied').length

    res.status(200).json({
      success: true,
      data: {
        guests: allGuests,
        hotel: updatedHotel,
        staffs: updatedStaffs,
        summary: {
          checkedIn,
          revenueGain,
          energyCost,
          newGuests: newGuestsCount,
        },
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '每日更新失败' })
  }
})

router.post('/hotel/:hotelId/auto-assign', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const allGuests = getAllGuests()
    const waitingGuests = allGuests.filter(g => !g.roomId)
    for (const guest of waitingGuests) {
      const room = autoAssignRoom(guest, hotel)
      if (room) {
        updateRoom(hotelId, room.id, { status: 'occupied', guestId: guest.id })
        updateGuest(guest.id, { roomId: room.id, checkIn: new Date(), hotelId })
      }
    }
    const hotelGuests = getGuestsByHotelId(hotelId)
    res.status(200).json({ success: true, data: hotelGuests })
  } catch (error) {
    res.status(500).json({ success: false, error: '自动分房失败' })
  }
})

router.put('/:guestId/checkin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestId } = req.params
    const { roomId, hotelId } = req.body
    const guest = getGuestById(guestId)
    if (!guest) {
      res.status(404).json({ success: false, error: '客人不存在' })
      return
    }
    const hid = hotelId || getHotelIdByRoomIdOrNumber(roomId)
    if (!hid) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const hotel = getHotelById(hid)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const room = getRoomByHotelAndIdOrNumber(hotel, roomId)
    if (!room) {
      res.status(404).json({ success: false, error: '房间不存在' })
      return
    }
    if (room.status === 'occupied') {
      res.status(400).json({ success: false, error: '房间已被占用' })
      return
    }
    updateRoom(hid, room.id, { status: 'occupied', guestId })
    const updatedGuest = updateGuest(guestId, { roomId: room.id, checkIn: new Date(), hotelId: hid })
    const updatedHotel = getHotelById(hid)
    res.status(200).json({ success: true, data: { guest: updatedGuest, hotel: updatedHotel } })
  } catch (error) {
    res.status(500).json({ success: false, error: '办理入住失败' })
  }
})

router.put('/:guestId/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestId } = req.params
    const guest = getGuestById(guestId)
    if (!guest) {
      res.status(404).json({ success: false, error: '客人不存在' })
      return
    }
    if (!guest.roomId) {
      res.status(400).json({ success: false, error: '客人未入住' })
      return
    }
    let occupied = findGuestOccupiedRoom(guestId)
    let hotelId: string | undefined
    let room: Room | undefined
    if (occupied) {
      hotelId = occupied.hotelId
      room = occupied.room
    } else {
      hotelId = getHotelIdByRoomIdOrNumber(guest.roomId)
      if (hotelId) {
        const hotel = getHotelById(hotelId)
        if (hotel) room = getRoomByHotelAndIdOrNumber(hotel, guest.roomId)
      }
    }
    if (!hotelId) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    if (!room) {
      res.status(404).json({ success: false, error: '房间不存在' })
      return
    }
    let days = 1
    if (guest.checkIn) {
      const diffMs = Date.now() - guest.checkIn.getTime()
      days = Math.max(1, Math.ceil(diffMs / 86400000))
    }
    const roomCharge = room.price * days
    updateRoom(hotelId, room.id, { status: 'vacant', guestId: undefined })
    const updatedGuest = updateGuest(guestId, { roomId: undefined, checkOut: new Date() })
    const updatedHotel = updateHotel(hotelId, { totalRevenue: hotel.totalRevenue + roomCharge })
    res.status(200).json({ success: true, data: { guest: updatedGuest, hotel: updatedHotel, roomCharge } })
  } catch (error) {
    res.status(500).json({ success: false, error: '办理退房失败' })
  }
})

export default router
