from fastapi import FastAPI
from api.v1.router import api_router

app = FastAPI(
    title="Device API",
    version="1.0.0",
    description="FastAPI + MongoDB + JWT"
)

app.include_router(api_router, prefix="/api/v1")
