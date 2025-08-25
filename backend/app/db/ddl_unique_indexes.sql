-- Unique indexes to support idempotent upserts

CREATE UNIQUE INDEX IF NOT EXISTS ux_fno_symbol_expiry ON fno_data (symbol, expiry_date);
CREATE UNIQUE INDEX IF NOT EXISTS ux_sector_overview_name ON sector_overview (sector_name);
CREATE UNIQUE INDEX IF NOT EXISTS ux_sector_stocks_sector_symbol ON sector_stocks (sector_id, symbol);
CREATE UNIQUE INDEX IF NOT EXISTS ux_market_depth_symbol ON market_depth (symbol);
CREATE UNIQUE INDEX IF NOT EXISTS ux_pro_setup_symbol ON pro_setup (symbol);
CREATE UNIQUE INDEX IF NOT EXISTS ux_swing_symbol_date_type ON swing_centre (symbol, detected_date, swing_type);

-- Additions aligned to DDL reference
-- FII/DII Net Flow
CREATE UNIQUE INDEX IF NOT EXISTS ux_fii_dii_trade_date ON fii_dii_netflow (trade_date);
CREATE INDEX IF NOT EXISTS idx_fii_dii_date ON fii_dii_netflow (trade_date);

-- Money Flux and Index Analysis
CREATE UNIQUE INDEX IF NOT EXISTS ux_moneyflux_index_name_expiry ON moneyflux_index (index_name, live_expiry);
CREATE INDEX IF NOT EXISTS idx_moneyflux_index_name ON moneyflux_index (index_name);

CREATE UNIQUE INDEX IF NOT EXISTS ux_index_analysis_name_expiry ON index_analysis (index_name, expiry_date);
CREATE INDEX IF NOT EXISTS idx_index_analysis_name ON index_analysis (index_name);

-- F&O Data additional indexes
CREATE INDEX IF NOT EXISTS idx_fno_symbol ON fno_data (symbol);
CREATE INDEX IF NOT EXISTS idx_fno_expiry ON fno_data (expiry_date);
-- For Postgres JSONB GIN index (supported when deployed on Postgres)
CREATE INDEX IF NOT EXISTS idx_fno_option_chain_gin ON fno_data USING GIN ((option_chain));

-- Watchlist unique per symbol as per DDL
CREATE UNIQUE INDEX IF NOT EXISTS ux_watchlist_symbol ON watchlist (symbol);
