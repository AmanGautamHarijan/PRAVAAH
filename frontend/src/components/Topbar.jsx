import { useEffect, useRef, useState } from 'react'
import { Bell, CalendarDays, ChevronDown, Command, Radio, Search } from 'lucide-react'
import { usePlacesSearch } from '../hooks/usePlacesSearch'

function getPlaceText(...values) {
  for (const value of values) {
    if (typeof value === 'string') return value
    if (typeof value?.text === 'string') return value.text
  }
  return ''
}

function Topbar({ mapsLoaded, selectedLocation, onLocationSelected, unreadCount, onToggleNotifications }) {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const inputRef = useRef(null)
  const { query, setQuery, suggestions, activeIndex, setActiveIndex, isLoading, setIsFocused, clearSuggestions, selectSuggestion } = usePlacesSearch({ enabled: mapsLoaded, selectedLocation, onLocationSelected })

  useEffect(() => {
    const clock = window.setInterval(() => setCurrentTime(new Date()), 1000)
    return () => window.clearInterval(clock)
  }, [])

  const onKeyDown = (event) => {
    if (!suggestions.length) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((index) => (index + 1) % suggestions.length) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length) }
    if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); selectSuggestion(suggestions[activeIndex]) }
    if (event.key === 'Escape') { clearSuggestions(); inputRef.current?.blur() }
  }

  return <header className="topbar"><div className="topbar-brand"><div className="mini-logo"><Command size={15} /></div><div><strong>PRAVAAH</strong><span>DISASTER INTELLIGENCE</span></div></div><div className="topbar-actions"><div className="places-search"><div className="search-box"><Search size={16} />{mapsLoaded ? <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => window.setTimeout(() => { setIsFocused(false); clearSuggestions() }, 120)} onKeyDown={onKeyDown} aria-label="Search locations" aria-autocomplete="list" aria-controls="place-suggestions" aria-expanded={suggestions.length > 0} placeholder="Search locations" /> : <span>{import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Loading Google Maps' : 'Add Google Maps key'}</span>}<kbd>/</kbd></div>{mapsLoaded && suggestions.length > 0 && <ul id="place-suggestions" className="place-suggestions" role="listbox">{suggestions.map((suggestion, index) => { const primaryText = getPlaceText(suggestion.mainText, suggestion.primaryText, suggestion.prediction?.mainText, suggestion.prediction?.text) || 'Unknown location'; const secondaryText = getPlaceText(suggestion.secondaryText, suggestion.prediction?.secondaryText); return <li key={suggestion.id} role="option" aria-selected={index === activeIndex}><button className={index === activeIndex ? 'active' : ''} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectSuggestion(suggestion)}><strong>{primaryText}</strong>{secondaryText && <span>{secondaryText}</span>}</button></li> })}</ul>}{isLoading && <span className="places-loading">Searching…</span>}</div><button className="date-control" type="button"><CalendarDays size={16} /> Last 24 hours <ChevronDown size={14} /></button><button className="icon-button" type="button" aria-label="Notifications" onClick={onToggleNotifications}><Bell size={16} />{unreadCount > 0 && <i />}</button><div className="live-chip"><Radio size={14} /> LIVE <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span></div></div></header>
}

export default Topbar
