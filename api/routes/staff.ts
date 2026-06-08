import { Router, type Request, type Response } from 'express'
import {
  getStaffByHotelId,
  getStaffById,
  updateStaff,
  addStaff,
  STAFF_POSITIONS,
} from '../data/store.js'
import { calculateStaffFatigue, calculateStaffSatisfaction } from '../services/gameEngine.js'

const router = Router()

router.get('/hotel/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const staffList = getStaffByHotelId(hotelId)
    res.status(200).json({ success: true, data: staffList })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取员工列表失败' })
  }
})

router.get('/:staffId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params
    const staff = getStaffById(staffId)
    if (!staff) {
      res.status(404).json({ success: false, error: '员工不存在' })
      return
    }
    res.status(200).json({ success: true, data: staff })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取员工信息失败' })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const staffData = req.body
    const newStaff = addStaff(staffData)
    res.status(201).json({ success: true, data: newStaff })
  } catch (error) {
    res.status(500).json({ success: false, error: '添加员工失败' })
  }
})

router.put('/:staffId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params
    const updates = req.body
    const staff = updateStaff(staffId, updates)
    if (!staff) {
      res.status(404).json({ success: false, error: '员工不存在' })
      return
    }
    const newFatigue = calculateStaffFatigue(staff, 0)
    const newSatisfaction = calculateStaffSatisfaction({ ...staff, fatigue: newFatigue })
    const updated = updateStaff(staffId, { fatigue: newFatigue, satisfaction: newSatisfaction })
    res.status(200).json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新员工信息失败' })
  }
})

router.get('/config/positions', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true, data: STAFF_POSITIONS })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取职位配置失败' })
  }
})

export default router
