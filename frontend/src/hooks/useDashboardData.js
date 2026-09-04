import { useEffect, useState } from 'react'
import { DEFAULT_ALERTS, getAlerts, getLatestSensor, getSummary } from '../services/dashboardApi'
import { requestPrediction } from '../services/predictionApi'
import { connectLiveSocket } from '../services/websocket'

const EMPTY = {
  summary: { overall_risk: 'CRITICAL', affected_villages: 3, population_at_risk: 12840, lead_time: 75, active_alerts: 2 },
  sensor: null,
  prediction: null,
  alerts: DEFAULT_ALERTS,
  connected: false,
}

export function useDashboardData(place) {
  const [data, setData] = useState(EMPTY)

  useEffect(() => {
    let mounted = true
    Promise.all([getLatestSensor(), getSummary(), getAlerts()]).then(async ([sensor, summary, alerts]) => {
      if (!mounted) return
      let prediction = null
      try { prediction = await requestPrediction(sensor) } catch { prediction = null }
      if (mounted) setData((current) => ({ ...current, sensor, summary, alerts, prediction }))
    }).catch(() => {})
    return () => { mounted = false }
  }, [place])

  useEffect(() => {
    return connectLiveSocket({
      onOpen: () => setData((current) => ({ ...current, connected: true })),
      onMessage: (event) => {
        const sensor = JSON.parse(event.data)
        setData((current) => ({ ...current, sensor: { ...sensor, location_id: sensor.location_id || sensor.location }, connected: true }))
      },
      onClose: () => setData((current) => ({ ...current, connected: false })),
    })
  }, [])

  return data
}
