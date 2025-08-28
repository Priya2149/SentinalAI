"use client";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
let registered = false;
export function ensureChartRegistration() {
  if (!registered) {
    Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);
    registered = true;
  }
}
