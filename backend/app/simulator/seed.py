"""Seed data for the simulator's sample monitoring locations."""

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.location import Location


logger = logging.getLogger(__name__)

SAMPLE_LOCATIONS = (
    {"id": "LOC101", "name": "Village A", "latitude": 20.5937, "longitude": 78.9629, "district": "Demo District", "state": "Demo State"},
    {"id": "LOC102", "name": "Village B", "latitude": 20.6037, "longitude": 78.9729, "district": "Demo District", "state": "Demo State"},
    {"id": "LOC103", "name": "Village C", "latitude": 20.5837, "longitude": 78.9529, "district": "Demo District", "state": "Demo State"},
)


def seed_locations(db: Session) -> list[Location]:
    """Create missing sample locations and return all simulator locations."""
    locations: list[Location] = []
    for values in SAMPLE_LOCATIONS:
        location = db.scalar(select(Location).where(Location.id == values["id"]))
        if location is None:
            location = Location(**values)
            db.add(location)
            db.flush()
            logger.info("Seeded simulator location %s", location.name)
        locations.append(location)
    return locations