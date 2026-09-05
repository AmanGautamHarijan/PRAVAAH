import { useEffect, useState } from 'react'
import { DEFAULT_ALERTS, getLatestSensor, getSummary } from '../services/dashboardApi'
import { requestPrediction } from '../services/predictionApi'

const POLL_INTERVAL_MS = 5000
const EMPTY = {
  summary: { overall_risk: 'CRITICAL', affected_villages: 3, population_at_risk: 12840, lead_time: 75, active_alerts: 2 },
  sensor: null,
  prediction: null,
  alerts: DEFAULT_ALERTS,
  connected: false,
  loading: true,
  error: null,
}

function selectedLocationId({ latitude, longitude }) {
  return `place:${latitude.toFixed(5)},${longitude.toFixed(5)}`
}

export function useDashboardData(place) {
  const [data, setData] = useState(EMPTY)

  useEffect(() => {
    let mounted = true
    const refreshDashboard = async () => {
      try {
        const [summary, sensor] = await Promise.all([getSummary(), getLatestSensor()])
        let prediction = null
        try {
          prediction = await requestPrediction({ ...sensor, location_id: selectedLocationId(place) })
        } catch {
          prediction = null
        }
        if (!mounted) return
        setData((current) => ({
          ...current,
          summary: prediction ? { ...summary, overall_risk: prediction.risk_level, lead_time: prediction.lead_time } : summary,
          sensor,
          prediction,
          connected: true,
          loading: false,
          error: null,
        }))
      } catch (error) {
        if (mounted) setData((current) => ({ ...current, connected: false, loading: false, error }))
      }
    }

    refreshDashboard()
    const intervalId = window.setInterval(refreshDashboard, POLL_INTERVAL_MS)
    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [place])

  return data
}
