"""Simulator control endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.simulator.state import DisasterScenario, get_simulator_state


class SimulatorStartRequest(BaseModel):
    """Start simulator request."""
    scenario: DisasterScenario = Field(default=DisasterScenario.NORMAL, description="Disaster scenario")


class SimulatorStatusResponse(BaseModel):
    """Simulator status response."""
    is_running: bool
    scenario: str


router = APIRouter(prefix="/simulator", tags=["simulator"])


@router.post("/start", response_model=SimulatorStatusResponse)
def start_simulator(payload: SimulatorStartRequest) -> SimulatorStatusResponse:
    """Start the simulator with specified scenario."""
    state = get_simulator_state()
    state.start(payload.scenario)
    return SimulatorStatusResponse(
        is_running=state.is_running,
        scenario=state.scenario.value,
    )


@router.post("/stop", response_model=SimulatorStatusResponse)
def stop_simulator() -> SimulatorStatusResponse:
    """Stop the simulator."""
    state = get_simulator_state()
    state.stop()
    return SimulatorStatusResponse(
        is_running=state.is_running,
        scenario=state.scenario.value,
    )


@router.get("/status", response_model=SimulatorStatusResponse)
def get_status() -> SimulatorStatusResponse:
    """Get current simulator status."""
    state = get_simulator_state()
    return SimulatorStatusResponse(
        is_running=state.is_running,
        scenario=state.scenario.value,
    )


@router.get("/scenarios")
def list_scenarios() -> dict[str, list[str]]:
    """Get available disaster scenarios."""
    return {
        "scenarios": [s.value for s in DisasterScenario]
    }
