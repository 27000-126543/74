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
    const hid = hotelId || getHotelIdByRoomId(roomId)
    if (!hid) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const hotel = getHotelById(hid)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const room = hotel.rooms.find(r => r.id === roomId)
    if (!room) {
      res.status(404).json({ success: false, error: '房间不存在' })
      return
    }
    updateRoom(hid, roomId, { status: 'occupied', guestId })
    const updatedGuest = updateGuest(guestId, { roomId, checkIn: new Date() })
    res.status(200).json({ success: true, data: updatedGuest })
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
    if (guest.roomId) {
      const hotelId = getHotelIdByRoomId(guest.roomId)
      if (hotelId) {
        updateRoom(hotelId, guest.roomId, { status: 'vacant', guestId: undefined })
      }
    }
    const updatedGuest = updateGuest(guestId, { roomId: undefined, checkOut: new Date() })
    res.status(200).json({ success: true, data: updatedGuest })
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
    const hotelGuests = getGuestsByHotelId(hotelId)
    res.status(200).json({ success: true, data: { processedGuests: hotelGuests.length } })
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
        updateGuest(guest.id, { roomId: room.id, checkIn: new Date() })
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
    const hid = hotelId || getHotelIdByRoomId(roomId)
    if (!hid) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const hotel = getHotelById(hid)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const room = hotel.rooms.find(r => r.id === roomId)
    if (!room) {
      res.status(404).json({ success: false, error: '房间不存在' })
      return
    }
    updateRoom(hid, roomId, { status: 'occupied', guestId })
    const updatedGuest = updateGuest(guestId, { roomId, checkIn: new Date() })
    res.status(200).json({ success: true, data: updatedGuest })
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
    if (guest.roomId) {
      const hotelId = getHotelIdByRoomId(guest.roomId)
      if (hotelId) {
        updateRoom(hotelId, guest.roomId, { status: 'vacant', guestId: undefined })
      }
    }
    const updatedGuest = updateGuest(guestId, { roomId: undefined, checkOut: new Date() })
    res.status(200).json({ success: true, data: updatedGuest })
  } catch (error) {
    res.status(500).json({ success: false, error: '办理退房失败' })
  }
})

function getHotelIdByRoomId(roomId: string): string | undefined {
  const { store } = require('../data/store.js')
  for (const hotel of store.hotels) {
    if (hotel.rooms.some((r: any) => r.id === roomId)) {
      return hotel.id
    }
  }
  return undefined
}

export default router
