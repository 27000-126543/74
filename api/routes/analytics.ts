import { Router, type Request, type Response } from 'express'
import { getHotelById } from '../data/store.js'
import {
  generateWeeklyReport,
  getDashboardSummary,
  getRevenueBreakdown,
  getStaffPerformance,
  getHotelComparison,
} from '../services/analyticsService.js'

const router = Router()

router.get('/dashboard/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const summary = getDashboardSummary(hotelId)
    if (!summary) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    res.status(200).json({ success: true, data: summary })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取仪表盘数据失败' })
  }
})

router.get('/weekly-report/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const report = generateWeeklyReport(hotelId)
    if (!report) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    res.status(200).json({ success: true, data: report })
  } catch (error) {
    res.status(500).json({ success: false, error: '生成周报失败' })
  }
})

router.get('/revenue/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const breakdown = getRevenueBreakdown(hotelId)
    if (!breakdown) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    res.status(200).json({ success: true, data: breakdown })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取收入分析失败' })
  }
})

router.get('/staff-performance/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const performance = getStaffPerformance(hotelId)
    res.status(200).json({ success: true, data: performance })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取员工绩效失败' })
  }
})

router.get('/comparison/:hotelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelId } = req.params
    const hotel = getHotelById(hotelId)
    if (!hotel) {
      res.status(404).json({ success: false, error: '酒店不存在' })
      return
    }
    const comparison = getHotelComparison(hotel)
    res.status(200).json({ success: true, data: comparison })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取对比数据失败' })
  }
})

export default router
