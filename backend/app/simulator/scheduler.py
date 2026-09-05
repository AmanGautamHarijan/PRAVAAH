"""Background scheduling and persistence for simulated sensor readings."""

import asyncio
import logging
from collections.abc import Callable
from datetime import datetime, timezone
from typing import Any

from app.database.database import SessionLocal
from app.ml.features import engineer_features
from app.ml.predictor import prediction_service
from app.models.alert import Alert
from app.models.prediction import Prediction
from app.models.sensor_data import SensorData
from app.simulator.generator import SensorGenerator, SensorReading, Scenario
from app.simulator.seed import seed_locations
from app.simulator.state import get_simulator_state
from app.websocket.manager import manager


logger = logging.getLogger(__name__)
SessionFactory = Callable[[], Any]


def generate_and_persist_readings(
    session_factory: SessionFactory = SessionLocal,
    generator: SensorGenerator | None = None,
) -> list[SensorReading]:
    """Generate, persist, predict, and alert for one simulator cycle."""
    generator = generator or SensorGenerator()
    db = session_factory()
    readings: list[SensorReading] = []
    events: list[dict[str, object]] = []
    try:
        locations = seed_locations(db)
        for location in locations:
            reading = generator.generate(location.id)
            timestamp = datetime.now(timezone.utc)
            db.add(SensorData(
                location_id=reading.location_id,
                rainfall=reading.rainfall,
                soil_moisture=reading.soil_moisture,
                water_level=reading.water_level,
                timestamp=timestamp,
            ))
            features = engineer_features(
                rainfall=reading.rainfall,
                forecast_rainfall=reading.forecast_rainfall,
                soil_moisture=reading.soil_moisture,
                elevation=0,
                slope=15,
                distance_to_river=1,
                historical_flood_frequency=2,
                water_level=reading.water_level,
            )
            result = prediction_service.predict(features)
            prediction = Prediction(
                location_id=reading.location_id,
                risk_score=result.risk_score,
                probability=result.probability,
                risk_level=result.risk_level,
                lead_time=result.lead_time,
                created_at=timestamp,
            )
            db.add(prediction)
            db.flush()
            if result.risk_level in {"HIGH", "CRITICAL"}:
                db.add(Alert(
                    prediction_id=prediction.id,
                    message=f"Flood risk is {result.risk_level.lower()} at {location.name}",
                    severity=result.risk_level,
                    created_at=timestamp,
                ))
            readings.append(reading)
            events.append({
                "timestamp": timestamp.isoformat().replace("+00:00", "Z"),
                "location": location.name,
                "rainfall": reading.rainfall,
                "soil_moisture": reading.soil_moisture,
                "water_level": reading.water_level,
                "risk_score": result.risk_score,
                "risk_level": result.risk_level,
                "lead_time": result.lead_time,
            })
        db.commit()
        for event in events:
            manager.publish_from_thread(event)
        logger.info("Persisted %d simulated readings", len(readings))
        return readings
    except Exception:
        db.rollback()
        logger.exception("Simulator cycle failed; transaction rolled back")
        raise
    finally:
        db.close()


async def run_scheduler(
    session_factory: SessionFactory = SessionLocal,
    interval_seconds: float = 5.0,
) -> None:
    """Run simulator cycles until cancelled during application shutdown."""
    generator = SensorGenerator()
    logger.info("Starting sensor simulator with %.1f second interval", interval_seconds)
    try:
        while True:
            try:
                state = get_simulator_state()
                if state.is_running:
                    # Update generator scenario if needed
                    current_scenario = Scenario(state.scenario.value)
                    if generator.scenario != current_scenario:
                        generator.set_scenario(current_scenario)
                    
                    # Generate and persist readings
                    await asyncio.to_thread(generate_and_persist_readings, session_factory, generator)
                else:
                    logger.debug("Simulator is paused")
            except Exception:
                logger.warning("Sensor simulator will retry on the next cycle")
            await asyncio.sleep(interval_seconds)
    except asyncio.CancelledError:
        logger.info("Sensor simulator stopped gracefully")
        raise