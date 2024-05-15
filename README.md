## How to run this project on your local computer

- Clone this project

- Run `npm install` in both folders to install all their dependencies.

- Start both servers using `npm start`


Make this look very good and responsive design must be modern use any design library or component libraries if you want





All triggers in use

1.
DELIMITER //
CREATE TRIGGER trg_unique_username
BEFORE INSERT ON Buyers
FOR EACH ROW
BEGIN
    DECLARE username_count INT;
    SELECT COUNT(*) INTO username_count FROM Buyers WHERE Username = NEW.Username;
    IF username_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username already exists in Buyers table';
    END IF;
END //

CREATE TRIGGER trg_unique_username_seller
BEFORE INSERT ON Sellers
FOR EACH ROW
BEGIN
    DECLARE username_count INT;
    SELECT COUNT(*) INTO username_count FROM Sellers WHERE Username = NEW.Username;
    IF username_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username already exists in Sellers table';
    END IF;
END //
DELIMITER ;


test
INSERT INTO Buyers (Buyer_ID, Username, Password, Email, Address, Account_Balance)  VALUES (99, 'raj_sharma', 'password123', 'raj@example.com', '123 Street', 1000.00);

INSERT INTO Sellers (Seller_ID, Username, Password, Email, Address, Account_Balance)  VALUES (99, 'fashion_hub', 'password456', 'fashion@example.com', '456 Avenue', 2000.00);


2.
DELIMITER //

CREATE TRIGGER set_last_bid_default BEFORE INSERT ON items
FOR EACH ROW
BEGIN
    IF NEW.Last_bid IS NULL THEN
        SET NEW.Last_bid = NEW.Starting_Price;
    END IF;
END//

DELIMITER ;



3.
DELIMITER //
CREATE TRIGGER trg_update_last_bid
AFTER INSERT ON Bids
FOR EACH ROW
BEGIN
    UPDATE Items
    SET Last_Bidder = NEW.Bidder_ID,
        Last_Bid = NEW.Bid_Amount
    WHERE Item_ID = NEW.Item_ID;
END //
DELIMITER ;


test
INSERT INTO Bids (Bid_ID, Bidder_ID, Item_ID, Bid_Amount, Bid_Time, Bid_Status, Bid_Increment) VALUES (123, 1, 19, 200.00, NOW(), 'Active', 0.00);

SELECT Last_Bidder, Last_Bid FROM Items WHERE Item_ID = 19;



4.
DELIMITER //
CREATE TRIGGER trg_update_buyer_balance
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
    DECLARE current_balance DECIMAL(10, 2);
    SELECT Account_Balance INTO current_balance FROM Buyers WHERE Buyer_ID = NEW.Buyer_ID;
    
    IF current_balance >= NEW.Transaction_Amount THEN
        UPDATE Buyers
        SET Account_Balance = current_balance - NEW.Transaction_Amount
        WHERE Buyer_ID = NEW.Buyer_ID;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance for the transaction';
    END IF;
END //
DELIMITER ;


Test
INSERT INTO Transactions (Transaction_ID, Buyer_ID, Seller_ID, Item_ID, Transaction_Amount, Transaction_Time, Payment_Method, Transaction_Status) VALUES (456, 1, 2, 19, 500.00, NOW(), 'Credit Card', 'Success');

SELECT Account_Balance FROM Buyers WHERE Buyer_ID = 1;

5.
DELIMITER //
CREATE TRIGGER trg_update_seller_balance
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
    UPDATE Sellers
    SET Account_Balance = Account_Balance + NEW.Transaction_Amount
    WHERE Seller_ID = NEW.Seller_ID;
END //
DELIMITER ;

Test
SELECT Account_Balance FROM Sellers WHERE Seller_ID = 2;



6.
DELIMITER //
CREATE TRIGGER after_auction_update_set_winning_bid_trigger
AFTER UPDATE ON Auctions
FOR EACH ROW
BEGIN
    DECLARE max_bid_id INT;
    DECLARE bidder_id INT;
    DECLARE winning_bid DECIMAL(10, 2); 
    
    IF NEW.Auction_Status = 'Closed' AND OLD.Auction_Status != 'Closed' THEN
        
        -- Selecting the highest bid amount for the item
        SELECT MAX(Bid_Amount) INTO winning_bid FROM Bids WHERE Item_ID = NEW.Item_ID;
        
        IF winning_bid IS NOT NULL THEN
            -- Selecting the maximum bid ID and incrementing it by 1 for the new bid
            SELECT COALESCE(MAX(Bid_ID), 0) + 1 INTO max_bid_id FROM Bids;
            
            -- Selecting the bidder ID associated with the highest bid
            SELECT Bidder_ID INTO bidder_id FROM Bids WHERE Item_ID = NEW.Item_ID AND Bid_Amount = winning_bid ORDER BY Bid_Time DESC LIMIT 1;
            
            -- Inserting the winning bid into the Bids table
            IF bidder_id IS NOT NULL THEN
                INSERT INTO Bids (Bid_ID, Bidder_ID, Item_ID, Bid_Amount, Bid_Time, Bid_Status, Bid_Increment)
                VALUES (max_bid_id, bidder_id, NEW.Item_ID, winning_bid, NOW(), 'Winning', 0);
            END IF;
        END IF;
    END IF;
END //
DELIMITER ;


test
UPDATE Auctions SET Auction_Status = 'Closed' WHERE Auction_ID = 24;
SELECT * FROM Bids WHERE Item_ID = (SELECT Item_ID FROM Auctions WHERE Auction_ID = 24) AND Bid_Status = 'Winning';


7.
DELIMITER //
CREATE TRIGGER end_auction_insert_transactions_trigger
BEFORE UPDATE ON Auctions
FOR EACH ROW
BEGIN
    DECLARE new_transaction_id INT;

    -- Check if the auction end time is in the past or now
    IF OLD.Auction_Status != 'Closed' AND NEW.Auction_Status = 'Closed' AND NEW.Auction_End_Time <= NOW() THEN
        -- Generate a new transaction ID by incrementing the maximum transaction ID
        SET new_transaction_id = (SELECT COALESCE(MAX(Transaction_ID), 0) + 1 FROM Transactions);

        -- Fetch the Last_Bidder and Last_Bid from the Items table based on the Item_ID associated with the auction
        SET @bidder_username := (SELECT Last_Bidder FROM Items WHERE Item_ID = NEW.Item_ID);
        SET @last_bid := (SELECT Last_Bid FROM Items WHERE Item_ID = NEW.Item_ID);

        -- Fetch the Buyer_ID using the bidder's username
        SET @buyer_id := (SELECT Buyer_ID FROM Buyers WHERE Username = @bidder_username);

        -- Insert a new transaction into the Transactions table
        INSERT INTO Transactions (Transaction_ID, Buyer_ID, Seller_ID, Item_ID, Transaction_Amount, Transaction_Time, Payment_Method, Transaction_Status)
        VALUES (
            new_transaction_id, -- New transaction ID
            @buyer_id, -- Buyer ID based on Last_Bidder
            (SELECT Seller_ID FROM Items WHERE Item_ID = NEW.Item_ID), -- Seller ID from the auction
            NEW.Item_ID, -- Item ID from the auction
            @last_bid, -- Last bid amount from the auction
            NOW(), -- Current timestamp
            'Online', -- Payment method (assuming online)
            'Completed' -- Transaction status (assuming completed)
        );

        -- Update the buyer's account balance by subtracting the last bid amount
        UPDATE Buyers
        SET Account_Balance = Account_Balance - @last_bid
        WHERE Buyer_ID = @buyer_id;
    END IF;
END //
DELIMITER ;


test
UPDATE Auctions 
SET Auction_Status = 'Closed' 
WHERE Auction_ID = 16

-- Check the latest transaction
SELECT * FROM Transactions ORDER BY Transaction_ID DESC LIMIT 1;

-- Check the buyer's account balance
SELECT * FROM Buyers WHERE Buyer_ID = <buyer_id>;





8.
DELIMITER $$
CREATE TRIGGER update_auction_status
BEFORE INSERT ON auctions
FOR EACH ROW
BEGIN
    IF NEW.Auction_End_Time <= NOW() THEN
        SET NEW.Auction_Status = 'Closed';
    END IF;
END$$
DELIMITER ;


test
-- Insert a new auction with Auction_End_Time set to a past time
INSERT INTO auctions (Auction_ID, Item_ID, Auction_Start_Time, Auction_End_Time, Auction_Status, Reserve_Price)
VALUES (99, 1, '2024-05-01 12:00:00', '2024-05-15 12:00:00', 'pen', 100.00);

-- Check the inserted auction
SELECT * FROM auctions WHERE Auction_ID = 99;


9.
DELIMITER $$
DROP TRIGGER IF EXISTS create_bid_entry_after_update $$
CREATE TRIGGER create_bid_entry_after_update
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    DECLARE bidder_id INT;
    DECLARE last_bid DECIMAL(10, 2);
    DECLARE bid_increment DECIMAL(10, 2);
    
    SET bidder_id = (SELECT Buyer_ID FROM buyers WHERE Username = NEW.Last_Bidder);
    
    SELECT Last_Bid INTO last_bid FROM items WHERE Item_ID = NEW.Item_ID;
    
    SET bid_increment = GREATEST(NEW.Last_Bid - COALESCE(last_bid, 0), 0);
    
    INSERT INTO bids (Bid_ID, Bidder_ID, Item_ID, Bid_Amount, Bid_Time, Bid_Status, Bid_Increment)
    SELECT COALESCE(MAX(Bid_ID), 0) + 1, bidder_id, NEW.Item_ID, NEW.Last_Bid, NOW(), 'Outbid', bid_increment FROM bids;
END$$
DELIMITER ;

test
-- Update the Last_Bid field of an item in the items table
UPDATE items SET Last_Bid = 150.00 WHERE Item_ID = 1;

-- This update will trigger the execution of the trigger create_bid_entry_after_update









Procedures



1.
DELIMITER //

CREATE PROCEDURE CalculateAverageTransaction(IN sellerID INT)
BEGIN
    DECLARE avgTransaction DECIMAL(10, 2);

    SELECT AVG(Transaction_Amount) INTO avgTransaction
    FROM Transactions
    WHERE Seller_ID = sellerID;

    SELECT avgTransaction;
END //

DELIMITER ;


test
CALL CalculateAverageTransaction(1); -- Replace 1 with the desired seller ID


2.
DELIMITER //

CREATE PROCEDURE CountBidsForItem(IN itemID INT)
BEGIN
    DECLARE bidCount INT;

    SELECT COUNT(*) INTO bidCount
    FROM Bids
    WHERE Item_ID = itemID;

    SELECT bidCount;
END //

DELIMITER ;


test
CALL CountBidsForItem(1); -- Replace 1 with the desired item ID



3.
DELIMITER //

CREATE FUNCTION FindMaxBidAmountForItem(itemID INT) RETURNS DECIMAL(10, 2)
BEGIN
    DECLARE maxBid DECIMAL(10, 2);

    SELECT MAX(Bid_Amount) INTO maxBid
    FROM Bids
    WHERE Item_ID = itemID;

    RETURN maxBid;
END //

DELIMITER ;

test
SELECT FindMaxBidAmountForItem(1); -- Replace 1 with the desired item ID



4.
DELIMITER //

CREATE PROCEDURE CalculateTotalSalesAmount(IN sellerID INT)
BEGIN
    DECLARE totalSales DECIMAL(10, 2);

    SELECT SUM(Transaction_Amount) INTO totalSales
    FROM Transactions
    WHERE Seller_ID = sellerID;

    SELECT totalSales;
END //

DELIMITER ;


test
CALL CalculateTotalSalesAmount(1); -- Replace 1 with the desired seller ID



5.
DELIMITER //

DROP PROCEDURE IF EXISTS CalculateAverageAuctionDuration;
DELIMITER //

CREATE PROCEDURE CalculateAverageAuctionDuration(IN category VARCHAR(50))
BEGIN
    DECLARE avgDuration DECIMAL(10, 2);

    SELECT AVG(TIMESTAMPDIFF(SECOND, Auctions.Auction_Start_Time, Auctions.Auction_End_Time)) INTO avgDuration
    FROM Auctions
    INNER JOIN Items ON Auctions.Item_ID = Items.Item_ID
    WHERE Items.Category = category;

    SELECT avgDuration;
END //

DELIMITER ;



test
CALL CalculateAverageAuctionDuration('Electronics'); -- Replace 'Electronics' with the desired category


6.
DELIMITER //

CREATE FUNCTION CountItemsSoldByBuyer(buyerID INT) RETURNS INT
BEGIN
    DECLARE itemCount INT;

    SELECT COUNT(*) INTO itemCount
    FROM Transactions
    WHERE Buyer_ID = buyerID;

    RETURN itemCount;
END //

DELIMITER ;


test
SELECT CountItemsSoldByBuyer(1); -- Replace 1 with the desired buyer ID






VIEW ALL TRIGGERS
SELECT
    TRIGGER_NAME,
    EVENT_OBJECT_TABLE
FROM
    INFORMATION_SCHEMA.TRIGGERS;

VIEW ALL PROCEDURES
SELECT 
  ROUTINE_SCHEMA,
  ROUTINE_NAME
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE';



-- Fetch all triggers in the database
SHOW TRIGGERS;

-- Fetch details of a specific trigger
SHOW CREATE TRIGGER trg_name;



-- Fetch all procedures in the database
SHOW PROCEDURES;

-- Fetch details of a specific procedure
SHOW CREATE PROCEDURE proc_name;
