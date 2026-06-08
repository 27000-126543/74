import { Router, type Request, type Response } from 'express'
import {
  getPlayerById,
  store,
} from '../data/store.js'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const allHotels = [...store.hotels]

    const hotelsWithPlayerInfo = allHotels.map(hotel => {
      const player = getPlayerById(hotel.playerId)
      return {
        playerId: hotel.playerId,
        playerName: player?.name || '',
        avatar: player?.avatar || '',
        hotelId: hotel.id,
        hotelName: hotel.name,
        rating: hotel.rating,
        totalRevenue: hotel.totalRevenue,
        roomCount: hotel.rooms.length,
      }
    })

    const ratingRanking = [...hotelsWithPlayerInfo]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 20)
      .map((item, index) => ({
        rank: index + 1,
        playerId: item.playerId,
        playerName: item.playerName,
        avatar: item.avatar,
        hotelId: item.hotelId,
        hotelName: item.hotelName,
        rating: item.rating,
      }))

    const revenueRanking = [...hotelsWithPlayerInfo]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 20)
      .map((item, index) => ({
        rank: index + 1,
        playerId: item.playerId,
        playerName: item.playerName,
        avatar: item.avatar,
        hotelId: item.hotelId,
        hotelName: item.hotelName,
        totalRevenue: item.totalRevenue,
      }))

    const roomsRanking = [...hotelsWithPlayerInfo]
      .sort((a, b) => b.roomCount - a.roomCount)
      .slice(0, 20)
      .map((item, index) => ({
        rank: index + 1,
        playerId: item.playerId,
        playerName: item.playerName,
        avatar: item.avatar,
        hotelId: item.hotelId,
        hotelName: item.hotelName,
        roomCount: item.roomCount,
      }))

    res.status(200).json({
      success: true,
      data: {
        rating: ratingRanking,
        revenue: revenueRanking,
        rooms: roomsRanking,
      },
      error: null,
    })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取排行榜失败' })
  }
})

export default router
