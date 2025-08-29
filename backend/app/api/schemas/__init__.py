from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict


# Moneyflux
class MoneyfluxHeatmap(BaseModel):
    index: str
    heatValue: Optional[float] = None
    ohlc: Optional[Dict[str, Any]] = None
    volume: Optional[int] = None
    liveExpiry: Optional[str] = None


class MoneyfluxSentiment(BaseModel):
    index: str
    sentimentScore: Optional[float] = None
    sentimentDirection: Optional[str] = None  # "bullish", "bearish", "neutral"
    calculatedAt: Optional[str] = None
    expiry: Optional[str] = None
    volumeRatio: Optional[float] = None
    priceAction: Optional[float] = None


class MoneyfluxPCR(BaseModel):
    index: str
    pcrRatio: Optional[float] = None
    pcrChange: Optional[float] = None
    putOI: Optional[int] = None
    callOI: Optional[int] = None
    putVolume: Optional[int] = None
    callVolume: Optional[int] = None
    expiry: Optional[str] = None
    calculatedAt: Optional[str] = None


class VolumeBar(BaseModel):
    timestamp: str
    volume: Optional[int] = None
    color: Optional[str] = None
    strikePrice: Optional[float] = None


class MoneyfluxVolumeHistogram(BaseModel):
    index: str
    expiry: Optional[str] = None
    volumeBars: List[VolumeBar] = []
    totalVolume: Optional[int] = None
    maxVolume: Optional[int] = None
    calculatedAt: Optional[str] = None


class MoneyfluxOHLC(BaseModel):
    index: str
    timeframe: str
    ohlcData: List[List[float]] = []  # [timestamp, open, high, low, close]
    volumeData: List[Dict[str, Any]] = []  # [{'x': timestamp, 'y': volume, 'color': color}]
    dataLength: Optional[int] = None
    lastUpdated: Optional[str] = None


class ExpiryOption(BaseModel):
    timestamp: int
    label: str
    isWeekly: Optional[bool] = False


class MoneyfluxExpiry(BaseModel):
    index: str
    expiries: List[ExpiryOption] = []
    currentExpiry: Optional[str] = None
    nextExpiry: Optional[str] = None


# Index Analysis
class IndexExpiry(BaseModel):
    index: str
    expiryDate: Optional[str] = None


class IndexOI(BaseModel):
    index: str
    oi: Optional[int] = None
    expiryDate: Optional[str] = None


class IndexPCR(BaseModel):
    index: str
    pcr: Optional[float] = None


class IndexContracts(BaseModel):
    index: str
    ceContracts: Optional[int] = None
    peContracts: Optional[int] = None


class IndexOptionChain(BaseModel):
    index: str
    optionChain: Optional[Dict[str, Any]] = None


# Enhanced Index Analysis Schemas
class OHLCData(BaseModel):
    timestamp: str
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: Optional[float] = None
    volume: Optional[int] = None


class IndexOHLCResponse(BaseModel):
    index: str
    timeframe: str
    data: List[OHLCData] = []


class IndexVolumeAnalysis(BaseModel):
    index: str
    currentVolume: Optional[int] = None
    averageVolume: Optional[int] = None
    volumeChange: Optional[float] = None
    volumeRatio: Optional[float] = None


class ConstituentStock(BaseModel):
    symbol: str
    price: Optional[float] = None
    priceChange: Optional[float] = None
    priceChangePercent: Optional[float] = None
    volume: Optional[int] = None
    volumeChangePercent: Optional[float] = None
    marketCap: Optional[int] = None
    weightage: Optional[float] = None
    high52w: Optional[float] = None
    low52w: Optional[float] = None
    heatScore: Optional[float] = None  # Calculated heat score for heatmap


class IndexHeatmapResponse(BaseModel):
    index: str
    constituents: List[ConstituentStock] = []
    lastUpdated: Optional[str] = None


class IndexComprehensiveAnalysis(BaseModel):
    index: str
    basicMetrics: IndexOI
    pcr: IndexPCR
    contracts: IndexContracts
    volumeAnalysis: IndexVolumeAnalysis
    recentOHLC: List[OHLCData] = []
    topGainers: List[ConstituentStock] = []
    topLosers: List[ConstituentStock] = []
    lastUpdated: Optional[str] = None


# F&O
class FnoExpiry(BaseModel):
    symbol: str
    expiryDate: Optional[str] = None


class FnoOI(BaseModel):
    symbol: str
    oi: Optional[int] = None
    oiChange: Optional[int] = None
    expiryDate: Optional[str] = None


class FnoOptionChain(BaseModel):
    symbol: str
    optionChain: Optional[Dict[str, Any]] = None


class FnoRelativeFactor(BaseModel):
    symbol: str
    relativeFactor: Optional[float] = Field(default=None, description="Relative strength factor")


class FnoHeatmapItem(BaseModel):
    symbol: str
    heatmapScore: Optional[float] = None
    relativeFactor: Optional[float] = None


class FnoHeatmapResponse(BaseModel):
    items: List[FnoHeatmapItem] = []


# Sector Analysis Schemas
class SectorStock(BaseModel):
    symbol: str
    price: Optional[float] = None
    priceChange: Optional[float] = None
    priceChangePercent: Optional[float] = None
    volume: Optional[int] = None
    marketCap: Optional[int] = None
    heatValue: Optional[float] = None
    rFactor: Optional[float] = None
    sector: Optional[str] = None


class SectorHeatmapResponse(BaseModel):
    data: List[Dict[str, Any]] = []
    name: str = "Sector Heatmap"
    timestamp: Optional[str] = None
    total_sectors: Optional[int] = None


class SectorDetailResponse(BaseModel):
    data: List[Dict[str, Any]] = []
    name: str = "Sector Detail"
    timestamp: Optional[str] = None
    sector_heat_score: Optional[float] = None


# Market Depth Schemas
class MarketDepthItem(BaseModel):
    symbol: str
    price: Optional[float] = None
    priceChange: Optional[float] = None
    volume: Optional[int] = None
    marketCap: Optional[int] = None
    heatValue: Optional[float] = None


class MarketDepthResponse(BaseModel):
    data: List[Dict[str, Any]] = []
    name: str = "Market Depth"
    timestamp: Optional[str] = None


# Pro Setup Schemas
class ProSetupItem(BaseModel):
    symbol: str
    price: Optional[float] = None
    priceChange: Optional[float] = None
    signal: Optional[str] = None
    strength: Optional[float] = None


class ProSetupResponse(BaseModel):
    data: List[Dict[str, Any]] = []
    name: str = "Pro Setup"
    timestamp: Optional[str] = None


# Swing Analysis Schemas
class SwingItem(BaseModel):
    symbol: str
    price: Optional[float] = None
    priceChange: Optional[float] = None
    swingType: Optional[str] = None
    strength: Optional[float] = None


class SwingResponse(BaseModel):
    data: List[Dict[str, Any]] = []
    name: str = "Swing Analysis"
    timestamp: Optional[str] = None


# FII/DII
class FiiDiiNet(BaseModel):
    date: str
    fiiBuy: int
    fiiSell: int
    diiBuy: int
    diiSell: int
    fiiNet: int
    diiNet: int
    netTotal: int


class FiiDiiBreakdownBucket(BaseModel):
    bucket: str
    fiiNet: int
    diiNet: int


class FiiDiiBreakdown(BaseModel):
    range: str
    series: List[FiiDiiBreakdownBucket]


class FiiDiiNetResponse(BaseModel):
    net: List[FiiDiiNet] = []


class FiiDiiBreakdownResponse(BaseModel):
    breakdown: List[FiiDiiBreakdown] = []


# Market depth (simple list entries)
class MarketDepthItem(BaseModel):
    symbol: str
    highPowerFlag: Optional[bool] = None
    intradayBoostFlag: Optional[bool] = None
    nearDaysHigh: Optional[bool] = None
    nearDaysLow: Optional[bool] = None
    gainerRank: Optional[int] = None
    loserRank: Optional[int] = None


class MarketDepthListResponse(BaseModel):
    items: List[MarketDepthItem] = []


# Pro setup entries
class ProItem(BaseModel):
    symbol: str
    fiveMinSpike: Optional[float] = None
    tenMinSpike: Optional[float] = None
    bullishDiv15m: Optional[bool] = None
    bearishDiv15m: Optional[bool] = None
    bullishDiv1h: Optional[bool] = None
    bearishDiv1h: Optional[bool] = None
    multiResistance: Optional[bool] = None
    multiSupport: Optional[bool] = None
    boMultiResistance: Optional[bool] = None
    boMultiSupport: Optional[bool] = None
    dailyContradiction: Optional[bool] = None
    maxSpike: Optional[float] = None


class ProListResponse(BaseModel):
    items: List[ProItem] = []


# Sector
class SectorHeatmapSector(BaseModel):
    sector: str
    heatScore: Optional[float] = None


class SectorHeatmapResponse(BaseModel):
    sectors: List[SectorHeatmapSector] = []


class SectorStockItem(BaseModel):
    symbol: str
    price: Optional[float] = None
    percentChange: Optional[float] = None
    relativeFactor: Optional[float] = None


class SectorDetailResponse(BaseModel):
    sector: str
    heatScore: Optional[float] = None
    stocks: List[SectorStockItem] = []