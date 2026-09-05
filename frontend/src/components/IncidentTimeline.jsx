import { useEffect, useRef, useState } from 'react'

function IncidentTimeline({ events, onEventSelected }) {
  const [selectedEventId, setSelectedEventId] = useState(null)
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [events])

  const selectEvent = (event) => {
    setSelectedEventId(event.id)
    onEventSelected?.(event)
  }

  return <section className="incident-timeline glass-panel" aria-label="Incident timeline"><div className="timeline-heading"><div><span className="section-kicker">OPERATIONAL HISTORY</span><h2>Incident timeline</h2></div><span>{events.length} events</span></div><ol className="timeline-list" ref={listRef}>{events.map((event) => <li key={event.id} className={`timeline-event ${event.severity}${selectedEventId === event.id ? ' active' : ''}`}><button type="button" onClick={() => selectEvent(event)}><i aria-hidden="true" /><div><strong>{event.title}</strong><span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{event.latitude != null && ` · ${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}`}</span></div></button></li>)}</ol></section>
}

export default IncidentTimeline
