import { Router, type Request, type Response } from 'express'
import {
  getMarketListingById,
  getMarketListings,
  addMarketListing,
  deleteMarketListing,
  getPriceHistory,
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

router.get('/price-suggestion', async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemType, itemName, itemRarity } = req.query
    if (!itemName || !itemRarity) {
      res.status(400).json({ success: false, error: '缺少必要参数' })
      return
    }
    const suggested = getSuggestedPrice(itemName as string, itemRarity as string)
    const history = getPriceHistory(itemName as string)
    res.status(200).json({ success: true, data: { ...suggested, history } })
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

router.post('/listings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sellerId, sellerName, itemType, itemName, itemRarity, price, durationDays } = req.body
    const result = publishListing(sellerId, sellerName, itemType, itemName, itemRarity, price, durationDays)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    res.status(201).json({ success: true, data: result.listing })
  } catch (error) {
    res.status(500).json({ success: false, error: '发布商品失败' })
  }
})

router.post('/listings/:listingId/buy', async (req: Request, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params
    const { buyerId } = req.body
    const result = purchaseListing(listingId, buyerId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    res.status(200).json({ success: true, data: result.listing })
  } catch (error) {
    res.status(500).json({ success: false, error: '购买商品失败' })
  }
})

router.delete('/listings/:listingId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params
    const { sellerId } = req.body
    const result = cancelListing(listingId, sellerId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: '取消上架失败' })
  }
})

export default router
