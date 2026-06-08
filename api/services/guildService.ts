import {
  type Guild,
  type GuildMember,
  getAllGuilds,
  getGuildById,
  getGuildByPlayerId,
  updateGuild,
  addGuildMember,
  getPlayerById,
  updatePlayer,
  getHotelByPlayerId,
} from '../data/store.js'

const GUILD_CREATE_COST = 50000
const MAX_MEMBERS_PER_LEVEL = 10
const LEVEL_UP_CONTRIBUTION = 50000

export const createGuild = (
  leaderId: string,
  name: string
): { success: boolean; guild?: Guild; message?: string } => {
  const leader = getPlayerById(leaderId)
  if (!leader) return { success: false, message: '玩家不存在' }

  const existingGuild = getGuildByPlayerId(leaderId)
  if (existingGuild) return { success: false, message: '您已经在一个公会中了' }

  if (leader.coins < GUILD_CREATE_COST) {
    return { success: false, message: `创建公会需要 ${GUILD_CREATE_COST} 金币` }
  }

  if (!name || name.length < 2 || name.length > 20) {
    return { success: false, message: '公会名称长度应为2-20个字符' }
  }

  const allGuilds = getAllGuilds()
  if (allGuilds.some(g => g.name === name)) {
    return { success: false, message: '该公会名称已被使用' }
  }

  updatePlayer(leaderId, { coins: leader.coins - GUILD_CREATE_COST, guildId: undefined })

  const newGuild: Guild = {
    id: `guild_${Date.now()}`,
    name,
    leaderId,
    members: [
      {
        playerId: leaderId,
        playerName: leader.name,
        contribution: GUILD_CREATE_COST,
        joinDate: new Date(),
      },
    ],
    resortLevel: 1,
    totalContribution: GUILD_CREATE_COST,
    visitorBonus: 2,
    revenueBonus: 1,
  }

  allGuilds.push(newGuild)
  updatePlayer(leaderId, { guildId: newGuild.id })

  return { success: true, guild: newGuild }
}

export const joinGuild = (
  guildId: string,
  playerId: string
): { success: boolean; guild?: Guild; message?: string } => {
  const player = getPlayerById(playerId)
  if (!player) return { success: false, message: '玩家不存在' }

  const existingGuild = getGuildByPlayerId(playerId)
  if (existingGuild) return { success: false, message: '您已经在一个公会中了' }

  const guild = getGuildById(guildId)
  if (!guild) return { success: false, message: '公会不存在' }

  const maxMembers = guild.resortLevel * MAX_MEMBERS_PER_LEVEL
  if (guild.members.length >= maxMembers) {
    return { success: false, message: '该公会成员已满' }
  }

  const member: GuildMember = {
    playerId,
    playerName: player.name,
    contribution: 0,
    joinDate: new Date(),
  }

  const updatedGuild = addGuildMember(guildId, member)
  updatePlayer(playerId, { guildId })

  return { success: true, guild: updatedGuild || undefined }
}

export const leaveGuild = (
  playerId: string
): { success: boolean; message?: string } => {
  const player = getPlayerById(playerId)
  if (!player) return { success: false, message: '玩家不存在' }

  const guild = getGuildByPlayerId(playerId)
  if (!guild) return { success: false, message: '您不在任何公会中' }

  if (guild.leaderId === playerId) {
    if (guild.members.length > 1) {
      return { success: false, message: '请先转让会长职位或解散公会' }
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
  return { success: true }
}

export const contributeToGuild = (
  playerId: string,
  amount: number
): { success: boolean; message?: string; newLevel?: number } => {
  const player = getPlayerById(playerId)
  if (!player) return { success: false, message: '玩家不存在' }

  const guild = getGuildByPlayerId(playerId)
  if (!guild) return { success: false, message: '您不在任何公会中' }

  if (amount <= 0) return { success: false, message: '贡献金额必须大于0' }
  if (player.coins < amount) return { success: false, message: '金币不足' }

  updatePlayer(playerId, { coins: player.coins - amount })

  const memberIndex = guild.members.findIndex(m => m.playerId === playerId)
  if (memberIndex !== -1) {
    guild.members[memberIndex].contribution += amount
  }

  const newTotalContribution = guild.totalContribution + amount
  const newLevel = Math.floor(newTotalContribution / LEVEL_UP_CONTRIBUTION) + 1

  const levelUp = newLevel > guild.resortLevel

  updateGuild(guild.id, {
    members: guild.members,
    totalContribution: newTotalContribution,
    resortLevel: Math.max(guild.resortLevel, newLevel),
    visitorBonus: levelUp ? Math.min(25, 2 + (newLevel - 1) * 2) : guild.visitorBonus,
    revenueBonus: levelUp ? Math.min(20, 1 + (newLevel - 1) * 2) : guild.revenueBonus,
  })

  return {
    success: true,
    newLevel: levelUp ? newLevel : undefined,
  }
}

export const transferLeadership = (
  guildId: string,
  currentLeaderId: string,
  newLeaderId: string
): { success: boolean; message?: string } => {
  const guild = getGuildById(guildId)
  if (!guild) return { success: false, message: '公会不存在' }

  if (guild.leaderId !== currentLeaderId) {
    return { success: false, message: '只有会长可以转让职位' }
  }

  const newLeader = guild.members.find(m => m.playerId === newLeaderId)
  if (!newLeader) {
    return { success: false, message: '新会长必须是公会成员' }
  }

  updateGuild(guildId, { leaderId: newLeaderId })
  return { success: true }
}

export const getGuildDetails = (guildId: string): (Guild & {
  totalRevenue: number
  averageLevel: number
}) | null => {
  const guild = getGuildById(guildId)
  if (!guild) return null

  let totalRevenue = 0
  let totalLevel = 0

  for (const member of guild.members) {
    const player = getPlayerById(member.playerId)
    if (player) {
      totalLevel += player.level
      const hotel = getHotelByPlayerId(member.playerId)
      if (hotel) {
        totalRevenue += hotel.totalRevenue
      }
    }
  }

  return {
    ...guild,
    totalRevenue,
    averageLevel: guild.members.length > 0 ? Math.round(totalLevel / guild.members.length) : 0,
  }
}

export const getGuildRanking = (): Array<{
  id: string
  name: string
  resortLevel: number
  memberCount: number
  totalContribution: number
  totalRevenue: number
}> => {
  const allGuilds = getAllGuilds()

  return allGuilds.map(guild => {
    let totalRevenue = 0
    for (const member of guild.members) {
      const hotel = getHotelByPlayerId(member.playerId)
      if (hotel) {
        totalRevenue += hotel.totalRevenue
      }
    }

    return {
      id: guild.id,
      name: guild.name,
      resortLevel: guild.resortLevel,
      memberCount: guild.members.length,
      totalContribution: guild.totalContribution,
      totalRevenue,
    }
  }).sort((a, b) => b.totalRevenue - a.totalRevenue)
}

export const getMemberRanking = (guildId: string): GuildMember[] => {
  const guild = getGuildById(guildId)
  if (!guild) return []

  return [...guild.members].sort((a, b) => b.contribution - a.contribution)
}

export const upgradeGuildResort = (
  guildId: string
): { success: boolean; message?: string } => {
  const guild = getGuildById(guildId)
  if (!guild) return { success: false, message: '公会不存在' }

  const upgradeCost = guild.resortLevel * 100000
  const leader = getPlayerById(guild.leaderId)
  if (!leader) return { success: false, message: '会长不存在' }

  if (leader.coins < upgradeCost) {
    return { success: false, message: `升级需要 ${upgradeCost} 金币` }
  }

  updatePlayer(guild.leaderId, { coins: leader.coins - upgradeCost })

  const newLevel = guild.resortLevel + 1
  updateGuild(guildId, {
    resortLevel: newLevel,
    visitorBonus: Math.min(25, 2 + (newLevel - 1) * 2),
    revenueBonus: Math.min(20, 1 + (newLevel - 1) * 2),
  })

  return { success: true }
}
