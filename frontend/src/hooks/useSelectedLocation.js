import { useCallback, useRef, useState } from 'react'
import { reverseGeocodeLocation, toSelectedLocation } from '../services/mapsService'

export function useSelectedLocation(initialLocation) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const coordinateRequestId = useRef(0)
  const selectLocation = useCallback((location) => {
    coordinateRequestId.current += 1
    setSelectedLocation(toSelectedLocation(location))
  }, [])
  const selectCoordinates = useCallback(async (coordinates) => {
    const requestId = ++coordinateRequestId.current
    setSelectedLocation(toSelectedLocation({ location: coordinates }))
    try {
      const location = await reverseGeocodeLocation(coordinates)
      if (requestId === coordinateRequestId.current) setSelectedLocation(location)
    } catch {
      // The coordinate fallback remains selected if geocoding is unavailable.
    }
  }, [])
  return { selectedLocation, selectLocation, selectCoordinates }
}
