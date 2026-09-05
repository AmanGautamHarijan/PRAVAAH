import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPlaceSuggestions, getSelectedPlace } from '../services/mapsService'

const SEARCH_DELAY_MS = 180

export function usePlacesSearch({ enabled, selectedLocation, onLocationSelected }) {
  const [query, setQuery] = useState(selectedLocation.name)
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const requestId = useRef(0)

  useEffect(() => { setQuery(selectedLocation.name) }, [selectedLocation.name])
  useEffect(() => {
    if (!enabled || !isFocused || !query.trim()) {
      setSuggestions([])
      setIsLoading(false)
      return undefined
    }
    const currentRequest = ++requestId.current
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await fetchPlaceSuggestions(query)
        if (currentRequest === requestId.current) {
          setSuggestions(results)
          setActiveIndex(results.length ? 0 : -1)
        }
      } catch {
        if (currentRequest === requestId.current) setSuggestions([])
      } finally {
        if (currentRequest === requestId.current) setIsLoading(false)
      }
    }, SEARCH_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [enabled, isFocused, query])

  const clearSuggestions = useCallback(() => {
    requestId.current += 1
    setSuggestions([])
    setActiveIndex(-1)
  }, [])
  const selectSuggestion = useCallback(async (suggestion) => {
    if (!suggestion) return
    setIsLoading(true)
    try {
      onLocationSelected(await getSelectedPlace(suggestion.prediction))
      setIsFocused(false)
      clearSuggestions()
    } finally { setIsLoading(false) }
  }, [clearSuggestions, onLocationSelected])

  return { query, setQuery, suggestions, activeIndex, setActiveIndex, isLoading, setIsFocused, clearSuggestions, selectSuggestion }
}
