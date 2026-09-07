import { useEffect, useRef, useState } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { useDashboardData } from '../hooks/useDashboardData'
import { useSelectedLocation } from '../hooks/useSelectedLocation'
import { useWeather } from '../hooks/useWeather'
import { useIncidentTimeline } from '../hooks/useIncidentTimeline'
import { useNotifications } from '../hooks/useNotifications'
import { DEFAULT_ALERTS } from '../services/dashboardApi'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import MapPanel from '../components/MapPanel'
import AlertsPanel from '../components/AlertsPanel'
import Analytics from '../components/Analytics'
import Radar from '../components/Radar'
import MissionCard from '../components/MissionCard'
import IncidentTimeline from '../components/IncidentTimeline'
import SimulatorControls from '../components/SimulatorControls'
import ResponsePanel from '../components/ResponsePanel'
import NotificationDrawer from '../components/NotificationDrawer'

const libraries = ['places', 'geometry', 'marker']
const DEFAULT_PLACE = { name: 'Central India flood belt', latitude: 20.5937, longitude: 78.9629, location: { lat: 20.5937, lng: 78.9629 } }

// Section IDs for sidebar navigation
export const SECTIONS = {
  DASHBOARD: 'dashboard',
  MAP: 'map',
  SENSOR: 'sensor',
  ALERTS: 'alerts',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
}

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
  const [activeAlertId, setActiveAlertId] = useState(null)
  const [responsePanelOpen, setResponsePanelOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(SECTIONS.DASHBOARD)

  const liveData = useDashboardData(selectedLocation)
  const weather = useWeather(selectedLocation)
  const activeAlert = liveData.alerts.find((alert) => alert.id === activeAlertId) || null
  const events = useIncidentTimeline({ place: selectedLocation, weather, liveData, activeAlert })

  const {
    notifications,
    unreadCount,
    isOpen: isNotificationsOpen,
    updateFromLiveData,
    markAsRead,
    markAllAsRead,
    clearAll,
    toggleDrawer,
    closeDrawer,
  } = useNotifications(DEFAULT_ALERTS)

  // Push live alerts into the notification drawer
  useEffect(() => {
    if (liveData.alerts && liveData.alerts.length > 0) {
      updateFromLiveData(liveData.alerts)
    }
  }, [liveData.alerts, updateFromLiveData])

  const selectAlert = (alert) => {
    setActiveAlertId(alert.id)
    onLocationSelected?.({ name: alert.location, location: { lat: alert.latitude, lng: alert.longitude } })
  }

  const selectTimelineEvent = (event) => onLocationSelected?.({ name: event.locationName || event.title, location: { lat: event.latitude, lng: event.longitude } })

  // Scroll handler
  const scrollToSection = (sectionId) => {
    const elementId = {
      [SECTIONS.DASHBOARD]: 'dashboard-top',
      [SECTIONS.MAP]: 'map-section',
      [SECTIONS.SENSOR]: 'analytics-section',
      [SECTIONS.ALERTS]: 'alerts-section',
      [SECTIONS.ANALYTICS]: 'analytics-section',
    }[sectionId]

    if (elementId) {
      const element = document.getElementById(elementId)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        setActiveSection(sectionId)
      }
    } else if (sectionId === SECTIONS.DASHBOARD) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setActiveSection(sectionId)
    }
  }

  // Intersection Observer for active section tracking
  useEffect(() => {
    const sections = [
      { id: SECTIONS.DASHBOARD, elementId: 'dashboard-top' },
      { id: SECTIONS.MAP, elementId: 'map-section' },
      { id: SECTIONS.ALERTS, elementId: 'alerts-section' },
      { id: SECTIONS.ANALYTICS, elementId: 'analytics-section' },
    ]

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)

        if (visibleEntries.length > 0) {
          // Sort by intersection ratio (most visible first)
          visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          const mostVisible = visibleEntries[0]

          // Find which section this entry belongs to
          const matchedSection = sections.find((s) => s.elementId === mostVisible.target.id)
          if (matchedSection) {
            setActiveSection(matchedSection.id)
          }
        }
      },
      {
        root: null,
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    )

    // Observe all sections
    sections.forEach(({ elementId }) => {
      const element = document.getElementById(elementId)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      sections.forEach(({ elementId }) => {
        const element = document.getElementById(elementId)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [])

  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        onNavigate={scrollToSection}
        unreadCount={unreadCount}
      />
      <main className="main-content">
        <section id="dashboard-top" style={{ scrollMarginTop: '24px' }}>
          <Topbar mapsLoaded={mapsLoaded} selectedLocation={selectedLocation} onLocationSelected={onLocationSelected} unreadCount={unreadCount} onToggleNotifications={toggleDrawer} />
        </section>
        <SimulatorControls />
        <section id="map-section" style={{ scrollMarginTop: '24px' }}>
          <MapPanel
            place={selectedLocation}
            mapsLoaded={mapsLoaded}
            liveData={liveData}
            onCoordinatesSelected={onCoordinatesSelected}
            activeAlertId={activeAlertId}
            missionCard={<MissionCard place={selectedLocation} prediction={liveData.prediction} alert={activeAlert} onOpenResponsePlan={() => setResponsePanelOpen(true)} />}
          />
        </section>
        <Radar />
        <section id="alerts-section" style={{ scrollMarginTop: '24px' }}>
          <AlertsPanel place={selectedLocation} liveData={liveData} activeAlertId={activeAlertId} onAlertSelected={selectAlert} />
        </section>
        <section id="analytics-section" style={{ scrollMarginTop: '24px' }}>
          <Analytics place={selectedLocation} liveData={liveData} weather={weather} />
        </section>
        <IncidentTimeline events={events} onEventSelected={selectTimelineEvent} />
      </main>
      <ResponsePanel isOpen={responsePanelOpen} onClose={() => setResponsePanelOpen(false)} place={selectedLocation} />
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={closeDrawer}
        notifications={notifications}
        onMarkAllRead={markAllAsRead}
        onClearAll={clearAll}
        onRead={markAsRead}
      />
    </div>
  )
}

export default Dashboard
