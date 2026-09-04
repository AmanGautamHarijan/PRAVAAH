import { useEffect, useState } from 'react'
import { fetchDashboardData, getLiveSocketUrl, requestPrediction } from '../services/dashboardApi'

const EMPTY = { summary: { overall_risk: 'CRITICAL', affected_villages: 3, population_at_risk: 12840, lead_time: 75, active_alerts: 2 }, sensor: null, prediction: null, connected: false }

export function useDashboardData(place) {
  const [data, setData] = useState(EMPTY)
  useEffect(() => {
    let mounted = true
    fetchDashboardData().then(async (result) => {
      if (!mounted) return
      let prediction = null
      try { prediction = await requestPrediction(result.sensor) } catch { prediction = null }
      if (mounted) setData({ ...result, prediction, connected: false })
    }).catch(() => {})
    return () => { mounted = false }
  }, [place])

  useEffect(() => {
    let socket
    let reconnectTimer
    try {
      socket = new WebSocket(getLiveSocketUrl())
      socket.onopen = () => setData((current) => ({ ...current, connected: true }))
      socket.onmessage = (event) => {
        const sensor = JSON.parse(event.data)
        setData((current) => ({ ...current, sensor: { ...sensor, location_id: sensor.location_id || sensor.location }, connected: true }))
      }
      socket.onclose = () => { setData((current) => ({ ...current, connected: false })) }
      socket.onerror = () => socket.close()
    } catch { setData((current) => ({ ...current, connected: false })) }
    return () => { clearTimeout(reconnectTimer); socket?.close() }
  }, [])
  return data
}
