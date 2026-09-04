"""Realistic, stateful digital-twin readings for flood sensors."""

import logging
import random
from dataclasses import dataclass


logger = logging.getLogger(__name__)


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

    _rainfall_trend = (20.0, 45.0, 78.0, 120.0, 182.0)

    def __init__(self, seed: int = 42) -> None:
        self._random = random.Random(seed)
        self._states: dict[str, _SensorState] = {}

    def generate(self, location_id: str) -> SensorReading:
        """Generate the next reading for a location without abrupt jumps."""
        state = self._states.setdefault(location_id, _SensorState())
        trend_index = min(state.step, len(self._rainfall_trend) - 1)
        target_rainfall = self._rainfall_trend[trend_index]
        if state.step >= len(self._rainfall_trend):
            target_rainfall = min(250.0, state.rainfall + 8.0)
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
        logger.info("Generated reading: %s", reading)
        return reading