const { auctionStatus } = require("./fragments");

module.exports = {
  insert: `
    INSERT INTO auctions (id, item_id, start_time, end_time, status, reserve_price, created_at)
    VALUES (:id, :itemId, :startTime, :endTime, :status, :reservePrice, CURRENT_TIMESTAMP)
  `,
  findByItemForUpdate:
    "SELECT id, item_id, start_time, end_time, status, reserve_price FROM auctions WHERE item_id = :itemId FOR UPDATE",
  listAll: `
    SELECT a.id, a.item_id, i.name AS item_name, a.start_time, a.end_time,
           ${auctionStatus} AS status, a.reserve_price,
           (SELECT MAX(b.amount) FROM bids b WHERE b.item_id = a.item_id) AS current_bid
    FROM auctions a
    JOIN items i ON i.id = a.item_id
    ORDER BY a.end_time DESC
  `,
  setStatus: "UPDATE auctions SET status = :status WHERE id = :id",
  countActive:
    "SELECT COUNT(*) AS total FROM auctions WHERE start_time <= CURRENT_TIMESTAMP AND end_time > CURRENT_TIMESTAMP",
};
