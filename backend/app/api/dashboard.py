from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)) -> dict[str, int | str]:
    del db
    return {
        "overall_risk": "CRITICAL",
        "affected_villages": 3,
        "population_at_risk": 12840,
        "lead_time": 75,
        "active_alerts": 2,
    }