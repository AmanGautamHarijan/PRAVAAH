import { Activity, Bell, ChartNoAxesCombined, CloudRain, Database, Map, Settings } from 'lucide-react'

const navigation = [
  { label: 'Command Center', icon: Activity, active: true },
  { label: 'Risk Map', icon: Map },
  { label: 'Sensor Network', icon: Database },
  { label: 'Analytics', icon: ChartNoAxesCombined },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-mark"><CloudRain size={19} strokeWidth={2.5} /></div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navigation.map(({ label, icon: Icon, active }) => (
          <button className={`nav-item ${active ? 'active' : ''}`} key={label} type="button" title={label} aria-label={label}>
            <Icon size={18} />
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item alert-nav" type="button" title="Alert log" aria-label="Alert log"><Bell size={18} /><b className="count-badge">2</b></button>
        <button className="nav-item" type="button" title="Settings" aria-label="Settings"><Settings size={18} /></button>
        <span className="operator-dot" title="System online" />
      </div>
    </aside>
  )
}

export default Sidebar