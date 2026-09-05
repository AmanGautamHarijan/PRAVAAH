# PRAVAAH -- Project Handoff

## Current Status

PRAVAAH is a React + FastAPI disaster intelligence dashboard.

### Working Features

-   FastAPI backend (Python 3.11)
-   React + Vite frontend
-   Google Maps with valid Map ID
-   Google Places Autocomplete search
-   Risk dashboard
-   Sensor data endpoints
-   Dashboard summary endpoint
-   Git repository restored (`develop` branch)

**WebSocket has been intentionally removed.**

## Project Structure

``` text
PRAVAAH/
├── backend/
├── frontend/
├── datasets/
├── docs/
├── docker/
└── testing/
```

## Setup

### Backend

``` bash
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend: `http://127.0.0.1:8000/docs`

### Frontend

``` bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Required Environment Variables

`frontend/.env`

``` env
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
VITE_GOOGLE_MAP_ID=YOUR_MAP_ID
```

## Git Workflow

Current branch: `develop`

Before starting:

``` bash
git pull origin develop
```

After completing a task:

``` bash
git add .
git commit -m "Describe the feature"
git push origin develop
```

## Known Issues

### UI

-   Mission card overlaps map controls.
-   Fonts are still too small.
-   Mission title sometimes shows coordinates instead of place name.
-   Search bar spacing needs improvement.

### Backend

-   `POST /sensor-data` location lookup behavior may need refinement.
-   WebSocket is intentionally disabled.

# Next Priority Tasks

  Priority     Task                                 Status
  ------------ ------------------------------------ ---------
  ⭐⭐⭐⭐⭐   **Build Live Disaster Simulator**    Next
  ⭐⭐⭐⭐     UI Polish (fonts + overlap fixes)    Pending
  ⭐⭐⭐⭐     Connect ML `/predict` to dashboard   Pending
  ⭐⭐⭐       Live Weather integration             Pending
  ⭐⭐⭐       Dynamic alert timeline               Pending
  ⭐⭐         PDF incident report export           Pending

# 🚨 Major Upcoming Feature: Live Disaster Simulator

## Why this is the priority

The simulator is the **flagship feature** of PRAVAAH. Instead of showing
static numbers, the dashboard should behave like a real Emergency
Operations Center where disaster conditions evolve continuously.

## Simulator Pipeline

``` text
Simulator
    ↓
Sensor Data API
    ↓
ML Prediction (/predict)
    ↓
Dashboard
    ↓
Google Maps + Alerts + Mission Card
```

## Phase 1: Live Simulator (MVP)

-   Start Simulation button
-   Stop Simulation button
-   Automatic updates every **5 seconds**
-   Simulate:
    -   Rainfall
    -   Water Level
    -   Soil Moisture

## Phase 2: Disaster Scenarios

-   Normal Weather
-   Moderate Rain
-   Heavy Rain
-   Flash Flood
-   Dam Release

Values should change gradually, not jump instantly.

## Phase 3: ML Integration

Every simulated reading should:

1.  Send data to `POST /predict`
2.  Receive:
    -   Risk Score
    -   Risk Level
3.  Update:
    -   Overall Risk
    -   Risk Trend
    -   Mission Card
    -   Alert Severity
    -   Flood-risk radius on the map

## Expected Demo Flow

1.  Search a location.
2.  Start **Flash Flood Simulation**.
3.  Rainfall begins increasing.
4.  Water level rises.
5.  Risk changes to **CRITICAL**.
6.  Red danger zone expands.
7.  Mission recommendation updates.
8.  Live alerts appear automatically.

## Coding Rules

-   Keep backend and frontend responsibilities separate.
-   Do not change APIs unless necessary.
-   Reuse existing hooks and services.
-   Keep commits focused on a single feature.
-   For small fixes, implement manually.
-   For large features, use a scoped Codex prompt.

## Testing Checklist

Before pushing:

-   [ ] Backend starts successfully.
-   [ ] Frontend builds (`npm run build`).
-   [ ] Location search works.
-   [ ] Google Maps loads correctly.
-   [ ] Dashboard updates without console errors.
-   [ ] Git status is clean after commit.

## Current Goal

1.  Finish UI polish (fonts, overlap, spacing).
2.  Build the Live Disaster Simulator.
3.  Connect simulator output to the ML prediction endpoint.
4.  Continue with weather and advanced disaster intelligence features.
