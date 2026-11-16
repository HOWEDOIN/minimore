type HoldItem = { variantId: number; quantity: number };
type HoldEntry = { items: HoldItem[]; expiresAt: number };
export type StockProduct = { id: number; stock_status: string; manage_stock: boolean; stock_quantity: number | null };

const DEFAULT_HOLD_MS = 10 * 60_000;
const holds = new Map<string, HoldEntry>();

function pruneExpired(now = Date.now()) {
  for (const [key, entry] of holds) {
    if (entry.expiresAt <= now) holds.delete(key);
  }
}

// ponytail: process-local 10-min TTL stock reservation; move to Redis/DB if running multiple app instances.
export function getHeldQuantity(productId: number, now = Date.now()): number {
  pruneExpired(now);
  let total = 0;
  for (const entry of holds.values()) {
    for (const item of entry.items) {
      if (item.variantId === productId) total += item.quantity;
    }
  }
  return total;
}

export function tryReserveStock(
  holdKey: string,
  cartItems: Array<{ variantId: string | number; quantity: number }>,
  products: StockProduct[],
  ttlMs = DEFAULT_HOLD_MS,
  now = Date.now()
): boolean {
  pruneExpired(now);
  const productMap = new Map<number, StockProduct>(products.map((p) => [p.id, p]));
  const available = cartItems.every((item) => {
    const product = productMap.get(Number(item.variantId));
    if (!product || product.stock_status !== "instock") return false;
    if (!product.manage_stock) return true;
    const remaining = (product.stock_quantity ?? 0) - getHeldQuantity(product.id, now);
    return remaining >= item.quantity;
  });
  if (!available) return false;
  holds.set(holdKey, {
    items: cartItems.map((i) => ({ variantId: Number(i.variantId), quantity: i.quantity })),
    expiresAt: now + ttlMs,
  });
  return true;
}

export function rekeyStockHold(oldKey: string, newKey: string) {
  const entry = holds.get(oldKey);
  if (!entry) return;
  holds.delete(oldKey);
  holds.set(newKey, entry);
}

export function releaseStockHold(holdKey: string) {
  holds.delete(holdKey);
}

export function clearAllStockHolds() {
  holds.clear();
}
