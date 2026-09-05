import { ArrowUpRight, Clock3, LocateFixed, ShieldAlert } from 'lucide-react'

function MissionCard({ place, prediction, alert }) {
  const title = alert ? `Respond to ${alert.location}.` : place.name === 'Central India flood belt' ? 'Protect the river belt.' : `Protect ${place.name}.`
  const riskLevel = alert?.value || prediction?.risk_level || 'ASSESSING'
  const riskClass = riskLevel.toLowerCase()
  const leadTime = prediction?.lead_time ?? 75
  const riskScore = prediction?.risk_score ?? '—'
  const missionCopy = alert
    ? `${alert.detail}. Coordinate response teams around the selected alert location.`
    : prediction ? `ML assessment: ${riskLevel.toLowerCase()} risk. Monitor water levels and prepare evacuation corridors.` : 'Monitoring water levels and preparing evacuation corridors around the selected flood-prone area.'
  return <section className="mission-card glass-panel"><div className="mission-top"><span className="section-kicker">CURRENT MISSION</span><span className={`mission-id ${riskClass}`}>#NDRF-071 / {riskLevel}</span></div><h2>{title}</h2><p>{missionCopy}</p><div className="mission-location"><span>{place.name}</span><small>{place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}</small></div><div className="mission-stats"><span><LocateFixed size={14} /><strong>03</strong> zones</span><span><Clock3 size={14} /><strong>{leadTime}</strong> min lead</span><span><ShieldAlert size={14} /><strong>{riskScore}</strong> score</span></div><button type="button" className="mission-action">Open response plan <ArrowUpRight size={15} /></button></section>
}

export default MissionCard
