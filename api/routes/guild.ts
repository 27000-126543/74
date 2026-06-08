import { Router, type Request, type Response } from 'express'
import {
  getGuildById,
  getGuildByPlayerId,
  getPlayerById,
  updatePlayer,
  addGuild,
  updateGuild,
  getAllGuilds,
  type GuildMember,
} from '../data/store.js'
import {
  upgradeGuildResort,
} from '../services/guildService.js'

const router = Router()

const GUILD_CREATE_COST = 50000
const LEVEL_UP_CONTRIBUTION = 100000
const BONUS_PER_LEVEL = 5

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const guilds = getAllGuilds()
    res.status(200).json({ success: true, data: guilds, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取公会列表失败' })
  }
})

router.get('/ranking', async (_req: Request, res: Response): Promise<void> => {
  try {
    const guilds = getAllGuilds()
    const ranking = [...guilds]
      .sort((a, b) => b.totalContribution - a.totalContribution)
      .slice(0, 20)
      .map((guild, index) => ({
        rank: index + 1,
        guildId: guild.id,
        guildName: guild.name,
        resortLevel: guild.resortLevel,
        totalContribution: guild.totalContribution,
        memberCount: guild.members.length,
      }))
    res.status(200).json({ success: true, data: ranking, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取公会排行榜失败' })
  }
})

router.get('/player/:playerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params
    const guild = getGuildByPlayerId(playerId)
    res.status(200).json({ success: true, data: guild || null, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取玩家公会信息失败' })
  }
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { leaderId, name } = req.body
    if (!leaderId || !name) {
      res.status(400).json({ success: false, data: null, error: '缺少必要参数' })
      return
    }

    const leader = getPlayerById(leaderId)
    if (!leader) {
      res.status(404).json({ success: false, data: null, error: '玩家不存在' })
      return
    }

    if (leader.guildId) {
      res.status(400).json({ success: false, data: null, error: '玩家已在公会中' })
      return
    }

    if (leader.coins < GUILD_CREATE_COST) {
      res.status(400).json({ success: false, data: null, error: '金币不足，创建公会需要50000金币' })
      return
    }

    updatePlayer(leaderId, { coins: leader.coins - GUILD_CREATE_COST })

    const leaderMember: GuildMember = {
      playerId: leaderId,
      playerName: leader.name,
      contribution: 0,
      joinDate: new Date(),
    }

    const newGuild = addGuild({
      name,
      leaderId,
      members: [leaderMember],
      resortLevel: 1,
      totalContribution: 0,
      visitorBonus: 5,
      revenueBonus: 5,
    })

    updatePlayer(leaderId, { guildId: newGuild.id })

    res.status(201).json({ success: true, data: newGuild, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '创建公会失败' })
  }
})

router.get('/:guildId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const guild = getGuildById(guildId)
    if (!guild) {
      res.status(404).json({ success: false, data: null, error: '公会不存在' })
      return
    }
    res.status(200).json({ success: true, data: guild, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取公会详情失败' })
  }
})

router.post('/:guildId/join', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { playerId } = req.body

    if (!playerId) {
      res.status(400).json({ success: false, data: null, error: '缺少 playerId' })
      return
    }

    const guild = getGuildById(guildId)
    if (!guild) {
      res.status(404).json({ success: false, data: null, error: '公会不存在' })
      return
    }

    const player = getPlayerById(playerId)
    if (!player) {
      res.status(404).json({ success: false, data: null, error: '玩家不存在' })
      return
    }

    if (player.guildId) {
      res.status(400).json({ success: false, data: null, error: '玩家已在公会中' })
      return
    }

    const newMember: GuildMember = {
      playerId,
      playerName: player.name,
      contribution: 0,
      joinDate: new Date(),
    }

    const updated = updateGuild(guildId, {
      members: [...guild.members, newMember],
    })

    if (!updated) {
      res.status(404).json({ success: false, data: null, error: '加入公会失败' })
      return
    }

    updatePlayer(playerId, { guildId })

    res.status(200).json({ success: true, data: updated, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '加入公会失败' })
  }
})

router.post('/:guildId/leave', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { playerId } = req.body

    if (!playerId) {
      res.status(400).json({ success: false, data: null, error: '缺少 playerId' })
      return
    }

    const guild = getGuildById(guildId)
    if (!guild) {
      res.status(404).json({ success: false, data: null, error: '公会不存在' })
      return
    }

    if (guild.leaderId === playerId) {
      res.status(400).json({ success: false, data: null, error: '公会会长不能退出公会' })
      return
    }

    const updated = updateGuild(guildId, {
      members: guild.members.filter(m => m.playerId !== playerId),
    })

    if (!updated) {
      res.status(404).json({ success: false, data: null, error: '退出公会失败' })
      return
    }

    updatePlayer(playerId, { guildId: undefined })

    res.status(200).json({ success: true, data: updated, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '退出公会失败' })
  }
})

router.post('/:guildId/contribute', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { playerId, amount } = req.body

    if (!playerId || !amount) {
      res.status(400).json({ success: false, data: null, error: '缺少必要参数' })
      return
    }

    const guild = getGuildById(guildId)
    if (!guild) {
      res.status(404).json({ success: false, data: null, error: '公会不存在' })
      return
    }

    const player = getPlayerById(playerId)
    if (!player) {
      res.status(404).json({ success: false, data: null, error: '玩家不存在' })
      return
    }

    if (player.coins < amount) {
      res.status(400).json({ success: false, data: null, error: '金币不足' })
      return
    }

    updatePlayer(playerId, { coins: player.coins - amount })

    const updatedMembers = guild.members.map(m =>
      m.playerId === playerId ? { ...m, contribution: m.contribution + amount } : m
    )
    let updated = updateGuild(guildId, {
      members: updatedMembers,
      totalContribution: guild.totalContribution + amount,
    })

    if (!updated) {
      res.status(404).json({ success: false, data: null, error: '捐献失败' })
      return
    }

    let newLevel = Math.floor(updated.totalContribution / LEVEL_UP_CONTRIBUTION) + 1
    newLevel = Math.min(newLevel, 10)
    const visitorBonus = (newLevel - 1) * BONUS_PER_LEVEL + 5
    const revenueBonus = (newLevel - 1) * BONUS_PER_LEVEL + 5
    updated = updateGuild(guildId, { resortLevel: newLevel, visitorBonus, revenueBonus }) || updated

    res.status(200).json({ success: true, data: updated, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '捐献失败' })
  }
})

router.put('/:guildId/upgrade', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const guild = getGuildById(guildId)
    if (!guild) {
      res.status(404).json({ success: false, data: null, error: '公会不存在' })
      return
    }

    const updated = upgradeGuildResort(guildId)
    if (!updated) {
      res.status(400).json({ success: false, data: null, error: '升级失败：贡献值不足或已达最大等级' })
      return
    }

    res.status(200).json({ success: true, data: updated, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '升级公会度假村失败' })
  }
})

export default router
