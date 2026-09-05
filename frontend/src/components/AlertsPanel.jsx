import { AlertTriangle, ArrowUpRight, BellRing, ChevronRight } from 'lucide-react'
import { DEFAULT_ALERTS } from '../services/dashboardApi'

function AlertsPanel({ place, liveData, activeAlertId, onAlertSelected }) {
  const current = liveData.prediction?.risk_level || liveData.summary.overall_risk || 'CRITICAL'
  const riskClass = current.toLowerCase()
  const alerts = liveData.alerts || DEFAULT_ALERTS
  const activateAlert = (alert) => onAlertSelected?.(alert)
  const handleAlertKeyDown = (event, alert) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activateAlert(alert) }
  }
  return <aside className="alerts-panel"><div className="panel-title-row"><div><span className="section-kicker">ATTENTION REQUIRED</span><h2>Live alerts</h2><small className={`selected-place severity ${riskClass}`}>{place.name} / {current}</small></div><span className="alert-total">{String(liveData.summary.active_alerts).padStart(2, '0')}</span></div><div className={`alert-summary ${riskClass}`}><AlertTriangle size={18} /><div><strong>{liveData.summary.active_alerts} active alerts</strong><span>{liveData.connected ? 'Live polling active' : 'Awaiting update'}</span></div><ArrowUpRight size={16} /></div><div className="alert-list">{alerts.map((alert) => <article className={`alert-item${activeAlertId === alert.id ? ' active' : ''}`} key={alert.id || alert.location} role="button" tabIndex={0} aria-pressed={activeAlertId === alert.id} onClick={() => activateAlert(alert)} onKeyDown={(event) => handleAlertKeyDown(event, alert)}><div className={`alert-icon ${alert.level}`}><BellRing size={15} /></div><div className="alert-copy"><div><strong>{alert.location}</strong><span className={`severity ${alert.level}`}>{alert.value}</span></div><p>{alert.detail}</p><small>{alert.time}</small></div><ChevronRight size={16} /></article>)}</div><button className="view-all" type="button">View alert history <ArrowUpRight size={15} /></button></aside>
}

export default AlertsPanel
