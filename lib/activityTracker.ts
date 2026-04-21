'use client'

export type ActivityEvent = {
  eventType: string
  projectSlug?: string
  shareCode?: string
  metadata?: Record<string, unknown>
}

export class ActivityTracker {
  private queue: ActivityEvent[] = []
  private timer: ReturnType<typeof setInterval> | null = null
  private readonly sessionId: string

  constructor() {
    this.sessionId = Math.random().toString(36).slice(2)
    this.timer = setInterval(() => this.flush(), 10_000)
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush(true))
    }
  }

  track(event: ActivityEvent): void {
    this.queue.push(event)
  }

  private async flush(keepalive = false): Promise<void> {
    if (this.queue.length === 0) return
    const batch = this.queue.splice(0)
    try {
      await fetch('/api/activity/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.sessionId, events: batch }),
        keepalive,
      })
    } catch {
      // silent — activity tracking is non-critical
    }
  }

  destroy(): void {
    if (this.timer) clearInterval(this.timer)
    this.flush(true)
  }
}
