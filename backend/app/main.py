import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import dashboard, health, predict, sensor
from app.simulator.scheduler import run_scheduler


logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_: FastAPI):
    simulator_enabled = os.getenv("SIMULATOR_ENABLED", "true").lower() == "true"
    scheduler_task = asyncio.create_task(run_scheduler()) if simulator_enabled else None
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


app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(sensor.router)
app.include_router(predict.router)