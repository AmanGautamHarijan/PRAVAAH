const fallbackName = (location) => `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`

function getCoordinates(location) {
  return { lat: location.lat(), lng: location.lng() }
}

export function toSelectedLocation({ name, location }) {
  const coordinates = typeof location.lat === 'function' ? getCoordinates(location) : location
  return { name: name || fallbackName(coordinates), latitude: coordinates.lat, longitude: coordinates.lng, location: coordinates }
}

export async function fetchPlaceSuggestions(input) {
  if (!input.trim() || !window.google?.maps?.importLibrary) return []
  const { AutocompleteSuggestion } = await window.google.maps.importLibrary('places')
  const { suggestions = [] } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({ input })
  return suggestions.filter(({ placePrediction }) => placePrediction).map(({ placePrediction }) => ({
    id: placePrediction.placeId,
    primaryText: placePrediction.mainText || placePrediction.text?.toString() || 'Unknown location',
    secondaryText: placePrediction.secondaryText || '',
    prediction: placePrediction,
  }))
}

export async function getSelectedPlace(prediction) {
  const place = prediction.toPlace()
  await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] })
  return toSelectedLocation({ name: place.formattedAddress || place.displayName, location: place.location })
}

export async function reverseGeocodeLocation(location) {
  if (!window.google?.maps?.importLibrary) return toSelectedLocation({ location })
  const { Geocoder } = await window.google.maps.importLibrary('geocoding')
  const { results = [] } = await new Geocoder().geocode({ location })
  return toSelectedLocation({ name: results[0]?.formatted_address, location })
}
