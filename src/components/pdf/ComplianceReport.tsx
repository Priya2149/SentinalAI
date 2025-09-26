"use client";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register custom fonts if needed (optional)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
// });

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

interface ComplianceReportProps {
  data: {
    totalCalls: number;
    estimatedCostUsd: number;
    avgLatencyMs: number;
    hallucinationRate: number;
    failures: number;
    euAiActRisk: string;
    successCount?: number;
    flaggedCount?: number;
    toxicityRate?: number;
  }
}

export default function ComplianceReport({ data }: ComplianceReportProps) {
  // Calculate derived metrics
  const successCount = data.successCount || (data.totalCalls - data.failures - (data.flaggedCount || 0));
  const successRate = data.totalCalls > 0 ? (successCount / data.totalCalls) * 100 : 0;
  const costPerCall = data.totalCalls > 0 ? data.estimatedCostUsd / data.totalCalls : 0;
  const toxicityRate = data.toxicityRate || 0;
  
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

  return (
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
                {data.totalCalls}
              </Text>
              <Text style={styles.metricLabel}>Total Calls</Text>
              <Text style={styles.metricDescription}>
                LLM API interactions monitored
              </Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardSuccess]}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                {data.avgLatencyMs}ms
              </Text>
              <Text style={styles.metricLabel}>Avg Latency</Text>
              <Text style={styles.metricDescription}>
                Response time performance
              </Text>
            </View>

            <View style={[
              styles.metricCard, 
              data.hallucinationRate > 0.15 ? styles.metricCardDanger : 
              data.hallucinationRate > 0.05 ? styles.metricCardWarning : styles.metricCardSuccess
            ]}>
              <Text style={[
                styles.metricValue,
                data.hallucinationRate > 0.15 ? styles.metricValueDanger : 
                data.hallucinationRate > 0.05 ? styles.metricValueWarning : styles.metricValueSuccess
              ]}>
                {(data.hallucinationRate * 100).toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>Hallucination Rate</Text>
              <Text style={styles.metricDescription}>
                Content accuracy monitoring
              </Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardSuccess]}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                ${costPerCall.toFixed(5)}
              </Text>
              <Text style={styles.metricLabel}>Avg Cost/Call</Text>
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
              <Text style={styles.statusText}>SUCCESS: {successCount}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusDotFail]} />
              <Text style={styles.statusText}>FAIL: {data.failures}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.statusDotFlagged]} />
              <Text style={styles.statusText}>FLAGGED: {data.flaggedCount || 0}</Text>
            </View>
          </View>

          {/* Safety & Security Metrics */}
          <Text style={styles.sectionTitle}>Safety & Security Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.metricCardSuccess]}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                {(toxicityRate * 100).toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>Toxicity Rate</Text>
              <Text style={styles.metricDescription}>
                Content safety violations
              </Text>
            </View>
            <View style={[styles.metricCard]}>
              <Text style={[styles.metricValue, styles.metricValueSuccess]}>
                {successRate.toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>Success Rate</Text>
              <Text style={styles.metricDescription}>
                Overall system reliability
              </Text>
            </View>
          </View>

          {/* Compliance Section */}
          <View style={styles.complianceSection}>
            <Text style={styles.complianceBadge}>EU AI Act Compliant</Text>
            <Text style={styles.complianceText}>
              Risk Classification: {data.euAiActRisk}
            </Text>
          </View>

          {/* Summary Stats */}
          <Text style={styles.sectionTitle}>Financial Overview</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard]}>
              <Text style={[styles.metricValue]}>
                ${data.estimatedCostUsd.toFixed(4)}
              </Text>
              <Text style={styles.metricLabel}>Total Cost</Text>
              <Text style={styles.metricDescription}>
                Cumulative API expenses
              </Text>
            </View>
            <View style={[styles.metricCard]}>
              <Text style={[styles.metricValue]}>
                ${(data.estimatedCostUsd * 30).toFixed(2)}
              </Text>
              <Text style={styles.metricLabel}>Est. Monthly Cost</Text>
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
}