import { Router, type Request, type Response } from 'express'
import {
  getGuestsByHotelId,
  getAllGuests,
  getHotelById,
  addGuest,
  updateRoom,
  getGuestById,
} from '../data/store.js'
import {
  autoAssignRoom,
  checkInGuest,
  checkOutGuest,
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

router.get('/waiting', async (_req: Request, res: Response): Promise<void> => {
  try {
    const allGuests = getAllGuests()
    const waitingGuests = allGuests.filter(g => !g.roomId)
    res.status(200).json({ success: true, data: waitingGuests })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取等待客人失败' })
  }
})

router.put('/:guestId/checkin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestId } = req.params
    const { roomId } = req.body
    const guest = getGuestById(guestId)
    if (!guest) {
      res.status(404).json({ success: false, error: '客人不存在' })
      return
    }
    const hotel = getHotelById(req.body.hotelId || (guest.roomId ? getHotelByRoomId(guest.roomId)?.id : undefined))
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const room = hotel.rooms.find(r => r.id === roomId)
    if (!room) {
      res.status(404).json({ success: false, error: '房间不存在' })
      return
    }
    const updatedGuest = { ...guest, roomId, checkIn: new Date() }
    updateRoom(hotel.id, roomId, { status: 'occupied', guestId })
    const allGuests = getAllGuests()
    const idx = allGuests.findIndex(g => g.id === guestId)
    if (idx !== -1) {
      allGuests[idx] = updatedGuest
    }
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
    const hotel = guest.roomId ? getHotelByRoomId(guest.roomId) : undefined
    if (hotel && guest.roomId) {
      updateRoom(hotel.id, guest.roomId, { status: 'vacant', guestId: undefined })
    }
    const updatedGuest = { ...guest, roomId: undefined, checkOut: new Date() }
    const allGuests = getAllGuests()
    const idx = allGuests.findIndex(g => g.id === guestId)
    if (idx !== -1) {
      allGuests[idx] = updatedGuest
    }
    res.status(200).json({ success: true, data: updatedGuest })
  } catch (error) {
    res.status(500).json({ success: false, error: '办理退房失败' })
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
    const updatedGuests: typeof allGuests = []
    for (const guest of waitingGuests) {
      const room = autoAssignRoom(guest, hotel)
      if (room) {
        const updatedGuest = { ...guest, roomId: room.id, checkIn: new Date() }
        updateRoom(hotelId, room.id, { status: 'occupied', guestId: guest.id })
        const idx = allGuests.findIndex(g => g.id === guest.id)
        if (idx !== -1) {
          allGuests[idx] = updatedGuest
        }
        updatedGuests.push(updatedGuest)
      } else {
        updatedGuests.push(guest)
      }
    }
    const hotelGuests = getGuestsByHotelId(hotelId)
    res.status(200).json({ success: true, data: hotelGuests })
  } catch (error) {
    res.status(500).json({ success: false, error: '自动分房失败' })
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

function getHotelByRoomId(roomId: string) {
  const { store } = require('../data/store.js')
  for (const hotel of store.hotels) {
    if (hotel.rooms.some((r: any) => r.id === roomId)) {
      return hotel
    }
  }
  return undefined
}

export default router
