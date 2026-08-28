/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStreetlight } from '../context/StreetlightContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  Activity, 
  Wind, 
  Zap, 
  Layers, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Maximize2,
  Sun,
  BatteryCharging,
  ShieldCheck,
  CloudFog,
  Radar,
  Lightbulb,
  Radio,
  ChevronRight
} from 'lucide-react';

type FeatureGraphType = 
  | 'lighting_dimming'
  | 'corridor_wave'
  | 'microgrid_solar'
  | 'air_quality'
  | 'pet_immunity'
  | 'winter_fog'
  | 'radar_speed';

export const TelemetryAnalytics: React.FC = () => {
  const { history, airQuality, light, microGrid, poles, selectedPoleId, radarSpeedKmh, radarDistanceM } = useStreetlight();
  const [selectedFeature, setSelectedFeature] = useState<FeatureGraphType>('lighting_dimming');

  // Format data for 8-pole corridor comparison bar chart
  const corridorBarData = poles.map((p, idx) => ({
    name: `Pole #${idx + 1}`,
    fullName: p.name,
    intensity: p.intensity,
    wattage: p.wattage,
    batterySoC: p.batterySoC,
    isTriggered: p.motionDetected,
    positionPct: p.positionPct
  }));

  return (
    <div id="telemetry-analytics-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-md flex flex-col gap-4">
      
      {/* Header & Feature Graph Selector Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Feature-Specific Real-Time Analytics & Telemetry Graphs
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dedicated live graphs for each subsystem: Dimming, 8-Pole Wave, Solar MPPT, Air Quality, Pet Immunity, Fog, & Radar.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          
          <button
            id="tab-chart-lighting"
            type="button"
            onClick={() => setSelectedFeature('lighting_dimming')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedFeature === 'lighting_dimming'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Lighting & PWM</span>
          </button>

          <button
            id="tab-chart-corridor"
            type="button"
            onClick={() => setSelectedFeature('corridor_wave')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedFeature === 'corridor_wave'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>8-Pole Corridor</span>
          </button>

          <button
            id="tab-chart-microgrid"
            type="button"
            onClick={() => setSelectedFeature('microgrid_solar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedFeature === 'microgrid_solar'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-emerald-400" />
            <span>Solar & Battery</span>
          </button>

          <button
            id="tab-chart-aqi"
            type="button"
            onClick={() => setSelectedFeature('air_quality')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedFeature === 'air_quality'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span>Air Quality & PM</span>
          </button>

          <button
            id="tab-chart-pet"
            type="button"
            onClick={() => setSelectedFeature('pet_immunity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedFeature === 'pet_immunity'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>Pet Immunity</span>
          </button>

          <button
            id="tab-chart-fog"
            type="button"
            onClick={() => setSelectedFeature('winter_fog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedFeature === 'winter_fog'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudFog className="w-3.5 h-3.5 text-indigo-400" />
            <span>Winter Fog Optics</span>
          </button>

          <button
            id="tab-chart-radar"
            type="button"
            onClick={() => setSelectedFeature('radar_speed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedFeature === 'radar_speed'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-rose-400" />
            <span>24GHz Radar</span>
          </button>

        </div>
      </div>

      {/* Feature Graph Canvas Container */}
      <div className="h-80 w-full">

        {/* 1. LIGHTING & PWM DIMMING GRAPH */}
        {selectedFeature === 'lighting_dimming' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLightPwm" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorWatts" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <ReferenceLine y={25} label={{ value: 'Idle Base (25%)', fill: '#94a3b8', fontSize: 10 }} stroke="#64748b" strokeDasharray="3 3" />
              <ReferenceLine y={100} label={{ value: 'Active Peak (100%)', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
              <Area
                type="stepAfter"
                dataKey="lightIntensity"
                name="PWM Intensity (%)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorLightPwm)"
              />
              <Area
                type="monotone"
                dataKey="wattage"
                name="LED Load (Watts)"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWatts)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 2. 8-POLE CORRIDOR COMPARISON GRAPH */}
        {selectedFeature === 'corridor_wave' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={corridorBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                formatter={(value: any, name: any) => [
                  name === 'intensity' ? `${value}% PWM` : `${value} Watts`,
                  name === 'intensity' ? 'Lighting Intensity' : 'Power Draw'
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="intensity" name="Luminaire Intensity (%)" radius={[6, 6, 0, 0]}>
                {corridorBarData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.intensity > 25 ? '#38bdf8' : '#334155'} 
                  />
                ))}
              </Bar>
              <Bar dataKey="wattage" name="Power Consumption (Watts)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 3. MICRO-GRID, SOLAR MPPT & BATTERY GRAPH */}
        {selectedFeature === 'microgrid_solar' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSolarPwr" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="batterySoC"
                name="Battery State-of-Charge (%)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorBattery)"
              />
              <Area
                type="monotone"
                dataKey="solarPower"
                name="Solar MPPT Power (W)"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSolarPwr)"
              />
              <Line
                type="monotone"
                dataKey="batteryTempC"
                name="Battery Temp (°C)"
                stroke="#fbbf24"
                strokeWidth={1.8}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 4. AIR QUALITY & MULTI-POLLUTANT TRENDS */}
        {selectedFeature === 'air_quality' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPm25Aqi" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <ReferenceLine y={35.4} label={{ value: 'WHO 24h Threshold (35.4 µg/m³)', fill: '#f87171', fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="pm25"
                name="PM2.5 Fine Dust (µg/m³)"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPm25Aqi)"
              />
              <Line
                type="monotone"
                dataKey="pm10"
                name="PM10 Coarse Particulates (µg/m³)"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="aqi"
                name="Air Quality Index (AQI)"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="voc"
                name="VOCs (ppb)"
                stroke="#38bdf8"
                strokeWidth={1.8}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 5. PET IMMUNITY & FALSE-TRIGGER FILTERING GRAPH */}
        {selectedFeature === 'pet_immunity' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPetSavings" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="petRejectionEvents"
                name="Cumulative Animal False Triggers Filtered"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPetSavings)"
              />
              <Line
                type="stepAfter"
                dataKey="lightIntensity"
                name="Lighting Profile (% Active vs Idle)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 6. WINTER FOG & OPTICAL PENETRATION GRAPH */}
        {selectedFeature === 'winter_fog' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFog" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="fogDensity"
                name="Atmospheric Fog Density (%)"
                stroke="#818cf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorFog)"
              />
              <Line
                type="stepAfter"
                dataKey="lightIntensity"
                name="Optical Lumens Output (% Output)"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 7. 24GHZ RADAR SPEED & DISTANCE GRAPH */}
        {selectedFeature === 'radar_speed' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="radarSpeedKmh"
                name="Vehicle Speed (km/h)"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f43f5e' }}
              />
              <Line
                type="monotone"
                dataKey="radarDistanceM"
                name="Distance to Node (Meters)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

      </div>

      {/* Real-Time Telemetry Metrics Footer Bar */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Synchronized Telemetry Stream: <strong>30 live buffer frames</strong></span>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-slate-300">
          <span>Active Focus: <strong className="text-cyan-300">{poles.find(p => p.id === selectedPoleId)?.name.split('(')[0]}</strong></span>
          <span>•</span>
          <span>PM2.5: <strong className="text-slate-200">{airQuality.pm25.toFixed(1)} µg/m³</strong></span>
          <span>•</span>
          <span>Battery SoC: <strong className="text-emerald-400">{microGrid.batterySoC.toFixed(1)}%</strong></span>
          <span>•</span>
          <span>PWM: <strong className="text-amber-400">{light.intensity}%</strong></span>
          <span>•</span>
          <span>Speed: <strong className="text-rose-400">{radarSpeedKmh} km/h</strong></span>
        </div>
      </div>

    </div>
  );
};
