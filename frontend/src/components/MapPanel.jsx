import { useEffect, useRef, useState } from 'react'
import { GoogleMap, MarkerF, PolygonF, Rectangle, TrafficLayerF } from '@react-google-maps/api'
import { LocateFixed, Map, Maximize2, Mountain, Satellite } from 'lucide-react'

const mapContainerStyle = { width: '100%', height: '100%' }
const floodPolygon = [{ lat: 20.64, lng: 78.91 }, { lat: 20.67, lng: 78.99 }, { lat: 20.59, lng: 79.03 }, { lat: 20.55, lng: 78.96 }]
const districtBounds = { north: 20.72, south: 20.48, east: 79.12, west: 78.78 }

function MapPanel({ place, mapsLoaded }) {
  return <section className="map-panel" aria-label="Live risk map"><div className="map-heading"><div><span className="section-kicker">REGION 07 / CENTRAL INDIA</span><h2>Hyper-local flood intelligence</h2></div><span className="map-status"><i /> {mapsLoaded ? 'Google satellite feed' : 'Google Maps setup required'}</span></div><div className="empty-map">{mapsLoaded ? <GoogleMapView place={place} /> : <div className="map-setup"><Map size={25} /><strong>Google Maps is ready to connect</strong><span>Set VITE_GOOGLE_MAPS_API_KEY to enable Places, satellite, terrain, road, hybrid, and flood overlays.</span></div>}</div><div className="map-footer"><span><i className="legend-dot critical" /> Critical</span><span><i className="legend-dot high" /> High</span><span><i className="legend-dot moderate" /> Watch</span><span className="coordinates">3 monitored zones / 12 active sensors</span></div></section>
}

function GoogleMapView({ place }) {
  const mapRef = useRef(null)
  const [mapTypeId, setMapTypeId] = useState('satellite')
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => { mapRef.current?.panTo(place.location) }, [place])
  return <div className={isFullscreen ? 'google-map-wrap fullscreen' : 'google-map-wrap'}><GoogleMap mapContainerStyle={mapContainerStyle} center={place.location} zoom={11} onLoad={(map) => { mapRef.current = map }} options={{ mapTypeId, streetViewControl: false, fullscreenControl: false, mapTypeControl: false, zoomControl: true, gestureHandling: 'greedy' }}><MarkerF position={place.location} title={place.name} /><MarkerF position={{ lat: place.location.lat + .035, lng: place.location.lng + .025 }} title="Village A critical zone" /><MarkerF position={{ lat: place.location.lat - .03, lng: place.location.lng - .025 }} title="Village B high zone" /><PolygonF paths={floodPolygon} options={{ fillColor: '#a63f3b', fillOpacity: .3, strokeColor: '#d37b68', strokeOpacity: .85, strokeWeight: 2 }} /><Rectangle bounds={districtBounds} options={{ fillOpacity: 0, strokeColor: '#d8ae58', strokeOpacity: .7, strokeWeight: 1, clickable: false }} /><TrafficLayerF /></GoogleMap><div className="map-mode-controls" role="group" aria-label="Map view"><button className={mapTypeId === 'satellite' ? 'selected' : ''} onClick={() => setMapTypeId('satellite')} type="button"><Satellite size={14} /> Satellite</button><button className={mapTypeId === 'terrain' ? 'selected' : ''} onClick={() => setMapTypeId('terrain')} type="button"><Mountain size={14} /> Terrain</button><button className={mapTypeId === 'roadmap' ? 'selected' : ''} onClick={() => setMapTypeId('roadmap')} type="button"><Map size={14} /> Road</button><button className={mapTypeId === 'hybrid' ? 'selected' : ''} onClick={() => setMapTypeId('hybrid')} type="button"><Map size={14} /> Hybrid</button></div><div className="map-action-controls"><button type="button" title="Fly to selected place" aria-label="Fly to selected place" onClick={() => mapRef.current?.panTo(place.location)}><LocateFixed size={15} /></button><button type="button" title="Toggle fullscreen" aria-label="Toggle fullscreen" onClick={() => setIsFullscreen((value) => !value)}><Maximize2 size={15} /></button></div></div>
}

export default MapPanel
