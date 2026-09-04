import apiClient from './apiClient'

export const DEFAULT_ALERTS = [
  { location: 'Village A', detail: 'Water level rising rapidly', time: '2 min ago', level: 'critical', value: 'CRITICAL' },
  { location: 'Village B', detail: 'Rainfall threshold exceeded', time: '8 min ago', level: 'high', value: 'HIGH' },
  { location: 'Village C', detail: 'Soil saturation increasing', time: '14 min ago', level: 'moderate', value: 'MODERATE' },
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
