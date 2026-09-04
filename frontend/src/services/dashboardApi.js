import apiClient from './apiClient'

export const DEFAULT_ALERTS = [
  { id: 'village-a', location: 'Village A', latitude: 20.5937, longitude: 78.9629, detail: 'Water level rising rapidly', time: '2 min ago', level: 'critical', value: 'CRITICAL' },
  { id: 'village-b', location: 'Village B', latitude: 20.6037, longitude: 78.9729, detail: 'Rainfall threshold exceeded', time: '8 min ago', level: 'high', value: 'HIGH' },
  { id: 'village-c', location: 'Village C', latitude: 20.5837, longitude: 78.9529, detail: 'Soil saturation increasing', time: '14 min ago', level: 'moderate', value: 'MODERATE' },
]

export async function getSummary() {
  const { data } = await apiClient.get('/dashboard/summary')
  return data
}

export async function getLatestSensor() {
  const { data } = await apiClient.get('/sensor-data/latest')
  return data
}

export async function getAlerts() {
  return DEFAULT_ALERTS
}
