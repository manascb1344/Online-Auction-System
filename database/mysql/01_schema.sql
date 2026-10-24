-- Online Auction System - MySQL 8.0 schema
-- Application SQL lives in server/src/queries and is shared by both dialects.
-- This file records only the storage-level differences (types, engine, indexes).

CREATE TABLE admins (
    id CHAR(36) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admins_username (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE buyers (
    id CHAR(36) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL,
    address VARCHAR(255) NULL,
    account_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_buyers_username (username),
    UNIQUE KEY uq_buyers_email (email),
    CONSTRAINT chk_buyers_balance CHECK (account_balance >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE sellers (
    id CHAR(36) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL,
    address VARCHAR(255) NULL,
    account_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_sellers_username (username),
    UNIQUE KEY uq_sellers_email (email),
    CONSTRAINT chk_sellers_balance CHECK (account_balance >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE items (
    id CHAR(36) NOT NULL,
    seller_id CHAR(36) NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT NULL,
    starting_price DECIMAL(12, 2) NOT NULL,
    category VARCHAR(60) NULL,
    image_url VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_items_seller (seller_id),
    CONSTRAINT fk_items_seller FOREIGN KEY (seller_id) REFERENCES sellers (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_items_starting_price CHECK (starting_price >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE auctions (
    id CHAR(36) NOT NULL,
    item_id CHAR(36) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    reserve_price DECIMAL(12, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_auctions_item (item_id),
    KEY idx_auctions_status_end (status, end_time),
    CONSTRAINT fk_auctions_item FOREIGN KEY (item_id) REFERENCES items (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_auctions_status CHECK (status IN ('scheduled', 'active', 'closed')),
    CONSTRAINT chk_auctions_window CHECK (end_time > start_time),
    CONSTRAINT chk_auctions_reserve CHECK (reserve_price >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE bids (
    id CHAR(36) NOT NULL,
    item_id CHAR(36) NOT NULL,
    bidder_id CHAR(36) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'winning',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_bids_item_amount (item_id, amount),
    KEY idx_bids_bidder (bidder_id),
    CONSTRAINT fk_bids_item FOREIGN KEY (item_id) REFERENCES items (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bids_bidder FOREIGN KEY (bidder_id) REFERENCES buyers (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_bids_amount CHECK (amount > 0),
    CONSTRAINT chk_bids_status CHECK (status IN ('winning', 'outbid', 'won', 'lost'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE transactions (
    id CHAR(36) NOT NULL,
    item_id CHAR(36) NOT NULL,
    buyer_id CHAR(36) NOT NULL,
    seller_id CHAR(36) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_transactions_item (item_id),
    KEY idx_transactions_buyer (buyer_id),
    KEY idx_transactions_seller (seller_id),
    CONSTRAINT fk_transactions_item FOREIGN KEY (item_id) REFERENCES items (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_transactions_buyer FOREIGN KEY (buyer_id) REFERENCES buyers (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_transactions_seller FOREIGN KEY (seller_id) REFERENCES sellers (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_transactions_amount CHECK (amount > 0),
    CONSTRAINT chk_transactions_status CHECK (status IN ('completed', 'refunded')),
    CONSTRAINT chk_transactions_payment CHECK (payment_method IN ('card', 'upi', 'cash', 'bank_transfer'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
