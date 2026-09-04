const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  if (!response.ok) throw new Error(`${path} returned ${response.status}`)
  return response.json()
}

export function fetchDashboardData() {
  return Promise.all([
    request('/sensor-data/latest'),
    request('/dashboard/summary'),
  ]).then(([sensor, summary]) => ({ sensor, summary }))
}

export function requestPrediction(sensor) {
  return request('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location_id: sensor.location_id, rainfall: sensor.rainfall, soil_moisture: sensor.soil_moisture, water_level: sensor.water_level }),
  })
}

export function getLiveSocketUrl() {
  return (import.meta.env.VITE_WS_BASE_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api`) + '/ws/live'
}
