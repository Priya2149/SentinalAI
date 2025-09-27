// components/RealTimeDashboard.tsx
"use client";

import { useEffect, useState } from 'react';
import { 
  Activity, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';

interface RealtimeMetrics {
  totalCalls: number;
  recentCalls: number;
  avgLatency: number;
  errorCount: number;
  recentCost?: number;
  lastUpdate: string;
  recentActivity?: Array<{
    status: string;
    latency: number;
    cost: number;
    timestamp: Date;
  }>;
}

export default function RealTimeDashboard() {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'sse' | 'polling'>('polling');

  // Try Server-Sent Events first, fallback to polling
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const startSSE = () => {
      try {
        const eventSource = new EventSource('/api/realtime/metrics');
        
        eventSource.onopen = () => {
          setIsConnected(true);
          setConnectionType('sse');
          console.log('Real-time SSE connection established');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setMetrics(data);
          } catch (err) {
            console.error('Failed to parse SSE data:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE connection failed, switching to polling:', err);
          eventSource.close();
          startPolling();
        };

        cleanup = () => {
          eventSource.close();
          setIsConnected(false);
        };
      } catch (error) {
        console.error('SSE not supported, using polling:', error);
        startPolling();
      }
    };

    const startPolling = () => {
      setConnectionType('polling');
      setIsConnected(true);
      
      const fetchMetrics = async () => {
        try {
          const response = await fetch('/api/realtime/metrics', { method: 'POST' });
          if (response.ok) {
            const data = await response.json();
            setMetrics(data);
          }
        } catch (error) {
          console.error('Polling failed:', error);
          setIsConnected(false);
        }
      };

      // Initial fetch
      fetchMetrics();
      
      // Poll every 5 seconds
      pollInterval = setInterval(fetchMetrics, 5000);
      
      cleanup = () => {
        if (pollInterval) clearInterval(pollInterval);
        setIsConnected(false);
      };
    };

    // Try SSE first
    startSSE();

    return () => {
      if (cleanup) cleanup();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  if (!metrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-muted-foreground">Connecting to real-time data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected 
                ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
            }`}>
              {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {connectionType === 'sse' ? 'Server-Sent Events' : 'Polling'}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Last update: {new Date(metrics.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RealtimeMetricCard
          title="Total API Calls"
          value={metrics.totalCalls.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
          color="blue"
          subtitle="All time"
        />
        <RealtimeMetricCard
          title="Recent Activity"
          value={metrics.recentCalls.toString()}
          icon={<Zap className="h-5 w-5" />}
          color="green"
          subtitle="Last 5 minutes"
        />
        <RealtimeMetricCard
          title="Avg Response Time"
          value={`${metrics.avgLatency}ms`}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
          subtitle={metrics.avgLatency < 500 ? 'Excellent' : metrics.avgLatency < 1000 ? 'Good' : 'Needs improvement'}
        />
        <RealtimeMetricCard
          title="Recent Errors"
          value={metrics.errorCount.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={metrics.errorCount > 5 ? "red" : "orange"}
          subtitle="Last hour"
        />
      </div>

      {/* Recent Activity Stream */}
      {metrics.recentActivity && metrics.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Live Activity Feed</h3>
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {metrics.recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <StatusDot status={activity.status} />
                    <span className="font-mono text-sm">{activity.status}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{activity.latency}ms</span>
                    <span>${activity.cost.toFixed(5)}</span>
                    <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cost Monitoring */}
      {metrics.recentCost !== undefined && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Recent Spending</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${metrics.recentCost.toFixed(4)}
              </p>
              <p className="text-xs text-green-600">Last 5 minutes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RealtimeMetricCard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle 
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange" | "red";
  subtitle: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
          {icon}
        </div>
        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const getColor = () => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-400';
      case 'FAIL':
        return 'bg-red-400';
      case 'FLAGGED':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
    }
  };

  return <div className={`h-3 w-3 rounded-full ${getColor()}`} />;
}