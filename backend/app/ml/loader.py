"""Loading and discovery of the trained flood-risk model artifact."""

import logging
import pickle
from pathlib import Path
from typing import Any


logger = logging.getLogger(__name__)
MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "xgboost_model.pkl"


def load_model(model_path: Path = MODEL_PATH) -> Any | None:
    """Load the optional XGBoost artifact, returning ``None`` when absent."""
    if not model_path.is_file():
        logger.info("No trained model found at %s; using deterministic fallback", model_path)
        return None
    try:
        with model_path.open("rb") as model_file:
            model = pickle.load(model_file)
    except (OSError, pickle.PickleError, EOFError, ImportError, ModuleNotFoundError) as exc:
        logger.exception("Unable to load model from %s", model_path)
        raise RuntimeError("The configured prediction model could not be loaded") from exc
    logger.info("Loaded prediction model from %s", model_path)
    return model