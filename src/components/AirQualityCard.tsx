/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStreetlight } from '../context/StreetlightContext';
import { 
  Wind, 
  Activity, 
  AlertTriangle, 
  Flame, 
  Car, 
  Sparkles, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Sliders, 
  CheckCircle2, 
  Info,
  Layers
} from 'lucide-react';
import { getCO2Status, getVOCStatus } from '../utils/aqiCalculator';

export const AirQualityCard: React.FC = () => {
  const {
    airQuality,
    setAirQualityManual,
    simulateAirPollutionSpike
  } = useStreetlight();

  const [showManualTuning, setShowManualTuning] = useState(false);

  const co2Status = getCO2Status(airQuality.co2);
  const vocStatus = getVOCStatus(airQuality.voc);

  // Health advice based on AQI
  const getHealthAdvice = () => {
    switch (airQuality.aqiCategory) {
      case 'Good':
        return 'Air quality is satisfactory and poses little or no health risk.';
      case 'Moderate':
        return 'Acceptable air quality; sensitive individuals should consider limiting heavy outdoor exertion.';
      case 'Unhealthy for Sensitive':
        return 'Members of sensitive groups may experience health effects. General public not likely affected.';
      case 'Unhealthy':
        return 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.';
      case 'Very Unhealthy':
        return 'Health alert: The risk of health effects is increased for everyone in the immediate radius.';
      case 'Hazardous':
        return 'Health warning of emergency conditions. Entire population is likely to be affected.';
    }
  };

  return (
    <div id="air-quality-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-md flex flex-col justify-between">
      
      {/* Header & AQI Headline */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: `${airQuality.aqiColor}20`, border: `1px solid ${airQuality.aqiColor}50`, color: airQuality.aqiColor }}
            >
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Local Air Quality Monitoring
                </h2>
                <span 
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: `${airQuality.aqiColor}25`, color: airQuality.aqiColor, border: `1px solid ${airQuality.aqiColor}60` }}
                >
                  AQI {airQuality.aqi} • {airQuality.aqiCategory}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plantower PMS5003 Laser Scattering & SGP30 MOX Sensor
              </p>
            </div>
          </div>

          <button
            id="btn-toggle-manual-aqi"
            type="button"
            onClick={() => setShowManualTuning(!showManualTuning)}
            className={`p-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showManualTuning 
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle manual slider tuning for PM2.5, CO2, and VOC sensors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tune Sensors</span>
          </button>
        </div>

        {/* Primary Sensor Reading Grid: PM2.5, CO2, VOCs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
          
          {/* 1. PM2.5 Card */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: airQuality.aqiColor }} />
                PM2.5 (Fine Dust)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Laser 0.3-2.5µm</span>
            </div>
            
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black font-mono" style={{ color: airQuality.aqiColor }}>
                {airQuality.pm25.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-mono">µg/m³</span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
              <span>Coarse PM10:</span>
              <span className="font-mono text-slate-300 font-semibold">{airQuality.pm10.toFixed(1)} µg/m³</span>
            </div>

            {/* EPA Standard PM2.5 Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (airQuality.pm25 / 150) * 100)}%`,
                  backgroundColor: airQuality.aqiColor
                }}
              />
            </div>
          </div>

          {/* 2. CO2 Concentration Card */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: co2Status.color }} />
                CO₂ (Carbon Dioxide)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">NDIR Optical</span>
            </div>
            
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black font-mono" style={{ color: co2Status.color }}>
                {airQuality.co2}
              </span>
              <span className="text-xs text-slate-400 font-mono">ppm</span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
              <span>Status:</span>
              <span className="font-semibold text-slate-300 truncate max-w-[120px]">{co2Status.label}</span>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, ((airQuality.co2 - 350) / 1650) * 100)}%`,
                  backgroundColor: co2Status.color 
                }}
              />
            </div>
          </div>

          {/* 3. VOCs (Volatile Organics) Card */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: vocStatus.color }} />
                VOCs (Hydrocarbons)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">MOX Metal-Oxide</span>
            </div>
            
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black font-mono" style={{ color: vocStatus.color }}>
                {airQuality.voc}
              </span>
              <span className="text-xs text-slate-400 font-mono">ppb</span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
              <span>Status:</span>
              <span className="font-semibold text-slate-300 truncate max-w-[120px]">{vocStatus.label}</span>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (airQuality.voc / 800) * 100)}%`,
                  backgroundColor: vocStatus.color 
                }}
              />
            </div>
          </div>

        </div>

        {/* Manual Interactive Sliders (When Expanded) */}
        {showManualTuning && (
          <div className="mt-4 p-4 bg-slate-950/90 rounded-xl border border-cyan-900/60 text-xs">
            <div className="flex items-center justify-between mb-3 text-cyan-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                Live Sensor Manual Overrides (Student Testing Sandbox)
              </span>
              <span className="text-[11px] text-slate-400">Inject raw values</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* PM2.5 Slider */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>PM2.5:</span>
                  <span className="font-mono text-cyan-400 font-bold">{airQuality.pm25.toFixed(1)} µg/m³</span>
                </div>
                <input
                  id="slider-manual-pm25"
                  type="range"
                  min="1"
                  max="250"
                  step="0.5"
                  value={airQuality.pm25}
                  onChange={(e) => setAirQualityManual({ pm25: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* CO2 Slider */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>CO₂:</span>
                  <span className="font-mono text-cyan-400 font-bold">{airQuality.co2} ppm</span>
                </div>
                <input
                  id="slider-manual-co2"
                  type="range"
                  min="380"
                  max="2200"
                  step="10"
                  value={airQuality.co2}
                  onChange={(e) => setAirQualityManual({ co2: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* VOC Slider */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>VOCs:</span>
                  <span className="font-mono text-cyan-400 font-bold">{airQuality.voc} ppb</span>
                </div>
                <input
                  id="slider-manual-voc"
                  type="range"
                  min="50"
                  max="1200"
                  step="10"
                  value={airQuality.voc}
                  onChange={(e) => setAirQualityManual({ voc: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

            </div>
          </div>
        )}

        {/* Environmental Ambient Sensors & Health Recommendation Strip */}
        <div className="mt-4 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-slate-200">Public Advisory:</strong> {getHealthAdvice()}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              {airQuality.temperatureC}°C
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              {airQuality.humidityPct}% RH
            </span>
            <span className="flex items-center gap-1 font-mono">
              NO₂: {airQuality.no2} ppb
            </span>
          </div>

        </div>

      </div>

      {/* Preset Pollution Scenario Simulator */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Simulate Environmental Air Event
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          <button
            id="btn-spike-clean"
            type="button"
            onClick={() => simulateAirPollutionSpike('clean')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clean Baseline</span>
          </button>

          <button
            id="btn-spike-traffic"
            type="button"
            onClick={() => simulateAirPollutionSpike('exhaust')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 transition-all"
          >
            <Car className="w-3.5 h-3.5 text-amber-400" />
            <span>Traffic Congestion</span>
          </button>

          <button
            id="btn-spike-dust"
            type="button"
            onClick={() => simulateAirPollutionSpike('dust')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-orange-300 border border-orange-500/30 hover:border-orange-500/50 transition-all"
          >
            <Wind className="w-3.5 h-3.5 text-orange-400" />
            <span>Dust / Construction</span>
          </button>

          <button
            id="btn-spike-wildfire"
            type="button"
            onClick={() => simulateAirPollutionSpike('wildfire')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Wildfire Smoke</span>
          </button>

        </div>
      </div>

    </div>
  );
};
