import { Activity, ArrowUpRight, CircleGauge } from 'lucide-react'

function Radar() {
  return <section className="radar-card glass-panel" aria-label="Flood monitoring status"><div className="radar-copy"><span className="section-kicker">MONITORING STATUS</span><h2>Flood pulse</h2><p>Hydrological signal is accelerating</p></div><div className="radar-score"><CircleGauge size={22} /><strong>91<span>/100</span></strong><small><ArrowUpRight size={12} /> +12%</small></div><div className="radar-meta"><span><i /> Critical conditions</span><small><Activity size={11} /> 03 sec refresh</small></div></section>
}

export default Radar
