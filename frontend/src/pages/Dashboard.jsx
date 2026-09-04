import { useState } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { useDashboardData } from '../hooks/useDashboardData'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import MapPanel from '../components/MapPanel'
import AlertsPanel from '../components/AlertsPanel'
import Analytics from '../components/Analytics'
import Radar from '../components/Radar'
import MissionCard from '../components/MissionCard'

const libraries = ['places', 'geometry', 'marker']
const DEFAULT_PLACE = { name: 'Central India flood belt', location: { lat: 20.5937, lng: 78.9629 } }

function Dashboard() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) return <DashboardContent place={DEFAULT_PLACE} mapsLoaded={false} />
  return <MapsEnabledDashboard apiKey={apiKey} />
}

function MapsEnabledDashboard({ apiKey }) {
  const { isLoaded } = useJsApiLoader({ id: 'pravaah-google-maps', googleMapsApiKey: apiKey, libraries })
  const [place, setPlace] = useState(DEFAULT_PLACE)
  return <DashboardContent place={place} mapsLoaded={isLoaded} onPlaceSelected={setPlace} />
}

function DashboardContent({ place, mapsLoaded, onPlaceSelected }) {
  const liveData = useDashboardData(place)
  return <div className="app-shell"><Sidebar /><main className="main-content"><Topbar mapsLoaded={mapsLoaded} onPlaceSelected={onPlaceSelected} /><MapPanel place={place} mapsLoaded={mapsLoaded} liveData={liveData} /><Radar /><MissionCard place={place} /><AlertsPanel place={place} liveData={liveData} /><Analytics place={place} liveData={liveData} /></main></div>
}

export default Dashboard
