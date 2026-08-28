/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStreetlight } from '../context/StreetlightContext';
import { 
  Sun, 
  Moon, 
  Radio, 
  Zap, 
  RefreshCw, 
  Play, 
  Pause, 
  Wind, 
  Cpu, 
  Signal, 
  Activity,
  Sliders
} from 'lucide-react';

interface HeaderProps {
  onOpenArchitecture: () => void;
  onOpenRawPacket: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenArchitecture, onOpenRawPacket }) => {
  const {
    metadata,
    light,
    airQuality,
    microGrid,
    isStreaming,
    simulationSpeed,
    setDayNight,
    toggleStreaming,
    setSimulationSpeed,
    resetAll
  } = useStreetlight();

  return (
    <header id="main-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-4 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Branding & Node Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Micro-Grid Smart Streetlight & Air Quality Node
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Edge
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="font-mono text-slate-300 font-semibold">{metadata.nodeId}</span>
              <span>•</span>
              <span>{metadata.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Signal className="w-3.5 h-3.5 text-cyan-400" />
                {metadata.connectivity} ({metadata.signalRssi} dBm)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-mono uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5 text-cyan-300">
                <Cpu className="w-3 h-3" /> Edge intelligence online
              </span>
              <span className="text-slate-600">/</span>
              <span className={light.motionDetected ? 'text-amber-300' : 'text-slate-500'}>
                {light.motionDetected ? (light.prolongedPresenceActive ? 'Presence safeguard active' : 'Sensor fusion tracking') : 'Predictive idle mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Day / Night Cycle Button */}
          <button
            id="btn-day-night-toggle"
            type="button"
            onClick={() => setDayNight(!light.isNightTime)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              light.isNightTime
                ? 'bg-indigo-950/80 text-indigo-200 border-indigo-700/60 hover:bg-indigo-900'
                : 'bg-amber-950/70 text-amber-200 border-amber-700/60 hover:bg-amber-900'
            }`}
            title="Toggle Dusk/Night vs Daylight cycle to test solar generation & adaptive lighting"
          >
            {light.isNightTime ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Night Mode ({light.ambientLux} lux)</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Day Mode ({light.ambientLux} lux)</span>
              </>
            )}
          </button>

          {/* Stream Pause/Play */}
          <button
            id="btn-toggle-stream"
            type="button"
            onClick={toggleStreaming}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isStreaming
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-amber-900/40 text-amber-300 border-amber-700 hover:bg-amber-900/60'
            }`}
            title={isStreaming ? 'Pause sensor telemetry stream' : 'Resume live sensor telemetry stream'}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Streaming</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Paused</span>
              </>
            )}
          </button>

          {/* Simulation Speed */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
            <button
              id="btn-speed-1x"
              type="button"
              onClick={() => setSimulationSpeed(1)}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                simulationSpeed === 1 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x
            </button>
            <button
              id="btn-speed-2x"
              type="button"
              onClick={() => setSimulationSpeed(2)}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                simulationSpeed === 2 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2x
            </button>
            <button
              id="btn-speed-5x"
              type="button"
              onClick={() => setSimulationSpeed(5)}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                simulationSpeed === 5 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5x
            </button>
          </div>

          {/* MQTT Packet Inspector */}
          <button
            id="btn-view-packet"
            type="button"
            onClick={onOpenRawPacket}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors"
            title="Inspect real JSON telemetry payload sent over MQTT"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">MQTT Telemetry</span>
          </button>

          {/* Architecture / Hardware Guide */}
          <button
            id="btn-view-architecture"
            type="button"
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architecture & Circuit</span>
          </button>

          {/* Reset button */}
          <button
            id="btn-reset-node"
            type="button"
            onClick={resetAll}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Reset simulation parameters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
