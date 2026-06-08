export type HotelStyle = 'classical' | 'modern' | 'tropical';

export type RoomType = 'standard' | 'suite' | 'villa';

export type RoomStatus = 'vacant' | 'occupied' | 'maintenance';

export type FacilityType = 'pool' | 'spa' | 'restaurant' | 'gym' | 'lounge';

export type StaffPosition = 'receptionist' | 'chef' | 'cleaner' | 'manager';

export type StaffStatus = 'working' | 'resting' | 'off';

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'off';

export type EventType = 'complaint' | 'malfunction' | 'wedding' | 'vip_arrival';

export type PartyEventType = 'party' | 'banquet' | 'wedding_reception';

export type PartyEventStatus = 'planning' | 'ongoing' | 'completed';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ItemType = 'blueprint' | 'ingredient';

export interface StaffSkills {
  service: number;
  efficiency: number;
  friendliness: number;
  professionalism: number;
}

export interface ScheduleItem {
  day: number;
  shift: ShiftType;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  level: number;
  exp: number;
  guildId?: string;
}

export interface Facility {
  id: string;
  type: FacilityType;
  level: number;
  quality: number;
}

export interface Room {
  id: string;
  type: RoomType;
  number: string;
  floor: number;
  price: number;
  comfort: number;
  status: RoomStatus;
  guestId?: string;
}

export interface Hotel {
  id: string;
  playerId: string;
  name: string;
  style: HotelStyle;
  rooms: Room[];
  facilities: Facility[];
  comfortScore: number;
  rating: number;
  totalRevenue: number;
}

export interface Staff {
  id: string;
  hotelId: string;
  name: string;
  avatar: string;
  position: StaffPosition;
  skills: StaffSkills;
  satisfaction: number;
  fatigue: number;
  salary: number;
  level: number;
  status: StaffStatus;
  schedule: ScheduleItem[];
}

export interface Guest {
  id: string;
  name: string;
  avatar: string;
  preferences: string[];
  budget: number;
  satisfaction: number;
  checkIn?: Date;
  checkOut?: Date;
  roomId?: string;
}

export interface EventEffect {
  rating?: number;
  satisfaction?: number;
  coins?: number;
}

export interface EventOption {
  id: string;
  label: string;
  cost?: number;
  effect: EventEffect;
}

export interface GameEvent {
  id: string;
  hotelId: string;
  type: EventType;
  title: string;
  description: string;
  options: EventOption[];
  createdAt: Date;
  expiresAt: Date;
  resolved?: boolean;
}

export interface PartyEvent {
  id: string;
  hotelId: string;
  type: PartyEventType;
  name: string;
  budget: number;
  attendees: number;
  maxAttendees: number;
  revenue: number;
  serviceScore: number;
  preparationProgress: number;
  status: PartyEventStatus;
  startTime: Date;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  itemType: ItemType;
  itemName: string;
  itemRarity: ItemRarity;
  price: number;
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface GuildMember {
  playerId: string;
  playerName: string;
  contribution: number;
  joinDate: Date;
}

export interface Guild {
  id: string;
  name: string;
  leaderId: string;
  members: GuildMember[];
  resortLevel: number;
  totalContribution: number;
  visitorBonus: number;
  revenueBonus: number;
}

export interface RevenueByDay {
  date: string;
  amount: number;
}

export interface FoodRevenueHeatmap {
  day: number;
  hour: number;
  value: number;
}

export interface StaffSatisfactionTrend {
  date: string;
  value: number;
}

export interface RadarData {
  service: number;
  comfort: number;
  food: number;
  facilities: number;
  value: number;
  location: number;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  occupancyRate: number[];
  revenueByDay: RevenueByDay[];
  foodRevenueHeatmap: FoodRevenueHeatmap[];
  staffSatisfactionTrend: StaffSatisfactionTrend[];
  radarData: RadarData;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  hotelName: string;
  rating: number;
  totalRevenue: number;
  roomCount: number;
  rank: number;
}

export interface Leaderboard {
  byRating: LeaderboardEntry[];
  byRevenue: LeaderboardEntry[];
  byRooms: LeaderboardEntry[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type PartyType = PartyEventType;
