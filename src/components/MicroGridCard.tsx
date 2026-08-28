/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStreetlight } from '../context/StreetlightContext';
import { 
  Sun, 
  BatteryCharging, 
  Battery, 
  Zap, 
  RefreshCw, 
  CloudSun, 
  CloudRain, 
  Moon, 
  Power, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { formatEnergy, formatWattage } from '../utils/aqiCalculator';

export const MicroGridCard: React.FC = () => {
  const {
    microGrid,
    light,
    setWeatherPreset,
    toggleGridFallback
  } = useStreetlight();

  const isCharging = microGrid.chargingState === 'bulk' || microGrid.chargingState === 'absorption' || microGrid.chargingState === 'float';

  return (
    <div id="microgrid-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-md flex flex-col justify-between">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Solar Micro-Grid & Storage
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  microGrid.gridFallbackActive 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {microGrid.gridFallbackActive ? 'Municipal Grid Fallback' : '100% Autonomous Solar'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100W Monocrystalline PV & MPPT LiFePO4 Energy Core
              </p>
            </div>
          </div>

          <button
            id="btn-toggle-grid"
            type="button"
            onClick={toggleGridFallback}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              microGrid.gridFallbackActive
                ? 'bg-rose-950 text-rose-300 border-rose-700 hover:bg-rose-900'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle between autonomous solar battery and AC municipal grid fallback"
          >
            <Power className="w-3.5 h-3.5" />
            <span>{microGrid.gridFallbackActive ? 'Disconnect Grid' : 'Engage Grid'}</span>
          </button>
        </div>

        {/* Microgrid Power Flow Diagram / Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
          
          {/* Solar PV Generation */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Solar PV Generation
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">
                {microGrid.chargingState}
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black font-mono text-amber-400">
                {formatWattage(microGrid.solarPower)}
              </span>
              <span className="text-xs text-slate-400">output</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 font-mono">
              <div>
                <span>PV Voltage: </span>
                <strong className="text-slate-200">{microGrid.solarVoltage.toFixed(1)} V</strong>
              </div>
              <div>
                <span>PV Current: </span>
                <strong className="text-slate-200">{microGrid.solarCurrent.toFixed(2)} A</strong>
              </div>
            </div>
          </div>

          {/* Battery Storage SoC */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                {isCharging ? (
                  <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
                ) : (
                  <Battery className="w-4 h-4 text-cyan-400" />
                )}
                LiFePO₄ Battery Storage
              </span>
              <span className="text-[10px] uppercase font-bold font-mono text-cyan-400">
                {isCharging ? 'Charging' : 'Discharging'}
              </span>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className="text-2xl font-black font-mono text-cyan-400">
                {microGrid.batterySoC.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">State of Charge</span>
            </div>

            {/* Battery Level Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  microGrid.batterySoC > 50 ? 'bg-emerald-500' : microGrid.batterySoC > 20 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${microGrid.batterySoC}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mt-2 font-mono">
              <div>
                <span>Terminal V: </span>
                <strong className="text-slate-200">{microGrid.batteryVoltage.toFixed(2)} V</strong>
              </div>
              <div>
                <span>Current: </span>
                <strong className="text-slate-200">{microGrid.batteryCurrent.toFixed(2)} A</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Microgrid Efficiency & Solar Yield Stats */}
        <div className="mt-4 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          
          <div>
            <span className="text-[10px] text-slate-400 block">Daily Solar Yield</span>
            <span className="font-mono text-sm font-bold text-amber-400">
              {formatEnergy(microGrid.dailySolarYieldWh)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block">Net Autonomy</span>
            <span className="font-mono text-sm font-bold text-emerald-400">
              {microGrid.gridFallbackActive ? 'Hybrid Grid' : '100% Off-Grid'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block">Battery Temp</span>
            <span className="font-mono text-sm font-bold text-slate-200">
              {microGrid.batteryTempC}°C
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block">Est. Reserve Runtime</span>
            <span className="font-mono text-sm font-bold text-cyan-400">
              {Math.round((microGrid.batterySoC / 100) * 36)} hrs
            </span>
          </div>

        </div>

      </div>

      {/* Irradiance / Weather Simulator */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Solar Irradiance Profile Simulator
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          <button
            id="btn-weather-sunny"
            type="button"
            onClick={() => setWeatherPreset('sunny')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-slate-600 transition-all"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Peak Sun (72W)</span>
          </button>

          <button
            id="btn-weather-overcast"
            type="button"
            onClick={() => setWeatherPreset('overcast')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all"
          >
            <CloudSun className="w-3.5 h-3.5 text-sky-400" />
            <span>Overcast (28W)</span>
          </button>

          <button
            id="btn-weather-storm"
            type="button"
            onClick={() => setWeatherPreset('storm')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all"
          >
            <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Heavy Cloud (8W)</span>
          </button>

          <button
            id="btn-weather-night"
            type="button"
            onClick={() => setWeatherPreset('night')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 hover:border-slate-600 transition-all"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Night (0W)</span>
          </button>

        </div>
      </div>

    </div>
  );
};
