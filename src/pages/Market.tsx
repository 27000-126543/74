import { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { BLUEPRINT_ITEMS, INGREDIENT_ITEMS, RARITY_CONFIG } from '../../shared/config';
import {
  ShoppingCart,
  Tag,
  Filter,
  Plus,
  Megaphone,
  TrendingUp,
  Package,
  Sparkles,
  Crown,
  Star,
  Diamond,
  CircleDot,
  ArrowRightLeft,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ItemType, ItemRarity } from 'shared/types';
import { cn } from '@/lib/utils';

const TYPE_FILTERS: { key: 'all' | ItemType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'blueprint', label: '蓝图' },
  { key: 'ingredient', label: '食材' },
];

const RARITY_FILTERS: { key: 'all' | ItemRarity; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'common', label: '普通' },
  { key: 'rare', label: '稀有' },
  { key: 'epic', label: '史诗' },
  { key: 'legendary', label: '传说' },
];

const RARITY_ICONS: Record<ItemRarity, typeof CircleDot> = {
  common: CircleDot,
  rare: Star,
  epic: Diamond,
  legendary: Crown,
};

const ANNOUNCEMENTS = [
  '🎉 恭喜玩家「奢华酒店大亨」以 ¥280,000 成交【总统套房蓝图】！',
  '⚡ 传说级【西班牙藏红花】刚刚上架，仅售 ¥98,000！',
  '🏆 本周交易额突破 ¥5,000,000，感谢各位玩家支持！',
  '💎 史诗级【意大利黑松露】以 ¥65,000 高价成交！',
];

export default function Market() {
  const { marketListings, createListing, buyItem, player, priceHistory, fetchPriceHistory, loading } = useGameStore();
  const { calculateMarketPriceSuggestion } = useGameEngine();

  const [typeFilter, setTypeFilter] = useState<'all' | ItemType>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | ItemRarity>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListing, setNewListing] = useState({
    itemType: 'blueprint' as ItemType,
    itemName: '',
    itemRarity: 'common' as ItemRarity,
    price: 1000,
  });

  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  const filteredListings = useMemo(() => {
    return marketListings.filter((listing) => {
      if (typeFilter !== 'all' && listing.itemType !== typeFilter) return false;
      if (rarityFilter !== 'all' && listing.itemRarity !== rarityFilter) return false;
      return true;
    });
  }, [marketListings, typeFilter, rarityFilter]);

  const priceHistoryData = useMemo(() => {
    if (priceHistory && priceHistory.length > 0) {
      return priceHistory;
    }
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days.map((day, i) => ({
      day,
      蓝图: 45000 + Math.sin(i) * 8000 + Math.random() * 5000,
      食材: 15000 + Math.cos(i) * 3000 + Math.random() * 2000,
    }));
  }, [priceHistory]);

  const availableItems =
    newListing.itemType === 'blueprint' ? BLUEPRINT_ITEMS : INGREDIENT_ITEMS;

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.itemName) return;

    await createListing({
      itemType: newListing.itemType,
      itemName: newListing.itemName,
      itemRarity: newListing.itemRarity,
      price: newListing.price,
    });

    setNewListing({ itemType: 'blueprint', itemName: '', itemRarity: 'common', price: 1000 });
    setShowCreateForm(false);
  };

  const suggestion = calculateMarketPriceSuggestion(
    newListing.itemRarity,
    newListing.itemType
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-gold">交易市场</h1>
          <p className="mt-1 text-navy-200">买卖蓝图与珍稀食材</p>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
          <Plus className="mr-2 inline h-4 w-4" />
          发布商品
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-3 bg-gradient-to-r from-wine-500/30 via-gold-500/20 to-emerald-500/30 px-6 py-3">
          <Megaphone className="h-5 w-5 flex-shrink-0 text-gold-400" />
          <div className="relative flex-1 overflow-hidden">
            <div className="animate-[slide-in_0.3s_ease-out] whitespace-nowrap text-sm text-white">
              {ANNOUNCEMENTS.map((msg, i) => (
                <span key={i} className="mx-8">
                  {msg}
                </span>
              ))}
            </div>
          </div>
          <ArrowRightLeft className="h-5 w-5 flex-shrink-0 text-gold-400" />
        </div>
      </div>

      {showCreateForm && (
        <div className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
            <Plus className="h-5 w-5 text-gold-400" />
            发布新商品
          </h2>
          <form onSubmit={handleCreateListing} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-navy-200">商品类型</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['blueprint', 'ingredient'] as ItemType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setNewListing({
                          ...newListing,
                          itemType: type,
                          itemName: '',
                          itemRarity: 'common',
                        });
                        setTypeFilter('all');
                      }}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-xl border p-3 transition-all',
                        newListing.itemType === type
                          ? 'border-gold-400/60 bg-gold-500/10'
                          : 'border-gold-500/20 bg-navy-800/40 hover:border-gold-500/40'
                      )}
                    >
                      {type === 'blueprint' ? (
                        <Sparkles className="h-4 w-4 text-purple-400" />
                      ) : (
                        <Package className="h-4 w-4 text-emerald-400" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {type === 'blueprint' ? '蓝图' : '食材'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-navy-200">选择商品</label>
                <select
                  className="input-field"
                  value={newListing.itemName}
                  onChange={(e) => {
                    const item = availableItems.find((i) => i.name === e.target.value);
                    setNewListing({
                      ...newListing,
                      itemName: e.target.value,
                      itemRarity: item?.rarity || 'common',
                    });
                  }}
                >
                  <option value="">请选择商品</option>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {newListing.itemName && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-navy-200">稀有度</label>
                  <div className="flex flex-wrap gap-2">
                    {(['common', 'rare', 'epic', 'legendary'] as ItemRarity[]).map((rarity) => {
                      const RarityIcon = RARITY_ICONS[rarity];
                      const config = RARITY_CONFIG[rarity];
                      return (
                        <button
                          key={rarity}
                          type="button"
                          onClick={() => setNewListing({ ...newListing, itemRarity: rarity })}
                          className={cn(
                            'flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all',
                            newListing.itemRarity === rarity
                              ? 'border-opacity-100 bg-opacity-20'
                              : 'border-opacity-30 hover:border-opacity-60'
                          )}
                          style={{
                            borderColor: config.color,
                            backgroundColor:
                              newListing.itemRarity === rarity ? `${config.color}20` : 'transparent',
                            color: config.color,
                          }}
                        >
                          <RarityIcon className="h-4 w-4" />
                          {config.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-navy-200">
                    售价 (¥)
                    <span className="ml-2 text-xs text-navy-300">
                      建议区间: ¥{suggestion.min.toLocaleString()} - ¥{suggestion.max.toLocaleString()}
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min={100}
                    step={100}
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: Number(e.target.value) })}
                  />
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-gold-400" />
                    <span className="text-navy-200">建议价格: </span>
                    <span className="font-medium text-gold-400">
                      ¥{suggestion.suggested.toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                <Plus className="mr-2 inline h-4 w-4" />
                确认发布
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          近7天成交均价
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D4465" />
              <XAxis dataKey="day" stroke="#7A91B0" fontSize={12} />
              <YAxis stroke="#7A91B0" fontSize={12} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141B27',
                  border: '1px solid #C9A96233',
                  borderRadius: '12px',
                  color: '#F0F3F7',
                }}
                formatter={(value: number) => [`¥${value.toLocaleString()}`, '']}
              />
              <Line
                type="monotone"
                dataKey="蓝图"
                stroke="#9B59B6"
                strokeWidth={2}
                dot={{ fill: '#9B59B6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="食材"
                stroke="#2ECC71"
                strokeWidth={2}
                dot={{ fill: '#2ECC71', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-white">
            <ShoppingCart className="h-5 w-5 text-gold-400" />
            商品列表
            <span className="badge-gold">{filteredListings.length}件</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-navy-300" />
              <span className="text-sm text-navy-200">类型:</span>
              <div className="flex gap-1">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTypeFilter(f.key)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm transition-all',
                      typeFilter === f.key
                        ? 'bg-gold-500/20 text-gold-300'
                        : 'text-navy-200 hover:bg-navy-600/50'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-navy-200">稀有度:</span>
              <div className="flex gap-1">
                {RARITY_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRarityFilter(f.key)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm transition-all',
                      rarityFilter === f.key
                        ? 'bg-gold-500/20 text-gold-300'
                        : 'text-navy-200 hover:bg-navy-600/50'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => {
            const rarityConfig = RARITY_CONFIG[listing.itemRarity];
            const RarityIcon = RARITY_ICONS[listing.itemRarity];
            const isSeller = player?.id === listing.sellerId;

            return (
              <div
                key={listing.id}
                className="group rounded-xl border border-gold-500/20 bg-navy-800/40 p-4 transition-all hover:border-gold-400/40 hover:shadow-luxury"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {listing.itemType === 'blueprint' ? (
                      <Sparkles className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Package className="h-5 w-5 text-emerald-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{listing.itemName}</h3>
                      <p className="text-xs text-navy-300">卖家: {listing.sellerName}</p>
                    </div>
                  </div>
                  <span
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${rarityConfig.color}20`,
                      color: rarityConfig.color,
                      border: `1px solid ${rarityConfig.color}40`,
                    }}
                  >
                    <RarityIcon className="h-3 w-3" />
                    {rarityConfig.name}
                  </span>
                </div>

                <div className="mb-3 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-navy-300">当前价格</span>
                    <span className="font-display text-lg font-bold text-gold-400">
                      ¥{listing.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy-400">建议区间</span>
                    <span className="text-navy-300">
                      ¥{listing.suggestedPriceMin.toLocaleString()} - ¥
                      {listing.suggestedPriceMax.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isSeller && (
                  <button
                    onClick={() => buyItem(listing.id)}
                    disabled={!player || (player.coins || 0) < listing.price}
                    className="btn-primary w-full !py-2 text-sm"
                  >
                    <ShoppingCart className="mr-2 inline h-4 w-4" />
                    购买
                  </button>
                )}
                {isSeller && (
                  <div className="text-center text-sm text-navy-400">您发布的商品</div>
                )}
              </div>
            );
          })}
        </div>

        {filteredListings.length === 0 && (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-navy-400" />
            <p className="text-navy-300">暂无符合条件的商品</p>
          </div>
        )}
      </div>
    </div>
  );
}
