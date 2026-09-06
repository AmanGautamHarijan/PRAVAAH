"""AI Response Plan generation using Groq Llama 3.3 70B Versatile with fallback."""

import json
import os
import logging
from dataclasses import dataclass
from typing import Dict, List, Optional
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


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
    """Generate emergency response plans using Groq Llama 3.3 70B with fallback."""

    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = None
        self.model = "llama-3.3-70b-versatile"

        if self.api_key:
            self.client = AsyncOpenAI(
                api_key=self.api_key,
                base_url="https://api.groq.com/openai/v1"
            )
            logger.info("Groq AI Response Service initialized")
        else:
            logger.warning("GROQ_API_KEY not found, using fallback responses only")

    def _get_fallback_response(self, state: DashboardState) -> Dict:
        """Generate a realistic fallback response when Groq is unavailable."""
        # Base responses by scenario
        fallback_responses = {
            "normal": {
                "priority": "LOW",
                "headline": "All Systems Normal",
                "summary": "No immediate threats detected. Routine monitoring in progress.",
                "affected_people": 0,
                "safe_place": "Current location - no evacuation needed",
                "eta": "N/A",
                "actions": [
                    "Continue routine sensor monitoring",
                    "Check equipment functionality",
                    "Review weather forecasts",
                    "Maintain communication readiness"
                ],
                "emergency_sms": "✅ PRAVAAH STATUS: All systems normal. No action required."
            },
            "moderate_rain": {
                "priority": "MODERATE",
                "headline": "Moderate Rainfall Advisory",
                "summary": "Increased rainfall detected. Monitor drainage systems and prepare for potential water accumulation.",
                "affected_people": max(0, state.population_at_risk // 10),
                "safe_place": "Community Center - Ground Floor",
                "eta": "30-60 minutes",
                "actions": [
                    "Check drainage systems for blockages",
                    "Prepare sandbags for vulnerable areas",
                    "Alert groundskeeping staff",
                    "Monitor water levels hourly"
                ],
                "emergency_sms": "⚠️ PRAVAAH ADVISORY: Moderate rainfall expected. Check drainage and prepare precautions."
            },
            "heavy_rain": {
                "priority": "HIGH",
                "headline": "Heavy Rainfall Warning",
                "summary": "Significant rainfall accumulating. Prepare for potential flooding in low-lying areas.",
                "affected_people": max(0, state.population_at_risk // 4),
                "safe_place": "District Relief Camp - Sector A",
                "eta": "15-25 minutes",
                "actions": [
                    "Deploy flood monitoring teams",
                    "Prepare evacuation routes",
                    "Check pump functionality",
                    "Alert residents in flood-prone zones"
                ],
                "emergency_sms": "🚨 PRAVAAH WARNING: Heavy rainfall accumulating. Prepare for possible flooding. Stay alert."
            },
            "flash_flood": {
                "priority": "CRITICAL",
                "headline": "FLASH FLOOD IMMINENT",
                "summary": "Flash flood detected! Immediate evacuation required for safety.",
                "affected_people": state.population_at_risk,
                "safe_place": "High Ground Shelter - Elevation Zone 3",
                "eta": "5-15 minutes",
                "actions": [
                    "EVACUATE immediately to higher ground",
                    "Deploy NDRF rescue teams",
                    "Close all river crossings",
                    "Activate emergency sirens",
                    "Assist elderly, children, and disabled persons first"
                ],
                "emergency_sms": "🚨🚨🚨 PRAVAAH EMERGENCY: FLASH FLOOD IMMINENT! Evacuate to high ground NOW. Do not delay - seek safety immediately."
            },
            "dam_release": {
                "priority": "CRITICAL",
                "headline": "Dam Release Alert",
                "summary": "Controlled water release detected. Downstream areas at risk.",
                "affected_people": max(0, state.population_at_risk // 2),
                "safe_place": "East Hill Community Center",
                "eta": "10-20 minutes",
                "actions": [
                    "Issue downstream evacuation warning",
                    "Close river crossings and bridges",
                    "Prepare rescue boats",
                    "Monitor water flow rates continuously"
                ],
                "emergency_sms": "🚨 PRAVAAH ALERT: Dam release in progress. Evacuate downstream areas immediately. Seek higher ground."
            }
        }

        # Get base response for scenario, default to moderate_rain
        base = fallback_responses.get(state.simulator_scenario, fallback_responses["moderate_rain"])

        # Adjust based on risk score for more dynamic response
        confidence = min(95, max(50, state.risk_score + (state.population_at_risk // 1000)))

        # Add confidence and fallback badge
        result = base.copy()
        result["response_confidence"] = f"{confidence}%"
        result["is_fallback"] = True

        return result

    async def generate_response_plan(self, state: DashboardState) -> Dict:
        """Generate AI-powered emergency response plan."""
        if not self.client:
            logger.info("Using fallback response (Groq not configured)")
            return self._get_fallback_response(state)

        try:
            # Build prompt for the AI
            prompt = self._build_prompt(state)

            # Call Groq API
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an experienced Emergency Operations Commander with 20+ years in disaster response. Generate clear, actionable emergency plans in valid JSON format only. Be precise, professional, and life-saving focused."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=500,
                response_format={"type": "json_object"}
            )

            # Parse response
            content = response.choices[0].message.content
            result = json.loads(content)

            # Add confidence and mark as AI-generated
            confidence = min(98, max(70, state.risk_score + 5))
            result["response_confidence"] = f"{confidence}%"
            result["is_fallback"] = False

            logger.info(f"Generated AI response plan with {confidence}% confidence")
            return result

        except Exception as e:
            logger.error(f"Groq API failed: {str(e)}. Using fallback.")
            return self._get_fallback_response(state)

    def _build_prompt(self, state: DashboardState) -> str:
        """Build the prompt for AI based on current dashboard state."""
        return f"""
Generate an emergency response plan for the following situation:

LOCATION: {state.location_name} (ID: {state.location_id})
CURRENT CONDITIONS:
- Rainfall: {state.rainfall} mm
- Water Level: {state.water_level} m
- Soil Moisture: {state.soil_moisture}%
- Risk Score: {state.risk_score}/100 ({state.risk_level})
- Lead Time: {state.lead_time} minutes
- Population at Risk: {state.population_at_risk:,} people
- Active Alerts: {state.active_alerts}
- Simulator Scenario: {state.simulator_scenario}

Based on these conditions, provide a JSON response with these exact fields:
- priority: "SAFE"/"LOW"/"MODERATE"/"HIGH"/"CRITICAL"
- headline: Brief, urgent headline (max 60 chars)
- summary: 1-2 sentence situation summary
- affected_people: Number of people at risk (integer)
- safe_place: Specific safe location/evacuation center name
- eta: Estimated time to impact or safety (e.g., "15 minutes")
- actions: Array of 4-6 immediate action items (strings)
- emergency_sms: SMS alert for public (max 160 chars, starts with 🚨 PRAVAAH)

Make the response realistic, actionable, and appropriate for the scenario.
For flash_flood: immediate evacuation needed.
For dam_release: downstream focus.
For normal: monitoring and preparedness.
Return ONLY valid JSON, no additional text.
"""


# Global service instance
ai_response_service = AIResponseService()