import { useEffect, useState } from 'react'
import { Play, Square } from 'lucide-react'
import { simulatorApi } from '../services/simulatorApi'

function SimulatorControls() {
  const [status, setStatus] = useState({ is_running: false, scenario: 'normal' })
  const [scenarios, setScenarios] = useState([])
  const [selectedScenario, setSelectedScenario] = useState('normal')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadScenarios()
    loadStatus()
    const interval = setInterval(loadStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadScenarios = async () => {
    try {
      const data = await simulatorApi.scenarios()
      setScenarios(data)
    } catch (error) {
      console.error('Failed to load scenarios:', error)
    }
  }

  const loadStatus = async () => {
    try {
      const data = await simulatorApi.status()
      setStatus(data)
      setSelectedScenario(data.scenario)
    } catch (error) {
      console.error('Failed to load simulator status:', error)
    }
  }

  const handleStart = async () => {
    setIsLoading(true)
    try {
      const result = await simulatorApi.start(selectedScenario)
      setStatus(result)
    } catch (error) {
      console.error('Failed to start simulator:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async () => {
    setIsLoading(true)
    try {
      const result = await simulatorApi.stop()
      setStatus(result)
    } catch (error) {
      console.error('Failed to stop simulator:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScenarioChange = (e) => {
    setSelectedScenario(e.target.value)
  }

  return (
    <div className="simulator-controls">
      <div className="simulator-section">
        <label htmlFor="scenario-select" className="simulator-label">Scenario</label>
        <select
          id="scenario-select"
          value={selectedScenario}
          onChange={handleScenarioChange}
          disabled={status.is_running || isLoading}
          className="scenario-select"
        >
          {scenarios.map((scenario) => (
            <option key={scenario} value={scenario}>
              {scenario.replace(/_/g, ' ').charAt(0).toUpperCase() + scenario.replace(/_/g, ' ').slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="simulator-section">
        {!status.is_running ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="simulator-button start-button"
            title="Start disaster simulation"
          >
            <Play size={16} />
            Start
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="simulator-button stop-button"
            title="Stop disaster simulation"
          >
            <Square size={16} />
            Stop
          </button>
        )}
      </div>

      <div className="simulator-status">
        <span className={`status-indicator ${status.is_running ? 'running' : 'stopped'}`} />
        {status.is_running ? (
          <span className="status-text">
            Simulating <strong>{status.scenario.replace(/_/g, ' ')}</strong>
          </span>
        ) : (
          <span className="status-text">Simulator stopped</span>
        )}
      </div>
    </div>
  )
}

export default SimulatorControls
