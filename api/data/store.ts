export interface Player {
  id: string
  name: string
  avatar: string
  coins: number
  level: number
  exp: number
  guildId?: string
}

export interface Room {
  id: string
  type: 'suite' | 'standard' | 'villa'
  number: string
  floor: number
  price: number
  comfort: number
  status: 'vacant' | 'occupied' | 'maintenance'
  guestId?: string
}

export interface Facility {
  id: string
  type: 'pool' | 'spa' | 'restaurant' | 'gym' | 'lounge'
  level: number
  quality: number
}

export interface Hotel {
  id: string
  playerId: string
  name: string
  style: 'classical' | 'modern' | 'tropical'
  rooms: Room[]
  facilities: Facility[]
  comfortScore: number
  rating: number
  totalRevenue: number
}

export interface ScheduleItem {
  day: number
  shift: 'morning' | 'afternoon' | 'night' | 'off'
}

export interface Staff {
  id: string
  hotelId: string
  name: string
  avatar: string
  position: 'receptionist' | 'chef' | 'cleaner' | 'manager'
  skills: {
    service: number
    efficiency: number
    friendliness: number
    professionalism: number
  }
  satisfaction: number
  fatigue: number
  salary: number
  level: number
  status: 'working' | 'resting' | 'off'
  schedule: ScheduleItem[]
}

export interface Guest {
  id: string
  name: string
  avatar: string
  preferences: string[]
  budget: number
  satisfaction: number
  checkIn?: Date
  checkOut?: Date
  roomId?: string
}

export interface EventOption {
  id: string
  label: string
  cost?: number
  effect: {
    rating?: number
    satisfaction?: number
    coins?: number
  }
}

export interface GameEvent {
  id: string
  hotelId: string
  type: 'complaint' | 'malfunction' | 'wedding' | 'vip_arrival'
  title: string
  description: string
  options: EventOption[]
  createdAt: Date
  expiresAt: Date
  resolved?: boolean
}

export interface PartyEvent {
  id: string
  hotelId: string
  type: 'party' | 'banquet' | 'wedding_reception'
  name: string
  budget: number
  attendees: number
  maxAttendees: number
  revenue: number
  serviceScore: number
  preparationProgress: number
  status: 'planning' | 'ongoing' | 'completed'
  startTime: Date
}

export interface MarketListing {
  id: string
  sellerId: string
  sellerName: string
  itemType: 'blueprint' | 'ingredient'
  itemName: string
  itemRarity: 'common' | 'rare' | 'epic' | 'legendary'
  price: number
  suggestedPriceMin: number
  suggestedPriceMax: number
  createdAt: Date
  expiresAt: Date
}

export interface GuildMember {
  playerId: string
  playerName: string
  contribution: number
  joinDate: Date
}

export interface Guild {
  id: string
  name: string
  leaderId: string
  members: GuildMember[]
  resortLevel: number
  totalContribution: number
  visitorBonus: number
  revenueBonus: number
}

export interface WeeklyReport {
  weekStart: Date
  weekEnd: Date
  occupancyRate: number[]
  revenueByDay: { date: string; amount: number }[]
  foodRevenueHeatmap: { day: number; hour: number; value: number }[]
  staffSatisfactionTrend: { date: string; value: number }[]
  radarData: {
    service: number
    comfort: number
    food: number
    facilities: number
    value: number
    location: number
  }
}

export const HOTEL_STYLES = {
  classical: {
    name: '古典风格',
    baseComfort: 70,
    priceMultiplier: 1.2,
    buildCost: 50000,
    decor: ['水晶吊灯', '大理石地板', '古董家具', '丝绸窗帘'],
  },
  modern: {
    name: '现代风格',
    baseComfort: 65,
    priceMultiplier: 1.0,
    buildCost: 40000,
    decor: ['智能控制', '极简设计', '落地窗', '艺术装置'],
  },
  tropical: {
    name: '热带风格',
    baseComfort: 75,
    priceMultiplier: 1.3,
    buildCost: 60000,
    decor: ['无边泳池', '热带花园', '露天餐厅', '水上别墅'],
  },
}

export const ROOM_TYPES = {
  standard: {
    name: '标准间',
    basePrice: 500,
    baseComfort: 50,
    capacity: 2,
    size: 35,
  },
  suite: {
    name: '豪华套房',
    basePrice: 1500,
    baseComfort: 80,
    capacity: 2,
    size: 80,
  },
  villa: {
    name: '别墅',
    basePrice: 5000,
    baseComfort: 95,
    capacity: 6,
    size: 250,
  },
}

export const STAFF_POSITIONS = {
  receptionist: {
    name: '前台',
    baseSalary: 5000,
    skills: ['service', 'friendliness', 'professionalism'],
    impactRoom: 0.15,
  },
  chef: {
    name: '厨师',
    baseSalary: 8000,
    skills: ['efficiency', 'service', 'professionalism'],
    impactFood: 0.3,
  },
  cleaner: {
    name: '清洁工',
    baseSalary: 3500,
    skills: ['efficiency', 'service'],
    impactCleanliness: 0.25,
  },
  manager: {
    name: '经理',
    baseSalary: 15000,
    skills: ['professionalism', 'service', 'efficiency', 'friendliness'],
    impactOverall: 0.2,
  },
}

const generateId = (): string => Math.random().toString(36).substring(2, 10)

const createMockRooms = (): Room[] => [
  { id: generateId(), type: 'standard', number: '101', floor: 1, price: 500, comfort: 55, status: 'vacant' },
  { id: generateId(), type: 'standard', number: '102', floor: 1, price: 500, comfort: 52, status: 'occupied', guestId: 'g1' },
  { id: generateId(), type: 'standard', number: '103', floor: 1, price: 550, comfort: 58, status: 'vacant' },
  { id: generateId(), type: 'suite', number: '201', floor: 2, price: 1500, comfort: 82, status: 'occupied', guestId: 'g2' },
  { id: generateId(), type: 'suite', number: '202', floor: 2, price: 1600, comfort: 85, status: 'vacant' },
  { id: generateId(), type: 'villa', number: '301', floor: 3, price: 5000, comfort: 96, status: 'maintenance' },
]

const createMockFacilities = (): Facility[] => [
  { id: generateId(), type: 'pool', level: 2, quality: 80 },
  { id: generateId(), type: 'spa', level: 1, quality: 70 },
  { id: generateId(), type: 'restaurant', level: 3, quality: 85 },
  { id: generateId(), type: 'gym', level: 1, quality: 65 },
  { id: generateId(), type: 'lounge', level: 2, quality: 75 },
]

const createMockSchedule = (): ScheduleItem[] => [
  { day: 0, shift: 'morning' },
  { day: 1, shift: 'morning' },
  { day: 2, shift: 'off' },
  { day: 3, shift: 'afternoon' },
  { day: 4, shift: 'afternoon' },
  { day: 5, shift: 'night' },
  { day: 6, shift: 'off' },
]

const createMockPlayers = (): Player[] => [
  { id: 'p1', name: '张经理', avatar: '👨‍💼', coins: 500000, level: 12, exp: 4500, guildId: 'guild1' },
  { id: 'p2', name: '李老板', avatar: '👩‍💼', coins: 800000, level: 15, exp: 6200 },
  { id: 'p3', name: '王总', avatar: '🧑‍💼', coins: 300000, level: 8, exp: 2800, guildId: 'guild1' },
]

const createMockHotels = (): Hotel[] => [
  {
    id: 'h1',
    playerId: 'p1',
    name: '皇家大酒店',
    style: 'classical',
    rooms: createMockRooms(),
    facilities: createMockFacilities(),
    comfortScore: 82,
    rating: 4.7,
    totalRevenue: 2580000,
  },
  {
    id: 'h2',
    playerId: 'p2',
    name: '云顶现代酒店',
    style: 'modern',
    rooms: createMockRooms(),
    facilities: createMockFacilities(),
    comfortScore: 78,
    rating: 4.5,
    totalRevenue: 3800000,
  },
]

const createMockStaff = (): Staff[] => [
  {
    id: 's1',
    hotelId: 'h1',
    name: '小明',
    avatar: '👨',
    position: 'receptionist',
    skills: { service: 85, efficiency: 78, friendliness: 90, professionalism: 82 },
    satisfaction: 88,
    fatigue: 25,
    salary: 5500,
    level: 3,
    status: 'working',
    schedule: createMockSchedule(),
  },
  {
    id: 's2',
    hotelId: 'h1',
    name: '小红',
    avatar: '👩',
    position: 'chef',
    skills: { service: 75, efficiency: 92, friendliness: 70, professionalism: 88 },
    satisfaction: 82,
    fatigue: 45,
    salary: 9000,
    level: 5,
    status: 'working',
    schedule: createMockSchedule(),
  },
  {
    id: 's3',
    hotelId: 'h1',
    name: '阿强',
    avatar: '🧑',
    position: 'cleaner',
    skills: { service: 70, efficiency: 85, friendliness: 65, professionalism: 72 },
    satisfaction: 75,
    fatigue: 60,
    salary: 3800,
    level: 2,
    status: 'resting',
    schedule: createMockSchedule(),
  },
  {
    id: 's4',
    hotelId: 'h1',
    name: '王经理',
    avatar: '👨‍💼',
    position: 'manager',
    skills: { service: 88, efficiency: 90, friendliness: 85, professionalism: 95 },
    satisfaction: 90,
    fatigue: 30,
    salary: 18000,
    level: 8,
    status: 'working',
    schedule: createMockSchedule(),
  },
]

const createMockGuests = (): Guest[] => [
  { id: 'g1', name: '旅客A', avatar: '🧑‍🤝‍🧑', preferences: ['安静', '早餐'], budget: 800, satisfaction: 85, checkIn: new Date(), roomId: '102' },
  { id: 'g2', name: '商务客B', avatar: '👔', preferences: ['高速WiFi', '会议室'], budget: 2000, satisfaction: 90, checkIn: new Date(), roomId: '201' },
  { id: 'g3', name: '游客C', avatar: '🧳', preferences: ['泳池', 'SPA'], budget: 600, satisfaction: 0, checkIn: undefined },
]

const createMockEvents = (): GameEvent[] => [
  {
    id: 'e1',
    hotelId: 'h1',
    type: 'complaint',
    title: '客人投诉空调故障',
    description: '302房间的客人反映空调无法正常制冷，要求立即处理。',
    options: [
      { id: 'o1', label: '立即派维修人员', cost: 200, effect: { rating: 2, satisfaction: 10 } },
      { id: 'o2', label: '升级到套房并道歉', cost: 800, effect: { rating: 5, satisfaction: 20, coins: -500 } },
      { id: 'o3', label: '暂时不处理', cost: 0, effect: { rating: -5, satisfaction: -15 } },
    ],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
  },
  {
    id: 'e2',
    hotelId: 'h1',
    type: 'vip_arrival',
    title: 'VIP客人即将抵达',
    description: '一位知名企业家预订了总统套房，预计1小时后到达。',
    options: [
      { id: 'o4', label: '准备欢迎礼盒和专属服务', cost: 1500, effect: { rating: 8, coins: 5000 } },
      { id: 'o5', label: '按标准流程接待', cost: 0, effect: { rating: 0 } },
    ],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7200000),
  },
]

const createMockPartyEvents = (): PartyEvent[] => [
  {
    id: 'pe1',
    hotelId: 'h1',
    type: 'wedding_reception',
    name: '陈氏婚礼喜宴',
    budget: 50000,
    attendees: 120,
    maxAttendees: 150,
    revenue: 60000,
    serviceScore: 0,
    preparationProgress: 65,
    status: 'planning',
    startTime: new Date(Date.now() + 86400000),
  },
]

const createMockMarketListings = (): MarketListing[] => [
  {
    id: 'm1',
    sellerId: 'p2',
    sellerName: '李老板',
    itemType: 'blueprint',
    itemName: '古典水晶吊灯蓝图',
    itemRarity: 'rare',
    price: 8000,
    suggestedPriceMin: 7000,
    suggestedPriceMax: 10000,
    createdAt: new Date(Date.now() - 3600000),
    expiresAt: new Date(Date.now() + 86400000 * 3),
  },
  {
    id: 'm2',
    sellerId: 'p3',
    sellerName: '王总',
    itemType: 'ingredient',
    itemName: '顶级松露',
    itemRarity: 'epic',
    price: 3500,
    suggestedPriceMin: 3000,
    suggestedPriceMax: 4500,
    createdAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() + 86400000 * 2),
  },
  {
    id: 'm3',
    sellerId: 'p1',
    sellerName: '张经理',
    itemType: 'ingredient',
    itemName: '新鲜有机蔬菜',
    itemRarity: 'common',
    price: 200,
    suggestedPriceMin: 150,
    suggestedPriceMax: 300,
    createdAt: new Date(Date.now() - 1800000),
    expiresAt: new Date(Date.now() + 86400000),
  },
]

const createMockGuilds = (): Guild[] => [
  {
    id: 'guild1',
    name: '酒店业联盟',
    leaderId: 'p1',
    members: [
      { playerId: 'p1', playerName: '张经理', contribution: 15000, joinDate: new Date(Date.now() - 86400000 * 30) },
      { playerId: 'p3', playerName: '王总', contribution: 8000, joinDate: new Date(Date.now() - 86400000 * 15) },
    ],
    resortLevel: 3,
    totalContribution: 23000,
    visitorBonus: 10,
    revenueBonus: 5,
  },
]

interface DataStore {
  players: Player[]
  hotels: Hotel[]
  staff: Staff[]
  guests: Guest[]
  events: GameEvent[]
  partyEvents: PartyEvent[]
  marketListings: MarketListing[]
  guilds: Guild[]
  priceHistory: { itemName: string; price: number; date: Date }[]
}

const store: DataStore = {
  players: createMockPlayers(),
  hotels: createMockHotels(),
  staff: createMockStaff(),
  guests: createMockGuests(),
  events: createMockEvents(),
  partyEvents: createMockPartyEvents(),
  marketListings: createMockMarketListings(),
  guilds: createMockGuilds(),
  priceHistory: [
    { itemName: '古典水晶吊灯蓝图', price: 7500, date: new Date(Date.now() - 86400000 * 6) },
    { itemName: '古典水晶吊灯蓝图', price: 8200, date: new Date(Date.now() - 86400000 * 5) },
    { itemName: '古典水晶吊灯蓝图', price: 7800, date: new Date(Date.now() - 86400000 * 4) },
    { itemName: '古典水晶吊灯蓝图', price: 9000, date: new Date(Date.now() - 86400000 * 3) },
    { itemName: '古典水晶吊灯蓝图', price: 8500, date: new Date(Date.now() - 86400000 * 2) },
    { itemName: '古典水晶吊灯蓝图', price: 7900, date: new Date(Date.now() - 86400000 * 1) },
    { itemName: '顶级松露', price: 3200, date: new Date(Date.now() - 86400000 * 6) },
    { itemName: '顶级松露', price: 3400, date: new Date(Date.now() - 86400000 * 5) },
    { itemName: '顶级松露', price: 3600, date: new Date(Date.now() - 86400000 * 4) },
    { itemName: '顶级松露', price: 3300, date: new Date(Date.now() - 86400000 * 3) },
    { itemName: '顶级松露', price: 3500, date: new Date(Date.now() - 86400000 * 2) },
    { itemName: '顶级松露', price: 3700, date: new Date(Date.now() - 86400000 * 1) },
  ],
}

export const getPlayerById = (id: string): Player | undefined => store.players.find(p => p.id === id)

export const updatePlayer = (id: string, updates: Partial<Player>): Player | undefined => {
  const index = store.players.findIndex(p => p.id === id)
  if (index !== -1) {
    store.players[index] = { ...store.players[index], ...updates }
    return store.players[index]
  }
  return undefined
}

export const getAllPlayers = (): Player[] => store.players

export const getPlayersSortedByRevenue = (): Player[] => {
  return [...store.players].sort((a, b) => {
    const hotelA = getHotelByPlayerId(a.id)
    const hotelB = getHotelByPlayerId(b.id)
    return (hotelB?.totalRevenue || 0) - (hotelA?.totalRevenue || 0)
  })
}

export const getPlayersSortedByLevel = (): Player[] => {
  return [...store.players].sort((a, b) => b.level - a.level)
}

export const addPlayer = (player: Partial<Player>): Player => {
  const newPlayer: Player = {
    id: player.id || generateId(),
    name: player.name || '新玩家',
    avatar: player.avatar || '👤',
    coins: player.coins ?? 0,
    level: player.level ?? 1,
    exp: player.exp ?? 0,
    guildId: player.guildId,
  }
  store.players.push(newPlayer)
  return newPlayer
}

export const getHotelByPlayerId = (playerId: string): Hotel | undefined => store.hotels.find(h => h.playerId === playerId)

export const getHotelById = (id: string): Hotel | undefined => store.hotels.find(h => h.id === id)

export const getAllHotels = (): Hotel[] => store.hotels

export const getHotelsSortedByRooms = (): Hotel[] => {
  return [...store.hotels].sort((a, b) => b.rooms.length - a.rooms.length)
}

export const createHotel = (playerId: string, name: string, style: 'classical' | 'modern' | 'tropical'): Hotel => {
  const styleConfig = HOTEL_STYLES[style]
  const newHotel: Hotel = {
    id: generateId(),
    playerId,
    name,
    style,
    rooms: [],
    facilities: [],
    comfortScore: styleConfig.baseComfort,
    rating: 0,
    totalRevenue: 0,
  }
  store.hotels.push(newHotel)
  return newHotel
}

export const updateHotel = (hotelId: string, updates: Partial<Hotel>): Hotel | undefined => {
  const index = store.hotels.findIndex(h => h.id === hotelId)
  if (index !== -1) {
    store.hotels[index] = { ...store.hotels[index], ...updates }
    return store.hotels[index]
  }
  return undefined
}

export const addRoom = (hotelId: string, roomData: { type: string; floor: number; number: string }): Hotel | undefined => {
  const hotel = getHotelById(hotelId)
  if (hotel) {
    const roomTypeConfig = ROOM_TYPES[roomData.type as keyof typeof ROOM_TYPES]
    const newRoom: Room = {
      id: generateId(),
      type: roomData.type as Room['type'],
      number: roomData.number,
      floor: roomData.floor,
      price: roomTypeConfig?.basePrice || 500,
      comfort: roomTypeConfig?.baseComfort || 50,
      status: 'vacant',
    }
    hotel.rooms.push(newRoom)
    return hotel
  }
  return undefined
}

export const updateRoom = (hotelId: string, roomId: string, updates: Partial<Room>): Room | undefined => {
  const hotel = getHotelById(hotelId)
  if (hotel) {
    const index = hotel.rooms.findIndex(r => r.id === roomId)
    if (index !== -1) {
      hotel.rooms[index] = { ...hotel.rooms[index], ...updates }
      return hotel.rooms[index]
    }
  }
  return undefined
}

export const addFacility = (hotelId: string, type: string): Hotel | undefined => {
  const hotel = getHotelById(hotelId)
  if (hotel) {
    const newFacility: Facility = {
      id: generateId(),
      type: type as Facility['type'],
      level: 1,
      quality: 50,
    }
    hotel.facilities.push(newFacility)
    return hotel
  }
  return undefined
}

export const updateFacility = (hotelId: string, facilityId: string, updates: Partial<Facility>): Facility | undefined => {
  const hotel = getHotelById(hotelId)
  if (hotel) {
    const index = hotel.facilities.findIndex(f => f.id === facilityId)
    if (index !== -1) {
      hotel.facilities[index] = { ...hotel.facilities[index], ...updates }
      return hotel.facilities[index]
    }
  }
  return undefined
}

export const getStaffByHotelId = (hotelId: string): Staff[] => store.staff.filter(s => s.hotelId === hotelId)

export const getStaffById = (id: string): Staff | undefined => store.staff.find(s => s.id === id)

export const addStaff = (staffData: Partial<Staff>): Staff => {
  const newStaff: Staff = {
    id: staffData.id || generateId(),
    hotelId: staffData.hotelId || '',
    name: staffData.name || '新员工',
    avatar: staffData.avatar || '👤',
    position: staffData.position || 'receptionist',
    skills: staffData.skills || { service: 50, efficiency: 50, friendliness: 50, professionalism: 50 },
    satisfaction: staffData.satisfaction ?? 70,
    fatigue: staffData.fatigue ?? 0,
    salary: staffData.salary ?? 5000,
    level: staffData.level ?? 1,
    status: staffData.status || 'working',
    schedule: staffData.schedule || [],
  }
  store.staff.push(newStaff)
  return newStaff
}

export const updateStaff = (staffId: string, updates: Partial<Staff>): Staff | undefined => {
  const index = store.staff.findIndex(s => s.id === staffId)
  if (index !== -1) {
    store.staff[index] = { ...store.staff[index], ...updates }
    return store.staff[index]
  }
  return undefined
}

export const deleteStaff = (staffId: string): boolean => {
  const index = store.staff.findIndex(s => s.id === staffId)
  if (index !== -1) {
    store.staff.splice(index, 1)
    return true
  }
  return false
}

export const getGuestsByHotelId = (hotelId: string): Guest[] => {
  const hotel = getHotelById(hotelId)
  if (!hotel) return []
  const roomGuestIds = hotel.rooms.filter(r => r.guestId).map(r => r.guestId)
  const checkedInGuests = store.guests.filter(g => roomGuestIds.includes(g.id))
  const waitingGuests = store.guests.filter(g => !g.roomId)
  return [...checkedInGuests, ...waitingGuests]
}

export const getAllGuests = (): Guest[] => store.guests

export const getGuestById = (id: string): Guest | undefined => store.guests.find(g => g.id === id)

export const addGuest = (guestData: Partial<Guest>): Guest => {
  const newGuest: Guest = {
    id: guestData.id || generateId(),
    name: guestData.name || '新客人',
    avatar: guestData.avatar || '🧑',
    preferences: guestData.preferences || [],
    budget: guestData.budget ?? 1000,
    satisfaction: guestData.satisfaction ?? 50,
    checkIn: guestData.checkIn,
    checkOut: guestData.checkOut,
    roomId: guestData.roomId,
  }
  store.guests.push(newGuest)
  return newGuest
}

export const updateGuest = (guestId: string, updates: Partial<Guest>): Guest | undefined => {
  const index = store.guests.findIndex(g => g.id === guestId)
  if (index !== -1) {
    store.guests[index] = { ...store.guests[index], ...updates }
    return store.guests[index]
  }
  return undefined
}

export const deleteGuest = (guestId: string): boolean => {
  const index = store.guests.findIndex(g => g.id === guestId)
  if (index !== -1) {
    store.guests.splice(index, 1)
    return true
  }
  return false
}

export const getEventsByHotelId = (hotelId: string): GameEvent[] =>
  store.events.filter(e => e.hotelId === hotelId && !e.resolved)

export const getEventById = (id: string): GameEvent | undefined => store.events.find(e => e.id === id)

export const addEvent = (eventData: Partial<GameEvent>): GameEvent => {
  const newEvent: GameEvent = {
    id: eventData.id || generateId(),
    hotelId: eventData.hotelId || '',
    type: eventData.type || 'complaint',
    title: eventData.title || '新事件',
    description: eventData.description || '',
    options: eventData.options || [],
    createdAt: eventData.createdAt || new Date(),
    expiresAt: eventData.expiresAt || new Date(Date.now() + 3600000),
    resolved: eventData.resolved,
  }
  store.events.push(newEvent)
  return newEvent
}

export const updateEvent = (eventId: string, updates: Partial<GameEvent>): GameEvent | undefined => {
  const index = store.events.findIndex(e => e.id === eventId)
  if (index !== -1) {
    store.events[index] = { ...store.events[index], ...updates }
    return store.events[index]
  }
  return undefined
}

export const getPartyEventsByHotelId = (hotelId: string): PartyEvent[] =>
  store.partyEvents.filter(p => p.hotelId === hotelId)

export const getPartyEventById = (id: string): PartyEvent | undefined =>
  store.partyEvents.find(p => p.id === id)

export const addPartyEvent = (partyData: Partial<PartyEvent>): PartyEvent => {
  const newPartyEvent: PartyEvent = {
    id: partyData.id || generateId(),
    hotelId: partyData.hotelId || '',
    type: partyData.type || 'party',
    name: partyData.name || '新活动',
    budget: partyData.budget ?? 0,
    attendees: partyData.attendees ?? 0,
    maxAttendees: partyData.maxAttendees ?? 100,
    revenue: partyData.revenue ?? 0,
    serviceScore: partyData.serviceScore ?? 0,
    preparationProgress: partyData.preparationProgress ?? 0,
    status: partyData.status || 'planning',
    startTime: partyData.startTime || new Date(),
  }
  store.partyEvents.push(newPartyEvent)
  return newPartyEvent
}

export const updatePartyEvent = (partyId: string, updates: Partial<PartyEvent>): PartyEvent | undefined => {
  const index = store.partyEvents.findIndex(p => p.id === partyId)
  if (index !== -1) {
    store.partyEvents[index] = { ...store.partyEvents[index], ...updates }
    return store.partyEvents[index]
  }
  return undefined
}

export const getAllMarketListings = (): MarketListing[] => store.marketListings

export const getMarketListingById = (id: string): MarketListing | undefined =>
  store.marketListings.find(m => m.id === id)

export const addMarketListing = (listing: Partial<MarketListing>): MarketListing => {
  const newListing: MarketListing = {
    id: listing.id || generateId(),
    sellerId: listing.sellerId || '',
    sellerName: listing.sellerName || '',
    itemType: listing.itemType || 'blueprint',
    itemName: listing.itemName || '',
    itemRarity: listing.itemRarity || 'common',
    price: listing.price ?? 0,
    suggestedPriceMin: listing.suggestedPriceMin ?? 0,
    suggestedPriceMax: listing.suggestedPriceMax ?? 0,
    createdAt: listing.createdAt || new Date(),
    expiresAt: listing.expiresAt || new Date(Date.now() + 86400000),
  }
  store.marketListings.push(newListing)
  return newListing
}

export const deleteMarketListing = (id: string): boolean => {
  const index = store.marketListings.findIndex(m => m.id === id)
  if (index !== -1) {
    store.marketListings.splice(index, 1)
    return true
  }
  return false
}

export const getPriceHistory = (itemName: string, itemRarity: string): { date: string; price: number }[] => {
  return store.priceHistory
    .filter(p => p.itemName === itemName)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(p => ({ date: p.date.toISOString(), price: p.price }))
}

export const addPriceHistory = (itemName: string, itemRarity: string, price: number): void => {
  store.priceHistory.push({ itemName, price, date: new Date() })
}

export const getAllGuilds = (): Guild[] => store.guilds

export const getGuildById = (id: string): Guild | undefined => store.guilds.find(g => g.id === id)

export const getGuildByPlayerId = (playerId: string): Guild | undefined =>
  store.guilds.find(g => g.members.some(m => m.playerId === playerId))

export const addGuild = (guildData: Partial<Guild>): Guild => {
  const newGuild: Guild = {
    id: guildData.id || generateId(),
    name: guildData.name || '新公会',
    leaderId: guildData.leaderId || '',
    members: guildData.members || [],
    resortLevel: guildData.resortLevel ?? 1,
    totalContribution: guildData.totalContribution ?? 0,
    visitorBonus: guildData.visitorBonus ?? 0,
    revenueBonus: guildData.revenueBonus ?? 0,
  }
  store.guilds.push(newGuild)
  return newGuild
}

export const updateGuild = (guildId: string, updates: Partial<Guild>): Guild | undefined => {
  const index = store.guilds.findIndex(g => g.id === guildId)
  if (index !== -1) {
    store.guilds[index] = { ...store.guilds[index], ...updates }
    return store.guilds[index]
  }
  return undefined
}

export const getGuestById = (id: string): Guest | undefined => store.guests.find(g => g.id === id)

export const removeStaff = deleteStaff
export const removeMarketListing = deleteMarketListing
export const addPriceRecord = (itemName: string, price: number): void => addPriceHistory(itemName, '', price)
export const getMarketListings = getAllMarketListings

export const createDefaultHotel = (playerId: string): Hotel => {
  const newHotel: Hotel = {
    id: generateId(),
    playerId,
    name: '我的酒店',
    style: 'modern',
    rooms: [
      { id: generateId(), type: 'standard', number: '101', floor: 1, price: 500, comfort: 55, status: 'vacant' },
      { id: generateId(), type: 'standard', number: '102', floor: 1, price: 500, comfort: 55, status: 'vacant' },
      { id: generateId(), type: 'standard', number: '103', floor: 1, price: 550, comfort: 58, status: 'vacant' },
    ],
    facilities: [
      { id: generateId(), type: 'restaurant', level: 1, quality: 70 },
    ],
    comfortScore: 60,
    rating: 3.5,
    totalRevenue: 0,
  }
  store.hotels.push(newHotel)
  return newHotel
}

export { store }
