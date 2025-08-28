"use client";
import { Line } from "react-chartjs-2";
import { ensureChartRegistration } from "./_chart-base";
ensureChartRegistration();

export default function CostChart({ labels, data }:{ labels:string[]; data:number[] }) {
  return <Line data={{ labels, datasets:[{ label:"Cost (USD)", data }] }} />;
}
