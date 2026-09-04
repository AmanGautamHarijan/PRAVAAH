from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.location import Location
from app.models.sensor_data import SensorData


class SensorDataCreate(BaseModel):
    location_id: str = Field(min_length=1, max_length=50)
    rainfall: float = Field(ge=0)
    soil_moisture: float = Field(ge=0, le=100)
    water_level: float = Field(ge=0)


class SensorDataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    location_id: str
    rainfall: float
    soil_moisture: float
    water_level: float
    timestamp: datetime


router = APIRouter(tags=["sensor data"])


@router.post("/sensor-data", status_code=status.HTTP_201_CREATED)
def create_sensor_data(
    payload: SensorDataCreate,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    location_exists = db.scalar(select(Location.id).where(Location.id == payload.location_id))
    if location_exists is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Location not found")

    sensor_data = SensorData(
        location_id=payload.location_id,
        rainfall=payload.rainfall,
        soil_moisture=payload.soil_moisture,
        water_level=payload.water_level,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(sensor_data)
    db.commit()
    return {"status": "received"}


@router.get("/sensor-data/latest", response_model=SensorDataResponse)
def get_latest_sensor_data(db: Session = Depends(get_db)) -> SensorData:
    latest = db.scalar(
        select(SensorData).order_by(
            SensorData.timestamp.desc(),
            SensorData.id.desc(),
        ).limit(1)
    )
    if latest is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No sensor data found")
    return latest