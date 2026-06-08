import type {
  HotelStyle,
  RoomType,
  StaffPosition,
  EventType,
  EventOption,
} from './types';

export interface HotelStyleConfig {
  name: string;
  baseComfort: number;
  priceMultiplier: number;
  buildCost: number;
  decor: string[];
  description: string;
  color: string;
  icon: string;
}

export interface RoomTypeConfig {
  name: string;
  basePrice: number;
  baseComfort: number;
  capacity: number;
  size: number;
  description: string;
  upgradeCost: number;
  dailyMaintenance: number;
}

export interface StaffPositionConfig {
  name: string;
  baseSalary: number;
  skills: string[];
  description: string;
  impactDescription: string;
  impactRoom?: number;
  impactFood?: number;
  impactCleanliness?: number;
  impactOverall?: number;
  maxStaffPerHotel: number;
}

export interface EventTemplate {
  id: string;
  type: EventType;
  title: string;
  description: string;
  durationMinutes: number;
  options: EventOption[];
  weight: number;
  minHotelLevel: number;
}

export const HOTEL_STYLES: Record<HotelStyle, HotelStyleConfig> = {
  classical: {
    name: '古典风格',
    baseComfort: 70,
    priceMultiplier: 1.2,
    buildCost: 50000,
    decor: ['水晶吊灯', '大理石地板', '古董家具', '丝绸窗帘', '金色装饰线条', '羊毛地毯', '复古壁画', '铜制门把手'],
    description: '典雅高贵的古典风格，适合追求品质与格调的高端客人。',
    color: '#C9A962',
    icon: 'castle',
  },
  modern: {
    name: '现代风格',
    baseComfort: 65,
    priceMultiplier: 1.0,
    buildCost: 40000,
    decor: ['智能控制', '极简设计', '落地窗', '艺术装置', 'LED氛围灯', '模块化家具', '大理石台面', '隐藏式收纳'],
    description: '简约时尚的现代风格，科技感十足，深受商务旅客喜爱。',
    color: '#4A90D9',
    icon: 'building',
  },
  tropical: {
    name: '热带风格',
    baseComfort: 75,
    priceMultiplier: 1.3,
    buildCost: 60000,
    decor: ['无边泳池', '热带花园', '露天餐厅', '水上别墅', '竹编家具', '椰子树装饰', '海景露台', '吊床休闲区'],
    description: '充满异域风情的热带度假风格，打造梦幻海岛体验。',
    color: '#2ECC71',
    icon: 'palm-tree',
  },
};

export const ROOM_TYPES: Record<RoomType, RoomTypeConfig> = {
  standard: {
    name: '标准间',
    basePrice: 500,
    baseComfort: 50,
    capacity: 2,
    size: 35,
    description: '温馨舒适的基础房型，配备基本设施，适合短期入住。',
    upgradeCost: 15000,
    dailyMaintenance: 50,
  },
  suite: {
    name: '豪华套房',
    basePrice: 1500,
    baseComfort: 80,
    capacity: 2,
    size: 80,
    description: '宽敞明亮的豪华套房，独立客厅与卧室，尊享私密空间。',
    upgradeCost: 50000,
    dailyMaintenance: 200,
  },
  villa: {
    name: '别墅',
    basePrice: 5000,
    baseComfort: 95,
    capacity: 6,
    size: 250,
    description: '顶级奢华独栋别墅，私人泳池与花园，至尊享受。',
    upgradeCost: 200000,
    dailyMaintenance: 800,
  },
};

export const STAFF_POSITIONS: Record<StaffPosition, StaffPositionConfig> = {
  receptionist: {
    name: '前台',
    baseSalary: 5000,
    skills: ['service', 'friendliness', 'professionalism'],
    description: '酒店门面，负责客人入住登记与咨询服务。',
    impactDescription: '提升客人入住体验与满意度',
    impactRoom: 0.15,
    maxStaffPerHotel: 6,
  },
  chef: {
    name: '厨师',
    baseSalary: 8000,
    skills: ['efficiency', 'service', 'professionalism'],
    description: '餐饮核心，负责菜品制作与厨房管理。',
    impactDescription: '提升餐饮品质与收入',
    impactFood: 0.3,
    maxStaffPerHotel: 4,
  },
  cleaner: {
    name: '清洁工',
    baseSalary: 3500,
    skills: ['efficiency', 'service'],
    description: '卫生保障，负责客房清洁与公共区域维护。',
    impactDescription: '提升客房整洁度与舒适度',
    impactCleanliness: 0.25,
    maxStaffPerHotel: 10,
  },
  manager: {
    name: '经理',
    baseSalary: 15000,
    skills: ['professionalism', 'service', 'efficiency', 'friendliness'],
    description: '运营管理，负责酒店整体运营与员工协调。',
    impactDescription: '全面提升酒店各项指标',
    impactOverall: 0.2,
    maxStaffPerHotel: 2,
  },
};

export const GUEST_PREFERENCES = [
  '安静环境',
  '高层房间',
  '海景房',
  '山景房',
  '大床',
  '双床',
  '无烟房',
  '连通房',
  '浴缸',
  '淋浴',
  '免费WiFi',
  '迷你吧',
  '保险箱',
  '熨斗',
  '冰箱',
  '咖啡机',
  '健身房',
  '游泳池',
  'SPA服务',
  '早餐',
  '24小时客房服务',
  '接机服务',
  '儿童设施',
  '宠物友好',
  '商务中心',
  '会议室',
  '礼宾服务',
  '代客泊车',
  '行李寄存',
  '货币兑换',
] as const;

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'complaint_noisy_neighbor',
    type: 'complaint',
    title: '噪音投诉',
    description: '302房间的客人投诉隔壁房间噪音过大，严重影响休息。',
    durationMinutes: 30,
    weight: 15,
    minHotelLevel: 1,
    options: [
      {
        id: 'opt_1',
        label: '亲自道歉并升级房型',
        cost: 2000,
        effect: { rating: 2, satisfaction: 15, coins: -2000 },
      },
      {
        id: 'opt_2',
        label: '警告噪音客人',
        effect: { rating: 0, satisfaction: 5 },
      },
      {
        id: 'opt_3',
        label: '提供免费餐饮补偿',
        cost: 500,
        effect: { rating: 1, satisfaction: 8, coins: -500 },
      },
    ],
  },
  {
    id: 'complaint_dirty_room',
    type: 'complaint',
    title: '房间卫生投诉',
    description: '新入住的客人发现房间角落有灰尘，浴室水龙头有水渍。',
    durationMinutes: 25,
    weight: 12,
    minHotelLevel: 1,
    options: [
      {
        id: 'opt_1',
        label: '立即重新打扫并赠送水果篮',
        cost: 300,
        effect: { rating: 1, satisfaction: 10, coins: -300 },
      },
      {
        id: 'opt_2',
        label: '更换到同等级干净房间',
        effect: { rating: 0, satisfaction: 7 },
      },
      {
        id: 'opt_3',
        label: '道歉并提供下次入住折扣',
        cost: 0,
        effect: { rating: -1, satisfaction: 3 },
      },
    ],
  },
  {
    id: 'malfunction_ac',
    type: 'malfunction',
    title: '空调故障',
    description: '5楼多个房间的空调突然停止制冷，客人们开始抱怨。',
    durationMinutes: 60,
    weight: 8,
    minHotelLevel: 2,
    options: [
      {
        id: 'opt_1',
        label: '紧急维修（专业团队）',
        cost: 5000,
        effect: { rating: 1, satisfaction: 12, coins: -5000 },
      },
      {
        id: 'opt_2',
        label: '转移客人到其他楼层',
        cost: 0,
        effect: { rating: -1, satisfaction: 4 },
      },
      {
        id: 'opt_3',
        label: '提供临时风扇和冰饮',
        cost: 500,
        effect: { rating: -2, satisfaction: -3, coins: -500 },
      },
    ],
  },
  {
    id: 'malfunction_elevator',
    type: 'malfunction',
    title: '电梯故障',
    description: '一部电梯发生故障停运，高峰期客人需要长时间等待。',
    durationMinutes: 90,
    weight: 6,
    minHotelLevel: 3,
    options: [
      {
        id: 'opt_1',
        label: '紧急维修并安排专人引导',
        cost: 8000,
        effect: { rating: 0, satisfaction: 6, coins: -8000 },
      },
      {
        id: 'opt_2',
        label: '仅进行维修',
        cost: 5000,
        effect: { rating: -2, satisfaction: -5, coins: -5000 },
      },
    ],
  },
  {
    id: 'wedding_small',
    type: 'wedding',
    title: '小型婚礼咨询',
    description: '一对新人希望在酒店举办小型婚礼，预计50位宾客。',
    durationMinutes: 120,
    weight: 5,
    minHotelLevel: 2,
    options: [
      {
        id: 'opt_1',
        label: '豪华套餐（含晚宴+布置）',
        effect: { rating: 3, satisfaction: 20, coins: 50000 },
      },
      {
        id: 'opt_2',
        label: '标准套餐（仅场地+基础布置）',
        effect: { rating: 1, satisfaction: 10, coins: 20000 },
      },
      {
        id: 'opt_3',
        label: '婉拒（档期已满）',
        effect: { rating: -1, satisfaction: 0 },
      },
    ],
  },
  {
    id: 'wedding_luxury',
    type: 'wedding',
    title: '豪华婚礼订单',
    description: '富商希望在酒店举办一场盛大婚礼，200位宾客，预算充足。',
    durationMinutes: 180,
    weight: 3,
    minHotelLevel: 4,
    options: [
      {
        id: 'opt_1',
        label: '至尊婚礼套餐（全包）',
        effect: { rating: 5, satisfaction: 30, coins: 200000 },
      },
      {
        id: 'opt_2',
        label: '高级定制套餐',
        effect: { rating: 3, satisfaction: 20, coins: 120000 },
      },
    ],
  },
  {
    id: 'vip_arrival_celebrity',
    type: 'vip_arrival',
    title: '知名影星入住',
    description: '一位知名影星将秘密入住酒店，需要绝对的隐私保护和顶级服务。',
    durationMinutes: 60,
    weight: 4,
    minHotelLevel: 3,
    options: [
      {
        id: 'opt_1',
        label: '总统套房+专属服务团队',
        cost: 3000,
        effect: { rating: 5, satisfaction: 25, coins: 15000 },
      },
      {
        id: 'opt_2',
        label: '豪华套房+隐私保护',
        cost: 1000,
        effect: { rating: 2, satisfaction: 15, coins: 5000 },
      },
    ],
  },
  {
    id: 'vip_arrival_ceo',
    type: 'vip_arrival',
    title: '跨国公司CEO入住',
    description: '一家世界500强公司的CEO将入住，并可能预订长期商务合作。',
    durationMinutes: 45,
    weight: 5,
    minHotelLevel: 4,
    options: [
      {
        id: 'opt_1',
        label: '总经理亲自接待+总统套房',
        cost: 5000,
        effect: { rating: 4, satisfaction: 20, coins: 30000 },
      },
      {
        id: 'opt_2',
        label: 'VIP标准接待流程',
        effect: { rating: 2, satisfaction: 12, coins: 10000 },
      },
    ],
  },
  {
    id: 'complaint_food',
    type: 'complaint',
    title: '餐饮投诉',
    description: '客人投诉餐厅上菜太慢，而且菜品温度不够。',
    durationMinutes: 30,
    weight: 10,
    minHotelLevel: 1,
    options: [
      {
        id: 'opt_1',
        label: '免单+重新制作',
        cost: 800,
        effect: { rating: 1, satisfaction: 12, coins: -800 },
      },
      {
        id: 'opt_2',
        label: '五折优惠',
        cost: 400,
        effect: { rating: 0, satisfaction: 7, coins: -400 },
      },
      {
        id: 'opt_3',
        label: '仅口头道歉',
        effect: { rating: -2, satisfaction: -5 },
      },
    ],
  },
  {
    id: 'malfunction_water',
    type: 'malfunction',
    title: '热水供应故障',
    description: '酒店热水系统出现问题，多个楼层暂时没有热水。',
    durationMinutes: 75,
    weight: 7,
    minHotelLevel: 2,
    options: [
      {
        id: 'opt_1',
        label: '紧急维修+提供瓶装水补偿',
        cost: 6000,
        effect: { rating: 0, satisfaction: 8, coins: -6000 },
      },
      {
        id: 'opt_2',
        label: '仅紧急维修',
        cost: 4000,
        effect: { rating: -1, satisfaction: 2, coins: -4000 },
      },
    ],
  },
];

export const FACILITY_CONFIG = {
  pool: {
    name: '游泳池',
    baseCost: 80000,
    upgradeCostMultiplier: 1.5,
    maxLevel: 5,
    comfortPerLevel: 8,
    description: '室内外泳池设施，提升客人体验。',
  },
  spa: {
    name: 'SPA中心',
    baseCost: 120000,
    upgradeCostMultiplier: 1.6,
    maxLevel: 5,
    comfortPerLevel: 12,
    description: '专业水疗与按摩服务，高端客人必备。',
  },
  restaurant: {
    name: '餐厅',
    baseCost: 100000,
    upgradeCostMultiplier: 1.4,
    maxLevel: 5,
    comfortPerLevel: 10,
    description: '精致餐饮服务，重要的收入来源。',
  },
  gym: {
    name: '健身房',
    baseCost: 50000,
    upgradeCostMultiplier: 1.3,
    maxLevel: 5,
    comfortPerLevel: 5,
    description: '现代化健身设施，商务客人标配。',
  },
  lounge: {
    name: '酒廊',
    baseCost: 60000,
    upgradeCostMultiplier: 1.4,
    maxLevel: 5,
    comfortPerLevel: 7,
    description: '行政酒廊与休闲酒吧，提升酒店档次。',
  },
};

export const GAME_BALANCE = {
  BASE_DAILY_GUEST_ARRIVAL: 5,
  RATING_GUEST_BONUS_PER_POINT: 0.5,
  COMFORT_SCORE_PRICE_BONUS: 0.01,
  EMPLOYEE_FATIGUE_PER_SHIFT: 10,
  EMPLOYEE_SATISFACTION_DECAY: 0.5,
  MIN_STAFF_FOR_OPERATION: {
    receptionist: 1,
    cleaner: 1,
  },
  EXP_PER_LEVEL: 1000,
  LEVEL_EXP_MULTIPLIER: 1.2,
  MAX_RATING: 5,
  MIN_RATING: 1,
  INITIAL_COINS: 100000,
  COIN_TO_EXP_RATIO: 0.1,
};

export const RARITY_CONFIG = {
  common: {
    name: '普通',
    color: '#95A5A6',
    priceMultiplier: 1,
    dropRate: 0.6,
  },
  rare: {
    name: '稀有',
    color: '#3498DB',
    priceMultiplier: 2.5,
    dropRate: 0.25,
  },
  epic: {
    name: '史诗',
    color: '#9B59B6',
    priceMultiplier: 6,
    dropRate: 0.12,
  },
  legendary: {
    name: '传说',
    color: '#F1C40F',
    priceMultiplier: 15,
    dropRate: 0.03,
  },
};

export const BLUEPRINT_ITEMS = [
  { id: 'bp_classical_lobby', name: '古典大堂蓝图', rarity: 'rare' as const },
  { id: 'bp_modern_rooftop', name: '现代屋顶酒吧蓝图', rarity: 'epic' as const },
  { id: 'bp_tropical_villa', name: '热带别墅蓝图', rarity: 'epic' as const },
  { id: 'bp_presidential_suite', name: '总统套房蓝图', rarity: 'legendary' as const },
  { id: 'bp_infinity_pool', name: '无边泳池蓝图', rarity: 'rare' as const },
  { id: 'bp_spa_retreat', name: 'SPA水疗中心蓝图', rarity: 'rare' as const },
  { id: 'bp_michelin_kitchen', name: '米其林级厨房蓝图', rarity: 'legendary' as const },
  { id: 'bp_basic_room', name: '标准客房蓝图', rarity: 'common' as const },
];

export const INGREDIENT_ITEMS = [
  { id: 'ing_black_tea', name: '锡兰红茶', rarity: 'common' as const },
  { id: 'ing_coffee_beans', name: '牙买加蓝山咖啡豆', rarity: 'rare' as const },
  { id: 'ing_caviar', name: '里海鱼子酱', rarity: 'epic' as const },
  { id: 'ing_foie_gras', name: '法式鹅肝', rarity: 'rare' as const },
  { id: 'ing_truffle', name: '意大利黑松露', rarity: 'epic' as const },
  { id: 'ing_wagyu', name: '神户和牛', rarity: 'epic' as const },
  { id: 'ing_champagne', name: '唐培里侬香槟', rarity: 'rare' as const },
  { id: 'ing_saffron', name: '西班牙藏红花', rarity: 'legendary' as const },
  { id: 'ing_white_gardenia', name: '白栀子花精油', rarity: 'legendary' as const },
  { id: 'ing_sea_salt', name: '法国海盐', rarity: 'common' as const },
];

export const GUILD_CONFIG = {
  MAX_MEMBERS: 30,
  MIN_MEMBERS_FOR_BONUS: 5,
  CREATE_COST: 50000,
  LEVEL_UP_BASE_CONTRIBUTION: 100000,
  CONTRIBUTION_MULTIPLIER: 1.5,
  VISITOR_BONUS_PER_LEVEL: 0.02,
  REVENUE_BONUS_PER_LEVEL: 0.015,
  MAX_LEVEL: 10,
  DAILY_CONTRIBUTION_LIMIT: 50000,
};

export const GAME_CONSTANTS = {
  MAX_FATIGUE: 100,
  MIN_SATISFACTION: 0,
  MAX_SATISFACTION: 100,
  MAX_COMFORT_SCORE: 100,
  MIN_RATING: GAME_BALANCE.MIN_RATING,
  MAX_RATING: GAME_BALANCE.MAX_RATING,
  EXP_PER_LEVEL: GAME_BALANCE.EXP_PER_LEVEL,
  EVENT_EXPIRY_HOURS: 24,
  MARKET_LISTING_EXPIRY_DAYS: 7,
} as const;

export const FACILITY_TYPES = FACILITY_CONFIG;
