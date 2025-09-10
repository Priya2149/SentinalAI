#AI Governance Dashboard

> **Modern full-stack monitoring tool for Large Language Models (LLMs).**  
> Built to showcase **AI observability, governance, and compliance readiness**

## Overview

This project is a **production-style AI governance dashboard** that tracks, evaluates, and reports on LLM activity.  
It solves the problems enterprises face when deploying AI at scale:

- **Hallucinations & unsafe outputs** → flagged in real-time  
- **Uncontrolled costs** → token usage & spend tracked per user  
- **No visibility** → latency, errors, and performance metrics charted  
- **Compliance pressure** → one-click downloadable reports

**Built with a 2025-ready stack:**  
Next.js 15 · Tailwind 4.0 · ShadCN UI · TypeScript · FastAPI (Python 3.12) · PostgreSQL/Supabase · Docker · Vercel · Render

---

## Core Features

### 1. Model Call Logging & Metrics
- Tracks every AI call: prompt (sanitized), response length, latency, status
- Dashboard table + charts for latency & error rate

### 2. Hallucination & Guardrail Checks
- Compares model outputs vs. expected demo answers
- Flags hallucinations and unsafe/toxic content via free moderation model

### 3. Cost Estimation
- Approximates token usage → calculates cost per user/month
- Visualized as bar graphs in the dashboard

### 4. Compliance Report (PDF Export)
- One-click PDF summary with:
  - Total calls
  - Avg latency
  - % hallucinations flagged
  - Estimated monthly cost
  - EU AI Act risk label (static for demo)

### 5. Modern Dashboard UI
- Built with **Next.js 15 + Tailwind 4.0**
- Dark mode + responsive charts
- Pages: **Logs | Metrics | Reports**

---

## Tech Stack

**Frontend:**  
- Next.js 15, TypeScript, Tailwind 4.0, ShadCN UI  
- Chart.js / Recharts for graphs  

**Backend:**  
- FastAPI (Python 3.12) or Bun + Express  
- SQLite (local) or Supabase PostgreSQL (free tier)  

**Infra & DevOps:**  
- Docker + GitHub Actions (CI/CD)  
- Deployment: Vercel (frontend), Render (backend)  

**AI / Eval Tools:**  
- Free HuggingFace moderation model  
- Simple evals pipeline for hallucination checks  

---
