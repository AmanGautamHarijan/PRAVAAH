# 🌊 PRAVAAH
## AI-Powered Hyper-Local Landslide & Flash Flood Intelligence Platform

> **Predict • Prepare • Protect Lives**

PRAVAAH is an AI-powered disaster intelligence platform built for **Smart India Hackathon (SIH) 2026** to address one of India's biggest challenges: **hyper-local landslide and flash flood prediction in hilly regions.**

Instead of broad district-level warnings, PRAVAAH combines **real-time IoT data, rainfall information, soil moisture, slope stability analysis, historical disaster records, and AI prediction** to generate **village-level early warnings**, evacuation guidance, and emergency response plans.

---

## 🚨 Problem Statement

Hilly regions across India experience landslides and flash floods with very little warning, resulting in significant loss of life and property.

Current systems often:
- Provide district-level rather than village-level alerts.
- Lack real-time IoT sensor integration.
- Offer limited evacuation planning.
- Delay coordination between disaster response teams.

**PRAVAAH transforms disaster prediction into actionable intelligence.**

---

## ✨ Key Features

- 🌧️ Hyper-local village/ward-level risk prediction
- 🗺️ Live Google Maps disaster dashboard
- 📡 Real-time IoT sensor monitoring
- 🤖 AI-generated emergency response plans
- 🚨 Automatic evacuation guidance
- 📱 Emergency SMS alert generation
- 🎮 Live disaster simulation mode
- 📊 Command center for disaster authorities
- 🔄 Real-time updates through WebSockets

---

## 🔄 How PRAVAAH Works

1. Collect rainfall, soil moisture, slope stability, historical disaster, and IoT sensor data.
2. Fuse multiple data sources into a unified prediction engine.
3. Run AI/ML risk estimation.
4. Generate village-level forecasts.
5. Display results on a live Google Maps dashboard.
6. Create evacuation plans and emergency alerts.

**Workflow**

```
Rainfall + Soil Moisture + Slope Data + Historical Records + IoT Sensors
                              │
                              ▼
                 AI Prediction Engine (ML + Data Fusion)
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   Live Map Alerts     Evacuation Plan      Emergency SMS
                              │
                              ▼
                    Authorities & Citizens
```

---

## 🖥️ Dashboard Highlights

The dashboard provides:

- Live disaster monitoring
- Google Maps visualization
- Real-time notification center
- Current mission panel
- Risk intelligence cards
- Disaster simulator
- AI response generation

---

## 🛠️ Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| Backend | FastAPI (Python) |
| Real-time | WebSockets |
| AI | Groq LLM |
| Maps | Google Maps API |
| ML | Scikit-learn + XGBoost |
| Version Control | Git & GitHub |
| Deployment | Docker (Optional) |

---

## 📂 Project Structure

```text
PRAVAAH/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── main.py
│
├── docs/
├── README.md
└── .gitignore
```

---

## 🚀 Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/AmanGautamHarijan/PRAVAAH.git
cd PRAVAAH
```

### 2. Backend Setup

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory.

```env
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=groq/compound-mini
```

> If the Groq model is unavailable, PRAVAAH automatically falls back to built-in emergency response templates.

---

## 📡 API Endpoints

### Health

| Method | Endpoint |
|---------|----------|
| GET | `/health` |

### Dashboard

| Method | Endpoint |
|---------|----------|
| GET | `/dashboard/summary` |

### Sensor Data

| Method | Endpoint |
|---------|----------|
| POST | `/sensor-data` |
| GET | `/sensor-data/latest` |

### Prediction

| Method | Endpoint |
|---------|----------|
| POST | `/predict` |

### AI Response

| Method | Endpoint |
|---------|----------|
| POST | `/response-plan` |

### Simulator

| Method | Endpoint |
|---------|----------|
| POST | `/simulator/start` |
| POST | `/simulator/stop` |
| GET | `/simulator/status` |
| GET | `/simulator/scenarios` |

---

## 🤖 AI Response Generator

PRAVAAH's AI module creates structured emergency response plans containing:

- Situation summary
- Immediate actions
- Safe evacuation routes
- Emergency shelter guidance
- Resource allocation
- Public communication
- SMS-ready alerts

Example:

> "Flood warning issued for Village A. Water level rising rapidly. Evacuate vulnerable households within 75 minutes and move toward designated shelters."

---

## 💡 Innovation

Unlike traditional disaster warning systems, PRAVAAH combines:

- AI prediction
- IoT monitoring
- GIS visualization
- Real-time simulation
- Emergency response planning

into a **single disaster intelligence platform** capable of providing **village-level actionable alerts**.

---

## 🌍 Future Scope

- Drone-assisted damage assessment
- Satellite imagery integration
- Mobile citizen reporting app
- Multi-language voice alerts
- Offline emergency mode
- State-wide disaster coordination

---

## 👥 Team Collaboration

The project follows a Git-based collaborative workflow.

```
Feature Branch
      │
      ▼
Push to GitHub
      │
      ▼
Pull Request
      │
      ▼
Code Review
      │
      ▼
Merge into Develop
```

---

## 📚 Research References

PRAVAAH is built using official government datasets and modern AI technologies.

### Government Sources

- India Meteorological Department (IMD): https://mausam.imd.gov.in/
- National Disaster Management Authority (NDMA): https://ndma.gov.in/
- National Remote Sensing Centre (NRSC): https://www.nrsc.gov.in/
- Geological Survey of India (GSI): https://www.gsi.gov.in/

### Technology References

- Google Maps Platform: https://developers.google.com/maps
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/
- Scikit-learn: https://scikit-learn.org/
- XGBoost: https://xgboost.readthedocs.io/
- Groq API Documentation: https://console.groq.com/docs

---

## 🏆 Smart India Hackathon 2026

PRAVAAH transforms disaster data into **hyper-local intelligence**, empowering communities and disaster response teams to **predict, prepare, and protect lives.**
