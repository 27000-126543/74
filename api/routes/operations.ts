import { Router, type Request, type Response } from 'express'
import {
  getGuestsByHotelId,
  getAllGuests,
  getHotelById,
  updateRoom,
  addGuest,
} from '../data/store.js'
import {
  autoAssignRoom,
  checkInGuest,
  checkOutGuest,
  processDailyTick,
  calculateEnergyConsumption,
  calculateEnergyCost,
} from '../services/gameEngine.js'

const router = Router()

router.get('/hotel/:hotelId/guests', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const guests = getGuestsByHotelId(hotelId)
    res.status(200).json({ success: true, data: guests })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取客人列表失败' })
  }
})

router.get('/guests/waiting', async (_req: Request, res: Response): Promise<void> => {
  try {
    const allGuests = getAllGuests()
    const waitingGuests = allGuests.filter(g => !g.roomId)
    res.status(200).json({ success: true, data: waitingGuests })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取等待客人失败' })
  }
})

router.post('/checkin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestId, hotelId } = req.body
    const result = checkInGuest(guestId, hotelId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: '办理入住失败' })
  }
})

router.post('/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestId, hotelId, roomId } = req.body
    const result = checkOutGuest(guestId, hotelId, roomId)
    if (!result.success) {
      res.status(400).json({ success: false, error: '退房失败' })
      return
    }
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: '办理退房失败' })
  }
})

router.post('/hotel/:hotelId/daily-tick', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const result = processDailyTick(hotelId)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: '每日处理失败' })
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
    const consumption = calculateEnergyConsumption(hotel)
    const cost = calculateEnergyCost(consumption)
    res.status(200).json({ success: true, data: { consumption, cost } })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取能耗数据失败' })
  }
})

router.post('/guests', async (req: Request, res: Response): Promise<void> => {
  try {
    const guestData = req.body
    const newGuest = addGuest(guestData)
    res.status(201).json({ success: true, data: newGuest })
  } catch (error) {
    res.status(500).json({ success: false, error: '添加客人失败' })
  }
})

router.post('/hotel/:hotelId/auto-assign', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const { guestId } = req.body
    const hotel = getHotelById(hotelId)
    const allGuests = getAllGuests()
    const guest = allGuests.find(g => g.id === guestId)
    if (!hotel || !guest) {
      res.status(404).json({ success: false, error: '酒店或客人不存在' })
      return
    }
    const room = autoAssignRoom(guest, hotel)
    if (!room) {
      res.status(400).json({ success: false, error: '没有合适的空房' })
      return
    }
    res.status(200).json({ success: true, data: room })
  } catch (error) {
    res.status(500).json({ success: false, error: '自动分房失败' })
  }
})

export default router
