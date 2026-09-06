import apiClient from './apiClient'

export async function getResponsePlan(locationId, locationName) {
  const { data } = await apiClient.post('/response-plan', {
    location_id: locationId,
    location_name: locationName,
  })
  return data
}
