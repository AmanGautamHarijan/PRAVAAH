from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import get_db


class PredictionRequest(BaseModel):
    location_id: str = Field(min_length=1, max_length=50)
    rainfall: float = Field(ge=0)
    soil_moisture: float = Field(ge=0, le=100)
    water_level: float = Field(ge=0)


class PredictionResponse(BaseModel):
    risk_score: int
    risk_level: str
    lead_time: int
    probability: float
    top_factors: list[str]


router = APIRouter(tags=["predictions"])


@router.post("/predict", response_model=PredictionResponse)
def predict_risk(
    payload: PredictionRequest,
    db: Session = Depends(get_db),
) -> PredictionResponse:
    del payload, db
    return PredictionResponse(
        risk_score=91,
        risk_level="CRITICAL",
        lead_time=75,
        probability=0.87,
        top_factors=[
            "Heavy Rainfall",
            "High Soil Moisture",
            "Steep Terrain",
        ],
    )