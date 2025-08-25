from . import 
from . import 

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/study_data"
    REDIS_URL: Optional[str] = "redis://localhost:6379"
    API_KEY: str
    MARKET_DATA_SOURCE: str = "dhan"  # or "nse" or other sources

    class Config:
        env_file = ".env"

settings = Settings()