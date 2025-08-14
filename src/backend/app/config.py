import os
from pydantic import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Settings(BaseSettings):
    # API configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Estilo Futbol"
    
    # StatsBomb API configuration
    # Currently using open data, but prepared for private API in the future
    STATSBOMB_USE_PRIVATE_API: bool = False
    STATSBOMB_API_KEY: str = os.getenv("STATSBOMB_API_KEY", "")
    STATSBOMB_API_URL: str = os.getenv("STATSBOMB_API_URL", "")
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list = ["*"]
    
    class Config:
        case_sensitive = True

# Create settings instance
settings = Settings()