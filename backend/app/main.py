from fastapi import FastAPI

from app.api import dashboard, health, predict, sensor


app = FastAPI(
    title="PRAVAAH Backend",
    description="Hyper-local flash flood intelligence and decision support API.",
    version="0.1.0",
)


app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(sensor.router)
app.include_router(predict.router)