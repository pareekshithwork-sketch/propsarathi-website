// PropSarathi Service Worker — Push Notifications + PWA
const CACHE_NAME = 'propsarathi-v1'
const STATIC_ASSETS = ['/', '/properties', '/crm', '/offline.html']

// Install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  )
  self.skipWaiting()
})

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Push notification received
self.addEventListener('push', e => {
  if (!e.data) return
  const data = e.data.json()
  const { title, body, type, phone, leadId, tag } = data

  const options = {
    body,
    icon: '/propsarathi-logo.png',
    badge: '/propsarathi-badge.png',
    tag: tag || type || 'general',
    requireInteraction: type === 'call_reminder' || type === 'click_to_call',
    vibrate: [200, 100, 200, 100, 400],
    data: { type, phone, leadId, url: data.url || '/crm' },
    actions: type === 'click_to_call'
      ? [
          { action: 'call', title: '📞 Call Now', icon: '/icons/call.png' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      : type === 'call_reminder'
      ? [
          { action: 'open_crm', title: '📋 Open CRM' },
          { action: 'call', title: '📞 Call Now' }
        ]
      : [
          { action: 'open', title: 'Open' }
        ]
  }

  e.waitUntil(self.registration.showNotification(title, options))
})

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const { type, phone, leadId, url } = e.notification.data || {}

  if (e.action === 'call' && phone) {
    // Open dialer with number
    e.waitUntil(
      self.clients.openWindow(`tel:${phone}`)
    )
    return
  }

  if (e.action === 'open_crm' || e.action === 'open' || !e.action) {
    const targetUrl = url || (leadId ? `/crm?lead=${leadId}` : '/crm')
    e.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        const crmClient = clients.find(c => c.url.includes('/crm'))
        if (crmClient) {
          crmClient.focus()
          crmClient.postMessage({ type: 'OPEN_LEAD', leadId })
        } else {
          self.clients.openWindow(targetUrl)
        }
      })
    )
  }
})

// Background sync for offline actions
self.addEventListener('sync', e => {
  if (e.tag === 'sync-call-logs') {
    e.waitUntil(syncCallLogs())
  }
})

async function syncCallLogs() {
  // Sync any offline call logs when back online
  const cache = await caches.open('call-logs')
  const keys = await cache.keys()
  for (const key of keys) {
    const response = await cache.match(key)
    const data = await response.json()
    try {
      await fetch('/api/crm/calls/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      await cache.delete(key)
    } catch {}
  }
}
