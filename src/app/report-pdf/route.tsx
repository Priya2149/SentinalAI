import { NextRequest } from "next/server";
import { pdf } from "@react-pdf/renderer";
import ComplianceReport from "@/components/pdf/ComplianceReport";

export const runtime = "nodejs"; // ensure Node runtime for PDF stream

export async function GET(req: NextRequest) {
  const res = await fetch(new URL("/api/report/summary", req.url));
  const summary = await res.json();
  const blob = await pdf(<ComplianceReport data={summary}/>).toBlob();
  return new Response(blob, {
    headers: {
      "Content-Type":"application/pdf",
      "Content-Disposition":"attachment; filename=ai-governance-report.pdf"
    }
  });
}
