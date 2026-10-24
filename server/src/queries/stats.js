module.exports = {
  summary: `
    SELECT
      (SELECT COUNT(*) FROM items) AS items,
      (SELECT COUNT(*) FROM auctions WHERE status = 'active') AS active_auctions,
      (SELECT COUNT(*) FROM bids) AS bids,
      (SELECT COUNT(*) FROM transactions) AS transactions,
      (SELECT COUNT(*) FROM buyers) AS buyers,
      (SELECT COUNT(*) FROM sellers) AS sellers
  `,
};
