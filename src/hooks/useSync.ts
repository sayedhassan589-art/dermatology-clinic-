'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type SyncEventHandler = (data: any) => void;

const SYNC_EVENTS = [
  'patient:created',
  'patient:updated',
  'patient:deleted',
  'visit:created',
  'visit:updated',
  'visit:deleted',
  'session:created',
  'session:updated',
  'session:deleted',
  'alert:new',
  'alert:updated',
  'alert:deleted',
  'note:new',
  'service:created',
  'service:updated',
  'service:deleted',
] as const;

type SyncEventType = (typeof SYNC_EVENTS)[number];

export function useSync() {
  const [connected, setConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<string>('');
  const [syncMode, setSyncMode] = useState<'polling' | 'websocket'>('polling');
  const handlersRef = useRef<Map<string, Set<SyncEventHandler>>>(new Map());
  const socketRef = useRef<any>(null);

  const handleSyncEvent = useCallback((event: string, data: any) => {
    setLastSyncTime(new Date());
    const handlers = handlersRef.current.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
    const wildcardHandlers = handlersRef.current.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler({ event, data }));
    }
  }, []);

  useEffect(() => {
    let wsCleanup: (() => void) | null = null;
    let cancelled = false;

    // After a brief period, set to polling mode if no WebSocket connection
    const fallbackTimeout = setTimeout(() => {
      if (!cancelled && !connectionInfo) {
        setSyncMode('polling');
        setConnectionInfo('وضع الاستطلاع');
        setConnected(true);
      }
    }, 2000);

    try {
      const syncUrl = typeof window !== 'undefined' ? window.location.origin : '';

      // Try dynamic import of socket.io-client
      // Use a shorter timeout to fall back quickly when no sync server is available
      Promise.all([
        import('socket.io-client' as any).catch(() => null),
        new Promise(resolve => setTimeout(resolve, 500)),
      ]).then(([mod]) => {
        if (cancelled) return;

        if (!mod) {
          console.log('[SYNC] Socket.IO not available, using polling mode');
          setSyncMode('polling');
          setConnectionInfo('وضع الاستطلاع');
          setConnected(true);
          return;
        }

        const { io } = mod;
        const socket = io(syncUrl, {
          path: '/api/sync',
          transports: ['polling'],
          reconnection: true,
          reconnectionAttempts: 2,
          reconnectionDelay: 2000,
          timeout: 3000,
          forceNew: true,
        });

        socketRef.current = socket;

        const connectTimeout = setTimeout(() => {
          if (!socket.connected && !cancelled) {
            console.log('[SYNC] WebSocket not available, using polling mode');
            setSyncMode('polling');
            setConnectionInfo('وضع الاستطلاع');
            setConnected(true);
            socket.disconnect();
            socketRef.current = null;
          }
        }, 3000);

        socket.on('connect', () => {
          if (cancelled) return;
          clearTimeout(connectTimeout);
          console.log('[SYNC] WebSocket connected:', socket.id);
          setConnected(true);
          setSyncMode('websocket');
          setConnectionInfo(`متصل - WebSocket (${(socket.id || '').substring(0, 6)})`);
        });

        socket.on('disconnect', () => {
          if (cancelled) return;
          setConnected(false);
          setSyncMode('polling');
          setConnectionInfo('وضع الاستطلاع');
        });

        socket.on('connect_error', () => {
          if (cancelled) return;
          clearTimeout(connectTimeout);
          setSyncMode('polling');
          setConnectionInfo('وضع الاستطلاع');
          setConnected(true);
        });

        socket.on('sync:connected', (data: any) => {
          if (cancelled) return;
          setConnectionInfo(`متصل (${data?.totalClients || 1} جهاز)`);
        });

        SYNC_EVENTS.forEach(event => {
          socket.on(event, (data: any) => {
            if (!cancelled) handleSyncEvent(event, data);
          });
        });

        socket.on('sync:pong', (data: any) => {
          if (!cancelled) setLastSyncTime(new Date(data?.timestamp || Date.now()));
        });

        wsCleanup = () => {
          clearTimeout(connectTimeout);
          SYNC_EVENTS.forEach(event => { socket.off(event); });
          socket.off('connect');
          socket.off('disconnect');
          socket.off('connect_error');
          socket.off('sync:connected');
          socket.off('sync:pong');
          socket.disconnect();
          socketRef.current = null;
        };
      }).catch(() => {
        if (cancelled) return;
        console.log('[SYNC] Error initializing sync, using polling mode');
        setSyncMode('polling');
        setConnectionInfo('وضع الاستطلاع');
        setConnected(true);
      });
    } catch {
      if (!cancelled) {
        setSyncMode('polling');
        setConnectionInfo('وضع الاستطلاع');
        setConnected(true);
      }
    }

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimeout);
      if (wsCleanup) wsCleanup();
    };
  }, [handleSyncEvent, connectionInfo]);

  // Periodic ping when connected via WebSocket
  useEffect(() => {
    if (syncMode !== 'websocket' || !connected) return;

    const pingInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('sync:ping');
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [syncMode, connected]);

  const on = useCallback((event: SyncEventType | '*', handler: SyncEventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    const handlers = handlersRef.current.get(event)!;
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }, []);

  return {
    connected,
    connectionInfo,
    lastSyncTime,
    syncMode,
    on,
  };
}
