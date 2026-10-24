const asNumber = (value) => (value === null || value === undefined ? null : Number(value));

const asIso = (value) => {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

function toUser(row, role) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role,
    email: row.email ?? null,
    address: row.address ?? null,
    accountBalance: row.account_balance === undefined ? null : asNumber(row.account_balance),
    createdAt: asIso(row.created_at),
  };
}

function toItem(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    startingPrice: asNumber(row.starting_price),
    category: row.category ?? null,
    imageUrl: row.image_url ?? null,
    createdAt: asIso(row.created_at),
    seller: { id: row.seller_id, username: row.seller_username },
    auction: {
      id: row.auction_id,
      startTime: asIso(row.start_time),
      endTime: asIso(row.end_time),
      status: row.auction_status,
      reservePrice: asNumber(row.reserve_price),
    },
    currentBid: asNumber(row.current_bid),
    bidCount: row.bid_count === undefined ? 0 : Number(row.bid_count),
  };
}

function toBid(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name ?? null,
    bidderId: row.bidder_id,
    bidderUsername: row.bidder_username ?? null,
    amount: asNumber(row.amount),
    status: row.status,
    createdAt: asIso(row.created_at),
  };
}

function toAuction(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name ?? null,
    startTime: asIso(row.start_time),
    endTime: asIso(row.end_time),
    status: row.status,
    reservePrice: asNumber(row.reserve_price),
    currentBid: asNumber(row.current_bid),
  };
}

function toTransaction(row) {
  return {
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name ?? null,
    buyerId: row.buyer_id,
    buyerUsername: row.buyer_username ?? null,
    sellerId: row.seller_id,
    sellerUsername: row.seller_username ?? null,
    amount: asNumber(row.amount),
    status: row.status,
    paymentMethod: row.payment_method,
    createdAt: asIso(row.created_at),
  };
}

module.exports = { toUser, toItem, toBid, toAuction, toTransaction, asNumber, asIso };
