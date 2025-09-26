"use client";

import { useEffect, useState } from "react";

type MetricsSummary = {
  total: number;
  avg_latency_ms: number;
  avg_cost_usd: number;
  hallucination_rate: number;
  toxicity_rate: number;
  statuses: { SUCCESS: number; FAIL: number; FLAGGED: number };
};

export default function Reports() {
  const [s, setS] = useState<MetricsSummary | null>(null);
  const [PDF, setPDF] =
    useState<null | typeof import("@react-pdf/renderer")>(null);

  // Load metrics
  useEffect(() => {
    fetch("/api/metrics/summary")
      .then((r) => r.json())
      .then((data: MetricsSummary) => setS(data))
      .catch(() => setS(null));
  }, []);

  // Dynamically import @react-pdf/renderer on the client only
  useEffect(() => {
    import("@react-pdf/renderer")
      .then((mod) => setPDF(mod))
      .catch(() => setPDF(null));
  }, []);

  if (!s) return <div className="p-6">Loading…</div>;
  if (!PDF) return <div className="p-6">Loading PDF tools…</div>;

  const { Document, Page, Text, View, StyleSheet, PDFDownloadLink } = PDF;

  // Enhanced Styles
  const styles = StyleSheet.create({
    page: {
      padding: 0,
      fontSize: 12,
      fontFamily: 'Helvetica',
      backgroundColor: '#ffffff'
    },
    
    // Header Styles
    header: {
      backgroundColor: '#4f46e5',
      padding: '40px 50px 30px',
      color: 'white',
      position: 'relative'
    },
    
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 6,
      color: 'white'
    },
    
    headerSubtitle: {
      fontSize: 14,
      color: '#e0e7ff',
      marginBottom: 0
    },
    
    timestamp: {
      position: 'absolute',
      top: 30,
      right: 50,
      fontSize: 11,
      color: '#e0e7ff',
      textAlign: 'right'
    },
    
    // Content Styles
    content: {
      padding: '40px 50px'
    },
    
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 20,
      marginTop: 30,
      borderLeft: '4px solid #4f46e5',
      paddingLeft: 12
    },
    
    // Metrics Grid
    metricsGrid: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,
      marginBottom: 30
    },
    
    metricCard: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: 20,
      flex: 1,
      minWidth: 120,
      borderLeft: '4px solid #3b82f6'
    },
    
    metricCardSuccess: {
      borderLeft: '4px solid #10b981'
    },
    
    metricCardWarning: {
      borderLeft: '4px solid #f59e0b'
    },
    
    metricCardDanger: {
      borderLeft: '4px solid #ef4444'
    },
    
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 4
    },
    
    metricValueSuccess: {
      color: '#10b981'
    },
    
    metricValueWarning: {
      color: '#f59e0b'
    },
    
    metricValueDanger: {
      color: '#ef4444'
    },
    
    metricLabel: {
      fontSize: 10,
      color: '#64748b',
      fontWeight: 'bold',
      marginBottom: 2
    },
    
    metricDescription: {
      fontSize: 9,
      color: '#94a3b8'
    },
    
    // Status Section
    statusGrid: {
      display: 'flex',
      flexDirection: 'row',
      gap: 15,
      marginBottom: 20
    },
    
    statusItem: {
      backgroundColor: 'white',
      border: '2px solid #e2e8f0',
      borderRadius: 6,
      padding: '12px 16px',
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    },
    
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8
    },
    
    statusDotSuccess: {
      backgroundColor: '#10b981'
    },
    
    statusDotFail: {
      backgroundColor: '#ef4444'
    },
    
    statusDotFlagged: {
      backgroundColor: '#f59e0b'
    },
    
    statusText: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#374151'
    },
    
    // Compliance Section
    complianceSection: {
      backgroundColor: '#f0f9ff',
      border: '2px solid #0ea5e9',
      borderRadius: 8,
      padding: 25,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 30
    },
    
    complianceBadge: {
      backgroundColor: '#0ea5e9',
      color: 'white',
      padding: '6px 16px',
      borderRadius: 16,
      fontSize: 11,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center'
    },
    
    complianceText: {
      color: '#075985',
      fontWeight: 'bold',
      fontSize: 14
    },
    
    // Footer
    footer: {
      backgroundColor: '#f8fafc',
      padding: '25px 50px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    
    footerText: {
      color: '#64748b',
      fontSize: 11
    },
    
    logo: {
      fontWeight: 'bold',
      color: '#4f46e5',
      fontSize: 14
    }
  });

  // Calculate derived metrics
  const successRate = s.total > 0 ? (s.statuses.SUCCESS / s.total) * 100 : 0;
  const costPerCall = s.total > 0 ? s.avg_cost_usd / s.total : 0;
  
  // Generate current timestamp
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  const EnhancedDoc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.timestamp}>
            Generated: {timestamp}
          </Text>
          <Text style={styles.headerTitle}>AI Governance Report</Text>
          <Text style={styles.headerSubtitle}>
            Comprehensive LLM Monitoring & Compliance Analysis
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Main Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard]}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                {s.total}
              </Text>
              <Text style={styles.metricLabel}>TOTAL CALLS</Text>
              <Text style={styles.metricDescription}>
                LLM API interactions monitored
              </Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardSuccess]}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                {s.avg_latency_ms}ms
              </Text>
              <Text style={styles.metricLabel}>AVG LATENCY</Text>
              <Text style={styles.metricDescription}>
                Response time performance
              </Text>
            </View>

            <View style={[
              styles.metricCard, 
              s.hallucination_rate > 0.15 ? styles.metricCardDanger : 
              s.hallucination_rate > 0.05 ? styles.metricCardWarning : styles.metricCardSuccess
            ]}>
              <Text style={[
                styles.metricValue,
                s.hallucination_rate > 0.15 ? styles.metricValueDanger : 
                s.hallucination_rate > 0.05 ? styles.metricValueWarning : styles.metricValueSuccess
              ]}>
                {(s.hallucination_rate * 100).toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>HALLUCINATION RATE</Text>
              <Text style={styles.metricDescription}>
                Content accuracy monitoring
              </Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardSuccess]}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                ${s.avg_cost_usd.toFixed(5)}
              </Text>
              <Text style={styles.metricLabel}>AVG COST/CALL</Text>
              <Text style={styles.metricDescription}>
                Token usage efficiency
              </Text>
            </View>
          </View>

          {/* System Status Overview */}
          <Text style={styles.sectionTitle}>System Status Overview</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusDotSuccess]} />
              <Text style={styles.statusText}>SUCCESS: {s.statuses.SUCCESS}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusDotFail]} />
              <Text style={styles.statusText}>FAIL: {s.statuses.FAIL}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusDotFlagged]} />
              <Text style={styles.statusText}>FLAGGED: {s.statuses.FLAGGED}</Text>
            </View>
          </View>

          {/* Safety & Security Metrics */}
          <Text style={styles.sectionTitle}>Safety & Security Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardSuccess]}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                {(s.toxicity_rate * 100).toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>TOXICITY RATE</Text>
              <Text style={styles.metricDescription}>
                Content safety violations
              </Text>
            </View>
            <View style={[styles.metricCard]}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                {successRate.toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>SUCCESS RATE</Text>
              <Text style={styles.metricDescription}>
                Overall system reliability
              </Text>
            </View>
          </View>

          {/* Compliance Section */}
          <View style={styles.complianceSection}>
            <Text style={styles.complianceBadge}>EU AI ACT COMPLIANT</Text>
            <Text style={styles.complianceText}>
              Risk Classification: Minimal Risk (Demo Environment)
            </Text>
          </View>

          {/* Financial Overview */}
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard]}>
              <Text style={[styles.metricValue]}>
                ${(s.avg_cost_usd * s.total).toFixed(4)}
              </Text>
              <Text style={styles.metricLabel}>TOTAL COST</Text>
              <Text style={styles.metricDescription}>
                Cumulative API expenses
              </Text>
            </View>
            <View style={[styles.metricCard]}>
              <Text style={[styles.metricValue]}>
                ${(s.avg_cost_usd * s.total * 30).toFixed(2)}
              </Text>
              <Text style={styles.metricLabel}>EST. MONTHLY COST</Text>
              <Text style={styles.metricDescription}>
                Projected scaling estimate
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Report generated by SentinalAI Dashboard • Confidential & Proprietary
          </Text>
          <Text style={styles.logo}>SentinalAI</Text>
        </View>
      </Page>
    </Document>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Compliance Reports</h1>
        <p className="text-gray-600 mb-6">
          Generate professional AI governance and compliance reports for audit and regulatory purposes.
        </p>
        
        <div className="flex items-center space-x-4">
          <PDFDownloadLink 
            document={<EnhancedDoc />} 
            fileName="ai-governance-compliance-report.pdf"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {({ blob, url, loading, error }) =>
              loading ? 'Generating PDF...' : 'Download Compliance Report'
            }
          </PDFDownloadLink>
          
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Quick Stats Preview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{s.total}</div>
          <div className="text-sm text-gray-500">Total Calls</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{s.avg_latency_ms}ms</div>
          <div className="text-sm text-gray-500">Avg Latency</div>
        </div>
        <div className={`bg-white p-4 rounded-lg shadow`}>
          <div className={`text-2xl font-bold ${
            s.hallucination_rate > 0.15 ? 'text-red-600' : 
            s.hallucination_rate > 0.05 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {(s.hallucination_rate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Hallucination Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {((s.statuses.SUCCESS / s.total) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Success Rate</div>
        </div>
      </div>
    </div>
  );
}