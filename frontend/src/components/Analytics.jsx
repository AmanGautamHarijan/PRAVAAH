import { Droplets, Gauge, MapPinned, Users, Wind } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const trend = [{ time: '00:00', risk: 28 }, { time: '04:00', risk: 34 }, { time: '08:00', risk: 42 }, { time: '12:00', risk: 67 }, { time: '16:00', risk: 82 }, { time: '20:00', risk: 91 }]

function Analytics({ place, liveData, weather: weatherState }) {
  const sensor = liveData.sensor || {}
  const weather = weatherState.weather
  const weatherMeta = weather
    ? `${weather.condition} · Wind ${Math.round(weather.windSpeed)} km/h`
    : weatherState.loading ? 'Loading weather' : 'Weather unavailable'
  const metrics = [
    { label: 'Rainfall', value: `${sensor.rainfall ?? 82} mm`, meta: 'Live sensor', icon: Droplets, tone: 'blue' },
    { label: 'Water level', value: `${sensor.water_level ?? 6.2} m`, meta: weather ? `Humidity ${Math.round(weather.humidity)}%` : 'Rising', icon: Gauge, tone: 'red' },
    { label: 'Weather', value: weather ? `${Math.round(weather.temperature)}°C` : '—', meta: weatherMeta, icon: Wind, tone: 'amber' },
    { label: 'Population at risk', value: liveData.summary.population_at_risk.toLocaleString(), meta: 'Across 3 villages', icon: Users, tone: 'green' },
    { label: 'Lead time', value: `${liveData.summary.lead_time} min`, meta: 'Current estimate', icon: MapPinned, tone: 'blue' },
  ]

  return <section className="analytics"><div className="analytics-header"><div><span className="section-kicker">SITUATION REPORT / {place.name.toUpperCase()}</span><h2>Risk intelligence</h2></div><span className="updated"><i /> {liveData.connected ? 'Live update' : 'Mock telemetry'}</span></div><div className="metric-grid">{metrics.map(({ label, value, meta, icon: Icon, tone }) => <article className="metric" key={label}><div className={`metric-icon ${tone}`}><Icon size={17} /></div><span>{label}</span><strong>{value}</strong><small>{meta}</small></article>)}<article className="trend-card"><div><span>Risk trend</span><strong>{liveData.prediction?.risk_score ?? 91} <small>/ 100</small></strong></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><defs><linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a63f3b" stopOpacity={.24} /><stop offset="100%" stopColor="#a63f3b" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="time" hide /><Tooltip contentStyle={{ background: '#242629', border: '1px solid #4a4d50', borderRadius: 4, color: '#f5f7fb' }} /><Area type="monotone" dataKey="risk" stroke="#c56a61" strokeWidth={2} fill="url(#riskFill)" /></AreaChart></ResponsiveContainer></div></article></div></section>
}

export default Analytics
