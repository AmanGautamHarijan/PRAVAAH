import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const path = error.config?.url || 'request'
    const detail = error.response?.data?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg || item).join(', ')
      : detail || error.message || 'Request failed'

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error(`${path} timed out`))
    }

    if (!error.response) {
      return Promise.reject(new Error(`${path} network error: ${message}`))
    }

    return Promise.reject(new Error(`${path} returned ${status}: ${message}`))
  },
)

export default apiClient
