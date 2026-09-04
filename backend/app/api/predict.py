from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.ml.explain import explain_prediction
from app.ml.features import engineer_features
from app.ml.predictor import prediction_service


class PredictionRequest(BaseModel):
    location_id: str = Field(min_length=1, max_length=50)
    rainfall: float = Field(ge=0)
    forecast_rainfall: float = Field(default=0, ge=0)
    soil_moisture: float = Field(ge=0, le=100)
    elevation: float = Field(default=0, ge=0)
    slope: float = Field(default=0, ge=0)
    distance_to_river: float = Field(default=0, ge=0)
    historical_flood_frequency: float = Field(default=0, ge=0)
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
    del db
    features = engineer_features(
        rainfall=payload.rainfall,
        forecast_rainfall=payload.forecast_rainfall,
        soil_moisture=payload.soil_moisture,
        elevation=payload.elevation,
        slope=payload.slope,
        distance_to_river=payload.distance_to_river,
        historical_flood_frequency=payload.historical_flood_frequency,
        water_level=payload.water_level,
    )
    prediction = prediction_service.predict(features)
    return PredictionResponse(
        risk_score=prediction.risk_score,
        risk_level=prediction.risk_level,
        lead_time=prediction.lead_time,
        probability=prediction.probability,
        top_factors=explain_prediction(features),
    )