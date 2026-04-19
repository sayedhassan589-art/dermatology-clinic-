// Server-side sync emitter
// Only active when SYNC_URL is configured (for self-hosted deployments with WebSocket sync)
// On Vercel / single-server setups, this is a no-op (polling mode)

export function emitSync(event: string, data: unknown): boolean {
  // If no SYNC_URL is configured, sync is disabled (normal for Vercel/single-server)
  if (!process.env.SYNC_URL) {
    return false
  }
  // When SYNC_URL is configured, the actual sync would be handled by a mini-service
  // For now, log the event for debugging
  console.log(`[SYNC-SERVER] Event: ${event} (sync enabled via SYNC_URL)`)
  return false
}
