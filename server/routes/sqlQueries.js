// Centralized SQL queries used by route handlers
module.exports = {
  GET_ITEMS_WITH_SELLER_AUCTION: `SELECT items.*, sellers.Username AS Seller_Username, sellers.Email AS Seller_Email, sellers.Address AS Seller_Address, sellers.Account_Balance AS Seller_Account_Balance, auctions.Auction_Status FROM items JOIN sellers ON items.Seller_ID = sellers.Seller_ID JOIN auctions ON items.Item_ID = auctions.Item_ID;`,

  GET_TRANSACTIONS_WITH_NAMES: `SELECT transactions.*, buyers.Username AS Buyer_Name, sellers.Username AS Seller_Name FROM transactions JOIN buyers ON transactions.Buyer_ID = buyers.Buyer_ID JOIN sellers ON transactions.Seller_ID = sellers.Seller_ID`,

  SELECT_ITEMS_BY_SELLER: `SELECT * FROM items WHERE seller_id = ?`,

  SELECT_SELLER_NAME_BY_ID: `SELECT name FROM sellers WHERE Seller_ID = ?`,

  SELECT_BUYER_BY_ID: `SELECT * FROM Buyers WHERE Buyer_ID = ?`,

  SELECT_TRANSACTIONS_BY_BUYER: `SELECT * FROM Transactions WHERE Buyer_ID = ?`,
  SELECT_BIDS_WITH_NAMES: `SELECT bids.*, buyers.Username AS Bidder_Name, items.Item_Name as Item FROM bids JOIN buyers ON bids.Bidder_ID = buyers.Buyer_ID JOIN items ON bids.Item_ID = items.Item_ID`,

  UPDATE_ITEM_LAST_BID: `UPDATE items SET Last_Bidder = ?, Last_Bid = ? WHERE Item_Name = ?`,

  GET_AUCTIONS_WITH_ITEMS: `SELECT auctions.*, items.Item_Name AS Item_Name, items.Description as Description FROM auctions JOIN items ON auctions.Item_ID = items.Item_ID`,

  SELECT_MAX_ITEM_ID: `SELECT MAX(Item_ID) AS maxItemID FROM Items`,

  INSERT_ITEM: `INSERT INTO Items (Seller_ID, Item_ID, Item_Name, Description, Starting_Price, Auction_End_Time, Category, Last_Bidder, Last_Bid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

  SELECT_MAX_AUCTION_ID: `SELECT MAX(Auction_ID) AS maxAuctionID FROM Auctions`,

  INSERT_AUCTION: `INSERT INTO Auctions (Auction_ID, Item_ID, Auction_Start_Time, Auction_End_Time, Auction_Status, Reserve_Price) VALUES (?, ?, ?, ?, ?, ?)`,

  // Dynamic query builders (used carefully)
  getUserByUsername: (tableName) => `SELECT * FROM ${tableName} WHERE Username = ?`,
};
