const auctionStatus = `CASE
  WHEN a.end_time <= CURRENT_TIMESTAMP THEN 'closed'
  WHEN a.start_time > CURRENT_TIMESTAMP THEN 'scheduled'
  ELSE 'active'
END`;

module.exports = { auctionStatus };
