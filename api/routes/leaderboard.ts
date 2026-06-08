import { Router, type Request, type Response } from 'express'
import {
  getPlayersSortedByRevenue,
  getPlayersSortedByLevel,
  getHotelsSortedByRooms,
  getHotelByPlayerId,
} from '../data/store.js'

const router = Router()

router.get('/revenue', async (_req: Request, res: Response): Promise<void> => {
  try {
    const players = getPlayersSortedByRevenue()
    const ranking = players.map((player, index) => {
      const hotel = getHotelByPlayerId(player.id)
      return {
        rank: index + 1,
        playerId: player.id,
        playerName: player.name,
        avatar: player.avatar,
        level: player.level,
        totalRevenue: hotel?.totalRevenue || 0,
        hotelName: hotel?.name || '',
      }
    })
    res.status(200).json({ success: true, data: ranking })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取收入排名失败' })
  }
})

router.get('/level', async (_req: Request, res: Response): Promise<void> => {
  try {
    const players = getPlayersSortedByLevel()
    const ranking = players.map((player, index) => ({
      rank: index + 1,
      playerId: player.id,
      playerName: player.name,
      avatar: player.avatar,
      level: player.level,
      exp: player.exp,
    }))
    res.status(200).json({ success: true, data: ranking })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取等级排名失败' })
  }
})

router.get('/rooms', async (_req: Request, res: Response): Promise<void> => {
  try {
    const hotels = getHotelsSortedByRooms()
    const ranking = hotels.map((hotel, index) => ({
      rank: index + 1,
      hotelId: hotel.id,
      hotelName: hotel.name,
      style: hotel.style,
      roomCount: hotel.rooms.length,
      rating: hotel.rating,
      totalRevenue: hotel.totalRevenue,
    }))
    res.status(200).json({ success: true, data: ranking })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取客房数排名失败' })
  }
})

router.get('/all', async (_req: Request, res: Response): Promise<void> => {
  try {
    const revenuePlayers = getPlayersSortedByRevenue()
    const levelPlayers = getPlayersSortedByLevel()
    const hotels = getHotelsSortedByRooms()

    const revenueRanking = revenuePlayers.map((player, index) => {
      const hotel = getHotelByPlayerId(player.id)
      return {
        rank: index + 1,
        playerId: player.id,
        playerName: player.name,
        avatar: player.avatar,
        level: player.level,
        totalRevenue: hotel?.totalRevenue || 0,
      }
    })

    const levelRanking = levelPlayers.map((player, index) => ({
      rank: index + 1,
      playerId: player.id,
      playerName: player.name,
      avatar: player.avatar,
      level: player.level,
      exp: player.exp,
    }))

    const roomsRanking = hotels.map((hotel, index) => ({
      rank: index + 1,
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomCount: hotel.rooms.length,
      rating: hotel.rating,
    }))

    res.status(200).json({
      success: true,
      data: {
        revenue: revenueRanking,
        level: levelRanking,
        rooms: roomsRanking,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取所有排名失败' })
  }
})

export default router
