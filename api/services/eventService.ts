import {
  type GameEvent,
  type EventOption,
  type PartyEvent,
  getEventsByHotelId,
  getPartyEventsByHotelId,
  addEvent,
  updateEvent,
  updatePartyEvent,
  updateHotel,
  getHotelById,
  updatePlayer,
  getPlayerById,
  getStaffByHotelId,
} from '../data/store.js'

const COMPLAINT_TEMPLATES = [
  {
    title: '客人投诉空调故障',
    description: '房间的客人反映空调无法正常制冷，要求立即处理。',
    options: [
      { cost: 200, rating: 2, satisfaction: 10, label: '立即派维修人员' },
      { cost: 800, rating: 5, satisfaction: 20, coins: -500, label: '升级到套房并道歉' },
      { cost: 0, rating: -5, satisfaction: -15, label: '暂时不处理' },
    ],
  },
  {
    title: '客人投诉噪音问题',
    description: '有客人投诉隔壁房间噪音太大，影响休息。',
    options: [
      { cost: 100, rating: 1, satisfaction: 8, label: '赠送果盘表示歉意' },
      { cost: 300, rating: 3, satisfaction: 12, label: '更换到安静区域的房间' },
      { cost: 0, rating: -3, satisfaction: -10, label: '提醒客人但不采取行动' },
    ],
  },
  {
    title: '客人投诉服务态度',
    description: '客人反映前台服务态度不好，需要改进。',
    options: [
      { cost: 0, rating: 0, satisfaction: 5, label: '与员工沟通改进' },
      { cost: 500, rating: 4, satisfaction: 15, label: '经理亲自道歉并提供补偿' },
    ],
  },
]

const MALFUNCTION_TEMPLATES = [
  {
    title: '电梯故障',
    description: '其中一部电梯出现故障，需要紧急维修。',
    options: [
      { cost: 2000, rating: 1, satisfaction: 5, label: '立即维修（4小时）' },
      { cost: 5000, rating: 3, satisfaction: 10, label: '紧急维修（1小时）' },
      { cost: 0, rating: -8, satisfaction: -20, label: '等到明天再处理' },
    ],
  },
  {
    title: '厨房设备故障',
    description: '主烤箱出现故障，影响餐厅正常运营。',
    options: [
      { cost: 1500, rating: 2, satisfaction: 8, label: '维修设备' },
      { cost: 8000, rating: 5, satisfaction: 12, label: '更换新设备' },
    ],
  },
]

const WEDDING_TEMPLATES = [
  {
    title: '婚礼预订请求',
    description: '一对新人希望在酒店举办婚礼，预计邀请150位宾客。',
    options: [
      { cost: 0, rating: 5, satisfaction: 20, coins: 30000, label: '接受预订，标准套餐' },
      { cost: -10000, rating: 8, satisfaction: 30, coins: 50000, label: '升级豪华套餐' },
    ],
  },
]

const VIP_ARRIVAL_TEMPLATES = [
  {
    title: 'VIP客人即将抵达',
    description: '一位知名企业家预订了豪华套房，预计1小时后到达。',
    options: [
      { cost: 1500, rating: 8, satisfaction: 15, coins: 5000, label: '准备欢迎礼盒和专属服务' },
      { cost: 0, rating: 0, satisfaction: 0, label: '按标准流程接待' },
    ],
  },
  {
    title: '明星客人入住',
    description: '一位知名明星计划匿名入住，需要特殊安排。',
    options: [
      { cost: 2000, rating: 10, satisfaction: 20, coins: 8000, label: '安排专属楼层和安保' },
      { cost: 500, rating: 3, satisfaction: 8, coins: 2000, label: '提供保密服务' },
    ],
  },
]

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export const generateRandomEvent = (hotelId: string): GameEvent | null => {
  const rand = Math.random()
  let templates: typeof COMPLAINT_TEMPLATES

  if (rand < 0.4) {
    templates = COMPLAINT_TEMPLATES
  } else if (rand < 0.65) {
    templates = MALFUNCTION_TEMPLATES
  } else if (rand < 0.85) {
    templates = WEDDING_TEMPLATES
  } else {
    templates = VIP_ARRIVAL_TEMPLATES
  }

  const template = randomFromArray(templates)
  const eventType = rand < 0.4 ? 'complaint' : rand < 0.65 ? 'malfunction' : rand < 0.85 ? 'wedding' : 'vip_arrival'

  const options: EventOption[] = template.options.map((opt, index) => ({
    id: `opt_${Date.now()}_${index}`,
    label: opt.label,
    cost: opt.cost,
    effect: {
      rating: opt.rating,
      satisfaction: opt.satisfaction,
      coins: opt.coins,
    },
  }))

  return addEvent({
    hotelId,
    type: eventType as GameEvent['type'],
    title: template.title,
    description: template.description,
    options,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000 * (1 + Math.random() * 3)),
    resolved: false,
  })
}

export const resolveEvent = (
  eventId: string,
  optionId: string,
  playerId: string
): { success: boolean; message?: string; effects?: EventOption['effect'] } => {
  const events = getEventsByHotelId('h1')
  const allEvents = [...events]
  const event = allEvents.find(e => e.id === eventId)
  if (!event) return { success: false, message: '事件不存在' }
  if (event.resolved) return { success: false, message: '事件已处理' }

  const option = event.options.find(o => o.id === optionId)
  if (!option) return { success: false, message: '选项不存在' }

  const now = new Date()
  if (now > event.expiresAt) {
    return { success: false, message: '事件已过期' }
  }

  const player = getPlayerById(playerId)
  if (!player) return { success: false, message: '玩家不存在' }

  if (option.cost && option.cost > 0 && player.coins < option.cost) {
    return { success: false, message: '金币不足' }
  }

  updateEvent(eventId, { resolved: true })

  const hotel = getHotelById(event.hotelId)
  if (hotel) {
    let newRating = hotel.rating
    let newRevenue = hotel.totalRevenue

    if (option.effect.rating) {
      newRating = Math.max(0, Math.min(5, newRating + option.effect.rating / 10))
    }
    if (option.effect.coins && option.effect.coins > 0) {
      newRevenue += option.effect.coins
    }

    updateHotel(hotel.id, {
      rating: Math.round(newRating * 10) / 10,
      totalRevenue: newRevenue,
    })
  }

  let newCoins = player.coins
  if (option.cost && option.cost > 0) {
    newCoins -= option.cost
  }
  if (option.effect.coins) {
    newCoins += option.effect.coins
  }
  updatePlayer(playerId, { coins: newCoins })

  return {
    success: true,
    effects: option.effect,
  }
}

export const getPendingEvents = (hotelId: string): GameEvent[] => {
  return getEventsByHotelId(hotelId).filter(e => !e.resolved && new Date() < e.expiresAt)
}

export const updatePartyProgress = (partyId: string): PartyEvent | null => {
  const parties = getPartyEventsByHotelId('h1')
  const allParties = [...parties]
  const party = allParties.find(p => p.id === partyId)
  if (!party) return null

  if (party.status === 'completed') return party

  const now = new Date()
  if (party.status === 'planning' && now >= party.startTime) {
    return updatePartyEvent(partyId, { status: 'ongoing', preparationProgress: 100 }) || null
  }

  if (party.status === 'planning') {
    const staff = getStaffByHotelId(party.hotelId)
    const workingStaff = staff.filter(s => s.status === 'working').length
    const progressIncrease = Math.min(5, workingStaff * 0.5 + 2)
    const newProgress = Math.min(100, party.preparationProgress + progressIncrease)

    const serviceScore = staff.length > 0
      ? Math.round(staff.reduce((sum, s) => sum + s.skills.service, 0) / staff.length * (newProgress / 100))
      : 0

    return updatePartyEvent(partyId, {
      preparationProgress: newProgress,
      serviceScore,
    }) || null
  }

  if (party.status === 'ongoing') {
    const staff = getStaffByHotelId(party.hotelId)
    const serviceScore = staff.length > 0
      ? Math.round(staff.reduce((sum, s) => sum + (s.skills.service + s.skills.efficiency) / 2, 0) / staff.length)
      : 0

    return updatePartyEvent(partyId, {
      serviceScore: Math.max(party.serviceScore, serviceScore),
    }) || null
  }

  return party
}

export const completePartyEvent = (partyId: string): { success: boolean; revenue?: number } => {
  const parties = getPartyEventsByHotelId('h1')
  const allParties = [...parties]
  const party = allParties.find(p => p.id === partyId)
  if (!party) return { success: false }
  if (party.status === 'completed') return { success: false }

  const finalRevenue = Math.round(party.budget * (0.8 + party.serviceScore / 200))

  const hotel = getHotelById(party.hotelId)
  if (hotel) {
    updateHotel(hotel.id, { totalRevenue: hotel.totalRevenue + finalRevenue })
  }

  updatePartyEvent(partyId, { status: 'completed', revenue: finalRevenue })

  return { success: true, revenue: finalRevenue }
}
