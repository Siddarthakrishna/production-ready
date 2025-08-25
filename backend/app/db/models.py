from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, Text, Date, BigInteger, Numeric, JSON, TIMESTAMP, Boolean, ForeignKey, UUID

Base = declarative_base()


class MoneyFluxIndex(Base):
    __tablename__ = "moneyflux_index"

    id = Column(Integer, primary_key=True)
    index_name = Column(Text, nullable=False, index=True)
    heat_value = Column(Numeric)
    ohlc = Column(JSON)  # JSONB in Postgres
    volume = Column(BigInteger)
    live_expiry = Column(Date)
    updated_at = Column(TIMESTAMP)


class IndexAnalysis(Base):
    __tablename__ = "index_analysis"

    id = Column(Integer, primary_key=True)
    index_name = Column(Text, nullable=False, index=True)
    oi = Column(BigInteger)
    expiry_date = Column(Date)
    option_chain = Column(JSON)  # JSONB
    pcr = Column(Numeric)
    ce_contracts = Column(BigInteger)
    pe_contracts = Column(BigInteger)
    # Enhanced OHLC and volume data
    ohlc_data = Column(JSON)  # JSONB containing open, high, low, close, timestamp
    volume = Column(BigInteger)
    volume_change = Column(Numeric)  # Volume change percentage
    price_change = Column(Numeric)  # Price change percentage
    volatility = Column(Numeric)  # Historical volatility
    updated_at = Column(TIMESTAMP)


class FnoData(Base):
    __tablename__ = "fno_data"

    id = Column(Integer, primary_key=True)
    symbol = Column(Text, nullable=False, index=True)
    expiry_date = Column(Date, index=True)
    oi = Column(BigInteger)
    oi_change = Column(BigInteger)
    option_chain = Column(JSON)
    relative_strength = Column(Numeric)
    volume = Column(BigInteger)
    signal = Column(Text)
    heatmap_score = Column(Numeric)
    updated_at = Column(TIMESTAMP)


class SectorOverview(Base):
    __tablename__ = "sector_overview"

    id = Column(Integer, primary_key=True)
    sector_name = Column(Text, nullable=False, index=True)
    sector_heat_score = Column(Numeric)
    updated_at = Column(TIMESTAMP)


class SectorStocks(Base):
    __tablename__ = "sector_stocks"

    id = Column(Integer, primary_key=True)
    sector_id = Column(Integer, ForeignKey("sector_overview.id"), index=True)
    symbol = Column(Text, index=True)
    price = Column(Numeric)
    percent_change = Column(Numeric)
    relative_factor = Column(Numeric)
    updated_at = Column(TIMESTAMP)


class MarketDepth(Base):
    __tablename__ = "market_depth"

    id = Column(Integer, primary_key=True)
    symbol = Column(Text, nullable=False, index=True)
    highpower_flag = Column(Boolean)
    intradayboost_flag = Column(Boolean)
    near_days_high = Column(Boolean)
    near_days_low = Column(Boolean)
    gainer_rank = Column(Integer)
    loser_rank = Column(Integer)
    updated_at = Column(TIMESTAMP)


class ProSetup(Base):
    __tablename__ = "pro_setup"

    id = Column(Integer, primary_key=True)
    symbol = Column(Text, nullable=False, index=True)
    five_min_spike = Column(Numeric)
    ten_min_spike = Column(Numeric)
    bullish_div_15m = Column(Boolean)
    bearish_div_1h = Column(Boolean)
    multi_resistance = Column(Boolean)
    multi_support = Column(Boolean)
    bo_multi_resistance = Column(Boolean)
    bo_multi_support = Column(Boolean)
    daily_contradiction = Column(Boolean)
    updated_at = Column(TIMESTAMP)


class SwingCentre(Base):
    __tablename__ = "swing_centre"

    id = Column(Integer, primary_key=True)
    symbol = Column(Text, nullable=False, index=True)
    swing_type = Column(Text)
    swing_level = Column(Numeric)
    detected_date = Column(Date)
    direction = Column(Text)


class JournalLog(Base):
    __tablename__ = "journal_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, index=True, nullable=False)
    ts = Column(TIMESTAMP, nullable=False)
    symbol = Column(Text, index=True, nullable=False)
    side = Column(Text, nullable=False)  # BUY/SELL
    qty = Column(Integer, nullable=False)
    price = Column(Numeric, nullable=False)
    gross_profit = Column(Numeric, nullable=False, default=0)
    stt = Column(Numeric, nullable=False, default=0)
    gst = Column(Numeric, nullable=False, default=0)
    stamp_duty = Column(Numeric, nullable=False, default=0)
    brokerage = Column(Numeric, nullable=False, default=0)


class FiiDiiNetflow(Base):
    __tablename__ = "fii_dii_netflow"

    id = Column(Integer, primary_key=True)
    trade_date = Column(Date, nullable=False, index=True)
    fii_buy = Column(BigInteger)
    fii_sell = Column(BigInteger)
    dii_buy = Column(BigInteger)
    dii_sell = Column(BigInteger)
    fii_net = Column(BigInteger)
    dii_net = Column(BigInteger)
    net_total = Column(BigInteger)


class TradingJournal(Base):
    __tablename__ = "trading_journal"

    id = Column(Integer, primary_key=True)
    trade_id = Column(Text, nullable=False, index=True)
    symbol = Column(Text, nullable=False, index=True)
    side = Column(Text)
    entry_price = Column(Numeric)
    exit_price = Column(Numeric)
    profit = Column(Numeric)
    stt = Column(Numeric)
    gst = Column(Numeric)
    stamp_duty = Column(Numeric)
    brokerage = Column(Numeric)
    net_profit = Column(Numeric)
    traded_at = Column(TIMESTAMP)
    notes = Column(Text)


class IndexConstituents(Base):
    __tablename__ = "index_constituents"

    id = Column(Integer, primary_key=True)
    index_name = Column(Text, nullable=False, index=True)
    symbol = Column(Text, nullable=False, index=True)
    price = Column(Numeric)
    price_change = Column(Numeric)
    price_change_percent = Column(Numeric)
    volume = Column(BigInteger)
    volume_change_percent = Column(Numeric)
    market_cap = Column(BigInteger)
    weightage = Column(Numeric)  # Weightage in the index
    high_52w = Column(Numeric)
    low_52w = Column(Numeric)
    updated_at = Column(TIMESTAMP)


class IndexOHLC(Base):
    __tablename__ = "index_ohlc"

    id = Column(Integer, primary_key=True)
    index_name = Column(Text, nullable=False, index=True)
    timestamp = Column(TIMESTAMP, nullable=False, index=True)
    open_price = Column(Numeric)
    high_price = Column(Numeric)
    low_price = Column(Numeric)
    close_price = Column(Numeric)
    volume = Column(BigInteger)
    timeframe = Column(Text, index=True)  # '1m', '5m', '15m', '1h', '1d'


class User(Base):
    __tablename__ = "users"

    id = Column(UUID, primary_key=True)
    email = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text)
    created_at = Column(TIMESTAMP)
    updated_at = Column(TIMESTAMP)


class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name = Column(Text, nullable=False)
    description = Column(Text)
    is_default = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP)
    updated_at = Column(TIMESTAMP)


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(UUID, primary_key=True)
    watchlist_id = Column(UUID, ForeignKey("watchlists.id", ondelete="CASCADE"), index=True)
    ticker = Column(Text, nullable=False, index=True)
    exchange = Column(Text)
    display_name = Column(Text)
    note = Column(Text)
    last_price = Column(Numeric(18, 6))
    last_price_at = Column(TIMESTAMP)
    percent_change = Column(Numeric(8, 4))
    target_price = Column(Numeric(18, 6))
    alert_enabled = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP)
    updated_at = Column(TIMESTAMP)


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(BigInteger, primary_key=True)
    ticker = Column(Text, nullable=False, index=True)
    exchange = Column(Text)
    price = Column(Numeric(18, 6), nullable=False)
    fetched_at = Column(TIMESTAMP, index=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID, primary_key=True)
    watchlist_item_id = Column(UUID, ForeignKey("watchlist_items.id", ondelete="CASCADE"), index=True)
    alert_type = Column(Text, nullable=False)  # 'price_above', 'price_below', 'percent_change'
    threshold = Column(Numeric(18, 6), nullable=False)
    comparison = Column(Text, nullable=False)  # 'gte', 'lte', 'eq'
    is_active = Column(Boolean, default=True)
    last_triggered_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP)
