import apiClient from './apiClient'

export const simulatorApi = {
  start: async (scenario = 'normal') => {
    const response = await apiClient.post('/simulator/start', { scenario })
    return response.data
  },

  stop: async () => {
    const response = await apiClient.post('/simulator/stop')
    return response.data
  },

  status: async () => {
    const response = await apiClient.get('/simulator/status')
    return response.data
  },

  scenarios: async () => {
    const response = await apiClient.get('/simulator/scenarios')
    return response.data.scenarios
  },
}
