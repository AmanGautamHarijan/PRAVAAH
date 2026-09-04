import { ArrowUpRight, Clock3, LocateFixed, ShieldAlert } from 'lucide-react'

function MissionCard({ place }) {
  const title = place.name === 'Central India flood belt' ? 'Protect the river belt.' : `Protect ${place.name}.`
  return <section className="mission-card glass-panel"><div className="mission-top"><span className="section-kicker">CURRENT MISSION</span><span className="mission-id">#NDRF-071</span></div><h2>{title}</h2><p>Monitor rising water levels and prepare evacuation corridors around the selected flood-prone area.</p><div className="mission-stats"><span><LocateFixed size={14} /><strong>03</strong> zones</span><span><Clock3 size={14} /><strong>75</strong> min lead</span><span><ShieldAlert size={14} /><strong>02</strong> critical</span></div><button type="button" className="mission-action">Open response plan <ArrowUpRight size={15} /></button></section>
}

export default MissionCard
