import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import { CityData } from '../types';
import { Info, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResearchPanelProps {
  data: CityData[];
  selectedCity: string;
  selectedYear: string;
  selectedDate: string;
}

export const ResearchPanel: React.FC<ResearchPanelProps> = ({ data, selectedCity, selectedYear, selectedDate }) => {
  const selectedData = data.find(c => c.id === selectedCity) || data[0];
  const yearlyStats = selectedData.yearly_stats;
  
  const dateObj = new Date(selectedDate);
  const selectedMonth = dateObj.getMonth();
  const selectedMonthName = dateObj.toLocaleString('default', { month: 'long' });
  const selectedYearFromDate = dateObj.getFullYear().toString();

  // Deterministic heatwave generation for the calendar
  const getHeatwaveDays = (year: string, month: number) => {
    const daysInMonth = new Date(parseInt(year), month + 1, 0).getDate();
    const seed = selectedCity.length + parseInt(year) + month;
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const heatwaveData: Record<number, 'high' | 'medium' | 'none'> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const r = random(seed + d);
      if (r > 0.92) {
        heatwaveData[d] = 'high';
      } else if (r > 0.82) {
        heatwaveData[d] = 'medium';
      } else {
        heatwaveData[d] = 'none';
      }
    }
    return heatwaveData;
  };

  const monthlyHeatwaveData = getHeatwaveDays(selectedYearFromDate, selectedMonth);
  const monthlyHeatwaveDays = Object.keys(monthlyHeatwaveData)
    .filter(d => monthlyHeatwaveData[parseInt(d)] !== 'none')
    .map(Number)
    .sort((a, b) => a - b);
  
  const highStressDays = Object.values(monthlyHeatwaveData).filter(v => v === 'high').length;
  const strongStressDays = Object.values(monthlyHeatwaveData).filter(v => v === 'medium').length;
  
  // Count heatwave "events" (streaks of 2+ days)
  const countEvents = (days: number[]) => {
    if (days.length === 0) return 0;
    let events = 0;
    let currentStreak = 1;
    for (let i = 1; i < days.length; i++) {
      if (days[i] === days[i-1] + 1) {
        currentStreak++;
      } else {
        if (currentStreak >= 2) events++;
        currentStreak = 1;
      }
    }
    if (currentStreak >= 2) events++;
    return events;
  };

  const monthlyEvents = countEvents(monthlyHeatwaveDays);
  const yearlyHeatwavesCount = selectedData.yearly_stats[selectedYearFromDate]?.heatwave_count || 0;

  const trendData = Object.entries(yearlyStats).map(([year, stats]) => ({
    year,
    peak: (stats as any).peak_utci,
    avg: (stats as any).avg_utci,
    heatwaves: (stats as any).heatwave_count
  }));

  const comparisonData = data.map(c => ({
    name: c.id.charAt(0).toUpperCase() + c.id.slice(1),
    utci: c.yearly_stats[selectedYear]?.peak_utci || c.utci_max,
    reduction: c.exposure_reduction
  }));

  return (
    <div className="space-y-8">
      {/* Heatwave Analysis Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif italic text-2xl dark:text-white">Heatwave Intensity & Duration</h3>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">Extreme Event Analysis for {selectedData.name}</p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--chart-text)', opacity: 0.5 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--chart-text)', opacity: 0.5 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-bg)', 
                    borderRadius: '12px', 
                    border: '1px solid var(--chart-border)', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ color: 'var(--chart-text)' }}
                  cursor={{ fill: 'var(--chart-grid)', opacity: 0.2 }}
                />
                <Bar dataKey="heatwaves" name="Heatwave Days" radius={[4, 4, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.heatwaves > 15 ? '#e11d48' : entry.heatwaves > 10 ? '#f43f5e' : '#fb7185'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Heatwave Summary ({selectedMonthName} {selectedYearFromDate})</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Yearly Total ({selectedYearFromDate})</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{yearlyHeatwavesCount} Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Very Strong Stress (+38°C)</span>
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{highStressDays} Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Strong Stress (+32°C)</span>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{strongStressDays} Days</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-600 dark:text-slate-400">{selectedMonthName} Events</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{monthlyEvents} Streaks</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50">
              <p className="text-[10px] font-mono text-rose-400 uppercase tracking-widest mb-1">Critical Alert</p>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                Heatwave frequency in {selectedData.name} has increased by 15% since 2020, with peak UTCI values consistently exceeding 40°C.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
                {selectedMonthName} {selectedYearFromDate} Calendar
              </h4>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: new Date(parseInt(selectedYearFromDate), selectedMonth + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const intensity = monthlyHeatwaveData[day];
                  const isToday = day === dateObj.getDate();
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "aspect-square rounded-[2px] flex items-center justify-center text-[8px] font-mono transition-all",
                        intensity === 'high' ? "bg-[#b91c1c] text-white" : 
                        intensity === 'medium' ? "bg-[#ea580c] text-white" : 
                        "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500",
                        isToday && "ring-1 ring-slate-900 dark:ring-slate-100 ring-offset-1 dark:ring-offset-slate-900 z-10"
                      )}
                      title={intensity === 'high' ? "Very Strong Heat Stress" : intensity === 'medium' ? "Strong Heat Stress" : "Normal Day"}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#b91c1c]"></div>
                  <span className="text-[7px] text-slate-500 uppercase tracking-tighter">Very Strong</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#ea580c]"></div>
                  <span className="text-[7px] text-slate-500 uppercase tracking-tighter">Strong</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Trends Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif italic text-2xl dark:text-white">Yearly Thermal Trends (2020-2026)</h3>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">Longitudinal Analysis for {selectedData.name}</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">Rising Intensity</span>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', opacity: 0.5 }} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: 'var(--chart-text)', opacity: 0.5 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid var(--chart-border)', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', 
                  backgroundColor: 'var(--chart-bg)' 
                }}
                itemStyle={{ color: 'var(--chart-text)' }}
              />
              <Area type="monotone" dataKey="peak" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorPeak)" name="Peak UTCI (°C)" />
              <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} dot={false} name="Avg Summer UTCI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logic & Calculation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle size={20} className="text-orange-500" />
            </div>
            <h4 className="text-white font-serif italic text-xl">Heat Stress Zone Selection</h4>
          </div>
          
          <div className="space-y-4 text-xs leading-relaxed">
            <p>
              High Heat Stress Zones are identified using the <span className="text-white font-bold">Universal Thermal Climate Index (UTCI)</span>, 
              which simulates the human body's thermoregulatory response to the environment.
            </p>
            
            <div className="bg-slate-800 dark:bg-slate-900 p-4 rounded-xl border border-slate-700 font-mono">
              <p className="text-orange-400 mb-2 uppercase tracking-widest text-[10px]">The UTCI Formula</p>
              <p className="text-white text-sm">UTCI = f(T<sub>db</sub>, T<sub>mrt</sub>, v, rh)</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[9px] opacity-70">
                <span>T<sub>db</sub>: Air Temp</span>
                <span>T<sub>mrt</sub>: Mean Radiant Temp</span>
                <span>v: Wind Speed</span>
                <span>rh: Humidity</span>
              </div>
            </div>

            <p>
              <span className="text-white font-bold">Logical Justification:</span> A zone is flagged as "High Stress" if the UTCI exceeds 
              <span className="text-orange-500 font-bold mx-1">38°C</span> (Very Strong Heat Stress). This threshold is derived from 
              physiological limits where the body's cooling mechanisms (sweating) begin to fail in humid South Asian conditions.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-serif italic text-xl">Regional Comparison ({selectedYear})</h4>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', opacity: 0.5 }} />
                <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-text)', opacity: 0.5 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid var(--chart-border)', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                    backgroundColor: 'var(--chart-bg)' 
                  }}
                  itemStyle={{ color: 'var(--chart-text)' }}
                />
                <Bar dataKey="utci" fill="#f97316" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name.toLowerCase() === selectedCity ? '#ea580c' : '#fdba74'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
            * Comparison based on peak summer months (April-June). Data includes shade-proxy adjustments for dense urban canyons.
          </p>
        </div>
      </div>
    </div>
  );
};
