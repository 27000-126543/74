import { create } from 'zustand';
import type {
  Player,
  Hotel,
  HotelStyle,
  Staff,
  StaffPosition,
  Guest,
  GameEvent,
  PartyEvent,
  MarketListing,
  Guild,
  WeeklyReport,
  Leaderboard,
  ItemType,
  ItemRarity,
  PartyType,
  PriceHistoryPoint,
} from 'shared/types';
import { api } from '@/services/api';

interface LoadingState {
  player: boolean;
  hotel: boolean;
  staffs: boolean;
  guests: boolean;
  events: boolean;
  parties: boolean;
  marketListings: boolean;
  priceHistory: boolean;
  guild: boolean;
  weeklyReport: boolean;
  leaderboard: boolean;
  hotelDetail: boolean;
}

interface ErrorState {
  player?: string;
  hotel?: string;
  staffs?: string;
  guests?: string;
  events?: string;
  parties?: string;
  marketListings?: string;
  priceHistory?: string;
  guild?: string;
  weeklyReport?: string;
  leaderboard?: string;
  hotelDetail?: string;
}

interface GameState {
  player: Player | null;
  hotel: Hotel | null;
  staffs: Staff[];
  guests: Guest[];
  events: GameEvent[];
  parties: PartyEvent[];
  marketListings: MarketListing[];
  priceHistory: PriceHistoryPoint[] | null;
  guild: Guild | null;
  weeklyReport: WeeklyReport | null;
  leaderboard: Leaderboard | null;
  selectedHotelDetail: { hotel: Hotel | null; staffs: Staff[] } | null;
  loading: LoadingState;
  errors: ErrorState;

  setPlayer: (player: Player | null) => void;
  setHotel: (hotel: Hotel | null) => void;

  fetchPlayer: () => Promise<void>;
  fetchHotel: (playerId?: string) => Promise<void>;
  fetchStaff: (hotelId?: string) => Promise<void>;
  fetchGuests: (hotelId?: string) => Promise<void>;
  fetchEvents: (hotelId?: string) => Promise<void>;
  fetchParties: (hotelId?: string) => Promise<void>;
  fetchMarketListings: (filters?: {
    itemType?: ItemType;
    itemRarity?: ItemRarity;
    minPrice?: number;
    maxPrice?: number;
  }) => Promise<void>;
  fetchPriceHistory: (itemType?: ItemType) => Promise<void>;
  fetchHotelDetail: (hotelId: string) => Promise<void>;
  fetchHotelDetailByPlayerId: (playerId: string) => Promise<void>;
  clearHotelDetail: () => void;
  fetchGuild: (playerId?: string) => Promise<void>;
  fetchWeeklyReport: (hotelId?: string) => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchAll: () => Promise<void>;

  login: (name: string) => Promise<boolean>;
  logout: () => Promise<void>;

  createHotel: (name: string, style: HotelStyle) => Promise<boolean>;
  updateHotelStyle: (style: HotelStyle) => Promise<boolean>;
  updateHotelName: (name: string) => Promise<boolean>;
  addRoom: (type: string) => Promise<boolean>;
  updateRoomPrice: (roomId: string, price: number) => Promise<boolean>;
  addFacility: (type: string) => Promise<boolean>;
  upgradeFacility: (facilityId: string) => Promise<boolean>;

  hireStaff: (position: StaffPosition) => Promise<boolean>;
  fireStaff: (staffId: string) => Promise<boolean>;
  updateStaffSchedule: (
    staffId: string,
    schedule: Staff['schedule']
  ) => Promise<boolean>;
  promoteStaff: (staffId: string) => Promise<boolean>;
  restStaff: (staffId: string) => Promise<boolean>;

  checkInGuest: (guestId: string, roomId: string) => Promise<boolean>;
  checkOutGuest: (guestId: string) => Promise<boolean>;
  autoAssignGuests: () => Promise<boolean>;
  dailyTick: () => Promise<boolean>;

  resolveEvent: (eventId: string, optionId: string) => Promise<boolean>;

  createParty: (data: {
    type: PartyType;
    name: string;
    budget: number;
    maxAttendees: number;
    startTime: Date;
  }) => Promise<boolean>;
  startParty: (partyId: string) => Promise<boolean>;
  completeParty: (partyId: string) => Promise<boolean>;

  buyItem: (listingId: string) => Promise<boolean>;
  createListing: (data: {
    itemType: ItemType;
    itemName: string;
    itemRarity: ItemRarity;
    price: number;
  }) => Promise<boolean>;
  cancelListing: (listingId: string) => Promise<boolean>;

  createGuild: (name: string) => Promise<boolean>;
  joinGuild: (guildId: string) => Promise<boolean>;
  leaveGuild: (guildId: string) => Promise<boolean>;
  contributeGuild: (amount: number) => Promise<boolean>;
  upgradeGuildResort: () => Promise<boolean>;

  reset: () => void;
}

const initialLoading: LoadingState = {
  player: false,
  hotel: false,
  staffs: false,
  guests: false,
  events: false,
  parties: false,
  marketListings: false,
  priceHistory: false,
  guild: false,
  weeklyReport: false,
  leaderboard: false,
  hotelDetail: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  hotel: null,
  staffs: [],
  guests: [],
  events: [],
  parties: [],
  marketListings: [],
  priceHistory: null,
  guild: null,
  weeklyReport: null,
  leaderboard: null,
  selectedHotelDetail: null,
  loading: { ...initialLoading },
  errors: {},

  setPlayer: (player) => set({ player }),
  setHotel: (hotel) => set({ hotel }),

  fetchPlayer: async () => {
    set({ loading: { ...get().loading, player: true }, errors: { ...get().errors, player: undefined } });
    try {
      const res = await api.auth.getCurrentPlayer();
      if (res.success && res.data) {
        set({ player: res.data });
      } else {
        const playerName = localStorage.getItem('playerName');
        if (playerName) {
          const loginRes = await api.auth.login(playerName);
          if (loginRes.success && loginRes.data) {
            localStorage.setItem('playerId', loginRes.data.id);
            set({ player: loginRes.data });
          } else {
            set({ errors: { ...get().errors, player: res.error } });
          }
        } else {
          set({ errors: { ...get().errors, player: res.error } });
        }
      }
    } catch (error) {
      set({ errors: { ...get().errors, player: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, player: false } });
    }
  },

  fetchHotel: async (playerId) => {
    const pid = playerId || get().player?.id;
    if (!pid) return;
    set({ loading: { ...get().loading, hotel: true }, errors: { ...get().errors, hotel: undefined } });
    try {
      const res = await api.hotel.getByPlayer(pid);
      if (res.success) {
        if (res.data) {
          set({ hotel: res.data });
        } else {
          await get().createHotel(`${get().player?.name || '我的'}酒店`, 'modern');
        }
      } else {
        set({ errors: { ...get().errors, hotel: res.error } });
      }
    } catch (error) {
      set({ errors: { ...get().errors, hotel: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, hotel: false } });
    }
  },

  fetchStaff: async (hotelId) => {
    const hid = hotelId || get().hotel?.id;
    if (!hid) return;
    set({ loading: { ...get().loading, staffs: true }, errors: { ...get().errors, staffs: undefined } });
    try {
      const res = await api.staff.getByHotel(hid);
      if (res.success && res.data) {
        set({ staffs: res.data });
      } else {
        set({ errors: { ...get().errors, staffs: res.error } });
      }
    } catch (error) {
      set({ errors: { ...get().errors, staffs: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, staffs: false } });
    }
  },

  fetchGuests: async (hotelId) => {
    const hid = hotelId || get().hotel?.id;
    if (!hid) return;
    set({ loading: { ...get().loading, guests: true }, errors: { ...get().errors, guests: undefined } });
    try {
      const res = await api.guests.getByHotel(hid);
      if (res.success && res.data) {
        set({ guests: res.data });
      } else {
        set({ errors: { ...get().errors, guests: res.error } });
      }
    } catch (error) {
      set({ errors: { ...get().errors, guests: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, guests: false } });
    }
  },

  fetchEvents: async (hotelId) => {
    const hid = hotelId || get().hotel?.id;
    if (!hid) return;
    set({ loading: { ...get().loading, events: true }, errors: { ...get().errors, events: undefined } });
    try {
      const res = await api.events.getByHotel(hid);
      if (res.success && res.data) {
        set({ events: res.data });
      } else {
        set({ errors: { ...get().errors, events: res.error } });
      }
    } catch (error) {
      set({ errors: { ...get().errors, events: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, events: false } });
    }
  },

  fetchParties: async (hotelId) => {
    const hid = hotelId || get().hotel?.id;
    if (!hid) return;
    set({ loading: { ...get().loading, parties: true }, errors: { ...get().errors, parties: undefined } });
    try {
      const res = await api.parties.getByHotel(hid);
      if (res.success && res.data) {
        set({ parties: res.data });
      } else {
        set({ errors: { ...get().errors, parties: res.error } });
      }
    } catch (error) {
      set({ errors: { ...get().errors, parties: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, parties: false } });
    }
  },

  fetchMarketListings: async (filters) => {
    set({ loading: { ...get().loading, marketListings: true }, errors: { ...get().errors, marketListings: undefined } });
    try {
      const res = await api.market.getListings(filters);
      if (res.success && res.data) {
        set({ marketListings: res.data });
      } else {
        set({ errors: { ...get().errors, marketListings: res.error } });
      }
    } catch (error) {
      set({ errors: { ...get().errors, marketListings: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, marketListings: false } });
    }
  },

  fetchPriceHistory: async (itemType) => {
    set({ loading: { ...get().loading, priceHistory: true }, errors: { ...get().errors, priceHistory: undefined } });
    try {
      const res = await api.market.getPriceHistory(itemType);
      if (res.success && res.data) {
        set({ priceHistory: res.data });
      } else {
        set({ priceHistory: null, errors: { ...get().errors, priceHistory: res.error } });
      }
    } catch (error) {
      set({ priceHistory: null, errors: { ...get().errors, priceHistory: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, priceHistory: false } });
    }
  },

  fetchHotelDetail: async (hotelId) => {
    set({ loading: { ...get().loading, hotelDetail: true }, errors: { ...get().errors, hotelDetail: undefined } });
    try {
      const [hotelRes, staffRes] = await Promise.all([
        api.hotel.getById(hotelId),
        api.staff.getByHotel(hotelId),
      ]);
      if (hotelRes.success) {
        set({
          selectedHotelDetail: {
            hotel: hotelRes.data || null,
            staffs: staffRes.success && staffRes.data ? staffRes.data : [],
          },
        });
      } else {
        set({ selectedHotelDetail: null, errors: { ...get().errors, hotelDetail: hotelRes.error } });
      }
    } catch (error) {
      set({ selectedHotelDetail: null, errors: { ...get().errors, hotelDetail: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, hotelDetail: false } });
    }
  },

  fetchHotelDetailByPlayerId: async (playerId) => {
    set({ loading: { ...get().loading, hotelDetail: true }, errors: { ...get().errors, hotelDetail: undefined } });
    try {
      const hotelRes = await api.hotel.getByPlayer(playerId);
      if (hotelRes.success && hotelRes.data) {
        const staffRes = await api.staff.getByHotel(hotelRes.data.id);
        set({
          selectedHotelDetail: {
            hotel: hotelRes.data,
            staffs: staffRes.success && staffRes.data ? staffRes.data : [],
          },
        });
      } else {
        set({ selectedHotelDetail: null, errors: { ...get().errors, hotelDetail: hotelRes.error } });
      }
    } catch (error) {
      set({ selectedHotelDetail: null, errors: { ...get().errors, hotelDetail: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, hotelDetail: false } });
    }
  },

  clearHotelDetail: () => {
    set({ selectedHotelDetail: null, errors: { ...get().errors, hotelDetail: undefined } });
  },

  fetchGuild: async (playerId) => {
    const pid = playerId || get().player?.id;
    if (!pid) return;
    set({ loading: { ...get().loading, guild: true }, errors: { ...get().errors, guild: undefined } });
    try {
      const res = await api.guild.getByPlayer(pid);
      if (res.success) {
        set({ guild: res.data || null });
      } else {
        set({ errors: { ...get().errors, guild: res.error } });
      }
    } catch (error) {
      set({ errors: { ...get().errors, guild: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, guild: false } });
    }
  },

  fetchWeeklyReport: async (hotelId) => {
    const hid = hotelId || get().hotel?.id;
    if (!hid) return;
    set({ loading: { ...get().loading, weeklyReport: true }, errors: { ...get().errors, weeklyReport: undefined } });
    try {
      const res = await api.analytics.getWeeklyReport(hid);
      if (res.success && res.data) {
        set({ weeklyReport: res.data });
      } else {
        set({ errors: { ...get().errors, weeklyReport: res.error } });
      }
    } catch (error) {
      set({ errors: { ...get().errors, weeklyReport: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, weeklyReport: false } });
    }
  },

  fetchLeaderboard: async () => {
    set({ loading: { ...get().loading, leaderboard: true }, errors: { ...get().errors, leaderboard: undefined } });
    try {
      const res = await api.leaderboard.get();
      if (res.success && res.data) {
        set({ leaderboard: res.data });
      } else {
        set({ errors: { ...get().errors, leaderboard: res.error } });
      }
    } catch (error) {
      set({ errors: { ...get().errors, leaderboard: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      set({ loading: { ...get().loading, leaderboard: false } });
    }
  },

  fetchAll: async () => {
    if (!get().player?.id) {
      await get().fetchPlayer();
    }
    if (!get().hotel?.id) {
      await get().fetchHotel();
    }
    if (!get().hotel?.id) {
      await get().createHotel(`${get().player?.name || '我的'}酒店`, 'modern');
    }
    await Promise.all([
      get().fetchStaff(),
      get().fetchGuests(),
      get().fetchEvents(),
      get().fetchParties(),
      get().fetchMarketListings(),
      get().fetchGuild(),
      get().fetchLeaderboard(),
    ]);
  },

  login: async (name) => {
    const res = await api.auth.login(name);
    if (res.success && res.data) {
      localStorage.setItem('playerId', res.data.id);
      localStorage.setItem('playerName', res.data.name);
      set({ player: res.data });
      const state = get();
      await state.fetchAll();
      if (!state.hotel) {
        await state.createHotel(`${res.data.name}的酒店`, 'modern');
      }
      window.location.href = '/dashboard';
      return true;
    }
    return false;
  },

  logout: async () => {
    await api.auth.logout();
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerName');
    get().reset();
    window.location.href = '/';
  },

  createHotel: async (name, style) => {
    const playerId = get().player?.id;
    if (!playerId) return false;
    const res = await api.hotel.create(playerId, { name, style });
    if (res.success && res.data) {
      set({ hotel: res.data });
      return true;
    }
    return false;
  },

  updateHotelStyle: async (style) => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    const res = await api.hotel.updateStyle(hotelId, style);
    if (res.success && res.data) {
      set({ hotel: res.data });
      return true;
    }
    return false;
  },

  updateHotelName: async (name) => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    const res = await api.hotel.updateName(hotelId, name);
    if (res.success && res.data) {
      set({ hotel: res.data });
      return true;
    }
    return false;
  },

  addRoom: async (type) => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    const hotel = get().hotel;
    if (!hotel) return false;
    const maxFloor = hotel.rooms.length > 0 ? Math.max(...hotel.rooms.map(r => r.floor)) : 0;
    const floor = maxFloor + 1;
    const roomsOnFloor = hotel.rooms.filter(r => r.floor === floor);
    const number = `${floor}${String(roomsOnFloor.length + 1).padStart(2, '0')}`;
    const res = await api.hotel.addRoom(hotelId, { type, floor, number });
    if (res.success && res.data) {
      set({ hotel: res.data });
      return true;
    }
    return false;
  },

  updateRoomPrice: async (roomId, price) => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    const res = await api.hotel.updateRoomPrice(hotelId, roomId, price);
    if (res.success && res.data) {
      set({ hotel: res.data });
      return true;
    }
    return false;
  },

  addFacility: async (type) => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    const res = await api.hotel.addFacility(hotelId, { type });
    if (res.success && res.data) {
      set({ hotel: res.data });
      return true;
    }
    return false;
  },

  upgradeFacility: async (facilityId) => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    const res = await api.hotel.upgradeFacility(hotelId, facilityId);
    if (res.success && res.data) {
      set({ hotel: res.data });
      return true;
    }
    return false;
  },

  hireStaff: async (position) => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    try {
      const candidatesRes = await api.staff.getCandidates(position);
      if (!candidatesRes.success || !candidatesRes.data || candidatesRes.data.length === 0) {
        console.error('[hireStaff] 获取候选人失败:', candidatesRes);
        return false;
      }
      const randomIndex = Math.floor(Math.random() * candidatesRes.data.length);
      const candidate = candidatesRes.data[randomIndex];
      const res = await api.staff.hire(hotelId, candidate);
      if (res.success && res.data) {
        set({ staffs: [...get().staffs, res.data] });
        return true;
      }
      console.error('[hireStaff] 招聘失败:', res);
      return false;
    } catch (error) {
      console.error('[hireStaff] 异常:', error);
      return false;
    }
  },

  fireStaff: async (staffId) => {
    const res = await api.staff.fire(staffId);
    if (res.success) {
      set({ staffs: get().staffs.filter((s) => s.id !== staffId) });
      return true;
    }
    return false;
  },

  updateStaffSchedule: async (staffId, schedule) => {
    const res = await api.staff.updateSchedule(staffId, schedule);
    if (res.success && res.data) {
      set({
        staffs: get().staffs.map((s) =>
          s.id === staffId ? res.data! : s
        ),
      });
      return true;
    }
    return false;
  },

  promoteStaff: async (staffId) => {
    const res = await api.staff.promote(staffId);
    if (res.success && res.data) {
      set({
        staffs: get().staffs.map((s) =>
          s.id === staffId ? res.data! : s
        ),
      });
      return true;
    }
    return false;
  },

  restStaff: async (staffId) => {
    const res = await api.staff.rest(staffId);
    if (res.success && res.data) {
      set({
        staffs: get().staffs.map((s) =>
          s.id === staffId ? res.data! : s
        ),
      });
      return true;
    }
    return false;
  },

  checkInGuest: async (guestId, roomId) => {
    const res = await api.guests.checkIn(guestId, roomId);
    if (res.success && res.data) {
      set({
        guests: get().guests.map((g) =>
          g.id === guestId ? res.data! : g
        ),
      });
      return true;
    }
    return false;
  },

  checkOutGuest: async (guestId) => {
    const res = await api.guests.checkOut(guestId);
    if (res.success && res.data) {
      set({
        guests: get().guests.map((g) =>
          g.id === guestId ? res.data! : g
        ),
      });
      return true;
    }
    return false;
  },

  autoAssignGuests: async () => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    const res = await api.guests.autoAssign(hotelId);
    if (res.success && res.data) {
      set({ guests: res.data });
      return true;
    }
    return false;
  },

  dailyTick: async () => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    const res = await api.guests.dailyTick(hotelId);
    if (res.success && res.data) {
      set({
        guests: res.data.guests,
        hotel: res.data.hotel,
        staffs: res.data.staffs,
      });
      return true;
    }
    return false;
  },

  resolveEvent: async (eventId, optionId) => {
    const res = await api.events.resolve(eventId, optionId);
    if (res.success && res.data) {
      set({
        events: get().events.map((e) =>
          e.id === eventId ? res.data! : e
        ),
      });
      return true;
    }
    return false;
  },

  createParty: async (data) => {
    const hotelId = get().hotel?.id;
    if (!hotelId) return false;
    const res = await api.parties.create(hotelId, data);
    if (res.success && res.data) {
      set({ parties: [...get().parties, res.data] });
      return true;
    }
    return false;
  },

  startParty: async (partyId) => {
    const res = await api.parties.start(partyId);
    if (res.success && res.data) {
      set({
        parties: get().parties.map((p) =>
          p.id === partyId ? res.data! : p
        ),
      });
      return true;
    }
    return false;
  },

  completeParty: async (partyId) => {
    const res = await api.parties.complete(partyId);
    if (res.success && res.data) {
      set({
        parties: get().parties.map((p) =>
          p.id === partyId ? res.data! : p
        ),
      });
      return true;
    }
    return false;
  },

  buyItem: async (listingId) => {
    const playerId = get().player?.id;
    if (!playerId) return false;
    const res = await api.market.buyItem(listingId, playerId);
    if (res.success) {
      set({
        marketListings: get().marketListings.filter((l) => l.id !== listingId),
      });
      return true;
    }
    return false;
  },

  createListing: async (data) => {
    const player = get().player;
    if (!player) return false;
    const sellerId = player.id;
    const sellerName = player.name;
    const res = await api.market.createListing(sellerId, { ...data, sellerName });
    if (res.success && res.data) {
      set({ marketListings: [...get().marketListings, res.data] });
      return true;
    }
    return false;
  },

  cancelListing: async (listingId) => {
    const res = await api.market.cancelListing(listingId);
    if (res.success) {
      set({
        marketListings: get().marketListings.filter((l) => l.id !== listingId),
      });
      return true;
    }
    return false;
  },

  createGuild: async (name) => {
    const leaderId = get().player?.id;
    if (!leaderId) return false;
    const res = await api.guild.create(leaderId, name);
    if (res.success && res.data) {
      set({ guild: res.data });
      return true;
    }
    return false;
  },

  joinGuild: async (guildId) => {
    const playerId = get().player?.id;
    if (!playerId) return false;
    const res = await api.guild.join(guildId, playerId);
    if (res.success && res.data) {
      set({ guild: res.data });
      return true;
    }
    return false;
  },

  leaveGuild: async (guildId) => {
    const playerId = get().player?.id;
    if (!guildId || !playerId) return false;
    const res = await api.guild.leave(guildId, playerId);
    if (res.success) {
      set({ guild: null });
      return true;
    }
    return false;
  },

  contributeGuild: async (amount) => {
    const guildId = get().guild?.id;
    const playerId = get().player?.id;
    if (!guildId || !playerId) return false;
    const res = await api.guild.contribute(guildId, playerId, amount);
    if (res.success && res.data) {
      set({ guild: res.data });
      return true;
    }
    return false;
  },

  upgradeGuildResort: async () => {
    const guildId = get().guild?.id;
    if (!guildId) return false;
    const res = await api.guild.upgradeResort(guildId);
    if (res.success && res.data) {
      set({ guild: res.data });
      return true;
    }
    return false;
  },

  reset: () => {
    set({
      player: null,
      hotel: null,
      staffs: [],
      guests: [],
      events: [],
      parties: [],
      marketListings: [],
      priceHistory: null,
      guild: null,
      weeklyReport: null,
      leaderboard: null,
      selectedHotelDetail: null,
      loading: { ...initialLoading },
      errors: {},
    });
  },
}));
