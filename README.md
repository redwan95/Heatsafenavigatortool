# 🌡️ HeatSafe Navigator: Thermal-Aware Urban Navigation

**HeatSafe Navigator** is a cutting-edge urban navigation platform designed to optimize pedestrian and commuter routes by prioritizing thermal safety. It helps users navigate South Asian megacities by choosing routes with maximum shade and minimum heat exposure, specifically targeting the Universal Thermal Climate Index (UTCI).

---

## 🚀 Quick Deployment (Vercel)

Since this project is built with **Vite + React**, Vercel is the recommended deployment platform for its "zero-config" setup.

### Step-by-Step Vercel Deployment:
1.  **Push to GitHub:** Ensure your project is pushed to a GitHub repository.
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```
2.  **Import to Vercel:**
    *   Log in to [Vercel.com](https://vercel.com).
    *   Click **"Add New"** > **"Project"**.
    *   Select your GitHub repository from the list.
3.  **Configure & Deploy:**
    *   Vercel will automatically detect **Vite** as the framework.
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
    *   Click **"Deploy"**.
4.  **Success:** Your app will be live at `https://your-repo-name.vercel.app`.

---

## 🧮 How the Calculations Work

The core of HeatSafe Navigator is its **Thermal Routing Engine**. Unlike standard GPS which only looks at distance ($L$), we calculate a "Thermal Cost" ($W$) for every street segment.

### 1. The Thermal Cost Formula
We use a modified Dijkstra's algorithm where the weight of an edge is defined as:

$$W = \frac{L}{V} + \beta \times \int \max(0, UTCI - 26) \, dL$$

| Variable | Definition | Typical Value |
| :--- | :--- | :--- |
| **$W$** | Total Route Weight (Cost) | Calculated |
| **$L$** | Segment Length | Meters |
| **$V$** | Walking Velocity | 1.4 m/s (Standard) |
| **$\beta$** | Heat Sensitivity Coefficient | 0.5 - 2.0 (User defined) |
| **$UTCI$** | Thermal Index | °C |
| **$26$** | Neutrality Threshold | 26°C (South Asian standard) |

### 2. Concrete Example for Validation
Imagine you have two paths to get from Point A to Point B:

#### **Path 1: The "Direct Sun" Route (Shortest)**
*   **Length ($L$):** 100 meters
*   **UTCI:** 40°C (Extremely Hot)
*   **Calculation:**
    *   Base Time: $100 / 1.4 = 71.4$ seconds
    *   Heat Penalty: $0.5 \times (40 - 26) \times 100 = 700$ units
    *   **Total Cost ($W$): 771.4**

#### **Path 2: The "Shaded Alley" Route (Longer)**
*   **Length ($L$):** 150 meters (50% longer)
*   **UTCI:** 28°C (Much Cooler)
*   **Calculation:**
    *   Base Time: $150 / 1.4 = 107.1$ seconds
    *   Heat Penalty: $0.5 \times (28 - 26) \times 150 = 150$ units
    *   **Total Cost ($W$): 257.1**

**Result:** Even though Path 2 is 50 meters longer, the Navigator will choose it because its **Thermal Cost (257.1)** is significantly lower than the direct route (771.4).

---

## 🛠 Development Process

### 1. Data Mocking
To ensure the app works without a complex backend, we use a static JSON structure located at `/public/api/research/summary.json`. This contains:
*   Historical UTCI data (2015-2026).
*   City-specific heatwave statistics.
*   Exposure reduction metrics.

### 2. Standalone Version
We maintain a `standalone.html` file in the root. This is a single-file version of the entire React app. It uses **UMD (Universal Module Definition)** to load React, Leaflet, and Recharts directly from CDNs, making it perfect for quick previews or simple static hosting.

### 3. Routing Integration
The app integrates with the **OSRM (Open Source Routing Machine)** API. In the "Thermal Routing" tab, we simulate the heat penalty by comparing multiple route alternatives provided by OSRM and selecting the one that minimizes the thermal integral.

---

## 📜 License
This project is developed for urban resilience research. All mapping data is provided by OpenStreetMap contributors.
