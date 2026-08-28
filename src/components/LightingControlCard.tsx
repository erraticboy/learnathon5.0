/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStreetlight } from '../context/StreetlightContext';
import { 
  Lightbulb, 
  Zap, 
  Clock, 
  Sliders, 
  ShieldAlert, 
  Leaf, 
  TrendingDown, 
  Activity,
  Radar,
  Radio,
  Gauge,
  Dog,
  ShieldCheck,
  CloudFog,
  Snowflake
} from 'lucide-react';
import { LightingMode } from '../types';
import { formatEnergy, formatWattage } from '../utils/aqiCalculator';

export const LightingControlCard: React.FC = () => {
  const {
    light,
    setLightIntensity,
    setLightingMode,
    setIdleIntensity,
    setActiveIntensity,
    setHoldTimeout,
    togglePetImmunity,
    setFogDensity,
    toggleWinterMode,
    triggerPedestrianMotion,
    triggerVehicleMotion,
    triggerAnimalMotion
  } = useStreetlight();

  const modes: { id: LightingMode; label: string; icon: any; desc: string }[] = [
    { id: 'auto', label: 'Adaptive Auto', icon: Activity, desc: 'Dims to idle; boosts to 100% on motion' },
    { id: 'eco', label: 'Ultra Eco', icon: Leaf, desc: 'Low 15% idle for maximum solar preservation' },
    { id: 'manual', label: 'Manual Control', icon: Sliders, desc: 'Fixed manual override intensity' },
    { id: 'emergency', label: 'Emergency Max', icon: ShieldAlert, desc: 'Constant 100% illumination' }
  ];

  // Energy savings calculation: % saved compared to standard fixed 60W streetlamp
  const energySavedPct = Math.max(0, Math.round(((light.conventionalWattage - light.currentWattage) / light.conventionalWattage) * 100));

  return (
    <div id="lighting-control-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-md flex flex-col justify-between">
      
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Adaptive Lighting Controller
              </h2>
              <p className="text-xs text-slate-400">
                Pulse-Width Modulation (PWM) & Smart Multi-Sensor Dimming
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black font-mono text-amber-400">
              {light.intensity}%
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {formatWattage(light.currentWattage)}
            </span>
          </div>
        </div>

        {/* Intensity Control Slider (0-100%) */}
        <div className="mt-5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              Light Output Duty Cycle (0 - 100%)
            </span>
            <span className="font-mono text-amber-400 font-bold">{light.intensity}% Intensity</span>
          </div>

          <div className="relative flex items-center">
            <input
              id="slider-light-intensity"
              type="range"
              min="0"
              max="100"
              step="1"
              value={light.intensity}
              onChange={(e) => {
                setLightIntensity(Number(e.target.value));
              }}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5 px-0.5">
            <span>0% (OFF)</span>
            <span>25% (Eco Idle)</span>
            <span>50% (Standard)</span>
            <span>75% (Enhanced)</span>
            <span>100% (Full Peak)</span>
          </div>
        </div>

        {/* Winter Fog & Pet Immunity Quick Feature Toggles */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Pet Immunity Switch */}
          <button
            type="button"
            onClick={togglePetImmunity}
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all text-left ${
              light.petImmunityEnabled 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {light.petImmunityEnabled ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Dog className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold block">Pet Immunity Filter</span>
                <span className="text-[10px] text-slate-400 block">
                  {light.petImmunityEnabled ? 'Active (Rejects Stray Animals)' : 'Disabled (Wastes Power)'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              light.petImmunityEnabled ? 'bg-emerald-900/80 text-emerald-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {light.petImmunityEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Winter Fog Mode Switch */}
          <button
            type="button"
            onClick={toggleWinterMode}
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all text-left ${
              light.isWinterMode || light.fogDensity >= 30
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <CloudFog className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block">Winter Fog Penetration</span>
                <span className="text-[10px] text-slate-400 block">
                  {light.fogDensity >= 30 || light.isWinterMode ? `Fog Density: ${light.fogDensity}%` : 'Clear Atmosphere'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              light.fogDensity >= 30 || light.isWinterMode ? 'bg-amber-900/80 text-amber-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {light.fogDensity >= 30 || light.isWinterMode ? 'BOOST' : 'OFF'}
            </span>
          </button>
        </div>

        {light.motionDetected || light.prolongedPresenceActive ? (
          <div className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-200">
            <span className="font-bold">Continuous presence rule: </span>
            {light.prolongedPresenceActive
              ? 'Presence exceeded 30s. Light output is limited to 40%.'
              : `${30 - light.presenceDurationSec}s until the light is limited to 40%.`}
          </div>
        ) : null}

        {/* Operating Profiles / Modes */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Operating Profile Mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {modes.map(m => {
              const Icon = m.icon;
              const isSelected = light.mode === m.id;
              return (
                <button
                  key={m.id}
                  id={`btn-mode-${m.id}`}
                  type="button"
                  onClick={() => setLightingMode(m.id)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">{m.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Adaptive Parameters: Idle Floor vs Active Ceiling */}
        {light.mode === 'auto' && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs">
            
            {/* Idle Floor */}
            <div>
              <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                <span>Idle Floor:</span>
                <span className="font-mono text-amber-400 font-bold">{light.idleIntensity}%</span>
              </div>
              <input
                id="input-idle-floor"
                type="range"
                min="0"
                max="50"
                value={light.idleIntensity}
                onChange={(e) => setIdleIntensity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] text-slate-400">Power: {(light.idleIntensity * 0.6).toFixed(1)}W</span>
            </div>

            {/* Active Peak */}
            <div>
              <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                <span>Motion Peak:</span>
                <span className="font-mono text-amber-400 font-bold">{light.activeIntensity}%</span>
              </div>
              <input
                id="input-active-peak"
                type="range"
                min="50"
                max="100"
                value={light.activeIntensity}
                onChange={(e) => setActiveIntensity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] text-slate-400">Power: {(light.activeIntensity * 0.6).toFixed(1)}W</span>
            </div>

            {/* Hold Duration */}
            <div>
              <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                <span>Hold Timer:</span>
                <span className="font-mono text-cyan-400 font-bold">{light.holdTimeoutSec}s</span>
              </div>
              <input
                id="input-hold-timer"
                type="range"
                min="5"
                max="60"
                step="5"
                value={light.holdTimeoutSec}
                onChange={(e) => setHoldTimeout(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] text-slate-400">Post-motion hold</span>
            </div>

          </div>
        )}

      </div>

      {/* Real-Time Energy Efficiency & Sensor Telemetry Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Current Draw</span>
          <span className="font-mono text-sm font-bold text-amber-400">
            {formatWattage(light.currentWattage)}
          </span>
          <span className="block text-[10px] text-slate-400">vs 60.0W fixed</span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Instant Savings</span>
          <span className="font-mono text-sm font-bold text-emerald-400">
            {energySavedPct}% Cut
          </span>
          <span className="block text-[10px] text-slate-400">
            {formatWattage(light.conventionalWattage - light.currentWattage)} saved
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Stray Pet Filtered</span>
          <span className="font-mono text-sm font-bold text-emerald-400">
            {light.petRejectionsCount} Ignored
          </span>
          <span className="block text-[10px] text-slate-400">
            +{(light.petRejectionsCount * 45 * 0.25).toFixed(1)}Wh saved
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Sensor Trigger</span>
          <span className={`font-mono text-xs font-bold block truncate ${
            light.motionDetected ? 'text-amber-300' : 'text-slate-400'
          }`}>
            {light.motionDetected 
              ? (light.radarTriggered ? '24GHz Radar' : 'PIR Motion') 
              : (light.animalDetected && light.animalFiltered ? 'Pet Immune' : 'Clear')}
          </span>
          <span className="block text-[10px] text-slate-400">
            {light.holdRemainingSec > 0 ? `${light.holdRemainingSec}s hold left` : 'Armed'}
          </span>
        </div>

      </div>

    </div>
  );
};
