import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import dashboard, health, predict, sensor, simulator
from app.simulator.scheduler import run_scheduler
from app.simulator.state import DisasterScenario, get_simulator_state
from app.websocket.events import router as websocket_router

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_: FastAPI):
    simulator_enabled = os.getenv("SIMULATOR_ENABLED", "true").lower() == "true"
    auto_start = os.getenv("SIMULATOR_AUTO_START", "true").lower() == "true"

    scheduler_task = asyncio.create_task(run_scheduler()) if simulator_enabled else None

    if simulator_enabled and auto_start:
        get_simulator_state().start(DisasterScenario.NORMAL)

    try:
        yield
    finally:
        if scheduler_task is not None:
            scheduler_task.cancel()
            await asyncio.gather(scheduler_task, return_exceptions=True)


app = FastAPI(
    title="PRAVAAH Backend",
    description="Hyper-local flash flood intelligence and decision support API.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(sensor.router)
app.include_router(predict.router)
app.include_router(simulator.router)
app.include_router(websocket_router)