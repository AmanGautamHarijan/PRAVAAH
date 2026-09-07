import { useEffect, useRef } from 'react'
import { Bell, CheckCheck, ChevronRight, Trash2, X } from 'lucide-react'

const PRIORITY_COLORS = {
  critical: { bg: '#4a1f24', text: '#ff8a9b', border: '#d37b68', label: 'CRITICAL' },
  high: { bg: '#4a3219', text: '#f8bd58', border: '#d4a24e', label: 'HIGH' },
  moderate: { bg: '#1e3d32', text: '#5de8b8', border: '#4aba94', label: 'MODERATE' },
  low: { bg: '#1e3a4a', text: '#7ec4e8', border: '#5aa8cc', label: 'LOW' },
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}

function NotificationCard({ notification, onRead }) {
  const priority = notification.level || notification.value?.toLowerCase() || 'moderate'
  const style = PRIORITY_COLORS[priority] || PRIORITY_COLORS.moderate

  const handleClick = () => {
    if (onRead) onRead(notification.id)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${notification.location}: ${notification.detail || notification.message || 'Alert'}`}
    >
      <div className="notification-priority" style={{ background: style.bg, borderColor: style.border }}>
        <span style={{ color: style.text }}>{style.label}</span>
      </div>
      <div className="notification-content">
        <div className="notification-header">
          <strong>{notification.location}</strong>
          <small>{formatTime(notification.timestamp)}</small>
        </div>
        <p>{notification.detail || notification.message || 'Alert details'}</p>
      </div>
      <ChevronRight size={16} className="notification-chevron" />
    </div>
  )
}

function NotificationDrawer({ isOpen, onClose, notifications, onMarkAllRead, onClearAll, onRead }) {
  const drawerRef = useRef(null)
  const closeButtonRef = useRef(null)

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus close button when drawer opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        // Check if click is not on bell button (which is outside app-shell)
        const bellButton = document.querySelector('[aria-label="Notifications"]')
        if (bellButton && !bellButton.contains(e.target)) {
          onClose()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <>
      <div className="notification-overlay" onClick={onClose} aria-hidden="true" />
      <aside
        ref={drawerRef}
        className="notification-drawer"
        role="dialog"
        aria-label="Emergency Notifications"
        aria-modal="true"
      >
        <div className="notification-header">
          <div className="notification-title">
            <Bell size={20} />
            <h2>Emergency Notifications</h2>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </div>
          <button
            ref={closeButtonRef}
            className="notification-close"
            onClick={onClose}
            aria-label="Close notifications"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="notification-actions">
          <button
            className="notification-action-btn"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            type="button"
          >
            <CheckCheck size={14} />
            Mark All Read
          </button>
          <button
            className="notification-action-btn"
            onClick={onClearAll}
            disabled={notifications.length === 0}
            type="button"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <Bell size={32} />
              <p>No notifications</p>
              <small>Alerts will appear here when the simulator runs</small>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={onRead}
              />
            ))
          )}
        </div>
      </aside>
    </>
  )
}

export default NotificationDrawer
