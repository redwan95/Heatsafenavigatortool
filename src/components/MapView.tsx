import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteData, RoutePoint, HeatZone } from '../types';
import { Clock, Thermometer, MapPin, Maximize2, Minimize2, Sun, Moon } from 'lucide-react';

interface MapViewProps {
  cityId: string;
  cityName: string;
  routeData: RouteData;
  onPointSelect: (type: 'start' | 'end', point: RoutePoint) => void;
  timeOfDay: number; // 0-23
  selectedDate: string;
  mapTheme: 'light' | 'dark';
  onToggleMapTheme: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

const CITY_COORDS: Record<string, [number, number]> = {
  mumbai: [19.0760, 72.8777],
  dhaka: [23.8103, 90.4125],
  karachi: [24.8607, 67.0011],
  bengaluru: [12.9716, 77.5946],
  kolkata: [22.5726, 88.3639],
  lahore: [31.5204, 74.3587],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.3850, 78.4867],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ 
  cityId, 
  routeData, 
  onPointSelect, 
  timeOfDay, 
  selectedDate,
  mapTheme,
  onToggleMapTheme,
  isMaximized,
  onToggleMaximize,
  cityName
}) => {
  const center = CITY_COORDS[cityId] || [20, 77];
  const [zoom, setZoom] = useState(12);
  const [heatZones, setHeatZones] = useState<HeatZone[]>([]);

  // Generate interactive heat zones based on time of day
  useEffect(() => {
    const zones: HeatZone[] = [];
    const seed = cityId.length;
    
    // Use a pseudo-random generator based on seed for consistency
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 100; i++) {
      // Spread zones across a much larger area (approx 30km x 30km)
      const latOffset = (random(seed + i) - 0.5) * 0.3;
      const lngOffset = (random(seed + i + 100) - 0.5) * 0.3;
      
      const lat = center[0] + latOffset;
      const lng = center[1] + lngOffset;
      
      // Diurnal temperature variation simulation
      const baseTemp = 28;
      const peakTemp = 12; // Max increase at 2 PM (14:00)
      const hourFactor = Math.max(0, 1 - Math.abs(timeOfDay - 14) / 10);
      
      // Add spatial variation (some areas are naturally hotter/cooler)
      // Use larger frequency for "patchy" feel
      const spatialFactor = (Math.sin(lat * 50) + Math.cos(lng * 50)) * 4;
      
      // Add a "Heatwave" factor based on the date (simulated)
      const dateSeed = selectedDate ? selectedDate.split('-').reduce((a, b) => a + parseInt(b), 0) : 0;
      const heatwaveFactor = (random(dateSeed) > 0.7) ? 5 : 0;

      const temp = baseTemp + (peakTemp * hourFactor) + spatialFactor + heatwaveFactor + (random(i) * 2);
      
      zones.push({
        lat, lng, temp,
        time: `${timeOfDay}:00`,
        intensity: temp > 38 ? 'high' : temp > 32 ? 'medium' : 'low'
      });
    }
    setHeatZones(zones);
  }, [cityId, timeOfDay, center, selectedDate]);

  const handleMapClick = (lat: number, lng: number) => {
    if (!routeData.start) {
      onPointSelect('start', { lat, lng });
    } else if (!routeData.end) {
      onPointSelect('end', { lat, lng });
    } else {
      // Reset and start over
      onPointSelect('start', { lat, lng });
    }
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeView center={center} zoom={zoom} />
        <MapClickHandler onMapClick={handleMapClick} />
        <TileLayer
          url={mapTheme === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* User Selected Points */}
        {routeData.start && (
          <Circle center={[routeData.start.lat, routeData.start.lng]} radius={150} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8 }}>
            <Popup><div className="font-mono text-xs">Point A: Start</div></Popup>
          </Circle>
        )}
        {routeData.end && (
          <Circle center={[routeData.end.lat, routeData.end.lng]} radius={150} pathOptions={{ color: '#1e293b', fillColor: '#1e293b', fillOpacity: 0.8 }}>
            <Popup><div className="font-mono text-xs">Point B: Destination</div></Popup>
          </Circle>
        )}

        {/* Baseline Route */}
        {routeData.baseline.length > 0 && (
          <Polyline 
            positions={routeData.baseline.map(p => [p.lat, p.lng])} 
            pathOptions={{ color: "#3b82f6", weight: 6, opacity: 0.3, lineCap: 'round' }}
          >
            <Popup><span className="font-sans text-xs">Baseline Route (Fastest)</span></Popup>
          </Polyline>
        )}

        {/* Thermal-Aware Route */}
        {routeData.thermal.length > 0 && (
          <Polyline 
            positions={routeData.thermal.map(p => [p.lat, p.lng])} 
            pathOptions={{ color: "#ef4444", weight: 6, opacity: 0.9, lineCap: 'round', dashArray: '1, 10' }}
          >
            <Popup><span className="font-sans text-xs font-bold">Thermal-Aware Route (Coolest)</span></Popup>
          </Polyline>
        )}

        {/* Interactive Heat Zones */}
        {heatZones.map((zone, i) => (
          <Circle 
            key={i}
            center={[zone.lat, zone.lng]}
            radius={500}
            pathOptions={{ 
              fillColor: zone.intensity === 'high' ? '#b91c1c' : zone.intensity === 'medium' ? '#ea580c' : '#fbbf24',
              fillOpacity: 0.3,
              stroke: false
            }}
          >
            <Popup>
              <div className="font-sans p-1">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer size={14} className="text-orange-500" />
                  <span className="font-bold text-sm">{zone.temp.toFixed(1)}°C</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Clock size={12} />
                  <span>Recorded at {zone.time}</span>
                </div>
                <p className="text-[9px] mt-2 text-slate-400 italic">
                  {zone.intensity === 'high' ? 'Very Strong Heat Stress' : zone.intensity === 'medium' ? 'Strong Heat Stress' : 'Moderate Exposure Area'}
                </p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-4">
        <button 
          onClick={() => setZoom(12)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          title="Recenter Map"
        >
          <MapPin size={14} className="text-blue-500" />
        </button>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span>{!routeData.start ? 'Click to set Point A' : !routeData.end ? 'Click to set Point B' : 'Route Calculated'}</span>
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <Clock size={14} className="text-orange-500" />
          <span>Simulation: {timeOfDay}:00</span>
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
        <button 
          onClick={onToggleMapTheme}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          title={mapTheme === 'light' ? "Switch to Dark Map" : "Switch to Light Map"}
        >
          {mapTheme === 'light' ? <Moon size={14} className="text-blue-500" /> : <Sun size={14} className="text-orange-500" />}
        </button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
        <button 
          onClick={onToggleMaximize}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          title={isMaximized ? "Minimize Map" : "Maximize Map"}
        >
          {isMaximized ? <Minimize2 size={14} className="text-slate-600 dark:text-slate-400" /> : <Maximize2 size={14} className="text-slate-600 dark:text-slate-400" />}
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-[10px] font-mono w-56">
        <p className="text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">UTCI Heat Stress Legend</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#b91c1c]"></div>
            <span className="text-slate-900 dark:text-slate-100 font-bold">+38 to +46°C</span>
            <span className="text-[8px] text-slate-400 uppercase">Very Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ea580c]"></div>
            <span className="text-slate-900 dark:text-slate-100 font-bold">+32 to +38°C</span>
            <span className="text-[8px] text-slate-400 uppercase">Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#fbbf24]"></div>
            <span className="text-slate-900 dark:text-slate-100 font-bold">&lt; +32°C</span>
            <span className="text-[8px] text-slate-400 uppercase">Moderate</span>
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-1.5 bg-blue-500/40 rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">Baseline Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Optimized Route</span>
          </div>
        </div>
      </div>

      {/* Viewport Box */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/10 dark:bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-800/50 shadow-xl">
        <p className="text-[8px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">Viewport</p>
        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{cityName}</p>
        <p className="text-[9px] text-slate-500 font-mono">{selectedDate} | {timeOfDay}:00</p>
      </div>
    </div>
  );
};
