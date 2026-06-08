import { Router, type Request, type Response } from 'express'
import {
  getHotelByPlayerId,
  getHotelById,
  updateHotel,
  updateRoom,
  createHotel,
  addRoom,
  addFacility,
  updateFacility,
  createDefaultHotel,
} from '../data/store.js'
import { calculateComfortScore, updateHotelRatings } from '../services/gameEngine.js'

const router = Router()

router.get('/player/:playerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params
    let hotel = getHotelByPlayerId(playerId)
    if (!hotel) {
      hotel = createDefaultHotel(playerId)
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

router.get('/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
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

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId, name, style } = req.body
    if (!playerId || !name || !style) {
      res.status(400).json({ success: false, error: '缺少必要参数' })
      return
    }

    const existingHotel = getHotelByPlayerId(playerId)
    if (existingHotel) {
      res.status(400).json({ success: false, error: '该玩家已有酒店' })
      return
    }

    const newHotel = createHotel(playerId, name, style)
    res.status(201).json({ success: true, data: newHotel })
  } catch (error) {
    res.status(500).json({ success: false, error: '创建酒店失败' })
  }
})

router.put('/:hotelId/style', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const { style } = req.body
    if (!style) {
      res.status(400).json({ success: false, error: '缺少 style 参数' })
      return
    }

    const hotel = updateHotel(hotelId, { style })
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }

    const updated = updateHotelRatings(hotelId)
    res.status(200).json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新酒店风格失败' })
  }
})

router.put('/:hotelId/name', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const { name } = req.body
    if (!name) {
      res.status(400).json({ success: false, error: '缺少 name 参数' })
      return
    }

    const hotel = updateHotel(hotelId, { name })
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }

    res.status(200).json({ success: true, data: hotel })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新酒店名失败' })
  }
})

router.post('/:hotelId/rooms', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const { type, floor, number } = req.body
    if (!type || floor === undefined || !number) {
      res.status(400).json({ success: false, error: '缺少必要参数' })
      return
    }

    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }

    const updatedHotel = addRoom(hotelId, { type, floor, number })
    if (!updatedHotel) {
      res.status(500).json({ success: false, error: '添加房间失败' })
      return
    }

    const rated = updateHotelRatings(hotelId)
    res.status(201).json({ success: true, data: rated || updatedHotel })
  } catch (error) {
    res.status(500).json({ success: false, error: '添加房间失败' })
  }
})

router.put('/:hotelId/rooms/:roomId/price', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId, roomId } = req.params
    const { price } = req.body
    if (price === undefined) {
      res.status(400).json({ success: false, error: '缺少 price 参数' })
      return
    }

    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }

    const room = updateRoom(hotelId, roomId, { price })
    if (!room) {
      res.status(404).json({ success: false, error: '房间不存在' })
      return
    }

    const updatedHotel = updateHotelRatings(hotelId)
    res.status(200).json({ success: true, data: updatedHotel || hotel })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新房间价格失败' })
  }
})

router.post('/:hotelId/facilities', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const { type } = req.body
    if (!type) {
      res.status(400).json({ success: false, error: '缺少 type 参数' })
      return
    }

    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }

    const updatedHotel = addFacility(hotelId, type)
    if (!updatedHotel) {
      res.status(500).json({ success: false, error: '添加设施失败' })
      return
    }

    const rated = updateHotelRatings(hotelId)
    res.status(201).json({ success: true, data: rated || updatedHotel })
  } catch (error) {
    res.status(500).json({ success: false, error: '添加设施失败' })
  }
})

router.put('/:hotelId/facilities/:facilityId/upgrade', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId, facilityId } = req.params

    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }

    const facility = hotel.facilities.find(f => f.id === facilityId)
    if (!facility) {
      res.status(404).json({ success: false, error: '设施不存在' })
      return
    }

    updateFacility(hotelId, facilityId, {
      level: facility.level + 1,
      quality: Math.min(100, facility.quality + 10),
    })

    const updatedHotel = updateHotelRatings(hotelId)
    res.status(200).json({ success: true, data: updatedHotel || hotel })
  } catch (error) {
    res.status(500).json({ success: false, error: '升级设施失败' })
  }
})

export default router
