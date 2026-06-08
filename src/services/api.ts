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
  ApiResponse,
  ItemType,
  ItemRarity,
  PartyType,
} from 'shared/types';

const API_BASE = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  auth = {
    login: (name: string): Promise<ApiResponse<Player>> =>
      this.post<Player>('/auth/login', { name }),

    logout: (): Promise<ApiResponse<void>> =>
      this.post<void>('/auth/logout'),

    getCurrentPlayer: (): Promise<ApiResponse<Player>> =>
      this.get<Player>('/auth/me'),
  };

  player = {
    getProfile: (playerId: string): Promise<ApiResponse<Player>> =>
      this.get<Player>(`/players/${playerId}`),

    updateProfile: (
      playerId: string,
      data: Partial<Pick<Player, 'name' | 'avatar'>>
    ): Promise<ApiResponse<Player>> =>
      this.put<Player>(`/players/${playerId}`, data),
  };

  hotel = {
    getByPlayer: (playerId: string): Promise<ApiResponse<Hotel>> =>
      this.get<Hotel>(`/hotels/player/${playerId}`),

    getById: (hotelId: string): Promise<ApiResponse<Hotel>> =>
      this.get<Hotel>(`/hotels/${hotelId}`),

    create: (
      playerId: string,
      data: { name: string; style: HotelStyle }
    ): Promise<ApiResponse<Hotel>> =>
      this.post<Hotel>('/hotels', { playerId, ...data }),

    updateStyle: (
      hotelId: string,
      style: HotelStyle
    ): Promise<ApiResponse<Hotel>> =>
      this.put<Hotel>(`/hotels/${hotelId}/style`, { style }),

    updateName: (
      hotelId: string,
      name: string
    ): Promise<ApiResponse<Hotel>> =>
      this.put<Hotel>(`/hotels/${hotelId}/name`, { name }),

    addRoom: (
      hotelId: string,
      data: { type: string; floor: number; number: string }
    ): Promise<ApiResponse<Hotel>> =>
      this.post<Hotel>(`/hotels/${hotelId}/rooms`, data),

    updateRoomPrice: (
      hotelId: string,
      roomId: string,
      price: number
    ): Promise<ApiResponse<Hotel>> =>
      this.put<Hotel>(`/hotels/${hotelId}/rooms/${roomId}/price`, { price }),

    addFacility: (
      hotelId: string,
      data: { type: string }
    ): Promise<ApiResponse<Hotel>> =>
      this.post<Hotel>(`/hotels/${hotelId}/facilities`, data),

    upgradeFacility: (
      hotelId: string,
      facilityId: string
    ): Promise<ApiResponse<Hotel>> =>
      this.put<Hotel>(`/hotels/${hotelId}/facilities/${facilityId}/upgrade`),
  };

  staff = {
    getByHotel: (hotelId: string): Promise<ApiResponse<Staff[]>> =>
      this.get<Staff[]>(`/staff/hotel/${hotelId}`),

    hire: (
      hotelId: string,
      data: {
        name: string;
        position: StaffPosition;
        avatar?: string;
      }
    ): Promise<ApiResponse<Staff>> =>
      this.post<Staff>('/staff', { hotelId, ...data }),

    fire: (staffId: string): Promise<ApiResponse<void>> =>
      this.delete<void>(`/staff/${staffId}`),

    update: (
      staffId: string,
      data: Partial<Staff>
    ): Promise<ApiResponse<Staff>> =>
      this.put<Staff>(`/staff/${staffId}`, data),

    updateSchedule: (
      staffId: string,
      schedule: Staff['schedule']
    ): Promise<ApiResponse<Staff>> =>
      this.put<Staff>(`/staff/${staffId}/schedule`, { schedule }),

    promote: (staffId: string): Promise<ApiResponse<Staff>> =>
      this.put<Staff>(`/staff/${staffId}/promote`),

    rest: (staffId: string): Promise<ApiResponse<Staff>> =>
      this.put<Staff>(`/staff/${staffId}/rest`),

    getCandidates: (
      position: StaffPosition
    ): Promise<ApiResponse<Array<Omit<Staff, 'id' | 'hotelId'>>>> =>
      this.get<Array<Omit<Staff, 'id' | 'hotelId'>>>(
        `/staff/candidates?position=${position}`
      ),
  };

  guests = {
    getByHotel: (hotelId: string): Promise<ApiResponse<Guest[]>> =>
      this.get<Guest[]>(`/guests/hotel/${hotelId}`),

    checkIn: (
      guestId: string,
      roomId: string
    ): Promise<ApiResponse<Guest>> =>
      this.put<Guest>(`/guests/${guestId}/checkin`, { roomId }),

    checkOut: (guestId: string): Promise<ApiResponse<Guest>> =>
      this.put<Guest>(`/guests/${guestId}/checkout`),

    autoAssign: (hotelId: string): Promise<ApiResponse<Guest[]>> =>
      this.post<Guest[]>(`/guests/hotel/${hotelId}/auto-assign`),
  };

  events = {
    getByHotel: (hotelId: string): Promise<ApiResponse<GameEvent[]>> =>
      this.get<GameEvent[]>(`/events/hotel/${hotelId}`),

    resolve: (
      eventId: string,
      optionId: string
    ): Promise<ApiResponse<GameEvent>> =>
      this.put<GameEvent>(`/events/${eventId}/resolve`, { optionId }),
  };

  parties = {
    getByHotel: (hotelId: string): Promise<ApiResponse<PartyEvent[]>> =>
      this.get<PartyEvent[]>(`/parties/hotel/${hotelId}`),

    create: (
      hotelId: string,
      data: {
        type: PartyType;
        name: string;
        budget: number;
        maxAttendees: number;
        startTime: Date;
      }
    ): Promise<ApiResponse<PartyEvent>> =>
      this.post<PartyEvent>('/parties', { hotelId, ...data }),

    update: (
      partyId: string,
      data: Partial<PartyEvent>
    ): Promise<ApiResponse<PartyEvent>> =>
      this.put<PartyEvent>(`/parties/${partyId}`, data),

    start: (partyId: string): Promise<ApiResponse<PartyEvent>> =>
      this.put<PartyEvent>(`/parties/${partyId}/start`),

    complete: (partyId: string): Promise<ApiResponse<PartyEvent>> =>
      this.put<PartyEvent>(`/parties/${partyId}/complete`),
  };

  market = {
    getListings: (
      filters?: {
        itemType?: ItemType;
        itemRarity?: ItemRarity;
        minPrice?: number;
        maxPrice?: number;
      }
    ): Promise<ApiResponse<MarketListing[]>> => {
      const queryParams = new URLSearchParams();
      if (filters?.itemType) queryParams.set('itemType', filters.itemType);
      if (filters?.itemRarity) queryParams.set('itemRarity', filters.itemRarity);
      if (filters?.minPrice) queryParams.set('minPrice', String(filters.minPrice));
      if (filters?.maxPrice) queryParams.set('maxPrice', String(filters.maxPrice));
      const query = queryParams.toString();
      return this.get<MarketListing[]>(
        `/market/listings${query ? `?${query}` : ''}`
      );
    },

    createListing: (
      sellerId: string,
      data: {
        itemType: ItemType;
        itemName: string;
        itemRarity: ItemRarity;
        price: number;
      }
    ): Promise<ApiResponse<MarketListing>> =>
      this.post<MarketListing>('/market/listings', { sellerId, ...data }),

    buyItem: (
      listingId: string,
      buyerId: string
    ): Promise<ApiResponse<MarketListing>> =>
      this.post<MarketListing>(`/market/listings/${listingId}/buy`, { buyerId }),

    cancelListing: (listingId: string): Promise<ApiResponse<void>> =>
      this.delete<void>(`/market/listings/${listingId}`),

    getPriceSuggestion: (
      itemType: ItemType,
      itemRarity: ItemRarity
    ): Promise<ApiResponse<{ min: number; max: number; average: number }>> =>
      this.get<{ min: number; max: number; average: number }>(
        `/market/price-suggestion?itemType=${itemType}&itemRarity=${itemRarity}`
      ),
  };

  guild = {
    get: (guildId: string): Promise<ApiResponse<Guild>> =>
      this.get<Guild>(`/guilds/${guildId}`),

    getByPlayer: (playerId: string): Promise<ApiResponse<Guild>> =>
      this.get<Guild>(`/guilds/player/${playerId}`),

    create: (
      leaderId: string,
      name: string
    ): Promise<ApiResponse<Guild>> =>
      this.post<Guild>('/guilds', { leaderId, name }),

    join: (
      guildId: string,
      playerId: string
    ): Promise<ApiResponse<Guild>> =>
      this.post<Guild>(`/guilds/${guildId}/join`, { playerId }),

    leave: (
      guildId: string,
      playerId: string
    ): Promise<ApiResponse<Guild>> =>
      this.post<Guild>(`/guilds/${guildId}/leave`, { playerId }),

    contribute: (
      guildId: string,
      playerId: string,
      amount: number
    ): Promise<ApiResponse<Guild>> =>
      this.post<Guild>(`/guilds/${guildId}/contribute`, { playerId, amount }),

    upgradeResort: (guildId: string): Promise<ApiResponse<Guild>> =>
      this.put<Guild>(`/guilds/${guildId}/upgrade`),
  };

  analytics = {
    getWeeklyReport: (
      hotelId: string
    ): Promise<ApiResponse<WeeklyReport>> =>
      this.get<WeeklyReport>(`/analytics/${hotelId}/weekly-report`),

    exportPdf: (hotelId: string): Promise<ApiResponse<{ url: string }>> =>
      this.get<{ url: string }>(`/analytics/${hotelId}/export-pdf`),
  };

  leaderboard = {
    get: (): Promise<ApiResponse<Leaderboard>> =>
      this.get<Leaderboard>('/leaderboard'),
  };
}

export const api = new ApiClient();
