-- Online Auction System - PostgreSQL 16 schema
-- Application SQL lives in server/src/queries and is shared by both dialects.
-- This file records only the storage-level differences (types, indexes).

CREATE TABLE admins (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buyers (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    address VARCHAR(255),
    account_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (account_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sellers (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    address VARCHAR(255),
    account_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (account_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id UUID PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES sellers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    starting_price NUMERIC(12, 2) NOT NULL CHECK (starting_price >= 0),
    category VARCHAR(60),
    image_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_items_seller ON items (seller_id);

CREATE TABLE auctions (
    id UUID PRIMARY KEY,
    item_id UUID NOT NULL UNIQUE REFERENCES items (id) ON DELETE CASCADE ON UPDATE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'active', 'closed')),
    reserve_price NUMERIC(12, 2) NOT NULL CHECK (reserve_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_auctions_window CHECK (end_time > start_time)
);
CREATE INDEX idx_auctions_status_end ON auctions (status, end_time);

CREATE TABLE bids (
    id UUID PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES items (id) ON DELETE CASCADE ON UPDATE CASCADE,
    bidder_id UUID NOT NULL REFERENCES buyers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'winning'
        CHECK (status IN ('winning', 'outbid', 'won', 'lost')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bids_item_amount ON bids (item_id, amount);
CREATE INDEX idx_bids_bidder ON bids (bidder_id);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    item_id UUID NOT NULL UNIQUE REFERENCES items (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    seller_id UUID NOT NULL REFERENCES sellers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'refunded')),
    payment_method VARCHAR(20) NOT NULL
        CHECK (payment_method IN ('card', 'upi', 'cash', 'bank_transfer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_transactions_buyer ON transactions (buyer_id);
CREATE INDEX idx_transactions_seller ON transactions (seller_id);
