import { Router, type Request, type Response } from 'express'
import {
  getAllPlayers,
  getAllHotels,
  getHotelByPlayerId,
  getPlayerById,
  type Player,
  type Hotel,
} from '../data/store.js'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const players = getAllPlayers()
    const hotels = getAllHotels()

    const playerHotelMap = new Map<string, { player: Player; hotel: Hotel | undefined }>()
    for (const player of players) {
      playerHotelMap.set(player.id, {
        player,
        hotel: getHotelByPlayerId(player.id),
      })
    }

    const withHotels = Array.from(playerHotelMap.values())
      .filter(item => item.hotel !== undefined)

    const ratingList = [...withHotels]
      .sort((a, b) => (b.hotel!.rating - a.hotel!.rating))
      .slice(0, 20)
      .map((item, index) => ({
        rank: index + 1,
        playerId: item.player.id,
        playerName: item.player.name,
        avatar: item.player.avatar,
        hotelId: item.hotel!.id,
        hotelName: item.hotel!.name,
        rating: item.hotel!.rating,
      }))

    const revenueList = [...withHotels]
      .sort((a, b) => (b.hotel!.totalRevenue - a.hotel!.totalRevenue))
      .slice(0, 20)
      .map((item, index) => ({
        rank: index + 1,
        playerId: item.player.id,
        playerName: item.player.name,
        avatar: item.player.avatar,
        hotelId: item.hotel!.id,
        hotelName: item.hotel!.name,
        totalRevenue: item.hotel!.totalRevenue,
      }))

    const roomsList = [...hotels]
      .sort((a, b) => b.rooms.length - a.rooms.length)
      .slice(0, 20)
      .map((hotel, index) => {
        const player = getPlayerById(hotel.playerId)
        return {
          rank: index + 1,
          playerId: hotel.playerId,
          playerName: player?.name || '',
          avatar: player?.avatar || '',
          hotelId: hotel.id,
          hotelName: hotel.name,
          roomCount: hotel.rooms.length,
        }
      })

    res.status(200).json({
      success: true,
      data: {
        rating: ratingList,
        revenue: revenueList,
        rooms: roomsList,
      },
      error: null,
    })
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: '获取排行榜失败' })
  }
})

export default router
