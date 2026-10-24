const baseSelect = `
  SELECT t.id, t.item_id, i.name AS item_name, t.buyer_id,
         bu.username AS buyer_username, t.seller_id, se.username AS seller_username,
         t.amount, t.status, t.payment_method, t.created_at
  FROM transactions t
  JOIN items i ON i.id = t.item_id
  JOIN buyers bu ON bu.id = t.buyer_id
  JOIN sellers se ON se.id = t.seller_id
`;

module.exports = {
  listAll: `${baseSelect} ORDER BY t.created_at DESC`,
  listByBuyer: `${baseSelect} WHERE t.buyer_id = :buyerId ORDER BY t.created_at DESC`,
};
