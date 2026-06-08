import {
  type MarketListing,
  getMarketListings,
  getMarketListingById,
  addMarketListing,
  removeMarketListing,
  getPriceHistory,
  addPriceRecord,
  getPlayerById,
  updatePlayer,
} from '../data/store.js'

const RARITY_BASE_PRICE: Record<string, number> = {
  common: 100,
  rare: 1000,
  epic: 5000,
  legendary: 20000,
}

export const getSuggestedPrice = (itemName: string, itemRarity: string): { min: number; max: number; avg: number; history: number[] } => {
  const history = getPriceHistory(itemName, 7)
  const basePrice = RARITY_BASE_PRICE[itemRarity] || 500

  if (history.length === 0) {
    return {
      min: Math.round(basePrice * 0.8),
      max: Math.round(basePrice * 1.2),
      avg: basePrice,
      history: [],
    }
  }

  const sum = history.reduce((a, b) => a + b, 0)
  const avg = Math.round(sum / history.length)

  const min = Math.round(avg * 0.85)
  const max = Math.round(avg * 1.15)

  return { min, max, avg, history }
}

export const publishListing = (
  sellerId: string,
  sellerName: string,
  itemType: 'blueprint' | 'ingredient',
  itemName: string,
  itemRarity: 'common' | 'rare' | 'epic' | 'legendary',
  price: number,
  durationDays: number = 3
): { success: boolean; listing?: MarketListing; message?: string } => {
  const seller = getPlayerById(sellerId)
  if (!seller) return { success: false, message: '卖家不存在' }

  const suggested = getSuggestedPrice(itemName, itemRarity)
  if (price < suggested.min * 0.5) {
    return { success: false, message: '定价过低，建议不低于 ' + Math.round(suggested.min * 0.5) }
  }
  if (price > suggested.max * 2) {
    return { success: false, message: '定价过高，建议不高于 ' + Math.round(suggested.max * 2) }
  }

  const listing = addMarketListing({
    sellerId,
    sellerName,
    itemType,
    itemName,
    itemRarity,
    price,
    suggestedPriceMin: suggested.min,
    suggestedPriceMax: suggested.max,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + durationDays * 86400000),
  })

  return { success: true, listing }
}

export const purchaseListing = (
  listingId: string,
  buyerId: string
): { success: boolean; message?: string; listing?: MarketListing } => {
  const listing = getMarketListingById(listingId)
  if (!listing) return { success: false, message: '商品不存在' }

  if (listing.sellerId === buyerId) {
    return { success: false, message: '不能购买自己的商品' }
  }

  const now = new Date()
  if (now > listing.expiresAt) {
    removeMarketListing(listingId)
    return { success: false, message: '商品已过期' }
  }

  const buyer = getPlayerById(buyerId)
  if (!buyer) return { success: false, message: '买家不存在' }

  if (buyer.coins < listing.price) {
    return { success: false, message: '金币不足' }
  }

  const seller = getPlayerById(listing.sellerId)
  if (seller) {
    const fee = Math.round(listing.price * 0.05)
    updatePlayer(listing.sellerId, { coins: seller.coins + listing.price - fee })
  }

  updatePlayer(buyerId, { coins: buyer.coins - listing.price })

  addPriceRecord(listing.itemName, listing.price)

  removeMarketListing(listingId)

  return { success: true, listing }
}

export const cancelListing = (
  listingId: string,
  sellerId: string
): { success: boolean; message?: string } => {
  const listing = getMarketListingById(listingId)
  if (!listing) return { success: false, message: '商品不存在' }

  if (listing.sellerId !== sellerId) {
    return { success: false, message: '只有卖家可以取消上架' }
  }

  removeMarketListing(listingId)
  return { success: true }
}

export const getFilteredListings = (
  filters?: {
    itemType?: string
    itemRarity?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'expiring'
  }
): MarketListing[] => {
  let listings = getMarketListings()

  const now = new Date()
  listings = listings.filter(l => l.expiresAt > now)

  if (filters?.itemType) {
    listings = listings.filter(l => l.itemType === filters.itemType)
  }

  if (filters?.itemRarity) {
    listings = listings.filter(l => l.itemRarity === filters.itemRarity)
  }

  if (filters?.minPrice !== undefined) {
    listings = listings.filter(l => l.price >= filters.minPrice!)
  }

  if (filters?.maxPrice !== undefined) {
    listings = listings.filter(l => l.price <= filters.maxPrice!)
  }

  switch (filters?.sortBy) {
    case 'price_asc':
      listings.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      listings.sort((a, b) => b.price - a.price)
      break
    case 'newest':
      listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      break
    case 'expiring':
      listings.sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime())
      break
    default:
      listings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  return listings
}

export const getSellerListings = (sellerId: string): MarketListing[] => {
  return getMarketListings().filter(l => l.sellerId === sellerId)
}

export const getMarketStats = (): {
  totalListings: number
  avgPriceByRarity: Record<string, number>
  recentTransactions: number
} => {
  const listings = getMarketListings()
  const now = new Date()
  const activeListings = listings.filter(l => l.expiresAt > now)

  const rarityPrices: Record<string, number[]> = {}
  for (const listing of activeListings) {
    if (!rarityPrices[listing.itemRarity]) {
      rarityPrices[listing.itemRarity] = []
    }
    rarityPrices[listing.itemRarity].push(listing.price)
  }

  const avgPriceByRarity: Record<string, number> = {}
  for (const [rarity, prices] of Object.entries(rarityPrices)) {
    avgPriceByRarity[rarity] = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  }

  return {
    totalListings: activeListings.length,
    avgPriceByRarity,
    recentTransactions: Math.floor(Math.random() * 50) + 10,
  }
}
