import { Router, type Request, type Response } from 'express'
import {
  getMarketListingById,
  getMarketListings,
  addMarketListing,
  deleteMarketListing,
  getPriceHistory,
  addPriceRecord,
  updatePlayer,
  getPlayerById,
  store,
} from '../data/store.js'
import {
  publishListing,
  purchaseListing,
  cancelListing,
  getFilteredListings,
  getSellerListings,
  getSuggestedPrice,
  getMarketStats,
} from '../services/marketService.js'

const router = Router()

router.get('/listings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemType, itemRarity, minPrice, maxPrice, sortBy } = req.query
    const listings = getFilteredListings({
      itemType: itemType as string,
      itemRarity: itemRarity as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy as any,
    })
    res.status(200).json({ success: true, data: listings })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取市场列表失败' })
  }
})

router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = getMarketStats()
    res.status(200).json({ success: true, data: stats })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取市场统计失败' })
  }
})

router.get('/price-history', async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemName, itemType } = req.query
    const days = 7
    const cutoff = new Date(Date.now() - days * 86400000)

    let records = store.priceHistory.filter(p => p.date >= cutoff)

    if (itemName) {
      records = records.filter(p => p.itemName === itemName)
    }

    const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const result: any[] = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const dayIdx = (d.getDay() + 6) % 7
      const nextDay = new Date(d)
      nextDay.setDate(nextDay.getDate() + 1)

      const dayRecords = records.filter(r => r.date >= d && r.date < nextDay)
      const blueprintAvg = avg(dayRecords.filter(r => isBlueprint(r.itemName)).map(r => r.price))
      const ingredientAvg = avg(dayRecords.filter(r => !isBlueprint(r.itemName)).map(r => r.price))

      result.push({
        day: dayLabels[dayIdx],
        蓝图: blueprintAvg,
        食材: ingredientAvg,
      })
    }

    const fallback = [
      { day: '周一', 蓝图: 68000, 食材: 14000 },
      { day: '周二', 蓝图: 72000, 食材: 15200 },
      { day: '周三', 蓝图: 69500, 食材: 14800 },
      { day: '周四', 蓝图: 74000, 食材: 16500 },
      { day: '周五', 蓝图: 78000, 食材: 17200 },
      { day: '周六', 蓝图: 82000, 食材: 18000 },
      { day: '周日', 蓝图: 76000, 食材: 15800 },
    ]
    const merged = result.map((r, i) => ({
      day: r.day,
      蓝图: r.蓝图 || fallback[i].蓝图,
      食材: r.食材 || fallback[i].食材,
    }))

    res.status(200).json({ success: true, data: merged })

    function avg(arr: number[]) {
      return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
    }
    function isBlueprint(name: string) {
      return name.includes('蓝图')
    }
  } catch (error) {
    res.status(500).json({ success: false, error: '获取价格历史失败' })
  }
})

router.get('/price-suggestion', async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemType, itemName, itemRarity } = req.query
    if (!itemName) {
      res.status(200).json({ success: true, data: { min: 100, max: 10000, suggested: 2000, avg: 2000, average: 2000, history: [] } })
      return
    }
    const rarity = (itemRarity as string) || 'common'
    const suggested = getSuggestedPrice(itemName as string, rarity)
    const history = getPriceHistory(itemName as string)
    res.status(200).json({ success: true, data: { ...suggested, suggested: suggested.average, avg: suggested.average, history } })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取建议价格失败' })
  }
})

router.get('/suggested-price', async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemType, itemName, itemRarity } = req.query
    if (!itemName) {
      res.status(200).json({ success: true, data: { min: 100, max: 10000, suggested: 2000, avg: 2000, average: 2000, history: [] } })
      return
    }
    const rarity = (itemRarity as string) || 'common'
    const suggested = getSuggestedPrice(itemName as string, rarity)
    const history = getPriceHistory(itemName as string)
    res.status(200).json({ success: true, data: { ...suggested, suggested: suggested.average, avg: suggested.average, history } })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取建议价格失败' })
  }
})

router.get('/seller/:sellerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sellerId } = req.params
    const listings = getSellerListings(sellerId)
    res.status(200).json({ success: true, data: listings })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取卖家列表失败' })
  }
})

router.post('/listings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sellerId, sellerName, itemType, itemName, itemRarity, price, durationDays } = req.body
    const result = publishListing(sellerId, sellerName, itemType, itemName, itemRarity, price, durationDays)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    addPriceRecord(itemName, price)
    res.status(201).json({ success: true, data: result.listing })
  } catch (error) {
    res.status(500).json({ success: false, error: '发布商品失败' })
  }
})

router.get('/listings/:listingId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params
    const listing = getMarketListingById(listingId)
    if (!listing) {
      res.status(404).json({ success: false, error: '商品不存在' })
      return
    }
    res.status(200).json({ success: true, data: listing })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取商品详情失败' })
  }
})

router.post('/listings/:listingId/buy', async (req: Request, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params
    const { buyerId } = req.body
    const listing = getMarketListingById(listingId)
    if (!listing) {
      res.status(404).json({ success: false, error: '商品不存在' })
      return
    }
    const buyer = getPlayerById(buyerId)
    if (!buyer) {
      res.status(404).json({ success: false, error: '买家不存在' })
      return
    }
    if (buyer.coins < listing.price) {
      res.status(400).json({ success: false, error: '金币不足' })
      return
    }
    const seller = getPlayerById(listing.sellerId)
    const updatedBuyer = updatePlayer(buyerId, { coins: buyer.coins - listing.price })
    let sellerCoins = seller ? seller.coins + listing.price : listing.price
    if (seller) {
      updatePlayer(listing.sellerId, { coins: seller.coins + listing.price })
    }
    addPriceRecord(listing.itemName, listing.price)
    deleteMarketListing(listingId)
    res.status(200).json({
      success: true,
      data: {
        listing,
        buyerCoins: updatedBuyer ? updatedBuyer.coins : buyer.coins - listing.price,
        sellerCoins,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: '购买商品失败' })
  }
})

router.delete('/listings/:listingId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params
    const sellerId = req.body.sellerId || req.query.sellerId
    const listing = getMarketListingById(listingId)
    if (!listing) {
      res.status(404).json({ success: false, error: '商品不存在' })
      return
    }
    if (listing.sellerId !== sellerId) {
      res.status(403).json({ success: false, error: '无权删除该商品' })
      return
    }
    deleteMarketListing(listingId)
    res.status(200).json({ success: true, data: { removed: true } })
  } catch (error) {
    res.status(500).json({ success: false, error: '取消上架失败' })
  }
})

export default router
