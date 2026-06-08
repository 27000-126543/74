import { Router, type Request, type Response } from 'express'
import {
  getHotelByPlayerId,
  getHotelById,
  updateHotel,
  updateRoom,
  HOTEL_STYLES,
  ROOM_TYPES,
} from '../data/store.js'
import { calculateComfortScore, calculateRoomPricing, updateHotelRatings } from '../services/gameEngine.js'

const router = Router()

router.get('/:playerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params
    const hotel = getHotelByPlayerId(playerId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }

    const comfortScore = calculateComfortScore(hotel)
    res.status(200).json({
      success: true,
      data: { ...hotel, comfortScore },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取酒店信息失败' })
  }
})

router.put('/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const updates = req.body
    const hotel = updateHotel(hotelId, updates)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const updated = updateHotelRatings(hotelId)
    res.status(200).json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新酒店信息失败' })
  }
})

router.put('/:hotelId/rooms/:roomId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId, roomId } = req.params
    const updates = req.body
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const room = updateRoom(hotelId, roomId, updates)
    if (!room) {
      res.status(404).json({ success: false, error: '房间不存在' })
      return
    }
    const newPrice = calculateRoomPricing(room, hotel)
    const updatedRoom = updateRoom(hotelId, roomId, { price: newPrice })
    res.status(200).json({ success: true, data: updatedRoom })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新房间信息失败' })
  }
})

router.get('/config/styles', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true, data: HOTEL_STYLES })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取酒店风格配置失败' })
  }
})

router.get('/config/rooms', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true, data: ROOM_TYPES })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取房间类型配置失败' })
  }
})

export default router
