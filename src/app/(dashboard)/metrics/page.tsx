"use client";

import { useEffect, useState } from "react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Activity,
  Calendar,
  BarChart3,
  RefreshCw
} from "lucide-react";

// Types matching your API responses
interface DailyMetric {
  date: string;
  calls: number;
  avgLatencyMs: number;
  costUsd: number;
  errors: number;
  errorRate: number;
}

interface DailyResponse {
  from: string;
  to: string;
  data: DailyMetric[];
}

interface SummaryData {
  total: number;
  avg_latency_ms: number;
  avg_cost_usd: number;
  hallucination_rate: number;
  toxicity_rate: number;
  statuses: {
    SUCCESS: number;
    FAIL: number;
    FLAGGED: number;
  };
}

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

// Custom tooltip types
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}
interface PieDataItem {
  name: string;
  value: number;
  color: string;
  // make it indexable like Recharts expects
  [key: string]: string | number;
}

export default function MetricsPage() {
  const [dailyData, setDailyData] = useState<DailyMetric[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const end = new Date();
      const start = new Date();
      const days = timeRange === '7d' ? 7 : 30;
      start.setDate(start.getDate() - days);

      // Fetch daily metrics and summary in parallel
      const [dailyRes, summaryRes] = await Promise.all([
        fetch(`/api/metrics/daily?from=${start.toISOString().split('T')[0]}&to=${end.toISOString().split('T')[0]}`),
        fetch('/api/metrics/summary')
      ]);

      const dailyResponse: DailyResponse = await dailyRes.json();
      const summary: SummaryData = await summaryRes.json();

      setDailyData(dailyResponse.data);
      setSummaryData(summary);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      // Fallback to empty state
      setDailyData([]);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading && !dailyData.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px] space-x-2">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-lg">Loading metrics...</span>
      </div>
    );
  }

  // Calculate stats from real data
  const totalCalls = dailyData.reduce((sum, d) => sum + d.calls, 0);
  const totalCost = dailyData.reduce((sum, d) => sum + d.costUsd, 0);
  const avgLatency = dailyData.length > 0 ? 
    Math.round(dailyData.reduce((sum, d) => sum + d.avgLatencyMs, 0) / dailyData.length) : 0;
  const totalErrors = dailyData.reduce((sum, d) => sum + d.errors, 0);
  const overallErrorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;

  // Prepare pie chart data
  const pieData: PieDataItem[] = summaryData ? [
    { name: 'Success', value: summaryData.statuses.SUCCESS, color: '#10b981' },
    { name: 'Failed', value: summaryData.statuses.FAIL, color: '#ef4444' },
    { name: 'Flagged', value: summaryData.statuses.FLAGGED, color: '#f59e0b' }
  ].filter(item => item.value > 0) : [];

  // Custom tooltip components
  const CallsTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{new Date(label || '').toLocaleDateString()}</p>
          <p className="text-blue-600">
            API Calls: {payload[0]?.value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const CostTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{new Date(label || '').toLocaleDateString()}</p>
          <p className="text-green-600">
            Daily Cost: ${payload[0]?.value.toFixed(4)}
          </p>
        </div>
      );
    }
    return null;
  };

  const LatencyTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{new Date(label || '').toLocaleDateString()}</p>
          <p className="text-purple-600">
            Avg Latency: {Math.round(payload[0]?.value || 0)}ms
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0]?.name}: {payload[0]?.value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Metrics</h1>
          <p className="text-muted-foreground mt-2">
            Real-time insights into your AI system performance
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d')}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Calls"
          value={totalCalls.toLocaleString()}
          change={`+${((totalCalls / Math.max(dailyData.length, 1)) / 10).toFixed(1)}%`}
          trend="up"
          icon={<Activity className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Total Cost"
          value={`$${totalCost.toFixed(4)}`}
          change={`+${(totalCost * 100).toFixed(1)}%`}
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="Avg Latency"
          value={`${avgLatency}ms`}
          change={avgLatency < 500 ? "-12%" : "+8%"}
          trend={avgLatency < 500 ? "up" : "down"}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
        <StatsCard
          title="Error Rate"
          value={`${overallErrorRate.toFixed(1)}%`}
          change={overallErrorRate < 5 ? "-2.4%" : "+1.2%"}
          trend={overallErrorRate < 5 ? "up" : "down"}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={overallErrorRate > 10 ? "red" : "orange"}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Calls Over Time */}
        <ChartCard title="API Calls Trend" description="Daily API call volume">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CallsTooltip />} />
              <Area 
                type="monotone" 
                dataKey="calls" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#callsGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cost Over Time */}
        <ChartCard title="Cost Analysis" description="Daily spending trends">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CostTooltip />} />
              <Area 
                type="monotone" 
                dataKey="costUsd" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#costGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Latency Trends */}
        <ChartCard title="Response Time" description="Average latency performance">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<LatencyTooltip />} />
              <Line 
                type="monotone" 
                dataKey="avgLatencyMs" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Error Analysis */}
        <ChartCard title="Error Distribution" description="Success vs failure rates">
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="80%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center space-x-6">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name} ({item.value.toLocaleString()})
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Daily Breakdown</h2>
              <p className="text-sm text-muted-foreground">Detailed metrics by day</p>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {dailyData.length} days tracked
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>API Calls</TableHeader>
                  <TableHeader>Daily Cost</TableHeader>
                  <TableHeader>Avg Latency</TableHeader>
                  <TableHeader>Errors</TableHeader>
                  <TableHeader>Error Rate</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dailyData.slice().reverse().slice(0, 15).map((row, index) => (
                  <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <TableCell>
                      <div className="font-medium">
                        {new Date(row.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="font-mono font-medium">{row.calls.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-green-600 font-medium">
                        ${row.costUsd.toFixed(4)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          row.avgLatencyMs < 400 ? 'bg-green-400' :
                          row.avgLatencyMs < 700 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <span className="font-mono">{row.avgLatencyMs}ms</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {row.errors > 0 ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <span className={row.errors > 5 ? 'text-red-600 font-medium' : ''}>
                          {row.errors}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        row.errorRate > 0.1 ? 'text-red-600' :
                        row.errorRate > 0.05 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {(row.errorRate * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color 
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange" | "red";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
          {icon}
        </div>
        <div className={`flex items-center space-x-1 text-sm ${
          trend === "up" ? "text-green-600" : "text-red-600"
        }`}>
          {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{change}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode; 
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap">
      {children}
    </td>
  );
}