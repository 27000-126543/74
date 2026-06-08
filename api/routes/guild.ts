import { Router, type Request, type Response } from 'express'
import {
  getAllGuilds,
  getGuildById,
  getGuildByPlayerId,
  updateGuild,
} from '../data/store.js'
import {
  createGuild,
  joinGuild,
  leaveGuild,
  contributeToGuild,
  transferLeadership,
  getGuildDetails,
  getGuildRanking,
  getMemberRanking,
  upgradeGuildResort as upgradeResortService,
} from '../services/guildService.js'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const guilds = getAllGuilds()
    res.status(200).json({ success: true, data: guilds })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取公会列表失败' })
  }
})

router.get('/ranking', async (_req: Request, res: Response): Promise<void> => {
  try {
    const ranking = getGuildRanking()
    res.status(200).json({ success: true, data: ranking })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取公会排名失败' })
  }
})

router.get('/player/:playerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params
    const guild = getGuildByPlayerId(playerId)
    if (!guild) {
      res.status(200).json({ success: true, data: null })
      return
    }
    const details = getGuildDetails(guild.id)
    res.status(200).json({ success: true, data: details })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取玩家公会信息失败' })
  }
})

router.get('/:guildId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const guild = getGuildDetails(guildId)
    if (!guild) {
      res.status(404).json({ success: false, error: '公会不存在' })
      return
    }
    res.status(200).json({ success: true, data: guild })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取公会详情失败' })
  }
})

router.get('/:guildId/members/ranking', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const ranking = getMemberRanking(guildId)
    res.status(200).json({ success: true, data: ranking })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取成员排名失败' })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaderId, name } = req.body
    const result = createGuild(leaderId, name)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    res.status(201).json({ success: true, data: result.guild })
  } catch (error) {
    res.status(500).json({ success: false, error: '创建公会失败' })
  }
})

router.post('/:guildId/join', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { playerId } = req.body
    const result = joinGuild(guildId, playerId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    res.status(200).json({ success: true, data: result.guild })
  } catch (error) {
    res.status(500).json({ success: false, error: '加入公会失败' })
  }
})

router.post('/:guildId/leave', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { playerId } = req.body
    const result = leaveGuild(playerId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '离开公会失败' })
  }
})

router.post('/:guildId/contribute', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { playerId, amount } = req.body
    const result = contributeToGuild(playerId, amount)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    const guild = getGuildDetails(guildId)
    res.status(200).json({ success: true, data: guild })
  } catch (error) {
    res.status(500).json({ success: false, error: '贡献失败' })
  }
})

router.put('/:guildId/upgrade', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const result = upgradeResortService(guildId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    const guild = getGuildDetails(guildId)
    res.status(200).json({ success: true, data: guild })
  } catch (error) {
    res.status(500).json({ success: false, error: '升级公会度假村失败' })
  }
})

router.post('/:guildId/transfer', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { currentLeaderId, newLeaderId } = req.body
    const result = transferLeadership(guildId, currentLeaderId, newLeaderId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '转让会长失败' })
  }
})

export default router
