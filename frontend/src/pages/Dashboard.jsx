import { useJsApiLoader } from '@react-google-maps/api'
import { useDashboardData } from '../hooks/useDashboardData'
import { useSelectedLocation } from '../hooks/useSelectedLocation'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import MapPanel from '../components/MapPanel'
import AlertsPanel from '../components/AlertsPanel'
import Analytics from '../components/Analytics'
import Radar from '../components/Radar'
import MissionCard from '../components/MissionCard'

const libraries = ['places', 'geometry', 'marker']
const DEFAULT_PLACE = { name: 'Central India flood belt', latitude: 20.5937, longitude: 78.9629, location: { lat: 20.5937, lng: 78.9629 } }

function Dashboard() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) return <DashboardContent selectedLocation={DEFAULT_PLACE} mapsLoaded={false} />
  return <MapsEnabledDashboard apiKey={apiKey} />
}

function MapsEnabledDashboard({ apiKey }) {
  const { isLoaded } = useJsApiLoader({ id: 'pravaah-google-maps', googleMapsApiKey: apiKey, libraries })
  const { selectedLocation, selectLocation, selectCoordinates } = useSelectedLocation(DEFAULT_PLACE)
  return <DashboardContent selectedLocation={selectedLocation} mapsLoaded={isLoaded} onLocationSelected={selectLocation} onCoordinatesSelected={selectCoordinates} />
}

function DashboardContent({ selectedLocation, mapsLoaded, onLocationSelected, onCoordinatesSelected }) {
  const liveData = useDashboardData(selectedLocation)
  return <div className="app-shell"><Sidebar /><main className="main-content"><Topbar mapsLoaded={mapsLoaded} selectedLocation={selectedLocation} onLocationSelected={onLocationSelected} /><MapPanel place={selectedLocation} mapsLoaded={mapsLoaded} liveData={liveData} onCoordinatesSelected={onCoordinatesSelected} /><Radar /><MissionCard place={selectedLocation} /><AlertsPanel place={selectedLocation} liveData={liveData} /><Analytics place={selectedLocation} liveData={liveData} /></main></div>
}

export default Dashboard
