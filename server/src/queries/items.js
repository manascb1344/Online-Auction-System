const { auctionStatus } = require("./fragments");

const baseSelect = `
  SELECT i.id, i.seller_id, i.name, i.description, i.starting_price, i.category,
         i.image_url, i.created_at,
         s.username AS seller_username,
         a.id AS auction_id, a.start_time, a.end_time, ${auctionStatus} AS auction_status,
         a.reserve_price,
         (SELECT MAX(b.amount) FROM bids b WHERE b.item_id = i.id) AS current_bid,
         (SELECT COUNT(*) FROM bids b WHERE b.item_id = i.id) AS bid_count
  FROM items i
  JOIN sellers s ON s.id = i.seller_id
  JOIN auctions a ON a.item_id = i.id
`;

function list({ status, search } = {}) {
  const conditions = [];
  if (status) conditions.push(`(${auctionStatus}) = :status`);
  if (search) conditions.push("LOWER(i.name) LIKE :search");
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return `${baseSelect}
    ${where}
    ORDER BY a.end_time ASC, i.created_at DESC
    LIMIT :limit OFFSET :offset`;
}

module.exports = {
  list,
  findById: `${baseSelect} WHERE i.id = :id`,
  listBySeller: `${baseSelect} WHERE i.seller_id = :sellerId ORDER BY a.end_time ASC`,
  insert: `
    INSERT INTO items (id, seller_id, name, description, starting_price, category, image_url, created_at)
    VALUES (:id, :sellerId, :name, :description, :startingPrice, :category, :imageUrl, CURRENT_TIMESTAMP)
  `,
};
