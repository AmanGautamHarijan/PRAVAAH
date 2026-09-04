import { useEffect, useState } from 'react'
import { getWeather } from '../services/weatherApi'

export function useWeather({ latitude, longitude }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    getWeather(latitude, longitude, controller.signal)
      .then((data) => setWeather(data))
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [latitude, longitude])

  return { weather, loading, error }
}
