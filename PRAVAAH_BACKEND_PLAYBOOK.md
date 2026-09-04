# PRAVAAH Backend + AI Playbook

## Role
Backend Lead (Owner)

This playbook is designed for Claude Code, ChatGPT, Gemini, Grok, or any coding LLM.

## Mission
Build the **entire backend**, AI, ML, database, and APIs.

Do NOT build frontend.

## Tech Stack
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- XGBoost
- Docker

## Folder Ownership
Only modify:

backend/

Expected structure:

backend/
 └── app/
     ├── api/
     ├── database/
     ├── ml/
     ├── models/
     ├── simulator/
     └── main.py

## Frozen API Contract

POST /sensor-data

{
 "location_id":"LOC101",
 "rainfall":82,
 "soil_moisture":79,
 "water_level":63
}

Response:

{"status":"received"}

POST /predict

{
 "risk_score":91,
 "risk_level":"CRITICAL",
 "lead_time":75,
 "probability":0.87,
 "top_factors":["Heavy Rainfall","High Soil Moisture","Steep Terrain"]
}

GET /dashboard/summary

{
 "overall_risk":"CRITICAL",
 "affected_villages":3,
 "population_at_risk":12840,
 "lead_time":75,
 "active_alerts":2
}

Never rename these fields.

## ML Pipeline
- Rainfall
- Forecast Rainfall
- Soil Moisture
- Elevation
- Slope
- Distance to River
- Historical Flood Frequency
- Water Level

Model: XGBoost

Outputs:
- Risk Score
- Probability
- Lead Time
- Explainable Factors

## Milestones

1. FastAPI setup
2. PostgreSQL
3. Database models
4. APIs
5. XGBoost
6. IoT simulator
7. Docker

## Git Workflow

git checkout -b feature/backend

Daily:

git add .
git commit -m "Describe today's work"
git push origin feature/backend

Create a Pull Request to develop.

## AI Prompt Template

Read MASTER_ORCHESTRATOR.md.

You are my senior FastAPI architect.

Build only inside backend/.

Wait for my approval before moving to the next milestone.
