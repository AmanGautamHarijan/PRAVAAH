import { useCallback, useEffect, useRef, useState } from 'react'

const severityForRisk = (riskLevel) => ({ LOW: 'info', MODERATE: 'warning', HIGH: 'warning', CRITICAL: 'critical' }[riskLevel] || 'info')

export function useIncidentTimeline({ place, weather, liveData, activeAlert }) {
  const [events, setEvents] = useState([])
  const eventId = useRef(0)
  const recordedKeys = useRef(new Set())
  const previousRisk = useRef(null)
  const coordinates = { latitude: place.latitude, longitude: place.longitude }

  const addEvent = useCallback((event) => {
    if (recordedKeys.current.has(event.key)) return
    recordedKeys.current.add(event.key)
    eventId.current += 1
    setEvents((current) => [...current.slice(-49), { ...event, ...coordinates, id: eventId.current, timestamp: new Date().toISOString() }])
  }, [coordinates.latitude, coordinates.longitude])

  useEffect(() => {
    addEvent({ key: `location:${place.latitude}:${place.longitude}`, title: `Location selected: ${place.name}`, severity: 'info', locationName: place.name })
  }, [addEvent, place.latitude, place.longitude, place.name])

  useEffect(() => {
    if (!weather.weather) return
    addEvent({ key: `weather:${place.latitude}:${place.longitude}:${weather.weather.condition}:${weather.weather.temperature}`, title: `Weather updated: ${weather.weather.condition}`, severity: 'info', locationName: place.name })
  }, [addEvent, place.latitude, place.longitude, place.name, weather.weather])

  useEffect(() => {
    if (!liveData.sensor) return
    addEvent({ key: `sensor:${liveData.sensor.id || liveData.sensor.timestamp}`, title: 'Sensor data received', severity: 'info', locationName: place.name })
  }, [addEvent, liveData.sensor, place.name])

  useEffect(() => {
    if (!liveData.prediction) return
    const { risk_level: riskLevel, risk_score: riskScore } = liveData.prediction
    addEvent({ key: `prediction:${riskScore}:${riskLevel}`, title: `ML prediction completed: ${riskScore}/100`, severity: severityForRisk(riskLevel), locationName: place.name })
    if (previousRisk.current && previousRisk.current !== riskLevel) addEvent({ key: `risk:${previousRisk.current}:${riskLevel}:${riskScore}`, title: `Risk level changed to ${riskLevel}`, severity: severityForRisk(riskLevel), locationName: place.name })
    previousRisk.current = riskLevel
  }, [addEvent, liveData.prediction, place.name])

  useEffect(() => {
    const missionKey = activeAlert?.id || `${place.latitude}:${place.longitude}`
    addEvent({ key: `mission:${missionKey}`, title: activeAlert ? `Mission updated: ${activeAlert.location}` : `Mission updated: ${place.name}`, severity: activeAlert?.level || severityForRisk(liveData.prediction?.risk_level), locationName: activeAlert?.location || place.name })
  }, [activeAlert, addEvent, liveData.prediction?.risk_level, place.latitude, place.longitude, place.name])

  useEffect(() => {
    if (!activeAlert) return
    addEvent({ key: `acknowledged:${activeAlert.id}`, title: `Alert acknowledged: ${activeAlert.location}`, severity: activeAlert.level, locationName: activeAlert.location })
  }, [activeAlert, addEvent])

  return events
}
