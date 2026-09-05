"""Global simulator state management."""

import logging
from dataclasses import dataclass
from enum import Enum


logger = logging.getLogger(__name__)


class DisasterScenario(str, Enum):
    """Available disaster scenarios for simulation."""
    NORMAL = "normal"
    MODERATE_RAIN = "moderate_rain"
    HEAVY_RAIN = "heavy_rain"
    FLASH_FLOOD = "flash_flood"
    DAM_RELEASE = "dam_release"


@dataclass
class SimulatorState:
    """Thread-safe global simulator state."""
    is_running: bool = False
    scenario: DisasterScenario = DisasterScenario.NORMAL

    def start(self, scenario: DisasterScenario = DisasterScenario.NORMAL) -> None:
        """Start simulator with specified scenario."""
        self.is_running = True
        self.scenario = scenario
        logger.info("Simulator started with scenario: %s", scenario.value)

    def stop(self) -> None:
        """Stop simulator."""
        self.is_running = False
        logger.info("Simulator stopped")

    def get_status(self) -> dict[str, object]:
        """Get current simulator status."""
        return {
            "is_running": self.is_running,
            "scenario": self.scenario.value,
        }


# Global simulator state instance
_state = SimulatorState()


def get_simulator_state() -> SimulatorState:
    """Get global simulator state."""
    return _state
