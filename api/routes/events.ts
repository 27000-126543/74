import { Router, type Request, type Response } from 'express'
import {
  getEventsByHotelId,
  getPartyEventsByHotelId,
  getEventById,
  updateEvent,
  getPartyEventById,
  updatePartyEvent,
  addPartyEvent,
} from '../data/store.js'
import {
  generateRandomEvent,
  resolveEvent,
  getPendingEvents,
  updatePartyProgress,
  completePartyEvent,
} from '../services/eventService.js'

const router = Router()

router.get('/hotel/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const events = getEventsByHotelId(hotelId)
    res.status(200).json({ success: true, data: events })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取事件列表失败' })
  }
})

router.get('/hotel/:hotelId/pending', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const events = getPendingEvents(hotelId)
    res.status(200).json({ success: true, data: events })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取待处理事件失败' })
  }
})

router.post('/hotel/:hotelId/generate', async (req: Request, res: Response): Promise<void> => {
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

router.put('/:eventId/resolve', async (req: Request, res: Response): Promise<void> => {
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

router.get('/hotel/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const parties = getPartyEventsByHotelId(hotelId)
    res.status(200).json({ success: true, data: parties })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取活动列表失败' })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId, type, name, budget, maxAttendees, startTime } = req.body
    const newParty = addPartyEvent({
      hotelId,
      type: type || 'party',
      name,
      budget,
      attendees: 0,
      maxAttendees: maxAttendees || 50,
      revenue: 0,
      serviceScore: 0,
      preparationProgress: 0,
      status: 'planning',
      startTime: startTime ? new Date(startTime) : new Date(Date.now() + 86400000),
    })
    res.status(201).json({ success: true, data: newParty })
  } catch (error) {
    res.status(500).json({ success: false, error: '创建活动失败' })
  }
})

router.put('/:partyId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { partyId } = req.params
    const updates = req.body
    const party = updatePartyEvent(partyId, updates)
    if (!party) {
      res.status(404).json({ success: false, error: '活动不存在' })
      return
    }
    res.status(200).json({ success: true, data: party })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新活动失败' })
  }
})

router.put('/:partyId/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { partyId } = req.params
    const party = updatePartyProgress(partyId)
    if (!party) {
      res.status(404).json({ success: false, error: '活动不存在' })
      return
    }
    const updated = updatePartyEvent(partyId, { status: 'ongoing', preparationProgress: 100 })
    res.status(200).json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: '开始活动失败' })
  }
})

router.put('/:partyId/progress', async (req: Request, res: Response): Promise<void> => {
  try {
    const { partyId } = req.params
    const party = updatePartyProgress(partyId)
    if (!party) {
      res.status(404).json({ success: false, error: '活动不存在' })
      return
    }
    res.status(200).json({ success: true, data: party })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新活动进度失败' })
  }
})

router.put('/:partyId/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { partyId } = req.params
    const result = completePartyEvent(partyId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    const party = getPartyEventById(partyId)
    res.status(200).json({ success: true, data: party })
  } catch (error) {
    res.status(500).json({ success: false, error: '完成活动失败' })
  }
})

export default router
