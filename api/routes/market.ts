import { Router, type Request, type Response } from 'express'
import {
  getMarketListingById,
} from '../data/store.js'
import {
  publishListing,
  purchaseListing,
  cancelListing,
  getFilteredListings,
  getSuggestedPrice,
} from '../services/marketService.js'

const router = Router()

router.get('/listings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemType, itemRarity, minPrice, maxPrice } = req.query
    const listings = getFilteredListings({
      itemType: itemType as string,
      itemRarity: itemRarity as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    })
    res.status(200).json({ success: true, data: listings })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取商品列表失败' })
  }
})

router.post('/listings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sellerId, sellerName, itemType, itemName, itemRarity, price } = req.body

    if (!sellerId || !sellerName || !itemType || !itemName || !itemRarity || price === undefined) {
      res.status(400).json({ success: false, error: '缺少必要参数' })
      return
    }

    const result = publishListing(sellerId, sellerName, itemType, itemName, itemRarity, price)
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

    if (!buyerId) {
      res.status(400).json({ success: false, error: '缺少买家ID' })
      return
    }

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

    const listing = getMarketListingById(listingId)
    if (!listing) {
      res.status(404).json({ success: false, error: '商品不存在' })
      return
    }

    const result = cancelListing(listingId, listing.sellerId)
    if (!result.success) {
      res.status(400).json({ success: false, error: result.message })
      return
    }
    res.status(200).json({ success: true, data: null })
  } catch (error) {
    res.status(500).json({ success: false, error: '取消上架失败' })
  }
})

router.get('/price-suggestion', async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemType, itemRarity } = req.query
    if (!itemType || !itemRarity) {
      res.status(400).json({ success: false, error: '缺少必要参数' })
      return
    }
    const suggested = getSuggestedPrice(itemType as string, itemRarity as string)
    res.status(200).json({ success: true, data: suggested })
  } catch (error) {
    res.status(500).json({ success: false, error: '获取建议价格失败' })
  }
})

export default router
