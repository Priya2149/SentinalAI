// hooks/useRealTimeUpdates.ts
"use client";

import { useEffect, useState, useCallback } from 'react';

interface RealtimeData {
  totalCalls: number;
  recentCalls: number;
  avgLatency: number;
  errorCount: number;
  lastUpdate: Date;
}

/**
 * Free real-time updates using Server-Sent Events (SSE)
 * No WebSocket service needed - uses built-in browser EventSource
 */
export function useRealTimeUpdates() {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    // Create Server-Sent Events connection
    const eventSource = new EventSource('/api/metrics/realtime');
    
    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('Real-time connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        setData({
          ...newData,
          lastUpdate: new Date()
        });
      } catch (err) {
        console.error('Failed to parse real-time data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Real-time connection error:', err);
      setIsConnected(false);
      setError('Connection lost - attempting to reconnect...');
      
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        eventSource.close();
        connect();
      }, 5000);
    };

    // Cleanup function
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  return { data, isConnected, error };
}

/**
 * Simple polling-based real-time updates (fallback)
 * Polls every 10 seconds for updates
 */
export function usePollingUpdates(interval = 10000) {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/metrics/summary');
        const summary = await response.json();
        
        setData({
          totalCalls: summary.total,
          recentCalls: summary.statuses.SUCCESS + summary.statuses.FAIL + summary.statuses.FLAGGED,
          avgLatency: summary.avg_latency_ms,
          errorCount: summary.statuses.FAIL + summary.statuses.FLAGGED,
          lastUpdate: new Date()
        });
      } catch (error) {
        console.error('Failed to fetch real-time data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [interval, isActive]);

  return { 
    data, 
    isActive, 
    toggle: () => setIsActive(!isActive) 
  };
}