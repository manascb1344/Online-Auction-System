module.exports = {
  insert: `
    INSERT INTO auctions (id, item_id, start_time, end_time, status, reserve_price, created_at)
    VALUES (:id, :itemId, :startTime, :endTime, :status, :reservePrice, CURRENT_TIMESTAMP)
  `,
  findByItem:
    "SELECT id, item_id, start_time, end_time, status, reserve_price FROM auctions WHERE item_id = :itemId",
  findByItemForUpdate:
    "SELECT id, item_id, start_time, end_time, status, reserve_price FROM auctions WHERE item_id = :itemId FOR UPDATE",
  listAll: `
    SELECT a.id, a.item_id, i.name AS item_name, a.start_time, a.end_time, a.status,
           a.reserve_price,
           (SELECT MAX(b.amount) FROM bids b WHERE b.item_id = a.item_id) AS current_bid
    FROM auctions a
    JOIN items i ON i.id = a.item_id
    ORDER BY a.end_time DESC
  `,
  closeExpired: "UPDATE auctions SET status = 'closed' WHERE status <> 'closed' AND end_time <= CURRENT_TIMESTAMP",
};
