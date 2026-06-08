import { Router, type Request, type Response } from 'express'
import {
  getStaffByHotelId,
  getStaffById,
  updateStaff,
  addStaff,
  deleteStaff,
  STAFF_POSITIONS,
} from '../data/store.js'
import { calculateStaffFatigue, calculateStaffSatisfaction } from '../services/gameEngine.js'

const router = Router()

const AVATARS = ['👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🍳', '👩‍🍳', '🧑‍🎨', '👨‍🎤', '👩‍🎤']
const STAFF_NAMES = ['小明', '小红', '阿强', '阿华', '小李', '小王', '老张', '老刘', '小陈', '小林']

router.get('/hotel/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const staffList = getStaffByHotelId(hotelId)
    res.status(200).json({ success: true, data: staffList })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取员工列表失败' })
  }
})

router.get('/candidates', async (req: Request, res: Response): Promise<void> => {
  try {
    const { position } = req.query
    const positionConfig = STAFF_POSITIONS[position as keyof typeof STAFF_POSITIONS]
    if (!positionConfig) {
      res.status(400).json({ success: false, error: '无效的职位' })
      return
    }
    const candidates = Array.from({ length: 3 }, () => {
      const skills: any = {}
      positionConfig.skills.forEach((skill: string) => {
        skills[skill] = Math.floor(Math.random() * 40) + 50
      })
      const remainingSkills = ['service', 'efficiency', 'friendliness', 'professionalism'].filter(s => !positionConfig.skills.includes(s))
      remainingSkills.forEach(skill => {
        skills[skill] = Math.floor(Math.random() * 30) + 40
      })
      return {
        name: STAFF_NAMES[Math.floor(Math.random() * STAFF_NAMES.length)],
        position,
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        skills,
        satisfaction: Math.floor(Math.random() * 20) + 70,
        fatigue: 0,
        salary: positionConfig.baseSalary + Math.floor(Math.random() * 1000),
        level: 1,
        status: 'working' as const,
        schedule: Array.from({ length: 7 }, (_, i) => ({
          day: i,
          shift: (['morning', 'afternoon', 'night', 'off'] as const)[Math.floor(Math.random() * 4)],
        })),
      }
    })
    res.status(200).json({ success: true, data: candidates })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取候选人列表失败' })
  }
})

router.get('/config/positions', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true, data: STAFF_POSITIONS })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取职位配置失败' })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId, name, position, avatar, skills, satisfaction, fatigue, salary, level, status, schedule } = req.body
    const positionConfig = STAFF_POSITIONS[position as keyof typeof STAFF_POSITIONS]
    if (!positionConfig) {
      res.status(400).json({ success: false, error: '无效的职位' })
      return
    }
    const newStaff = addStaff({
      hotelId,
      name: name || STAFF_NAMES[Math.floor(Math.random() * STAFF_NAMES.length)],
      position,
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      skills: skills || positionConfig.skills.reduce((acc: any, skill: string) => {
        acc[skill] = Math.floor(Math.random() * 30) + 60
        return acc
      }, {}),
      satisfaction: satisfaction ?? 80,
      fatigue: fatigue ?? 0,
      salary: salary || positionConfig.baseSalary,
      level: level || 1,
      status: status || 'working',
      schedule: schedule || Array.from({ length: 7 }, (_, i) => ({
        day: i,
        shift: i < 5 ? 'morning' as const : 'off' as const,
      })),
    })
    res.status(201).json({ success: true, data: newStaff })
  } catch (error) {
    res.status(500).json({ success: false, error: '添加员工失败' })
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

router.delete('/:staffId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params
    const success = deleteStaff(staffId)
    if (!success) {
      res.status(404).json({ success: false, error: '员工不存在' })
      return
    }
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '解雇员工失败' })
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
    res.status(200).json({ success: true, data: staff })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新员工信息失败' })
  }
})

router.put('/:staffId/schedule', async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params
    const { schedule } = req.body
    const staff = updateStaff(staffId, { schedule })
    if (!staff) {
      res.status(404).json({ success: false, error: '员工不存在' })
      return
    }
    res.status(200).json({ success: true, data: staff })
  } catch (error) {
    res.status(500).json({ success: false, error: '更新排班失败' })
  }
})

router.put('/:staffId/promote', async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params
    const staff = getStaffById(staffId)
    if (!staff) {
      res.status(404).json({ success: false, error: '员工不存在' })
      return
    }
    const updated = updateStaff(staffId, {
      level: staff.level + 1,
      salary: Math.floor(staff.salary * 1.2),
      satisfaction: Math.min(100, staff.satisfaction + 10),
    })
    res.status(200).json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: '晋升失败' })
  }
})

router.put('/:staffId/rest', async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params
    const staff = getStaffById(staffId)
    if (!staff) {
      res.status(404).json({ success: false, error: '员工不存在' })
      return
    }
    const newFatigue = Math.max(0, staff.fatigue - 30)
    const newSatisfaction = Math.min(100, staff.satisfaction + 5)
    const updated = updateStaff(staffId, {
      fatigue: newFatigue,
      satisfaction: newSatisfaction,
      status: 'resting',
    })
    res.status(200).json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: '休息失败' })
  }
})

export default router
