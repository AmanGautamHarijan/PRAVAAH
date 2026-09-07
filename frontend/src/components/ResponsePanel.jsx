import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, Clipboard, Clock, Copy, MapPin, Phone, ShieldAlert, UserCheck, X } from 'lucide-react'
import { getResponsePlan } from '../services/responseApi'

const PRIORITY_COLORS = {
  CRITICAL: { bg: '#4a1f24', text: '#ff8a9b', border: '#d37b68' },
  HIGH: { bg: '#4a3219', text: '#f8bd58', border: '#d4a24e' },
  MODERATE: { bg: '#1e3d32', text: '#5de8b8', border: '#4aba94' },
  LOW: { bg: '#1e3a4a', text: '#7ec4e8', border: '#5aa8cc' },
  SAFE: { bg: '#1e3d2d', text: '#7de8a0', border: '#5acc7d' },
}

function ResponsePanel({ isOpen, onClose, place }) {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && !response) {
      fetchResponse()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      fetchResponse()
    }
  }, [place?.location?.lat, place?.location?.lng])

  const fetchResponse = async () => {
    setLoading(true)
    try {
      const locationId = `place:${place?.latitude?.toFixed(5)},${place?.longitude?.toFixed(5)}`
      const data = await getResponsePlan(locationId, place?.name || 'Central India')
      setResponse(data)
    } catch (error) {
      console.error('Failed to fetch response plan:', error)
      // Generate local fallback
      setResponse({
        priority: 'MODERATE',
        headline: 'Response Plan Generated',
        summary: 'Local fallback response plan generated due to API error.',
        affected_people: 12840,
        safe_place: 'District Relief Center - Sector B',
        eta: '15-30 minutes',
        actions: [
          'Monitor weather conditions',
          'Prepare evacuation routes',
          'Alert local authorities',
          'Stand by for updates',
        ],
        emergency_sms: '⚠️ PRAVAAH: Monitoring conditions. Stand by for updates.',
        response_confidence: '75%',
        is_fallback: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopySms = () => {
    if (response?.emergency_sms) {
      navigator.clipboard.writeText(response.emergency_sms)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = () => {
    setResponse(null)
    fetchResponse()
  }

  if (!isOpen) return null

  const priorityStyle = PRIORITY_COLORS[response?.priority] || PRIORITY_COLORS.MODERATE

  return (
    <>
      <div className="response-overlay" onClick={onClose} />
      <aside className="response-panel glass-panel">
        <div className="response-header">
          <div className="response-title">
            <ShieldAlert size={20} />
            <h2>Emergency Response Plan</h2>
          </div>
          <div className="response-actions">
            <button className="response-refresh" onClick={handleRefresh} title="Refresh plan">
              ↻
            </button>
            <button className="response-close" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {loading && !response ? (
          <div className="response-loading">
            <div className="response-spinner" />
            <span>Generating AI response...</span>
          </div>
        ) : response ? (
          <div className="response-content">
            {response.is_fallback && (
              <div className="fallback-badge">
                <AlertTriangle size={14} />
                Fallback Response
              </div>
            )}

            <div className="response-priority" style={{ background: priorityStyle.bg, borderColor: priorityStyle.border }}>
              <span className="priority-label" style={{ color: priorityStyle.text }}>
                {response.priority}
              </span>
              <span className="confidence-badge">{response.response_confidence}</span>
            </div>

            <h3 className="response-headline">{response.headline}</h3>

            <p className="response-summary">{response.summary}</p>

            <div className="response-stats">
              <div className="response-stat">
                <UserCheck size={16} />
                <div>
                  <strong>{response.affected_people?.toLocaleString()}</strong>
                  <span>People at Risk</span>
                </div>
              </div>
              <div className="response-stat">
                <Clock size={16} />
                <div>
                  <strong>{response.eta}</strong>
                  <span>Time to Impact</span>
                </div>
              </div>
            </div>

            <div className="response-safe-place">
              <MapPin size={16} />
              <div>
                <strong>Safe Place</strong>
                <span>{response.safe_place}</span>
              </div>
            </div>

            <div className="response-actions-list">
              <h4>
                <CheckCircle2 size={16} />
                Immediate Actions
              </h4>
              <ul>
                {response.actions?.map((action, index) => (
                  <li key={index}>
                    <ArrowRight size={14} />
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            <div className="response-sms">
              <div className="sms-header">
                <Phone size={16} />
                <h4>Emergency SMS</h4>
                <button className="copy-sms-btn" onClick={handleCopySms} title="Copy SMS">
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy SMS'}
                </button>
              </div>
              <div className="sms-content">
                {response.emergency_sms}
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  )
}

export default ResponsePanel
