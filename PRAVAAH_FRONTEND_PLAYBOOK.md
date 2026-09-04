# PRAVAAH Frontend AI Playbook

## Role
Frontend Lead (Owner)

This playbook is designed for Claude Code, ChatGPT, Gemini, Grok, or any coding LLM.

## Mission
Build the **entire frontend** of PRAVAAH using React, Vite, Tailwind CSS, Leaflet, and Recharts.

Do NOT build backend.

## Dashboard Rules
Use the provided dashboard image as the design bible.

- Dark Navy (#020B1D)
- Electric Blue accents
- Left Sidebar
- Top Command Bar
- Center Satellite Map
- Right Alert Panel
- Bottom Analytics Cards

Never redesign the UI.

## Tech Stack
- React
- Vite
- Tailwind CSS
- Leaflet
- Recharts
- Framer Motion

## Folder Ownership
Only modify:

frontend/

Expected structure:

frontend/
 └── src/
     ├── components/
     ├── pages/
     ├── maps/
     ├── services/
     ├── hooks/
     ├── utils/
     └── App.jsx

## Frozen API Contract

GET /dashboard/summary

{
 "overall_risk":"CRITICAL",
 "affected_villages":3,
 "population_at_risk":12840,
 "lead_time":75,
 "active_alerts":2
}

POST /predict

{
 "risk_score":91,
 "risk_level":"CRITICAL",
 "lead_time":75,
 "probability":0.87,
 "top_factors":["Heavy Rainfall","High Soil Moisture","Steep Terrain"]
}

Never rename these fields.

## Milestones

1. React + Vite setup
2. Dashboard layout
3. Sidebar
4. Top Bar
5. Risk Cards
6. Leaflet Map
7. Alert Panel
8. Charts
9. API Integration

## Git Workflow

git checkout -b feature/frontend

Daily:

git add .
git commit -m "Describe today's work"
git push origin feature/frontend

Create a Pull Request to develop.

## AI Prompt Template

Read MASTER_ORCHESTRATOR.md.

You are my senior React architect.

Build only inside frontend/.

Wait for my approval before moving to the next milestone.
