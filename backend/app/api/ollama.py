from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
import httpx
import os
import asyncio
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ollama", tags=["ollama"])

# Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT_MS", "30000")) / 1000  # Convert to seconds
DEFAULT_MODEL = os.getenv("OLLAMA_DEFAULT_MODEL", "llama2")


class OllamaGenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = DEFAULT_MODEL
    system: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class OllamaResponse(BaseModel):
    response: str
    model: str
    created_at: str
    done: bool


class StockAnalysisRequest(BaseModel):
    symbol: str
    current_price: Optional[float] = None
    price_change_percent: Optional[float] = None
    volume: Optional[int] = None
    notes: Optional[str] = None
    analysis_type: str = "summary"  # summary, trade_rationale, risk_analysis


class TradeRationaleRequest(BaseModel):
    symbol: str
    action: str  # BUY, SELL, HOLD
    current_price: float
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    position_size: Optional[str] = None
    timeframe: Optional[str] = None
    context: Optional[str] = None


async def check_ollama_health() -> bool:
    """Check if Ollama server is running"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return response.status_code == 200
    except:
        return False


async def call_ollama_api(endpoint: str, data: dict) -> dict:
    """Make a call to Ollama API"""
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/{endpoint}", json=data)
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Ollama request timed out")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Ollama service unavailable")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Ollama API error: {e.response.text}")


@router.get("/health")
async def ollama_health_check():
    """Check Ollama service health"""
    is_healthy = await check_ollama_health()
    return {
        "success": is_healthy,
        "service": "ollama",
        "endpoint": OLLAMA_BASE_URL,
        "status": "healthy" if is_healthy else "unavailable"
    }


@router.post("/generate")
async def generate_text(request: OllamaGenerateRequest):
    """Generate text using Ollama"""
    try:
        # Check if Ollama is available
        if not await check_ollama_health():
            raise HTTPException(status_code=503, detail="Ollama service is not available")
        
        ollama_data = {
            "model": request.model,
            "prompt": request.prompt,
            "stream": False
        }
        
        if request.system:
            ollama_data["system"] = request.system
        
        response = await call_ollama_api("generate", ollama_data)
        
        return {
            "success": True,
            "data": {
                "response": response.get("response", ""),
                "model": response.get("model", request.model),
                "created_at": response.get("created_at", ""),
                "done": response.get("done", True)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ollama generate error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/stock-analysis")
async def analyze_stock(request: StockAnalysisRequest):
    """Generate stock analysis using Ollama"""
    try:
        # Build context-aware prompt
        if request.analysis_type == "summary":
            prompt = f"""Provide a concise stock analysis summary for {request.symbol}.

Current Information:
- Symbol: {request.symbol}
- Current Price: ₹{request.current_price} INR
- Price Change: {request.price_change_percent}%
- Volume: {request.volume:,} shares
- Notes: {request.notes or 'No additional notes'}

Please provide:
1. Brief market sentiment analysis
2. Key technical indicators observation
3. Risk factors to consider
4. Short-term outlook (1-2 sentences)

Keep the response under 150 words and focus on actionable insights."""

        elif request.analysis_type == "trade_rationale":
            prompt = f"""Generate a trade rationale for {request.symbol}.

Current Market Data:
- Price: ₹{request.current_price} INR
- Change: {request.price_change_percent}%
- Volume: {request.volume:,}
- Context: {request.notes or 'Standard market conditions'}

Provide a structured analysis covering:
1. Entry justification
2. Risk assessment
3. Potential targets
4. Exit strategy

Limit to 100 words, focus on practical trading insights."""

        elif request.analysis_type == "risk_analysis":
            prompt = f"""Analyze risks for {request.symbol} investment.

Current Position:
- Symbol: {request.symbol}
- Price: ₹{request.current_price} INR
- Recent Performance: {request.price_change_percent}%

Identify:
1. Market risks
2. Sector-specific risks
3. Technical risks
4. Risk mitigation strategies

Keep response concise (100 words max)."""

        else:
            prompt = f"Analyze {request.symbol} stock with current price ₹{request.current_price} INR."

        ollama_request = OllamaGenerateRequest(
            prompt=prompt,
            model=DEFAULT_MODEL,
            system="You are a professional stock analyst. Provide concise, actionable insights based on the given data. Use Indian stock market context and INR currency."
        )
        
        return await generate_text(ollama_request)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Stock analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/trade-rationale")
async def generate_trade_rationale(request: TradeRationaleRequest):
    """Generate detailed trade rationale"""
    try:
        prompt = f"""Generate a professional trade rationale for {request.action} position in {request.symbol}.

Trade Setup:
- Action: {request.action}
- Symbol: {request.symbol}
- Current Price: ₹{request.current_price} INR
- Target Price: ₹{request.target_price} INR
- Stop Loss: ₹{request.stop_loss} INR
- Position Size: {request.position_size or 'Not specified'}
- Timeframe: {request.timeframe or 'Medium term'}
- Additional Context: {request.context or 'Standard market conditions'}

Provide structured rationale covering:
1. **Entry Logic**: Why enter at current levels
2. **Risk-Reward**: Calculate risk-reward ratio
3. **Target Justification**: Why this target makes sense
4. **Risk Management**: Stop loss and position sizing rationale
5. **Market Context**: Current market environment consideration

Keep response under 200 words, professional tone, actionable insights."""

        ollama_request = OllamaGenerateRequest(
            prompt=prompt,
            model=DEFAULT_MODEL,
            system="You are an experienced equity trader and analyst. Provide structured, professional trade rationales with risk management focus. Use Indian stock market context."
        )
        
        return await generate_text(ollama_request)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trade rationale error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Trade rationale generation failed: {str(e)}")


@router.post("/summarize-notes")
async def summarize_watchlist_notes(symbol: str, notes: str):
    """Summarize and enhance watchlist notes"""
    try:
        prompt = f"""Enhance and summarize the following watchlist notes for {symbol}:

Original Notes:
{notes}

Please:
1. Clean up and organize the information
2. Add any obvious insights or observations
3. Keep the enhanced version concise (50-75 words)
4. Maintain all important numerical data and dates
5. Use bullet points if appropriate

Return only the enhanced notes, no additional commentary."""

        ollama_request = OllamaGenerateRequest(
            prompt=prompt,
            model=DEFAULT_MODEL,
            system="You are a financial research assistant. Enhance and organize notes while preserving all important information. Be concise and professional."
        )
        
        return await generate_text(ollama_request)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Notes summarization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Notes summarization failed: {str(e)}")


@router.post("/portfolio-insights")
async def generate_portfolio_insights(watchlist_data: dict):
    """Generate insights for entire watchlist/portfolio"""
    try:
        # Format watchlist data into readable text
        stocks_info = []
        for stock in watchlist_data.get("stocks", []):
            stocks_info.append(
                f"- {stock.get('symbol')}: ₹{stock.get('current_price', 0)} "
                f"({stock.get('price_change_percent', 0):+.2f}%)"
            )
        
        stocks_text = "\n".join(stocks_info[:10])  # Limit to top 10 stocks
        
        prompt = f"""Analyze this watchlist and provide portfolio-level insights:

Watchlist: {watchlist_data.get('name', 'Portfolio')}
Total Stocks: {len(watchlist_data.get('stocks', []))}

Current Holdings:
{stocks_text}

Provide insights on:
1. Overall portfolio sentiment (bullish/bearish/neutral)
2. Sector concentration risks
3. Performance patterns observed
4. Diversification suggestions
5. Key stocks to watch

Keep response under 150 words, focus on actionable portfolio management insights."""

        ollama_request = OllamaGenerateRequest(
            prompt=prompt,
            model=DEFAULT_MODEL,
            system="You are a portfolio analyst. Provide high-level insights for watchlist optimization and risk management. Focus on practical recommendations."
        )
        
        return await generate_text(ollama_request)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Portfolio insights error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Portfolio insights generation failed: {str(e)}")


@router.get("/models")
async def list_available_models():
    """List available Ollama models"""
    try:
        if not await check_ollama_health():
            raise HTTPException(status_code=503, detail="Ollama service is not available")
        
        response = await call_ollama_api("tags", {})
        
        models = []
        for model in response.get("models", []):
            models.append({
                "name": model.get("name"),
                "size": model.get("size"),
                "modified_at": model.get("modified_at")
            })
        
        return {
            "success": True,
            "data": {
                "models": models,
                "default_model": DEFAULT_MODEL
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Models list error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve models: {str(e)}")


# Background task for async processing
async def process_bulk_analysis(watchlist_id: str, user_id: str):
    """Background task to process bulk stock analysis"""
    try:
        # This would integrate with WatchlistService to get stocks and generate analysis
        # For now, just log the task
        logger.info(f"Processing bulk analysis for watchlist {watchlist_id}, user {user_id}")
        await asyncio.sleep(1)  # Simulate processing
        logger.info(f"Completed bulk analysis for watchlist {watchlist_id}")
    except Exception as e:
        logger.error(f"Bulk analysis failed for watchlist {watchlist_id}: {str(e)}")


@router.post("/bulk-analysis/{watchlist_id}")
async def start_bulk_analysis(watchlist_id: str, background_tasks: BackgroundTasks, user_id: str = "demo"):
    """Start bulk analysis for entire watchlist (async)"""
    try:
        background_tasks.add_task(process_bulk_analysis, watchlist_id, user_id)
        
        return {
            "success": True,
            "message": "Bulk analysis started",
            "watchlist_id": watchlist_id,
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"Bulk analysis start error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start bulk analysis: {str(e)}")