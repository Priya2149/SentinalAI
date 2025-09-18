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

  const { Document, Page, Text, View, PDFDownloadLink } = PDF;

  const Doc = () => (
    <Document>
      <Page style={{ padding: 24 }}>
        <Text style={{ fontSize: 18, marginBottom: 12 }}>
          AI Governance Report
        </Text>
        <Text>Total calls: {s.total}</Text>
        <Text>Avg latency: {s.avg_latency_ms} ms</Text>
        <Text>Avg cost per call: ${s.avg_cost_usd.toFixed(5)}</Text>
        <Text>
          Hallucination rate: {(s.hallucination_rate * 100).toFixed(1)}%
        </Text>
        <Text>Toxicity rate: {(s.toxicity_rate * 100).toFixed(1)}%</Text>
        <View style={{ marginTop: 12 }}>
          <Text>Statuses:</Text>
          <Text>- SUCCESS: {s.statuses.SUCCESS}</Text>
          <Text>- FAIL: {s.statuses.FAIL}</Text>
          <Text>- FLAGGED: {s.statuses.FLAGGED}</Text>
        </View>
        <View style={{ marginTop: 12 }}>
          <Text>EU AI Act Risk: Minimal (demo)</Text>
        </View>
      </Page>
    </Document>
  );

  return (
    <div className="p-6">
      <PDFDownloadLink document={<Doc />} fileName="compliance-report.pdf">
        Download Compliance PDF
      </PDFDownloadLink>
    </div>
  );
}
