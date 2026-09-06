import { useCallback, useEffect, useRef, useState } from 'react'

const POLL_INTERVAL = 5000 // Match dashboard polling interval

export function useNotifications(initialAlerts = []) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const previousAlertsRef = useRef([])

  // Initialize with alerts
  useEffect(() => {
    if (initialAlerts.length > 0 && notifications.length === 0) {
      setNotifications(initialAlerts)
      setUnreadCount(initialAlerts.length)
    }
  }, [initialAlerts])

  // Update notifications when new alerts come in
  const updateFromLiveData = useCallback((liveAlerts) => {
    if (!liveAlerts || liveAlerts.length === 0) return

    setNotifications((current) => {
      // Find truly new alerts (not in previous list)
      const previousIds = new Set(previousAlertsRef.current.map((a) => a.id || a.location))
      const newAlerts = liveAlerts
        .filter((alert) => {
          const alertId = alert.id || alert.location
          return !previousIds.has(alertId)
        })
        .map((alert) => ({
          ...alert,
          id: alert.id || alert.location || `alert-${Date.now()}-${Math.random()}`,
          isRead: false,
          timestamp: new Date().toISOString(),
        }))

      if (newAlerts.length > 0) {
        // Prepend new alerts, keep only last 50
        const updated = [...newAlerts, ...current].slice(0, 50)
        // Update unread count
        setUnreadCount((prev) => prev + newAlerts.length)
        return updated
      }

      return current
    })

    // Update previous alerts ref
    previousAlertsRef.current = liveAlerts
  }, [])

  // Mark single notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((current) =>
      current.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // Open/close drawer
  const openDrawer = useCallback(() => {
    setIsOpen(true)
    // Auto-mark all as read when opening
    if (unreadCount > 0) {
      setNotifications((current) => current.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    }
  }, [unreadCount])

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleDrawer = useCallback(() => {
    if (isOpen) {
      closeDrawer()
    } else {
      openDrawer()
    }
  }, [isOpen, closeDrawer, openDrawer])

  return {
    notifications,
    unreadCount,
    isOpen,
    updateFromLiveData,
    markAsRead,
    markAllAsRead,
    clearAll,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  }
}
