import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mock Research Data API with Yearly Stats
  app.get("/api/research/summary", (req, res) => {
    const years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];
    const cities = [
      { id: "mumbai", name: "Mumbai, India", utci_max: 38.2, exposure_reduction: 24.5, heatwave_days: 12 },
      { id: "dhaka", name: "Dhaka, Bangladesh", utci_max: 40.1, exposure_reduction: 28.2, heatwave_days: 18 },
      { id: "karachi", name: "Karachi, Pakistan", utci_max: 42.5, exposure_reduction: 31.0, heatwave_days: 22 },
      { id: "bengaluru", name: "Bengaluru, India", utci_max: 34.8, exposure_reduction: 15.4, heatwave_days: 5 },
      { id: "kolkata", name: "Kolkata, India", utci_max: 39.5, exposure_reduction: 26.8, heatwave_days: 15 },
      { id: "lahore", name: "Lahore, Pakistan", utci_max: 43.2, exposure_reduction: 33.5, heatwave_days: 25 },
      { id: "chennai", name: "Chennai, India", utci_max: 37.9, exposure_reduction: 22.1, heatwave_days: 10 },
      { id: "hyderabad", name: "Hyderabad, India", utci_max: 39.1, exposure_reduction: 23.4, heatwave_days: 14 },
      { id: "ahmedabad", name: "Ahmedabad, India", utci_max: 41.8, exposure_reduction: 29.7, heatwave_days: 20 },
      { id: "surat", name: "Surat, India", utci_max: 38.5, exposure_reduction: 25.2, heatwave_days: 11 },
    ].map(city => ({
      ...city,
      yearly_stats: years.reduce((acc, year) => {
        const base = city.utci_max - 2 + Math.random() * 4;
        acc[year] = {
          avg_utci: base - 5,
          peak_utci: base,
          heatwave_count: Math.floor(city.heatwave_days * (0.8 + Math.random() * 0.4))
        };
        return acc;
      }, {} as any)
    }));
    res.json(cities);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Explicitly serve standalone.html if it exists in root
    app.get("/standalone.html", (req, res) => {
      res.sendFile(path.join(process.cwd(), "standalone.html"));
    });

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
