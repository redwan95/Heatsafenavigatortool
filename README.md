# HeatSafe Navigator: Thermal-Aware Urban Navigation

HeatSafe Navigator is a full-stack web application designed to help urban travelers in South Asia navigate extreme heat. It uses real-time road network data (OSRM) and simulated thermal climate indices (UTCI) to provide "thermal-aware" routing, prioritizing shaded or cooler paths over the fastest ones.

## Features

- **Dark Mode UI**: The application is permanently set to a sleek dark mode for optimal visibility and reduced eye strain.
- **Dynamic Map Theme**: Switch between Light and Dark map tiles independently of the UI theme.
- **Active Viewport Stats**: Real-time display of the selected city, date, and simulation time directly on the map.
- **Thermal-Aware Routing**: Compare baseline (fastest) routes with optimized (coolest) paths.
- **Regional Impact Analysis**: Dashboard with yearly thermal performance metrics for major South Asian cities.
- **Research & Data Panel**: Detailed methodology, data sources (ERA5-Land, OSM), and academic citations.
- **Interactive Heat Maps**: Visualize UTCI distribution and heat stress levels in real-time.
- **Map Maximization**: Expand the map view for detailed spatial analysis.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Framer Motion, Lucide React.
- **Data Visualization**: Recharts, React Leaflet.
- **Backend**: Express.js (Node.js).
- **Routing API**: OpenStreetMap (OSRM).
- **Build Tool**: Vite 6.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd heatsafe-navigator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to GitHub

1. Create a new repository on GitHub.
2. Push your local code to the new repository:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### Deploy to Cloud Run (via AI Studio)

If you are using Google AI Studio, you can directly deploy this app to Cloud Run:
1. Go to the **Settings** menu in AI Studio.
2. Select **Deploy to Cloud Run**.
3. Follow the prompts to authorize and deploy.

### Manual Production Build

To build the app for production:
```bash
npm run build
npm start
```

### Standalone Hosting
For simple server hosting (Apache, Nginx, or shared hosting), a **`standalone.html`** file is provided in the root directory. This single file contains the entire application logic (using CDNs) and can be hosted independently without a build step.

## Project Structure

- `src/App.tsx`: Main application logic and layout.
- `src/components/MapView.tsx`: Interactive map component with heat zones and routing.
- `src/components/ResearchPanel.tsx`: Detailed data and methodology panel.
- `server.ts`: Express server handling API routes and static file serving.
- `src/index.css`: Global styles and theme configurations.

## Data Sources & Methodology

- **UTCI (Universal Thermal Climate Index)**: Calculated based on air temperature, humidity, wind speed, and mean radiant temperature.
- **ERA5-Land**: Used for historical and real-time atmospheric data.
- **OpenStreetMap**: Provides the road network and morphological data for routing.

## License

This project is licensed under the MIT License.
