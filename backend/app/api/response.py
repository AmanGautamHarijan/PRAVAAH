"""API endpoint for AI-powered emergency response plan generation."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.alert import Alert
from app.models.prediction import Prediction
from app.models.sensor_data import SensorData
from app.services.ai_response import AIResponseService, DashboardState
from app.simulator.state import get_simulator_state

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/response-plan", tags=["response-plan"])


class ResponsePlanRequest(BaseModel):
    """Request model for response plan generation."""
    location_id: str = Field(default="LOC101", description="Location ID")
    location_name: str = Field(default="Central India", description="Location name")


class ResponsePlanResponse(BaseModel):
    """Response model for emergency response plan."""
    priority: str
    headline: str
    summary: str
    affected_people: int
    safe_place: str
    eta: str
    actions: list[str]
    emergency_sms: str
    response_confidence: str
    is_fallback: bool


def get_current_dashboard_state(
    request: Optional[ResponsePlanRequest] = None,
    db: Session = None
) -> DashboardState:
    """Extract current dashboard state for AI response generation."""
    # Get latest sensor data
    latest_sensor = None
    if db:
        latest_sensor = db.scalar(
            select(SensorData).order_by(
                SensorData.timestamp.desc()
            ).limit(1)
        )

    # Get latest prediction
    latest_prediction = None
    if db:
        latest_prediction = db.scalar(
            select(Prediction).order_by(
                Prediction.created_at.desc()
            ).limit(1)
        )

    # Get active alerts count
    active_alerts_count = 0
    if db:
        active_alerts_count = db.scalar(
            select(func.count(Alert.id))
        ) or 0

    # Get simulator state
    simulator_state = get_simulator_state()
    scenario = simulator_state.scenario.value if simulator_state.is_running else "normal"

    # Get location name from request or use default
    location_name = request.location_name if request and request.location_name else "Central India"
    location_id = request.location_id if request and request.location_id else "LOC101"

    return DashboardState(
        location_id=location_id,
        location_name=location_name,
        rainfall=latest_sensor.rainfall if latest_sensor else 50.0,
        water_level=latest_sensor.water_level if latest_sensor else 5.0,
        soil_moisture=latest_sensor.soil_moisture if latest_sensor else 60.0,
        risk_score=latest_prediction.risk_score if latest_prediction else 50,
        risk_level=latest_prediction.risk_level if latest_prediction else "MODERATE",
        lead_time=latest_prediction.lead_time if latest_prediction else 30,
        population_at_risk=12840,  # Could be made dynamic based on location
        active_alerts=active_alerts_count,
        simulator_scenario=scenario
    )


@router.post("", response_model=ResponsePlanResponse)
async def generate_response_plan(
    request: ResponsePlanRequest = None,
    db: Session = Depends(get_db)
) -> ResponsePlanResponse:
    """
    Generate an AI-powered emergency response plan.

    Uses the current live dashboard state including:
    - Current sensor readings (rainfall, water level, soil moisture)
    - ML prediction (risk score, risk level, lead time)
    - Active alerts count
    - Current simulator scenario

    Returns a structured emergency response with:
    - Priority level
    - Actionable headline
    - Situation summary
    - Evacuation details
    - Immediate action checklist
    - Emergency SMS template
    - Response confidence score
    """
    try:
        # Get current state
        state = get_current_dashboard_state(request, db)

        logger.info(
            f"Generating response plan for {state.location_name} "
            f"(scenario: {state.simulator_scenario}, risk: {state.risk_level})"
        )

        # Generate response
        ai_service = AIResponseService()
        result = await ai_service.generate_response_plan(state)

        return ResponsePlanResponse(**result)

    except Exception as e:
        logger.error(f"Failed to generate response plan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate emergency response plan"
        )
