import { Router, type Request, type Response } from 'express'
import {
  getAllGuilds,
  getGuildById,
  getGuildByPlayerId,
  updateGuild,
  getPlayerById,
  updatePlayer,
  type Guild,
  type GuildMember,
} from '../data/store.js'

const router = Router()

const GUILD_CREATE_COST = 50000
const LEVEL_UP_CONTRIBUTION = 100000
const BONUS_PER_LEVEL = 5

const generateId = (): string => Math.random().toString(36).substring(2, 10)

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

    const leader = getPlayerById(leaderId)
    if (!leader) {
      res.status(400).json({ success: false, data: null, error: '玩家不存在' })
      return
    }

    const existingGuild = getGuildByPlayerId(leaderId)
    if (existingGuild) {
      res.status(400).json({ success: false, data: null, error: '您已经在一个公会中了' })
      return
    }

    if (leader.coins < GUILD_CREATE_COST) {
      res.status(400).json({ success: false, data: null, error: `创建公会需要 ${GUILD_CREATE_COST} 金币` })
      return
    }

    if (!name || name.length < 2 || name.length > 20) {
      res.status(400).json({ success: false, data: null, error: '公会名称长度应为2-20个字符' })
      return
    }

    const allGuilds = getAllGuilds()
    if (allGuilds.some(g => g.name === name)) {
      res.status(400).json({ success: false, data: null, error: '该公会名称已被使用' })
      return
    }

    updatePlayer(leaderId, { coins: leader.coins - GUILD_CREATE_COST })

    const leaderMember: GuildMember = {
      playerId: leaderId,
      playerName: leader.name,
      contribution: GUILD_CREATE_COST,
      joinDate: new Date(),
    }

    const newGuild: Guild = {
      id: generateId(),
      name,
      leaderId,
      members: [leaderMember],
      resortLevel: 1,
      totalContribution: GUILD_CREATE_COST,
      visitorBonus: 5,
      revenueBonus: 5,
    }

    allGuilds.push(newGuild)
    updatePlayer(leaderId, { guildId: newGuild.id })

    res.status(201).json({ success: true, data: newGuild, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '创建公会失败' })
  }
})

router.post('/:guildId/join', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { playerId } = req.body

    const player = getPlayerById(playerId)
    if (!player) {
      res.status(400).json({ success: false, data: null, error: '玩家不存在' })
      return
    }

    const existingGuild = getGuildByPlayerId(playerId)
    if (existingGuild) {
      res.status(400).json({ success: false, data: null, error: '您已经在一个公会中了' })
      return
    }

    const guild = getGuildById(guildId)
    if (!guild) {
      res.status(404).json({ success: false, data: null, error: '公会不存在' })
      return
    }

    const member: GuildMember = {
      playerId,
      playerName: player.name,
      contribution: 0,
      joinDate: new Date(),
    }

    guild.members.push(member)
    updatePlayer(playerId, { guildId })

    res.status(200).json({ success: true, data: guild, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '加入公会失败' })
  }
})

router.post('/:guildId/leave', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { playerId } = req.body

    const player = getPlayerById(playerId)
    if (!player) {
      res.status(400).json({ success: false, data: null, error: '玩家不存在' })
      return
    }

    const guild = getGuildById(guildId)
    if (!guild) {
      res.status(404).json({ success: false, data: null, error: '公会不存在' })
      return
    }

    const isMember = guild.members.some(m => m.playerId === playerId)
    if (!isMember) {
      res.status(400).json({ success: false, data: null, error: '您不在该公会中' })
      return
    }

    if (guild.leaderId === playerId) {
      if (guild.members.length > 1) {
        res.status(400).json({ success: false, data: null, error: '会长需要先转让职位或解散公会' })
        return
      }
      const allGuilds = getAllGuilds()
      const index = allGuilds.findIndex(g => g.id === guild.id)
      if (index !== -1) {
        allGuilds.splice(index, 1)
      }
    } else {
      const memberIndex = guild.members.findIndex(m => m.playerId === playerId)
      if (memberIndex !== -1) {
        const memberContribution = guild.members[memberIndex].contribution
        guild.members.splice(memberIndex, 1)
        guild.totalContribution = Math.max(0, guild.totalContribution - Math.floor(memberContribution * 0.5))
        updateGuild(guild.id, {
          members: guild.members,
          totalContribution: guild.totalContribution,
        })
      }
    }

    updatePlayer(playerId, { guildId: undefined })

    res.status(200).json({ success: true, data: null, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '离开公会失败' })
  }
})

router.post('/:guildId/contribute', async (req: Request, res: Response): Promise<void> => {
  try {
    const { guildId } = req.params
    const { playerId, amount } = req.body

    const player = getPlayerById(playerId)
    if (!player) {
      res.status(400).json({ success: false, data: null, error: '玩家不存在' })
      return
    }

    const guild = getGuildById(guildId)
    if (!guild) {
      res.status(404).json({ success: false, data: null, error: '公会不存在' })
      return
    }

    const isMember = guild.members.some(m => m.playerId === playerId)
    if (!isMember) {
      res.status(400).json({ success: false, data: null, error: '您不在该公会中' })
      return
    }

    if (amount <= 0) {
      res.status(400).json({ success: false, data: null, error: '贡献金额必须大于0' })
      return
    }

    if (player.coins < amount) {
      res.status(400).json({ success: false, data: null, error: '金币不足' })
      return
    }

    updatePlayer(playerId, { coins: player.coins - amount })

    const memberIndex = guild.members.findIndex(m => m.playerId === playerId)
    if (memberIndex !== -1) {
      guild.members[memberIndex].contribution += amount
    }

    const newTotalContribution = guild.totalContribution + amount
    const expectedLevel = Math.floor(newTotalContribution / LEVEL_UP_CONTRIBUTION) + 1
    const newLevel = Math.max(guild.resortLevel, expectedLevel)
    const levelUp = newLevel > guild.resortLevel

    updateGuild(guild.id, {
      members: guild.members,
      totalContribution: newTotalContribution,
      resortLevel: newLevel,
      visitorBonus: levelUp ? (newLevel - 1) * BONUS_PER_LEVEL + 5 : guild.visitorBonus,
      revenueBonus: levelUp ? (newLevel - 1) * BONUS_PER_LEVEL + 5 : guild.revenueBonus,
    })

    const updatedGuild = getGuildById(guildId)

    res.status(200).json({ success: true, data: { guild: updatedGuild, levelUp, newLevel: levelUp ? newLevel : undefined }, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '贡献失败' })
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

    const nextLevel = guild.resortLevel + 1
    const requiredContribution = nextLevel * LEVEL_UP_CONTRIBUTION

    if (guild.totalContribution < requiredContribution) {
      res.status(400).json({
        success: false,
        data: null,
        error: `升级需要 ${requiredContribution} 总贡献，当前 ${guild.totalContribution}`,
      })
      return
    }

    const updatedGuild = updateGuild(guildId, {
      resortLevel: nextLevel,
      visitorBonus: (nextLevel - 1) * BONUS_PER_LEVEL + 5,
      revenueBonus: (nextLevel - 1) * BONUS_PER_LEVEL + 5,
    })

    res.status(200).json({ success: true, data: updatedGuild, error: null })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '升级度假村失败' })
  }
})

export default router
