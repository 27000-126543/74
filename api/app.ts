/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import hotelRoutes from './routes/hotel.js'
import staffRoutes from './routes/staff.js'
import guestsRoutes from './routes/operations.js'
import eventsRoutes from './routes/events.js'
import partiesRoutes from './routes/parties.js'
import marketRoutes from './routes/market.js'
import guildRoutes from './routes/guild.js'
import analyticsRoutes from './routes/analytics.js'
import leaderboardRoutes from './routes/leaderboard.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/hotels', hotelRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/guests', guestsRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/parties', partiesRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/guilds', guildRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
