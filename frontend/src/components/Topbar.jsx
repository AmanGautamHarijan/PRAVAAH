import { useEffect, useRef, useState } from 'react'
import { Autocomplete } from '@react-google-maps/api'
import { Bell, CalendarDays, ChevronDown, Command, Radio, Search } from 'lucide-react'

function Topbar({ mapsLoaded, onPlaceSelected }) {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const autocompleteRef = useRef(null)
  useEffect(() => { const clock = window.setInterval(() => setCurrentTime(new Date()), 1000); return () => window.clearInterval(clock) }, [])
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const search = <div className="search-box"><Search size={16} />{mapsLoaded ? <input aria-label="Search locations" placeholder="Search locations" /> : <span>{import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Loading Google Maps' : 'Add Google Maps key'}</span>}<kbd>/</kbd></div>
  return <header className="topbar"><div className="topbar-brand"><div className="mini-logo"><Command size={15} /></div><div><strong>PRAVAAH</strong><span>DISASTER INTELLIGENCE</span></div></div><div className="topbar-actions">{mapsLoaded ? <Autocomplete onLoad={(autocomplete) => { autocompleteRef.current = autocomplete }} onPlaceChanged={() => { const result = autocompleteRef.current?.getPlace(); if (result?.geometry?.location) onPlaceSelected({ name: result.formatted_address || result.name, location: { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() } }) }}>{search}</Autocomplete> : search}<button className="date-control" type="button"><CalendarDays size={16} /> Last 24 hours <ChevronDown size={14} /></button><button className="icon-button" type="button" aria-label="Notifications"><Bell size={16} /><i /></button><div className="live-chip"><Radio size={14} /> LIVE <span>{formattedTime}</span></div></div></header>
}

export default Topbar
