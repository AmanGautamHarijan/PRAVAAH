import { Activity, Bell, ChartNoAxesCombined, CloudRain, Database, Map, Settings } from 'lucide-react'

const navigation = [
  { id: 'dashboard', label: 'Command Center', icon: CloudRain, tooltip: 'Cloud - Dashboard' },
  { id: 'map', label: 'Risk Map', icon: Map, tooltip: 'Risk Intelligence' },
  { id: 'sensor', label: 'Sensor Network', icon: Database, tooltip: 'Sensor Data' },
  { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined, tooltip: 'Analytics' },
]

function Sidebar({ activeSection = 'dashboard', onNavigate, unreadCount = 0 }) {
  const handleNavClick = (sectionId) => {
    if (typeof onNavigate === 'function') {
      onNavigate(sectionId)
    }
  }

  const handleKeyDown = (event, sectionId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleNavClick(sectionId)
    }
  }

  const handleAlertsClick = () => {
    handleNavClick('alerts')
  }

  const handleAlertsKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleAlertsClick()
    }
  }

  const handleSettingsClick = (event) => {
    event.preventDefault()
    // Settings coming in next sprint - just show feedback
    const btn = event.currentTarget
    if (btn) {
      const originalTitle = btn.getAttribute('title')
      btn.setAttribute('title', 'Settings (Coming Next Sprint)')
      btn.setAttribute('aria-label', 'Settings (Coming Next Sprint)')
      setTimeout(() => {
        btn.setAttribute('title', originalTitle)
        btn.setAttribute('aria-label', 'Settings')
      }, 2000)
    }
  }

  const handleSettingsKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleSettingsClick(event)
    }
  }

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <CloudRain size={19} strokeWidth={2.5} />
      </div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navigation.map(({ id, label, icon: Icon, tooltip }) => (
          <button
            className={`nav-item ${activeSection === id ? 'active' : ''}`}
            key={id}
            type="button"
            title={tooltip}
            aria-label={label}
            aria-current={activeSection === id ? 'page' : undefined}
            onClick={() => handleNavClick(id)}
            onKeyDown={(event) => handleKeyDown(event, id)}
          >
            <Icon size={18} />
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          className={`nav-item alert-nav ${activeSection === 'alerts' ? 'active' : ''}`}
          type="button"
          title="Bell - Live Alerts"
          aria-label="Bell - Live Alerts"
          aria-current={activeSection === 'alerts' ? 'page' : undefined}
          onClick={handleAlertsClick}
          onKeyDown={handleAlertsKeyDown}
        >
          <Bell size={18} />
          <b className="count-badge">{unreadCount > 0 ? unreadCount : ''}</b>
        </button>
        <button
          className="nav-item"
          type="button"
          title="Settings (Coming Next Sprint)"
          aria-label="Settings"
          onClick={handleSettingsClick}
          onKeyDown={handleSettingsKeyDown}
        >
          <Settings size={18} />
        </button>
        <span className="operator-dot" title="System online" />
      </div>
    </aside>
  )
}

export default Sidebar
