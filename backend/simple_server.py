from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Unified Sharada Research API",
    description="API for both landing page and financial application",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/v1/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3510"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic endpoints
@app.get("/api")
async def root():
    return {"message": "Welcome to Sharada Research API"}

@app.get("/api/healthz")
async def healthz():
    return {"status": "ok"}

# Auth endpoints
@app.post("/api/auth/login")
async def auth_login():
    from fastapi import Response
    resp = Response(content='{"ok": true, "user": {"email": "demo@example.com"}}', media_type="application/json")
    resp.set_cookie(key="session", value="demo-session", httponly=True)
    return resp

@app.post("/api/auth/logout")
async def auth_logout():
    from fastapi import Response
    resp = Response(content='{"ok": true}', media_type="application/json")
    resp.delete_cookie(key="session")
    return resp

@app.post("/api/auth/refresh")
async def auth_refresh():
    return {"ok": True}

if __name__ == "__main__":
    uvicorn.run("simple_server:app", host="127.0.0.1", port=8001, reload=True)