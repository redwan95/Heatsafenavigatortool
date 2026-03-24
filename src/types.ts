export interface CityData {
  id: string;
  name: string;
  utci_max: number;
  exposure_reduction: number;
  heatwave_days: number;
  yearly_stats: Record<string, {
    avg_utci: number;
    peak_utci: number;
    heatwave_count: number;
  }>;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteData {
  start: RoutePoint | null;
  end: RoutePoint | null;
  baseline: RoutePoint[];
  thermal: RoutePoint[];
  metrics: {
    time_penalty: number;
    exposure_reduction: number;
    distance: number;
  };
}

export interface HeatZone {
  lat: number;
  lng: number;
  temp: number;
  time: string;
  intensity: 'low' | 'medium' | 'high';
}
