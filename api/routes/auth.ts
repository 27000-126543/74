import { Router, type Request, type Response } from 'express'
import { getPlayerById } from '../data/store.js'

const router = Router()

const players: { id: string; name: string; avatar: string; coins: number; level: number; exp: number; createdAt: Date }[] = []

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body

  if (!name || typeof name !== 'string') {
    res.status(400).json({
      success: false,
      error: '请输入有效的昵称',
    })
    return
  }

  let player = players.find(p => p.name === name.trim())

  if (!player) {
    const avatars = ['👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🍳', '👩‍🍳', '🧑‍🎨', '👨‍🎤', '👩‍🎤']
    const newPlayer = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      coins: 100000,
      level: 1,
      exp: 0,
      createdAt: new Date(),
    }
    players.push(newPlayer)
    player = newPlayer
  }

  res.json({
    success: true,
    data: player,
  })
})

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: '已退出登录',
  })
})

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const playerId = req.headers['x-player-id'] as string

  if (!playerId) {
    res.status(401).json({
      success: false,
      error: '未登录',
    })
    return
  }

  let player = getPlayerById(playerId)

  if (!player) {
    player = players.find(p => p.id === playerId)
  }

  if (!player) {
    res.status(404).json({
      success: false,
      error: '玩家不存在',
    })
    return
  }

  res.json({
    success: true,
    data: player,
  })
})

export default router
