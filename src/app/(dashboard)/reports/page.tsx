export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Reports</h2>
      <p>Generate a one-click PDF snapshot with totals, latency, hallucination rate, and a demo EU AI Act label.</p>
      <a className="underline" href="/report-pdf" download>Download Compliance PDF</a>
    </div>
  );
}
