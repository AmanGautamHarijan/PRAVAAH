import apiClient from './apiClient'

export async function requestPrediction(sensor) {
  if (!sensor) return null

  const { data } = await apiClient.post('/predict', {
    location_id: sensor.location_id,
    rainfall: sensor.rainfall,
    soil_moisture: sensor.soil_moisture,
    water_level: sensor.water_level,
  })

  return data
}
