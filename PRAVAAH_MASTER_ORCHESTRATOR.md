# PRAVAAH --- Master Orchestrator

**Smart India Hackathon 2025**

**Version:** 1.0

> Mission: Build an AI-powered Hyper-Local Flash Flood Intelligence &
> Decision Support Platform.

## Project Vision

PRAVAAH is a decision-support layer that fuses weather, terrain,
historical disaster data, and IoT-ready inputs into hyper-local risk
assessment, lead-time estimation, impact assessment, and recommended
actions.

## Core Product Flow

Weather + Terrain + Historical Data + IoT ↓ Data Fusion Engine ↓ AI Risk
Engine (XGBoost) ↓ Hyper-local Risk Map ↓ Lead-Time Estimate ↓ Impact
Assessment ↓ Recommended Actions

## UI Design Bible

Use the provided dashboard mockup as the single source of truth.

-   Dark navy command-center theme
-   Electric blue accents
-   Red critical alerts
-   Amber warnings
-   Green operational indicators
-   Satellite map at center
-   Left navigation
-   Right alert panel

Do not redesign the UI.

## Frozen Tech Stack

-   Frontend: React + Vite + Tailwind
-   Maps: Leaflet
-   Charts: Recharts
-   Backend: FastAPI
-   ML: XGBoost
-   Database: PostgreSQL
-   ORM: SQLAlchemy
-   Deployment: Docker

## Repository Structure

    PRAVAAH/
    ├── backend/
    ├── frontend/
    ├── datasets/
    ├── design/
    ├── docs/
    ├── testing/
    └── docker/

## Immutable API Contracts

### POST /sensor-data

Request

``` json
{
  "location_id":"LOC101",
  "rainfall":82,
  "soil_moisture":79,
  "water_level":63
}
```

Response

``` json
{
  "status":"received"
}
```

### POST /predict

``` json
{
  "risk_score":91,
  "risk_level":"CRITICAL",
  "lead_time":75,
  "probability":0.87,
  "top_factors":[
    "Heavy Rainfall",
    "High Soil Moisture",
    "Steep Terrain"
  ]
}
```

### GET /dashboard/summary

``` json
{
  "overall_risk":"CRITICAL",
  "affected_villages":3,
  "population_at_risk":12840,
  "lead_time":75,
  "active_alerts":2
}
```

## Database Schema

### locations

-   id
-   name
-   latitude
-   longitude
-   district
-   state

### sensor_data

-   id
-   location_id
-   rainfall
-   soil_moisture
-   water_level
-   timestamp

### predictions

-   id
-   location_id
-   risk_score
-   probability
-   risk_level
-   lead_time
-   created_at

### alerts

-   id
-   prediction_id
-   message
-   severity
-   created_at

## Machine Learning Workflow

Inputs:

-   Rainfall
-   Forecast Rainfall
-   Soil Moisture
-   Elevation
-   Slope
-   Distance to River
-   Historical Flood Frequency
-   Water Level

Model: **XGBoost**

Outputs:

-   Flood Probability
-   Risk Score
-   Risk Level
-   Estimated Lead Time
-   Top contributing factors

## Explainable AI

Every prediction must explain why risk increased using:

-   Heavy Rainfall
-   Soil Saturation
-   Forecast Rain
-   Terrain
-   Historical Flood Pattern

## Dashboard Components

-   Overview Cards
-   Interactive Leaflet Map
-   Risk Legend
-   Active Alerts
-   Recommended Actions
-   IoT Overview
-   Risk Trend
-   Why Risk Is High
-   Impact Summary

## Risk Colors

  Level      Color
  ---------- --------
  Safe       Blue
  Low        Green
  Moderate   Yellow
  High       Orange
  Critical   Red

## Team Ownership

  Member   Responsibility
  -------- ----------------
  1        Backend + AI
  2        Frontend
  3        Data Research
  4        UI Assets
  5        Documentation
  6        Testing

## Git Workflow

    main
     │
    develop
     ├── feature/backend
     ├── feature/frontend
     ├── feature/data
     ├── feature/design
     ├── feature/docs
     └── feature/testing

Never push directly to `main`.

## Demo Story

Dashboard → Rainfall Increases → AI Recalculates → Map Turns Green →
Yellow → Orange → Red → Alert → Shelter Recommendation.

## Final Rule for Every LLM

You are one engineer inside a six-person SIH team.

-   Respect the frozen architecture.
-   Never redesign the UI.
-   Never change API contracts.
-   Generate production-ready work only for the assigned module.
