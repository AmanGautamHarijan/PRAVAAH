import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, PolygonF, Rectangle, TrafficLayerF } from '@react-google-maps/api'
import { LocateFixed, Map, Maximize2, Mountain, Satellite } from 'lucide-react'

const mapContainerStyle = { width: '100%', height: '100%' }
const floodPolygon = [{ lat: 20.64, lng: 78.91 }, { lat: 20.67, lng: 78.99 }, { lat: 20.59, lng: 79.03 }, { lat: 20.55, lng: 78.96 }]
const districtBounds = { north: 20.72, south: 20.48, east: 79.12, west: 78.78 }
const radiusByRisk = { CRITICAL: 5000, HIGH: 3000, MODERATE: 1500, LOW: 800 }
const circleStyleByRisk = {
  CRITICAL: { fillColor: '#a63f3b', strokeColor: '#d37b68', pinColor: '#a63f3b' },
  HIGH: { fillColor: '#b96b3f', strokeColor: '#e49a61', pinColor: '#b96b3f' },
  MODERATE: { fillColor: '#d8ae58', strokeColor: '#e9c978', pinColor: '#d8ae58' },
  LOW: { fillColor: '#438d6a', strokeColor: '#72b58d', pinColor: '#438d6a' },
}

function MapPanel({ place, mapsLoaded, liveData, onCoordinatesSelected, missionCard, activeAlertId }) {
  return <section className="map-panel" aria-label="Live risk map"><div className="map-heading"><div><span className="section-kicker">REGION 07 / CENTRAL INDIA</span><h2>Hyper-local flood intelligence</h2></div><span className="map-status"><i /> {mapsLoaded ? 'Google satellite feed' : 'Google Maps setup required'}</span></div><div className="empty-map">{mapsLoaded ? <GoogleMapView place={place} liveData={liveData} onCoordinatesSelected={onCoordinatesSelected} activeAlertId={activeAlertId} /> : <div className="map-setup"><Map size={25} /><strong>Google Maps is ready to connect</strong><span>Set VITE_GOOGLE_MAPS_API_KEY to enable Places, satellite, terrain, road, hybrid, and flood overlays.</span></div>}</div><div className="map-footer"><span><i className="legend-dot critical" /> Critical</span><span><i className="legend-dot high" /> High</span><span><i className="legend-dot moderate" /> Watch</span><span className="coordinates">3 monitored zones / 12 active sensors</span></div>{missionCard}</section>
}

function GoogleMapView({ place, liveData, onCoordinatesSelected, activeAlertId }) {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const markerContentRef = useRef(null)
  const circleRef = useRef(null)
  const circleAnimationRef = useRef(null)
  const previousAlertIdRef = useRef(null)
  const infoWindowRef = useRef(null)
  const [mapTypeId, setMapTypeId] = useState('satellite')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const riskLevel = liveData.prediction?.risk_level || 'CRITICAL'
  const riskRadius = radiusByRisk[riskLevel] || 5000
  const riskStyle = circleStyleByRisk[riskLevel] || circleStyleByRisk.CRITICAL
  const sensor = liveData.sensor || {}

  const openInfoWindow = useCallback((map) => {
    if (!window.google?.maps || !markerRef.current) return
    const content = `<div class="gm-info"><div class="gm-info-head"><strong>${place.name}</strong><span class="gm-risk">${riskLevel}</span></div><div class="gm-info-grid"><span>Rainfall<b>${sensor.rainfall ?? 82} mm</b></span><span>Water level<b>${sensor.water_level ?? 6.2} m</b></span><span>Lead time<b>${liveData.summary.lead_time} min</b></span><span>Population<b>${liveData.summary.population_at_risk.toLocaleString()}</b></span></div><p>Recommended action: prepare evacuation corridors.</p></div>`
    infoWindowRef.current?.close()
    infoWindowRef.current = new window.google.maps.InfoWindow({ content, ariaLabel: place.name })
    infoWindowRef.current.open({ map, anchor: markerRef.current })
  }, [liveData.summary.lead_time, liveData.summary.population_at_risk, place.name, riskLevel, sensor.rainfall, sensor.water_level])

  const animateRiskCircle = useCallback((circle, targetRadius, style, force = false) => {
    if (circleAnimationRef.current) window.cancelAnimationFrame(circleAnimationRef.current)
    circle.setOptions({ ...style, fillOpacity: .14, strokeOpacity: .75, strokeWeight: 2 })
    const currentRadius = circle.getRadius()
    const startRadius = force ? targetRadius * .82 : currentRadius
    if (force) circle.setRadius(startRadius)
    if (Math.abs(startRadius - targetRadius) < 1) return
    const startTime = window.performance.now()
    const animate = (now) => {
      const progress = Math.min((now - startTime) / 400, 1)
      const easedProgress = 1 - (1 - progress) ** 3
      circle.setRadius(startRadius + (targetRadius - startRadius) * easedProgress)
      if (progress < 1) circleAnimationRef.current = window.requestAnimationFrame(animate)
    }
    circleAnimationRef.current = window.requestAnimationFrame(animate)
  }, [])

  const createMarker = useCallback(async (map) => {
    if (!window.google?.maps?.importLibrary) return
    const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary('marker')
    const alertChanged = activeAlertId !== previousAlertIdRef.current
    previousAlertIdRef.current = activeAlertId
    if (markerRef.current && circleRef.current) {
      markerRef.current.position = place.location
      markerRef.current.title = place.name
      markerContentRef.current?.classList.toggle('alert-marker-active', Boolean(activeAlertId))
      circleRef.current.setCenter(place.location)
      animateRiskCircle(circleRef.current, riskRadius, riskStyle, Boolean(activeAlertId) && alertChanged)
      openInfoWindow(map)
      return
    }
    const pin = new PinElement({ background: riskStyle.pinColor, borderColor: '#f1e6d3', glyphColor: '#fff' })
    pin.element.classList.add('arrival-bounce')
    pin.element.classList.toggle('alert-marker-active', Boolean(activeAlertId))
    const marker = new AdvancedMarkerElement({ map, position: place.location, title: place.name, content: pin.element, gmpClickable: true })
    marker.addListener('click', () => openInfoWindow(map))
    markerRef.current = marker
    markerContentRef.current = pin.element
    circleRef.current = new window.google.maps.Circle({ map, center: place.location, radius: riskRadius, ...riskStyle, fillOpacity: .14, strokeOpacity: .75, strokeWeight: 2 })
    openInfoWindow(map)
  }, [activeAlertId, animateRiskCircle, openInfoWindow, place.location, place.name, riskRadius, riskStyle])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.panTo(place.location)
    mapRef.current.setZoom(14)
    createMarker(mapRef.current)
  }, [createMarker, place])
  useEffect(() => () => { if (circleAnimationRef.current) window.cancelAnimationFrame(circleAnimationRef.current); if (markerRef.current) markerRef.current.map = null; circleRef.current?.setMap(null); infoWindowRef.current?.close() }, [])

  const handleMapClick = useCallback((event) => {
    const coordinates = event.latLng && { lat: event.latLng.lat(), lng: event.latLng.lng() }
    if (coordinates) onCoordinatesSelected?.(coordinates)
  }, [onCoordinatesSelected])
  const flyToPlace = () => { mapRef.current?.panTo(place.location); mapRef.current?.setZoom(14) }
  const onLoad = (map) => { mapRef.current = map; map.setZoom(14); createMarker(map) }

  return <div className={isFullscreen ? 'google-map-wrap fullscreen' : 'google-map-wrap'}><GoogleMap
  mapContainerStyle={mapContainerStyle}
  center={place.location}
  zoom={14}
  onLoad={onLoad}
  onClick={handleMapClick}
  options={{
    mapTypeId,
    mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    zoomControl: true,
    gestureHandling: 'greedy'
  }}
>
  {false && (
    <PolygonF
      paths={floodPolygon}
      options={{
        fillColor: '#a63f3b',
        fillOpacity: 0.3,
        strokeColor: '#d37b68',
        strokeOpacity: 0.85,
        strokeWeight: 2
      }}
    />
  )}

  {false && (
    <Rectangle
      bounds={districtBounds}
      options={{
        fillOpacity: 0,
        strokeColor: '#d8ae58',
        strokeOpacity: 0.7,
        strokeWeight: 1,
        clickable: false
      }}
    />
  )}

  <TrafficLayerF />
</GoogleMap><div className="map-mode-controls" role="group" aria-label="Map view"><button className={mapTypeId === 'satellite' ? 'selected' : ''} onClick={() => setMapTypeId('satellite')} type="button"><Satellite size={14} /> Satellite</button><button className={mapTypeId === 'terrain' ? 'selected' : ''} onClick={() => setMapTypeId('terrain')} type="button"><Mountain size={14} /> Terrain</button><button className={mapTypeId === 'roadmap' ? 'selected' : ''} onClick={() => setMapTypeId('roadmap')} type="button"><Map size={14} /> Road</button><button className={mapTypeId === 'hybrid' ? 'selected' : ''} onClick={() => setMapTypeId('hybrid')} type="button"><Map size={14} /> Hybrid</button></div><div className="map-action-controls"><button type="button" title="Fly to selected place" aria-label="Fly to selected place" onClick={flyToPlace}><LocateFixed size={15} /></button><button type="button" title="Toggle fullscreen" aria-label="Toggle fullscreen" onClick={() => setIsFullscreen((value) => !value)}><Maximize2 size={15} /></button></div></div>
}

export default MapPanel
