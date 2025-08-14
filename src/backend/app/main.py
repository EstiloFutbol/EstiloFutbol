from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import matches, competitions
from app.config import settings

app = FastAPI(
    title="Estilo Futbol API",
    description="Football analytics API using StatsBomb data",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(matches.router, prefix="/api")
app.include_router(competitions.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Estilo Futbol API"}

@app.get("/ping")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)