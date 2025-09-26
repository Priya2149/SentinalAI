import { prisma } from "@/lib/prisma";
import { 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Zap, 
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag,
  Eye,
  MoreVertical
} from "lucide-react";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatRelativeTime(d: Date | string) {
  const now = new Date();
  const date = new Date(d);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default async function LogsPage() {
  const raw = await prisma.modelCall.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  const rows = raw.map((r) => ({
    id: r.id,
    at: r.createdAt,
    user: r.user?.email ?? "—",
    model: r.model,
    latency: r.latencyMs ?? 0,
    tokens: (r.promptTokens ?? 0) + (r.respTokens ?? 0),
    cost: r.costUsd ?? 0,
    status: r.status,
    promptTokens: r.promptTokens ?? 0,
    respTokens: r.respTokens ?? 0,
  }));

  // Calculate some quick stats
  const totalCalls = rows.length;
  const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);
  const avgLatency = Math.round(rows.reduce((sum, r) => sum + r.latency, 0) / totalCalls);
  const errorRate = ((rows.filter(r => r.status !== 'SUCCESS').length / totalCalls) * 100);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Call Logs</h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of all AI model interactions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickStat
          icon={<Zap className="h-5 w-5" />}
          label="Total Calls"
          value={totalCalls.toLocaleString()}
          color="blue"
        />
        <QuickStat
          icon={<DollarSign className="h-5 w-5" />}
          label="Total Cost"
          value={`$${totalCost.toFixed(4)}`}
          color="green"
        />
        <QuickStat
          icon={<Clock className="h-5 w-5" />}
          label="Avg Latency"
          value={`${avgLatency}ms`}
          color="purple"
        />
        <QuickStat
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Error Rate"
          value={`${errorRate.toFixed(1)}%`}
          color={errorRate > 10 ? "red" : "orange"}
        />
      </div>

      {/* Enhanced Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Feed</span>
                <span className="text-xs text-muted-foreground">({totalCalls} entries)</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Auto-refresh: ON</span>
              <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
              <span>Last updated: {formatRelativeTime(rows[0]?.at || new Date())}</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/30">
              <tr>
                <TableHeader>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Time</span>
                  </div>
                </TableHeader>
                <TableHeader>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>User</span>
                  </div>
                </TableHeader>
                <TableHeader>Model</TableHeader>
                <TableHeader>Latency</TableHeader>
                <TableHeader>Tokens</TableHeader>
                <TableHeader>Cost</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`
                    hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-150
                    ${index < 5 ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}
                  `}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-mono text-sm">{formatDate(row.at)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(row.at)}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {row.user === "—" ? "U" : row.user[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {row.user === "—" ? "Anonymous" : row.user.split('@')[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.user === "—" ? "Guest User" : row.user.split('@')[1]}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border">
                      {row.model}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <LatencyIndicator latency={row.latency} />
                      <div className="text-right">
                        <div className={`font-mono text-sm font-medium ${
                          row.latency < 500 ? 'text-green-600' :
                          row.latency < 1000 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {row.latency}ms
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.latency < 500 ? 'Fast' : row.latency < 1000 ? 'Normal' : 'Slow'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-mono text-sm font-medium">{row.tokens.toLocaleString()}</div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <span>{row.promptTokens}↑</span>
                        <span>{row.respTokens}↓</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-right">
                      <div className="font-mono text-sm font-medium text-green-600">
                        ${row.cost.toFixed(5)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${(row.cost * 1000).toFixed(2)}/1K
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadgeEnhanced status={row.status} />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{Math.min(rows.length, 200)}</span> of{" "}
              <span className="font-medium">{rows.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function LatencyIndicator({ latency }: { latency: number }) {
  const getColor = () => {
    if (latency < 500) return "bg-green-400";
    if (latency < 1000) return "bg-yellow-400"; 
    return "bg-red-400";
  };

  const getWidth = () => {
    const percentage = Math.min((latency / 2000) * 100, 100);
    return `${percentage}%`;
  };

  return (
    <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${getColor()} transition-all duration-300`}
        style={{ width: getWidth() }}
      />
    </div>
  );
}

function StatusBadgeEnhanced({ status }: { status: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'SUCCESS':
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
          pulse: false
        };
      case 'FAIL':
        return {
          icon: <XCircle className="h-3 w-3" />,
          className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
          pulse: true
        };
      case 'FLAGGED':
        return {
          icon: <Flag className="h-3 w-3" />,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
          pulse: true
        };
      default:
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
          pulse: false
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`
      inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
      ${config.className}
      ${config.pulse ? 'animate-pulse' : ''}
    `}>
      {config.icon}
      <span>{status}</span>
    </span>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-6 py-4">
      {children}
    </td>
  );
}