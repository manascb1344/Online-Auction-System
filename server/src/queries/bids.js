module.exports = {
  insert: `
    INSERT INTO bids (id, item_id, bidder_id, amount, status, created_at)
    VALUES (:id, :itemId, :bidderId, :amount, 'winning', CURRENT_TIMESTAMP)
  `,
  markPreviousOutbid:
    "UPDATE bids SET status = 'outbid' WHERE item_id = :itemId AND status = 'winning'",
  highestForItem: `
    SELECT amount, bidder_id FROM bids
    WHERE item_id = :itemId
    ORDER BY amount DESC, created_at ASC
    LIMIT 1
  `,
  findById: `
    SELECT b.id, b.item_id, b.bidder_id, b.amount, b.status, b.created_at,
           u.username AS bidder_username, i.name AS item_name
    FROM bids b
    JOIN buyers u ON u.id = b.bidder_id
    JOIN items i ON i.id = b.item_id
    WHERE b.id = :id
  `,
  listForItem: `
    SELECT b.id, b.item_id, b.bidder_id, b.amount, b.status, b.created_at,
           u.username AS bidder_username, i.name AS item_name
    FROM bids b
    JOIN buyers u ON u.id = b.bidder_id
    JOIN items i ON i.id = b.item_id
    WHERE b.item_id = :itemId
    ORDER BY b.amount DESC, b.created_at ASC
  `,
  listAll: `
    SELECT b.id, b.item_id, i.name AS item_name, b.bidder_id,
           u.username AS bidder_username, b.amount, b.status, b.created_at
    FROM bids b
    JOIN buyers u ON u.id = b.bidder_id
    JOIN items i ON i.id = b.item_id
    ORDER BY b.created_at DESC
    LIMIT :limit OFFSET :offset
  `,
  listByBidder: `
    SELECT b.id, b.item_id, i.name AS item_name, b.amount, b.status, b.created_at
    FROM bids b
    JOIN items i ON i.id = b.item_id
    WHERE b.bidder_id = :bidderId
    ORDER BY b.created_at DESC
  `,
};
