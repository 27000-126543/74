import { useMemo } from 'react';
import type { Hotel, Room, Staff, Facility, Guest, RoomType } from 'shared/types';
import { HOTEL_STYLES, ROOM_TYPES, STAFF_POSITIONS, GAME_CONSTANTS, FACILITY_TYPES } from 'shared/config';

export function useGameEngine() {
  const calculateRoomComfort = (room: Room, hotelStyle: Hotel['style']): number => {
    const styleConfig = HOTEL_STYLES[hotelStyle];
    const roomConfig = ROOM_TYPES[room.type];
    let comfort = (styleConfig.baseComfort + roomConfig.baseComfort) / 2;
    comfort = Math.min(comfort + room.comfort * 0.5, GAME_CONSTANTS.MAX_COMFORT_SCORE);
    return Math.round(comfort * 10) / 10;
  };

  const calculateHotelComfort = (hotel: Hotel, staffs: Staff[]): number => {
    if (hotel.rooms.length === 0) return 0;

    const styleConfig = HOTEL_STYLES[hotel.style];
    let totalComfort = styleConfig.baseComfort;

    const avgRoomComfort =
      hotel.rooms.reduce((sum, room) => sum + calculateRoomComfort(room, hotel.style), 0) /
      hotel.rooms.length;
    totalComfort += avgRoomComfort * 0.4;

    const facilityBonus = hotel.facilities.reduce((sum, facility) => {
      const facilityConfig = FACILITY_TYPES[facility.type as keyof typeof FACILITY_TYPES];
      if (!facilityConfig) return sum;
      const levelBonus = facility.level * (facilityConfig.comfortPerLevel || 5);
      const qualityBonus = facility.quality * 0.3;
      return sum + (levelBonus + qualityBonus) / Math.max(hotel.facilities.length, 1);
    }, 0);
    totalComfort += facilityBonus * 0.25;

    const staffBonus = calculateStaffImpact(staffs);
    totalComfort += staffBonus * 0.2;

    const guildBonus = hotel.rating * 2;
    totalComfort += guildBonus * 0.15;

    return Math.min(Math.round(totalComfort * 10) / 10, GAME_CONSTANTS.MAX_COMFORT_SCORE);
  };

  const calculateStaffImpact = (staffs: Staff[]): number => {
    if (staffs.length === 0) return 0;

    let impact = 0;
    for (const staff of staffs) {
      if (staff.status !== 'working') continue;

      const positionConfig = STAFF_POSITIONS[staff.position];
      const avgSkill =
        Object.values(staff.skills).reduce((sum, s) => sum + s, 0) /
        Object.keys(staff.skills).length;
      const fatiguePenalty = 1 - staff.fatigue / GAME_CONSTANTS.MAX_FATIGUE * 0.5;
      const satisfactionBonus = staff.satisfaction / GAME_CONSTANTS.MAX_SATISFACTION;

      let staffImpact = 0;
      if (positionConfig.impactRoom) staffImpact += positionConfig.impactRoom * avgSkill;
      if (positionConfig.impactFood) staffImpact += positionConfig.impactFood * avgSkill;
      if (positionConfig.impactCleanliness) staffImpact += positionConfig.impactCleanliness * avgSkill;
      if (positionConfig.impactOverall) staffImpact += positionConfig.impactOverall * avgSkill;

      impact += staffImpact * fatiguePenalty * satisfactionBonus;
    }

    return Math.min(impact * 10, 30);
  };

  const calculateRoomPrice = (
    room: Room,
    hotel: Hotel,
    staffs: Staff[],
    marketMultiplier: number = 1
  ): number => {
    const roomConfig = ROOM_TYPES[room.type];
    const styleConfig = HOTEL_STYLES[hotel.style];

    let basePrice = roomConfig.basePrice * styleConfig.priceMultiplier;
    const comfortScore = calculateRoomComfort(room, hotel.style);
    const comfortMultiplier = 1 + (comfortScore - 50) / 100;
    basePrice *= comfortMultiplier;

    const staffImpact = calculateStaffImpact(staffs);
    basePrice *= 1 + staffImpact / 100;

    basePrice *= marketMultiplier;

    return Math.round(basePrice);
  };

  const calculateOptimalPricing = (
    hotel: Hotel,
    staffs: Staff[],
    marketDemand: number = 1
  ): Record<RoomType, number> => {
    const prices: Partial<Record<RoomType, number>> = {};
    const roomTypes: RoomType[] = ['standard', 'suite', 'villa'];

    for (const type of roomTypes) {
      const sampleRoom: Room = {
        id: 'sample',
        type,
        number: '000',
        floor: 1,
        price: 0,
        comfort: 50,
        status: 'vacant',
      };
      prices[type] = calculateRoomPrice(sampleRoom, hotel, staffs, marketDemand);
    }

    return prices as Record<RoomType, number>;
  };

  const calculateOccupancyRate = (rooms: Room[]): number => {
    if (rooms.length === 0) return 0;
    const occupied = rooms.filter((r) => r.status === 'occupied').length;
    return Math.round((occupied / rooms.length) * 1000) / 10;
  };

  const calculateDailyRevenue = (
    rooms: Room[],
    parties: { revenue: number; status: string }[]
  ): number => {
    const roomRevenue = rooms
      .filter((r) => r.status === 'occupied')
      .reduce((sum, r) => sum + r.price, 0);

    const partyRevenue = parties
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.revenue, 0);

    return roomRevenue + partyRevenue;
  };

  const calculateStaffEfficiency = (staff: Staff): number => {
    const avgSkill =
      Object.values(staff.skills).reduce((sum, s) => sum + s, 0) /
      Object.keys(staff.skills).length;
    const fatigueFactor = 1 - staff.fatigue / GAME_CONSTANTS.MAX_FATIGUE;
    const satisfactionFactor = staff.satisfaction / GAME_CONSTANTS.MAX_SATISFACTION;
    const levelBonus = 1 + (staff.level - 1) * 0.1;

    return Math.round(avgSkill * fatigueFactor * satisfactionFactor * levelBonus * 10) / 10;
  };

  const calculateStaffCosts = (staffs: Staff[]): number => {
    return staffs.reduce((sum, s) => sum + s.salary, 0);
  };

  const calculatePlayerLevelProgress = (exp: number): { level: number; currentExp: number; requiredExp: number; progress: number } => {
    const level = Math.floor(exp / GAME_CONSTANTS.EXP_PER_LEVEL) + 1;
    const currentExp = exp % GAME_CONSTANTS.EXP_PER_LEVEL;
    const requiredExp = GAME_CONSTANTS.EXP_PER_LEVEL;
    const progress = Math.round((currentExp / requiredExp) * 1000) / 10;

    return { level, currentExp, requiredExp, progress };
  };

  const calculatePartyServiceScore = (
    party: { budget: number; attendees: number; maxAttendees: number },
    staffs: Staff[]
  ): number => {
    const budgetScore = Math.min((party.budget / 10000) * 20, 30);
    const attendanceScore = party.maxAttendees > 0
      ? (party.attendees / party.maxAttendees) * 30
      : 0;
    const staffScore = calculateStaffImpact(staffs) * 0.4;

    return Math.min(Math.round(budgetScore + attendanceScore + staffScore), 100);
  };

  const calculatePartyRevenue = (
    party: { budget: number; attendees: number; serviceScore: number }
  ): number => {
    const baseRevenue = party.budget * 0.3;
    const attendeeRevenue = party.attendees * (party.budget / 100);
    const serviceBonus = 1 + party.serviceScore / 100;

    return Math.round((baseRevenue + attendeeRevenue) * serviceBonus);
  };

  const calculateMarketPriceSuggestion = (
    itemRarity: 'common' | 'rare' | 'epic' | 'legendary',
    itemType: 'blueprint' | 'ingredient',
    historicalPrices: number[] = []
  ): { min: number; max: number; suggested: number } => {
    const rarityMultiplier: Record<string, number> = {
      common: 1,
      rare: 3,
      epic: 8,
      legendary: 20,
    };
    const typeBasePrice: Record<string, number> = {
      blueprint: 1000,
      ingredient: 500,
    };

    const basePrice = typeBasePrice[itemType] * rarityMultiplier[itemRarity];

    if (historicalPrices.length > 0) {
      const avgPrice = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
      const finalPrice = Math.round((basePrice * 0.4 + avgPrice * 0.6));
      return {
        min: Math.round(finalPrice * 0.8),
        max: Math.round(finalPrice * 1.2),
        suggested: finalPrice,
      };
    }

    return {
      min: Math.round(basePrice * 0.8),
      max: Math.round(basePrice * 1.2),
      suggested: basePrice,
    };
  };

  const calculateGuestSatisfaction = (
    guest: Guest,
    room: Room | undefined,
    hotel: Hotel,
    staffs: Staff[]
  ): number => {
    if (!room) return Math.round(guest.satisfaction * 0.8);

    let satisfaction = 50;

    const roomComfort = calculateRoomComfort(room, hotel.style);
    satisfaction += (roomComfort - 50) * 0.5;

    const budgetMatch = room.price <= guest.budget ? 10 : -15;
    satisfaction += budgetMatch;

    const staffImpact = calculateStaffImpact(staffs);
    satisfaction += staffImpact * 0.3;

    const prefBonus = guest.preferences.length > 0 ? 5 : 0;
    satisfaction += prefBonus;

    return Math.max(
      GAME_CONSTANTS.MIN_SATISFACTION,
      Math.min(GAME_CONSTANTS.MAX_SATISFACTION, Math.round(satisfaction))
    );
  };

  const autoAssignRooms = (guests: Guest[], rooms: Room[]): Array<{ guestId: string; roomId: string }> => {
    const assignments: Array<{ guestId: string; roomId: string }> = [];
    const availableRooms = [...rooms.filter((r) => r.status === 'vacant')];
    const unassignedGuests = [...guests.filter((g) => !g.roomId)];

    unassignedGuests.sort((a, b) => b.budget - a.budget);

    for (const guest of unassignedGuests) {
      const bestRoom = availableRooms
        .filter((r) => r.price <= guest.budget * 1.2)
        .sort((a, b) => b.comfort - a.comfort)[0];

      if (bestRoom) {
        assignments.push({ guestId: guest.id, roomId: bestRoom.id });
        const idx = availableRooms.findIndex((r) => r.id === bestRoom.id);
        if (idx !== -1) availableRooms.splice(idx, 1);
      }
    }

    return assignments;
  };

  return useMemo(
    () => ({
      calculateRoomComfort,
      calculateHotelComfort,
      calculateStaffImpact,
      calculateRoomPrice,
      calculateOptimalPricing,
      calculateOccupancyRate,
      calculateDailyRevenue,
      calculateStaffEfficiency,
      calculateStaffCosts,
      calculatePlayerLevelProgress,
      calculatePartyServiceScore,
      calculatePartyRevenue,
      calculateMarketPriceSuggestion,
      calculateGuestSatisfaction,
      autoAssignRooms,
    }),
    []
  );
}
