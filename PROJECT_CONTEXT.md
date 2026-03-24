# HeatSafe Navigator | Project Context & Reference

This document serves as a persistent memory and technical reference for the **HeatSafe Navigator** project. It outlines the architecture, features, and deployment strategies developed to date.

## 🌍 Project Overview
**HeatSafe Navigator** is a thermal-aware urban navigation platform designed for South Asian cities. It optimizes pedestrian and commuter routes by prioritizing shade and lower Universal Thermal Climate Index (UTCI) zones over the shortest distance.

## 🛠 Technical Stack
- **Frontend:** React 18+, Vite, TypeScript.
- **Styling:** Tailwind CSS (Mobile-first, Dark Mode default, Glassmorphism UI).
- **Mapping:** Leaflet.js (with OpenStreetMap/CartoDB tiles).
- **Data Visualization:** Recharts (Area & Bar charts for thermal trends).
- **Routing Engine:** OSRM (Open Source Routing Machine) API.
- **Geocoding:** Nominatim (OpenStreetMap) API.
- **Animations:** Framer Motion (`motion/react`).

## 🚀 Key Features
1. **Impact Dashboard:** High-level metrics (Peak UTCI, Heatwave Days, Exposure Reduction) for selected cities.
2. **Thermal Routing:** 
   - Compares "Baseline" (shortest) vs. "Thermal Optimized" (safest) routes.
   - Calculates time penalties vs. heat exposure reduction.
   - Interactive map with dynamic heat zone overlays based on time of day.
3. **Research Panel:** 
   - Yearly thermal trend analysis (2020-2026).
   - Methodology breakdown (Dijkstra-based routing with thermal cost functions).
4. **Standalone Mode:** A single-file `standalone.html` that mirrors the full React app's functionality using UMD builds (React, Leaflet, Recharts).

## 📂 Critical File Structure
- `/src/App.tsx`: Main application logic and state management.
- `/src/components/`: Modular UI components (`ImpactDashboard`, `MapView`, `ResearchPanel`).
- `/public/api/research/summary.json`: Static mock API data for city statistics.
- `/standalone.html`: Self-contained, zero-dependency version of the app.
- `/server.ts`: Express server for development and production serving.

## 🧠 Developed Logic & Algorithms
- **Thermal Cost Function:** $W = L/V + \beta \times \int [max(0, UTCI - 26)] dL$
- **UTCI Threshold:** 26°C is used as the thermal neutrality threshold for the South Asian context.
- **Dynamic Heat Zones:** Simulated intensity scales with the time of day, peaking at 14:00 local time.

## 📦 Deployment Guide (GitHub)
### Option A: Professional (Vercel/Netlify)
1. Push the entire repository to GitHub.
2. Connect the repo to Vercel/Netlify.
3. The build command is `npm run build` and the output directory is `dist`.

### Option B: Static (GitHub Pages)
1. Upload `standalone.html` to a GitHub repo.
2. Rename it to `index.html`.
3. Enable GitHub Pages in the repository settings.

## 📍 Current State
- The app is fully functional and "static-ready" (fetches data from local JSON).
- Standalone HTML is synchronized with the React preview.
- Deployment instructions are provided and tested.

---
*Last Updated: March 24, 2026*
