import { Router, type Request, type Response } from 'express'
import {
  getEventsByHotelId,
  getEventById,
  updateEvent,
} from '../data/store.js'
import {
  generateRandomEvent,
  resolveEvent,
  getPendingEvents,
} from '../services/eventService.js'

const eventsRouter = Router()

eventsRouter.get('/hotel/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const events = getEventsByHotelId(hotelId)
    res.status(200).json({ success: true, data: events })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取事件列表失败' })
  }
})

eventsRouter.get('/hotel/:hotelId/pending', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const events = getPendingEvents(hotelId)
    res.status(200).json({ success: true, data: events })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取待处理事件失败' })
  }
})

eventsRouter.post('/hotel/:hotelId/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const event = generateRandomEvent(hotelId)
    if (!event) {
      res.status(400).json({ success: false, error: '生成事件失败' })
      return
    }
    res.status(201).json({ success: true, data: event })
  } catch (error) {
    res.status(500).json({ success: false, error: '生成随机事件失败' })
  }
})

eventsRouter.put('/:eventId/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params
    const { optionId, playerId } = req.body
    const result = resolveEvent(eventId, optionId, playerId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    const updatedEvent = getEventById(eventId)
    res.status(200).json({ success: true, data: updatedEvent })
  } catch (error) {
    res.status(500).json({ success: false, error: '处理事件失败' })
  }
})

export default eventsRouter
