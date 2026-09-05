"""Feature engineering for the flood-risk prediction pipeline."""

from dataclasses import asdict, dataclass


FEATURE_NAMES = (
    "rainfall",
    "forecast_rainfall",
    "soil_moisture",
    "elevation",
    "slope",
    "distance_to_river",
    "historical_flood_frequency",
    "water_level",
)


@dataclass(frozen=True, slots=True)
class FeatureVector:
    """Ordered, model-ready values for one risk prediction."""

    rainfall: float
    forecast_rainfall: float
    soil_moisture: float
    elevation: float
    slope: float
    distance_to_river: float
    historical_flood_frequency: float
    water_level: float

    def as_list(self) -> list[float]:
        """Return values in the stable training-feature order."""
        return [getattr(self, name) for name in FEATURE_NAMES]

    def as_dict(self) -> dict[str, float]:
        """Return named feature values for logging and explanations."""
        return asdict(self)


def engineer_features(
    *,
    rainfall: float,
    forecast_rainfall: float,
    soil_moisture: float,
    elevation: float,
    slope: float,
    distance_to_river: float,
    historical_flood_frequency: float,
    water_level: float,
) -> FeatureVector:
    """Validate and normalize raw inputs into a clean feature vector."""
    values = {
        "rainfall": rainfall,
        "forecast_rainfall": forecast_rainfall,
        "soil_moisture": soil_moisture,
        "elevation": elevation,
        "slope": slope,
        "distance_to_river": distance_to_river,
        "historical_flood_frequency": historical_flood_frequency,
        "water_level": water_level,
    }
    if any(value < 0 for value in values.values()):
        raise ValueError("Feature values must be non-negative")
    return FeatureVector(**values)