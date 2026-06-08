import { Router, type Request, type Response } from 'express'
import {
  getPlayersSortedByRevenue,
  getPlayersSortedByLevel,
  getHotelsSortedByRooms,
  getHotelByPlayerId,
} from '../data/store.js'
import type { Leaderboard, LeaderboardEntry } from '../../shared/types.js'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const revenuePlayers = getPlayersSortedByRevenue()
    const levelPlayers = getPlayersSortedByLevel()
    const hotels = getHotelsSortedByRooms()

    const byRevenue: LeaderboardEntry[] = revenuePlayers.map((player, index) => {
      const hotel = getHotelByPlayerId(player.id)
      return {
        rank: index + 1,
        playerId: player.id,
        playerName: player.name,
        hotelName: hotel?.name || '',
        rating: hotel?.rating || 0,
        totalRevenue: hotel?.totalRevenue || 0,
        roomCount: hotel?.rooms.length || 0,
      }
    })

    const byRating: LeaderboardEntry[] = [...revenuePlayers]
      .map((player, index) => {
        const hotel = getHotelByPlayerId(player.id)
        return {
          rank: 0,
          playerId: player.id,
          playerName: player.name,
          hotelName: hotel?.name || '',
          rating: hotel?.rating || 0,
          totalRevenue: hotel?.totalRevenue || 0,
          roomCount: hotel?.rooms.length || 0,
        }
      })
      .sort((a, b) => b.rating - a.rating)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))

    const byRooms: LeaderboardEntry[] = hotels.map((hotel, index) => ({
      rank: index + 1,
      playerId: hotel.playerId,
      playerName: '',
      hotelName: hotel.name,
      rating: hotel.rating,
      totalRevenue: hotel.totalRevenue,
      roomCount: hotel.rooms.length,
    }))

    const leaderboard: Leaderboard = {
      byRating,
      byRevenue,
      byRooms,
    }

    res.status(200).json({ success: true, data: leaderboard })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取排行榜失败' })
  }
})

export default router
