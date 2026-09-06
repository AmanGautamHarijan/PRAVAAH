"""AI Response Plan generation using Groq with automatic model validation."""

import json
import logging
import os
from dataclasses import dataclass
from typing import Dict, Optional

import httpx
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

# Default model (recommended by Groq for this use case)
DEFAULT_MODEL = "groq/compound-mini"


@dataclass
class DashboardState:
    """Current dashboard state for AI response generation."""
    location_id: str
    location_name: str
    rainfall: float
    water_level: float
    soil_moisture: float
    risk_score: int
    risk_level: str
    lead_time: int
    population_at_risk: int
    active_alerts: int
    simulator_scenario: str


class AIResponseService:
    """Generate emergency response plans using Groq with automatic fallback."""

    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.configured_model = os.getenv("GROQ_MODEL", DEFAULT_MODEL)
        self.model: Optional[str] = None
        self.client: Optional[AsyncOpenAI] = None
        self._verified = False

        if self.api_key:
            self.client = AsyncOpenAI(
                api_key=self.api_key,
                base_url="https://api.groq.com/openai/v1",
                timeout=10.0,
            )
            logger.info(f"Groq AI Response Service initialized (configured model: {self.configured_model})")
        else:
            logger.warning("GROQ_API_KEY not found, using fallback responses only")

    def _validate_model(self) -> bool:
        """
        Validate if the configured model is available.
        Uses Groq's models endpoint to check availability.
        Falls back to default model if unavailable.
        """
        if self._verified or not self.client:
            return self.client is not None

        configured = self.configured_model

        try:
            # Fetch available models from Groq
            response = httpx.get(
                "https://api.groq.com/openai/v1/models",
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=5.0,
            )

            if response.status_code == 200:
                models_data = response.json()
                available_models = [m["id"] for m in models_data.get("data", [])]

                logger.info(f"Available Groq models: {available_models[:10]}...")

                # Check if configured model is available
                if configured in available_models:
                    self.model = configured
                    logger.info(f"Model '{configured}' is available and authorized")
                else:
                    # Try default model
                    if DEFAULT_MODEL in available_models:
                        logger.warning(
                            f"Configured model '{configured}' not available. "
                            f"Auto-switching to '{DEFAULT_MODEL}'"
                        )
                        self.model = DEFAULT_MODEL
                    else:
                        # Neither configured nor default available
                        logger.warning(
                            f"Neither '{configured}' nor '{DEFAULT_MODEL}' available. "
                            f"Checking other groq models..."
                        )
                        # Try any available groq model
                        groq_models = [m for m in available_models if m.startswith("groq/")]
                        if groq_models:
                            self.model = groq_models[0]
                            logger.warning(f"Using fallback model: {self.model}")
                        else:
                            logger.warning("No Groq models available. Using fallback responses.")
                            self.client = None
                            return False

            else:
                logger.warning(f"Failed to fetch models: {response.status_code}")
                # Assume configured model works (will be validated on first call)
                self.model = configured

        except Exception as e:
            logger.warning(f"Model validation failed: {e}. Proceeding with configured model.")
            self.model = configured

        self._verified = True
        return self.client is not None

    def _get_fallback_response(self, state: DashboardState) -> Dict:
        """Generate a realistic fallback response when Groq is unavailable."""
        fallback_responses = {
            "normal": {
                "priority": "LOW",
                "headline": "All Systems Normal",
                "summary": "No immediate threats detected. Routine monitoring in progress across all sensor zones.",
                "affected_people": 0,
                "safe_place": "Current location - no evacuation needed",
                "eta": "N/A",
                "actions": [
                    "Continue routine sensor monitoring",
                    "Check equipment functionality",
                    "Review weather forecasts",
                    "Maintain communication readiness",
                    "Log hourly readings",
                ],
                "emergency_sms": "✅ PRAVAAH STATUS: All systems normal. No action required.",
            },
            "moderate_rain": {
                "priority": "MODERATE",
                "headline": "Moderate Rainfall Advisory",
                "summary": f"Rainfall of {state.rainfall:.1f}mm detected. Monitor drainage systems and prepare for potential water accumulation.",
                "affected_people": max(0, state.population_at_risk // 10),
                "safe_place": "Community Center - Ground Floor",
                "eta": "30-60 minutes",
                "actions": [
                    "Check drainage systems for blockages",
                    "Prepare sandbags for vulnerable areas",
                    "Alert groundskeeping staff",
                    "Monitor water levels every 30 minutes",
                    "Prepare emergency supplies",
                ],
                "emergency_sms": f"⚠️ PRAVAAH ADVISORY: Moderate rainfall ({state.rainfall:.0f}mm). Check drainage. Stay alert.",
            },
            "heavy_rain": {
                "priority": "HIGH",
                "headline": "Heavy Rainfall Warning",
                "summary": f"Severe rainfall of {state.rainfall:.1f}mm detected. Soil moisture at {state.soil_moisture:.0f}%. Prepare for potential flooding.",
                "affected_people": max(0, state.population_at_risk // 4),
                "safe_place": "District Relief Camp - Sector A",
                "eta": "15-25 minutes",
                "actions": [
                    "Deploy flood monitoring teams immediately",
                    "Prepare evacuation routes and signage",
                    "Check all pump functionality",
                    "Alert residents in flood-prone zones",
                    "Pre-position rescue equipment",
                ],
                "emergency_sms": f"🚨 PRAVAAH WARNING: Heavy rainfall ({state.rainfall:.0f}mm). Prepare for flooding. Stay alert for updates.",
            },
            "flash_flood": {
                "priority": "CRITICAL",
                "headline": "FLASH FLOOD IMMINENT",
                "summary": f"CRITICAL: Water level at {state.water_level:.1f}m. Rainfall {state.rainfall:.1f}mm. Soil saturation {state.soil_moisture:.0f}%. Immediate evacuation required.",
                "affected_people": state.population_at_risk,
                "safe_place": "High Ground Shelter - Elevation Zone 3",
                "eta": f"{state.lead_time} minutes",
                "actions": [
                    "EVACUATE immediately to higher ground",
                    "Deploy NDRF rescue teams NOW",
                    "Close all river crossings and bridges",
                    "Activate emergency sirens",
                    "Assist elderly, children, and disabled persons first",
                    "Broadcast emergency alerts to all residents",
                ],
                "emergency_sms": f"🚨🚨🚨 PRAVAAH EMERGENCY: FLASH FLOOD IMMINENT! Water rising rapidly. Evacuate to high ground NOW. {state.lead_time} min.",
            },
            "dam_release": {
                "priority": "CRITICAL",
                "headline": "Dam Release Alert - Act Now",
                "summary": f"Controlled water release in progress. Downstream water level: {state.water_level:.1f}m. Immediate evacuation of river-adjacent areas required.",
                "affected_people": max(0, state.population_at_risk // 2),
                "safe_place": "East Hill Community Center",
                "eta": "10-20 minutes",
                "actions": [
                    "Issue immediate downstream evacuation warning",
                    "Close all river crossings and low-level bridges",
                    "Deploy rescue boats to strategic positions",
                    "Monitor dam water flow rates continuously",
                    "Alert hospitals and emergency services",
                ],
                "emergency_sms": f"🚨 PRAVAAH ALERT: Dam release in progress. Downstream areas must evacuate NOW. Move to elevated ground.",
            },
        }

        base = fallback_responses.get(state.simulator_scenario, fallback_responses["moderate_rain"])

        # Confidence based on risk score
        confidence = min(95, max(50, state.risk_score))

        result = base.copy()
        result["response_confidence"] = f"{confidence}%"
        result["is_fallback"] = True

        return result

    async def generate_response_plan(self, state: DashboardState) -> Dict:
        """Generate AI-powered emergency response plan."""
        # Validate model availability
        if not self._validate_model():
            logger.info("Using fallback response (Groq unavailable)")
            return self._get_fallback_response(state)

        try:
            prompt = self._build_prompt(state)

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an experienced Emergency Operations Commander with 20+ years in disaster response. Generate clear, actionable emergency plans in valid JSON format only. Be precise, professional, and life-saving focused.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
                max_tokens=600,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            result = json.loads(content)

            # Add confidence based on risk score
            confidence = min(98, max(70, state.risk_score + 5))
            result["response_confidence"] = f"{confidence}%"
            result["is_fallback"] = False

            logger.info(f"Generated AI response with {confidence}% confidence (model: {self.model})")
            return result

        except Exception as e:
            error_msg = str(e).lower()
            logger.warning(f"Groq API failed: {e}")

            # Handle model not found - try default
            if "model_not_found" in error_msg or "not found" in error_msg or "404" in error_msg:
                if self.model != DEFAULT_MODEL:
                    logger.warning(f"Model '{self.model}' unavailable. Trying '{DEFAULT_MODEL}'.")
                    self.model = DEFAULT_MODEL
                    try:
                        return await self._retry_with_model(state)
                    except Exception:
                        pass

            # Handle other errors - use fallback
            logger.warning("Groq failed. Using fallback response.")
            return self._get_fallback_response(state)

    async def _retry_with_model(self, state: DashboardState) -> Dict:
        """Retry with a different model."""
        prompt = self._build_prompt(state)
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an experienced Emergency Operations Commander. Generate valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=600,
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        confidence = min(98, max(70, state.risk_score + 5))
        result["response_confidence"] = f"{confidence}%"
        result["is_fallback"] = False
        logger.info(f"AI response successful with model {self.model}")
        return result

    def _build_prompt(self, state: DashboardState) -> str:
        """Build the prompt for AI based on current dashboard state."""
        scenario_context = {
            "normal": "Normal weather conditions. Routine monitoring required. No immediate threats.",
            "moderate_rain": f"Moderate rainfall ({state.rainfall:.0f}mm). Water levels rising. Monitor drainage.",
            "heavy_rain": f"Heavy rainfall ({state.rainfall:.0f}mm). Soil at {state.soil_moisture:.0f}% saturation. Flood risk increasing.",
            "flash_flood": f"FLASH FLOOD CONDITION. Water level {state.water_level:.1f}m, rainfall {state.rainfall:.0f}mm, soil {state.soil_moisture:.0f}%. IMMEDIATE ACTION REQUIRED.",
            "dam_release": f"Dam water release. Downstream water level {state.water_level:.1f}m. Downstream evacuation needed.",
        }

        context = scenario_context.get(
            state.simulator_scenario,
            f"Current scenario: {state.simulator_scenario}"
        )

        return f"""You are an Emergency Operations Commander generating flood emergency response plans.

SITUATION:
- Location: {state.location_name}
- Scenario: {context}
- Rainfall: {state.rainfall:.1f} mm
- Water Level: {state.water_level:.1f} m
- Soil Moisture: {state.soil_moisture:.0f}%
- Risk Score: {state.risk_score}/100 ({state.risk_level})
- Lead Time: {state.lead_time} minutes
- Population at Risk: {state.population_at_risk:,} people
- Active Alerts: {state.active_alerts}

Generate a JSON response with exactly these fields:
{{
  "priority": "SAFE|LOW|MODERATE|HIGH|CRITICAL",
  "headline": "Brief urgent headline (max 60 characters)",
  "summary": "1-2 sentence situation summary",
  "affected_people": integer_number,
  "safe_place": "Specific evacuation center name",
  "eta": "time to impact (e.g., '15 minutes')",
  "actions": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "emergency_sms": "SMS alert starting with 🚨 PRAVAAH (max 160 chars)"
}}

IMPORTANT: Return ONLY valid JSON. No markdown formatting or explanation."""


# Global service instance
ai_response_service = AIResponseService()
