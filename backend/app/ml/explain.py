"""Explainability output for flood-risk predictions."""

import logging

from app.ml.features import FeatureVector


logger = logging.getLogger(__name__)


def explain_prediction(features: FeatureVector) -> list[str]:
    """Return current deterministic factors pending SHAP integration."""
    logger.debug("Generating explanation for features: %s", features.as_dict())
    return [
        "Heavy Rainfall",
        "High Soil Moisture",
        "Steep Terrain",
    ]