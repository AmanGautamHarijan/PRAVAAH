from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.alert import Alert
from app.models.prediction import Prediction
from app.models.sensor_data import SensorData


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)) -> dict[str, int | str]:
    latest_prediction = db.scalar(select(Prediction).order_by(Prediction.created_at.desc()).limit(1))
    if latest_prediction is None:
        return {
            "overall_risk": "CRITICAL",
            "affected_villages": 3,
            "population_at_risk": 12840,
            "lead_time": 75,
            "active_alerts": 2,
        }
    affected_villages = db.scalar(select(func.count(func.distinct(SensorData.location_id)))) or 0
    active_alerts = db.scalar(select(func.count(Alert.id))) or 0
    return {
        "overall_risk": latest_prediction.risk_level,
        "affected_villages": affected_villages,
        "population_at_risk": 12840,
        "lead_time": latest_prediction.lead_time,
        "active_alerts": active_alerts,
    }