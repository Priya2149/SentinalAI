// app/api/metrics/realtime/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define proper types
interface MetricsData {
  totalCalls: number;
  recentCalls: number;
  avgLatency: number;
  errorCount: number;
  timestamp: string;
}

interface ErrorData {
  error: string;
}

interface ConnectionData {
  type: string;
  message: string;
}

type SSEData = MetricsData | ErrorData | ConnectionData;

/**
 * Free real-time updates using Server-Sent Events
 * No external service needed - built into browsers and Next.js
 */
export async function GET(request: NextRequest) {
  // Set up Server-Sent Events headers
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Function to send data to client
  const sendEvent = async (data: SSEData, event = 'message') => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  };

  // Function to fetch and send metrics
  const sendMetricsUpdate = async () => {
    try {
      // Get latest metrics from database
      const [count, latency, recentCalls, errors] = await Promise.all([
        prisma.modelCall.count(),
        prisma.modelCall.aggregate({ _avg: { latencyMs: true } }),
        prisma.modelCall.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            }
          }
        }),
        prisma.modelCall.count({
          where: {
            status: { not: 'SUCCESS' },
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
            }
          }
        })
      ]);

      const metricsData: MetricsData = {
        totalCalls: count,
        recentCalls: recentCalls,
        avgLatency: Math.round(latency._avg.latencyMs ?? 0),
        errorCount: errors,
        timestamp: new Date().toISOString()
      };

      await sendEvent(metricsData);
    } catch (error) {
      console.error('Failed to send metrics update:', error);
      const errorData: ErrorData = { error: 'Failed to fetch metrics' };
      await sendEvent(errorData, 'error');
    }
  };

  // Send initial data
  const connectionData: ConnectionData = { 
    type: 'connected', 
    message: 'Real-time connection established' 
  };
  await sendEvent(connectionData, 'connect');
  await sendMetricsUpdate();

  // Set up periodic updates (every 10 seconds)
  const interval = setInterval(sendMetricsUpdate, 10000);

  // Handle client disconnect
  request.signal.addEventListener('abort', () => {
    clearInterval(interval);
    writer.close();
  });

  return new Response(responseStream.readable, { headers });
}

/**
 * Alternative: Simple polling endpoint for real-time data
 * Use this if Server-Sent Events don't work in your environment
 */
export async function POST() {
  try {
    const [summary, recentActivity] = await Promise.all([
      // Get overall summary
      prisma.modelCall.aggregate({
        _count: { _all: true },
        _avg: { latencyMs: true }
      }),
      
      // Get recent activity (last 5 minutes)
      prisma.modelCall.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000)
          }
        },
        select: {
          status: true,
          latencyMs: true,
          costUsd: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    const recentErrors = recentActivity.filter(call => call.status !== 'SUCCESS').length;
    const recentCost = recentActivity.reduce((sum, call) => sum + (call.costUsd || 0), 0);

    return Response.json({
      totalCalls: summary._count._all,
      recentCalls: recentActivity.length,
      avgLatency: Math.round(summary._avg.latencyMs ?? 0),
      errorCount: recentErrors,
      recentCost: recentCost,
      lastUpdate: new Date().toISOString(),
      recentActivity: recentActivity.slice(0, 5).map(call => ({
        status: call.status,
        latency: call.latencyMs,
        cost: call.costUsd,
        timestamp: call.createdAt
      }))
    });
  } catch (error) {
    console.error('Failed to fetch real-time metrics:', error);
    return Response.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}