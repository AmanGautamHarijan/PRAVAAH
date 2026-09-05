"""Realistic, stateful digital-twin readings for flood sensors."""

import logging
import random
from dataclasses import dataclass
from enum import Enum


logger = logging.getLogger(__name__)


class Scenario(str, Enum):
    """Disaster scenario types."""
    NORMAL = "normal"
    MODERATE_RAIN = "moderate_rain"
    HEAVY_RAIN = "heavy_rain"
    FLASH_FLOOD = "flash_flood"
    DAM_RELEASE = "dam_release"


@dataclass(frozen=True, slots=True)
class SensorReading:
    """One generated reading, including telemetry beyond the database schema."""

    location_id: str
    rainfall: float
    soil_moisture: float
    water_level: float
    wind_speed: float
    temperature: float
    forecast_rainfall: float


@dataclass(slots=True)
class _SensorState:
    rainfall: float = 20.0
    soil_moisture: float = 35.0
    water_level: float = 1.0
    wind_speed: float = 8.0
    temperature: float = 28.0
    step: int = 0


class SensorGenerator:
    """Generate smooth readings with rainfall-driven soil and water trends."""

    # Rainfall trends for each scenario
    _scenario_trends = {
        Scenario.NORMAL: (20.0, 25.0, 22.0, 24.0, 21.0),
        Scenario.MODERATE_RAIN: (30.0, 50.0, 72.0, 95.0, 120.0),
        Scenario.HEAVY_RAIN: (60.0, 95.0, 140.0, 190.0, 240.0),
        Scenario.FLASH_FLOOD: (80.0, 150.0, 220.0, 250.0, 250.0),
        Scenario.DAM_RELEASE: (50.0, 100.0, 180.0, 245.0, 250.0),
    }

    def __init__(self, seed: int = 42, scenario: Scenario = Scenario.NORMAL) -> None:
        self._random = random.Random(seed)
        self._states: dict[str, _SensorState] = {}
        self.scenario = scenario

    def generate(self, location_id: str) -> SensorReading:
        """Generate the next reading for a location without abrupt jumps."""
        state = self._states.setdefault(location_id, _SensorState())
        rainfall_trend = self._scenario_trends[self.scenario]
        trend_index = min(state.step, len(rainfall_trend) - 1)
        target_rainfall = rainfall_trend[trend_index]
        if state.step >= len(rainfall_trend):
            # Continue with gradual increase for extreme scenarios, flatten for normal
            if self.scenario == Scenario.NORMAL:
                target_rainfall = 23.0 + (state.step % 5) * 0.5  # oscillate around normal
            else:
                target_rainfall = min(250.0, state.rainfall + 3.0)  # slow increase
        state.rainfall += (target_rainfall - state.rainfall) * 0.7
        state.rainfall = max(0.0, min(250.0, state.rainfall))
        state.soil_moisture = min(100.0, state.soil_moisture + state.rainfall / 180.0)
        state.water_level = min(10.0, state.water_level + max(0.02, state.rainfall / 2200.0))
        state.wind_speed = max(0.0, min(120.0, state.wind_speed + self._random.uniform(-1.5, 1.5)))
        state.temperature = max(10.0, min(45.0, state.temperature + self._random.uniform(-0.4, 0.4)))
        state.step += 1

        reading = SensorReading(
            location_id=location_id,
            rainfall=round(state.rainfall, 2),
            soil_moisture=round(state.soil_moisture, 2),
            water_level=round(state.water_level, 2),
            wind_speed=round(state.wind_speed, 2),
            temperature=round(state.temperature, 2),
            forecast_rainfall=round(min(250.0, state.rainfall * 1.1), 2),
        )
        logger.info("Generated reading (scenario=%s): %s", self.scenario.value, reading)
        return reading

    def set_scenario(self, scenario: Scenario) -> None:
        """Change scenario and reset sensor states for new trend."""
        if scenario != self.scenario:
            self.scenario = scenario
            self._states.clear()  # Reset all states to start new scenario fresh
            logger.info("Scenario changed to: %s", scenario.value)
